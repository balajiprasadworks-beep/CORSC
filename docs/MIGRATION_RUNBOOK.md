# Migration runbook — deploying to a database that holds patient data

CORSC's production database holds clinical records. Every procedure here is
written so that the *worst* outcome of getting it wrong is a failed command
and an unchanged database, never a lost record.

Two rules hold for every deployment:

- `prisma migrate deploy` is the only command that may touch production.
  `migrate dev`, `db push` and `migrate reset` all reserve the right to drop
  and recreate objects to make the database match the schema file. On a
  database holding patient data that is not a recovery path, it is the
  incident.
- A migration is verified against the database before it is applied, and
  again after. Prisma's `_prisma_migrations` table records what Prisma *was
  told* happened. The catalogue records what actually exists. When those two
  disagree, the catalogue is right.

## Which URL migrations run over

`prisma/schema.prisma` declares `directUrl = env("DIRECT_URL")`, so
`migrate deploy` and `migrate status` connect over `DIRECT_URL` while the
application connects over `DATABASE_URL`.

Supabase's transaction-mode pooler (port 6543, `?pgbouncer=true`) cannot run
migrations: it multiplexes statements across backends, so the session-level
advisory lock Prisma takes and the DDL it issues do not behave. `DIRECT_URL`
must therefore be either the direct database host or the **session-mode**
pooler on port 5432 — not the transaction pooler.

Confirm which one you are pointed at before deploying; `migrate status` prints
the host and port it connected to, and that line is the check.

## Step 1 — preflight, read-only

```sh
npm run db:verify -- --save
```

`prisma/verify-live.ts` is read-only — no create, update, delete or DDL — and
is safe to run against production. It reports the connection, checks every
object the current code requires, records row counts to a snapshot file for the
comparison in step 3, and then exercises the application's own read path
(`enginePatientInclude`, `toEnginePatientRecord`, the worklist row builder, the
clinical picture) against a real stored record.

Before the migration it is *expected* to fail, and the failure it prints is the
one the website is showing. That is the confirmation you are looking at the
right problem.

Its `--patient <uuid>` option verifies a named record rather than the most
recently updated one.

For the underlying catalogue queries, or to run them by hand in the Supabase SQL
editor, each is below. Every statement is a `SELECT`; nothing here writes.

```sql
-- 1. What Prisma believes it has applied, and whether any attempt failed.
--    finished_at IS NULL      -> a migration started and never completed
--    rolled_back_at NOT NULL  -> a migration was marked as rolled back
--    A row in either state means the history is inconsistent and must be
--    reconciled before anything is deployed.
SELECT migration_name,
       started_at,
       finished_at,
       rolled_back_at,
       applied_steps_count
FROM   _prisma_migrations
ORDER  BY started_at;

-- 2. Does the new table exist yet?
SELECT to_regclass('public.therapy_phases') AS therapy_phases;

-- 3. Which of the columns the pending migrations add are already present?
--    Expect zero rows before deploying, all nine after.
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM   information_schema.columns
WHERE  table_schema = 'public'
AND    (   (table_name = 'therapy_plans'
            AND column_name IN ('entry_method', 'regimen_library_id',
                                'regimen_family', 'active_phase_key'))
        OR (table_name = 'therapy_agents'
            AND column_name IN ('phase_id', 'position', 'drug_class',
                                'therapy_class', 'corsc_therapy_class'))
        OR (table_name = 'therapy_phases'
            AND column_name = 'activated_on'))
ORDER  BY table_name, column_name;

-- 4. Indexes and constraints the pending migrations create.
SELECT indexname FROM pg_indexes
WHERE  schemaname = 'public'
AND    indexname IN ('therapy_phases_therapy_plan_id_position_idx',
                     'therapy_phases_therapy_plan_id_key_key',
                     'therapy_agents_phase_id_position_idx');

SELECT conname, contype FROM pg_constraint
WHERE  connamespace = 'public'::regnamespace
AND    conname IN ('therapy_phases_pkey',
                   'therapy_phases_therapy_plan_id_fkey',
                   'therapy_agents_phase_id_fkey');

-- 5. The RLS helpers the phases migration depends on. Both must already
--    exist; they are created by 20260817000100_constraints_rls_and_search.
--    If either is missing the phases migration will fail on its policy block.
SELECT proname FROM pg_proc
WHERE  pronamespace = 'public'::regnamespace
AND    proname IN ('corsc_can_read_patient', 'corsc_can_write');

-- 6. Policies already on therapy_phases, if the table exists at all.
SELECT policyname, cmd FROM pg_policies
WHERE  schemaname = 'public' AND tablename = 'therapy_phases';

-- 7. Row counts, recorded so that "no data was lost" is a comparison
--    rather than an assertion. Re-run after deploying; these must not move.
SELECT 'patients'                 AS t, count(*) FROM patients
UNION ALL SELECT 'therapy_plans',            count(*) FROM therapy_plans
UNION ALL SELECT 'therapy_agents',           count(*) FROM therapy_agents
UNION ALL SELECT 'therapy_class_assignments',count(*) FROM therapy_class_assignments
UNION ALL SELECT 'therapy_cycles',           count(*) FROM therapy_cycles
UNION ALL SELECT 'anthracycline_doses',      count(*) FROM anthracycline_doses
UNION ALL SELECT 'visits',                   count(*) FROM visits
UNION ALL SELECT 'audit_events',             count(*) FROM audit_events;
```

### Reading the result

The preflight puts the database into exactly one of three states, and each
has a different repair. Do not proceed until you know which one you are in.

| Query 1 shows | Queries 2–4 show | State | What to do |
|---|---|---|---|
| Only the two `20260817*` rows, both `finished_at` set, none rolled back | Nothing exists | **Database is behind the code.** History is consistent. | Step 2 — `migrate deploy`. |
| A row with `finished_at IS NULL` or `rolled_back_at` set | Some objects exist | **A migration failed part-way.** | Do *not* deploy. Finish or reverse the partial objects by hand, then `migrate resolve`. See "Partially applied" below. |
| Only the two `20260817*` rows | Some or all objects already exist | **Drift** — objects were created outside Prisma, e.g. by `db push` or by hand. | Do *not* deploy; it will fail on the first object that already exists. See "Drift" below. |

## Step 2 — deploy

```sh
npx prisma migrate status     # confirm the pending list and the host
npx prisma migrate deploy
npx prisma migrate status     # expect "No pending migrations"
npx prisma generate
```

`migrate deploy` applies only migrations `_prisma_migrations` does not
already record, in filename order, and never inspects the schema file for
differences. It cannot drop a column that the schema no longer mentions.

Each migration file runs inside one transaction, so a failure part-way
through leaves none of that file's objects behind — the failed migration is
recorded and the next `deploy` is refused until it is resolved.

## Step 3 — verify

Re-run the preflight. Expect the inverse of what it showed before:

- query 1 now lists all four migrations, every one with `finished_at` set and
  `rolled_back_at` null;
- query 2 returns `therapy_phases`;
- query 3 returns all nine columns;
- query 4 returns all three indexes and all three constraints;
- query 6 returns the three `therapy_phases_*` policies;
- **query 7 returns the same counts as before.** Any change here is the one
  result that warrants stopping and investigating: these migrations add
  structures and must not touch a row.

Or let the script do all of it, including the row-count comparison against the
snapshot step 1 saved:

```sh
npm run db:verify
```

Every line must read `ok`. The three `therapy_phases_*` policies are the one
exception: they are created only where an `auth.users` table exists, so on a
non-Supabase database the script prints them as a `note` rather than a failure.

> [!CAUTION]
> **Never point the database-backed test suites at production.** They call
> `resetDatabase()` in `beforeEach`, which TRUNCATEs every clinical table —
> running them against a real database destroys every patient record. They are
> guarded (`tests/helpers/database.ts` refuses a `DATABASE_URL` that is neither
> a local host nor a database named like a test one) but do not rely on the
> guard: run them only against a disposable database.
>
> `npm run db:verify` is the check that is safe against production. It only
> reads.

## Repairing an inconsistent history

Both of these are for the states the preflight table marks "do not deploy".
Neither is a routine step, and neither should be run to make
`migrate status` look green — the point is to make the catalogue and the
history describe the same database.

### Partially applied

A migration whose row has `finished_at IS NULL` was interrupted. Establish
from queries 2–4 which of its objects exist, then either complete the
remainder by hand in a transaction and

```sh
npx prisma migrate resolve --applied <migration_name>
```

or drop the objects that migration created — and *only* those — and

```sh
npx prisma migrate resolve --rolled-back <migration_name>
```

so the next `deploy` reapplies it from a clean start.

### Drift

Objects exist that no applied migration created. Compare them against the
migration SQL column by column, including types, nullability, defaults,
indexes and foreign keys.

- If they match exactly, the migration's effects are already present:
  `migrate resolve --applied <migration_name>` records that fact without
  re-running the SQL.
- If they differ in any respect, they are not the migration's effects.
  Marking the migration applied would leave the database permanently wrong
  in a way Prisma reports as healthy. Write a corrective migration that
  brings the existing objects to the intended shape instead.

`migrate resolve --applied` is a claim that the SQL's effects already exist.
Make it only after the catalogue has been read and shown to support it.

## What is never run against production

| Command | Why not |
|---|---|
| `prisma migrate reset` | Drops the schema and recreates it. Total data loss. |
| `prisma db push` | Reconciles the database to the schema file directly, dropping columns and tables that the schema no longer mentions, with no migration recorded. |
| `prisma migrate dev` | May reset the database when it detects drift, and writes new migration files from the live database. A development command. |
| `migrate resolve` without preflight | Records history that the database does not support, hiding the mismatch instead of fixing it. |
| `vitest run tests` with `DATABASE_URL` set to production | The database-backed suites TRUNCATE every clinical table between tests. |
| `npm run db:seed` against production | Writes synthetic patients into the real record. |
