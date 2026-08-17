# CORSC backend architecture

CORSC — Cardiac Oncology Risk Surveillance and Care — is clinical decision
support for a cardio-oncology service. This document describes how it stores and
serves patient data after the move from browser storage to PostgreSQL.

It is a description of software architecture. It says nothing about whether
CORSC is clinically validated, and passing every test in this repository does
not make it so. See [Limitations](#limitations).

---

## 1. Where this started

Before this change, CORSC kept patient records in the browser's `localStorage`,
keyed by `corsc:patient:<userId>:<patientId>`. Supabase was present, but only
for authentication; a schema and a repository seam existed
(`supabase/migrations/0001_corsc_schema.sql`, `lib/db/patient-repository.js`)
and neither was wired into the application.

Browser storage is not a defensible place for identifiable clinical data:

- unencrypted at rest, and readable by anything running in the page,
- lost when the browser is cleared, with no backup,
- impossible to share with a colleague, audit centrally, or revoke,
- invisible to any governance process.

Everything else about the application was sound and is preserved. The clinical
engines, the encounter workflow, the provenance registry and the existing test
suite are unchanged.

## 2. What the architecture is now

```
                    Browser (React 19 / Next.js 16)
                                │
                    lib/client/patient-repository
                    lib/client/api-client
                                │  fetch + Supabase bearer token
                                ▼
                    Next.js Route Handlers  (app/api/**)
                                │
                    lib/backend/route      auth → validate → work → audit → respond
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   lib/backend/auth     lib/backend/validation   lib/backend/services
   Supabase token       Zod schemas              patient-record, clinical,
   + role from DB       + clinical vocabulary    medication, therapy, visit,
                                                 investigation, override,
                                                 report, legacy-migration
                                                          │
                                    ┌─────────────────────┴────────────┐
                                    ▼                                  ▼
                    lib/backend/services/engine-patient      lib/backend/repositories
                        (assembles the engine shape)              (Prisma queries)
                                    │                                  │
                                    ▼                                  ▼
                    lib/*.js CLINICAL ENGINES                    Prisma Client
                    hfa-icos, ctrcvt, ctrcd,                          │
                    surveillance, fitness,                            ▼
                    anthracycline, medication                    PostgreSQL
                                                              (Supabase or self-hosted)
```

There is no separate Express server. Next.js Route Handlers run on the same
Node process that serves the application, which is one deployment, one
authentication story and one set of environment variables. A separate API server
would have added an operational boundary this project has no need for.

## 3. The rule the whole design serves

**The clinical engines were not modified, and they never touch persistence.**

CORSC's engines carry validated clinical logic — HFA-ICOS proformas, CTRCD
grading, CTR-CVT domains, the anthracycline equivalence models, the surveillance
rules — with 454 tests describing their behaviour. Those tests still pass
unchanged.

They read one denormalised patient object with a `visits` array. The database
stores normalised rows. Between them sits exactly one module:

**`lib/backend/services/engine-patient.ts`** assembles normalised rows back into
the object shape the engines already consume, and hands it over. The engines see
what they always saw.

The alternative — rewriting the engines to read normalised rows — would have
meant re-deriving validated clinical logic to suit a storage decision. That is
not a trade this codebase should make.

```
API request
    ↓  authenticate            lib/backend/auth
    ↓  authorise               requirePatientAccess / requireWrite
    ↓  validate                lib/backend/validation (Zod)
    ↓  load normalised rows    lib/backend/repositories
    ↓  assemble engine shape   lib/backend/services/engine-patient
    ↓  CLINICAL ENGINE         lib/hfa-icos.js  (unchanged)
    ↓  persist result          assessments table, with engine + rules version
    ↓  audit                   audit_events (append-only)
    ↓  respond                 { data } | { error }
```

No clinical algorithm is duplicated in a route handler, a service, a database
trigger, SQL, or a React component. `lib/backend/services/engine-versions.ts`
records which engine version produced each stored result.

## 4. Authentication

Supabase Auth, which the application already used. Unchanged from the user's
point of view.

```
Browser signs in with Supabase  →  session held by supabase-js
        │
        ├── access token read per request (not cached — tokens refresh)
        ▼
Authorization: Bearer <token>
        ▼
lib/backend/auth · authenticate()
        │  supabase.auth.getUser(token)   ← verification, with the PUBLISHABLE key
        ▼
  user id  →  clinicians table  →  role
```

- The server uses the **publishable** key. Verifying a token needs nothing more.
- **The service-role key is never read.** No module under `lib/backend` requires
  it. Adding a dependency on it would be a regression.
- A verified user with no clinician row is provisioned one on first sign-in with
  the `CLINICIAN` role — the least-privileged role that can still do clinical
  work — and the provisioning is itself an audit event.

## 5. Authorisation

Derived server-side, from the database, on every request. **A role in a request
body is data, not a claim** — `tests/api/security.test.ts` asserts that sending
`{"role": "ADMIN"}` changes nothing.

| Role | Read own caseload | Write | Read audit trail |
|---|---|---|---|
| `ADMIN` | all patients | ✓ | ✓ |
| `CARDIO_ONCOLOGIST` | own + care team | ✓ | ✓ |
| `ONCOLOGIST` | own + care team | ✓ | — |
| `CLINICIAN` | own + care team | ✓ | — |
| `RESEARCHER` | own + care team | — | — |
| `READ_ONLY` | own + care team | — | — |

Access to a patient is by **registration or explicit care-team membership** —
a row someone granted, not a consequence of being signed in. Shared caseloads
are a real requirement in a cardio-oncology service, and this is how they are
met without making every record visible to every authenticated user.

A patient the caller cannot see returns **404, not 403**: a 403 would confirm
that the record exists, which is itself a disclosure about someone else's
caseload.

## 6. Two access paths, two controls

This is the most important thing to understand before changing anything.

| Path | Reaches the database as | Protected by |
|---|---|---|
| Browser → Supabase PostgREST | the signed-in user | **row-level security** |
| Browser → CORSC API → Prisma | a role that bypasses RLS | **`lib/backend/auth`** |

The publishable key is in the client bundle by design, so the browser *can*
reach PostgREST directly. RLS is what stands between an authenticated user and
another clinician's caseload on that path; it is enabled and **forced** on every
table, and `tests/database/schema.test.ts` verifies that rather than assuming it.

The API connects with a role that bypasses RLS, because it must read a clinician
profile and write an audit row for a caller who does not own the patient — which
no single policy set can express. That is a deliberate split, and it carries an
obligation: **every route handler must go through `requirePatientAccess()`**.
`tests/api/security.test.ts` is what holds that obligation.

## 7. The database

PostgreSQL, through Prisma. See [DATABASE.md](./DATABASE.md) for the full model.

Design rules the schema obeys:

1. **No clinical rule lives in the database.** No thresholds, no conversion
   factors, no proforma weights, no guideline text. Changing a clinical rule is
   a reviewed code change, never a row update. What *is* stored is the engine
   and rules version that produced each computed result.
2. **Clinical facts are columns, not a JSON blob.** "Every LVEF this patient has
   had" is a query. JSON appears in three named, justified places.
3. **Baseline risk and current toxicity are separate tables.** A troponin rise
   after cycle 4 cannot rewrite what the risk was before therapy.
4. **Nothing clinical is deleted.** Patients are archived, medications are
   stopped, overrides are withdrawn, surveillance is superseded, audit rows have
   no update path at all.

## 8. Clinical provenance and versioning

The provenance registry (`lib/clinical-sources.js`) is unchanged and remains the
only place in the codebase that may state a guideline, a year or a table number.

Every stored assessment carries `engine`, `engineVersion` and `rulesVersion`.
Every surveillance recommendation carries its `reason`, its `sourceId`, and its
`verification` level — including `partial`, which the report renders rather than
hides.

**Historical assessments are never recomputed.** When an engine changes from
1.0.0 to 1.1.0, existing assessments stay attributable to 1.0.0, because that is
what the clinician who made the treatment decision was looking at.

`lib/backend/services/engine-versions.ts` explains why those versions are
maintained by hand and when to bump them.

## 9. Baseline risk versus current toxicity

Mandatory, and enforced structurally rather than by convention:

| | Baseline risk | Current toxicity |
|---|---|---|
| Question | risk *before* therapy | what has happened *since* |
| Engine | `lib/hfa-icos.js` | `lib/ctrcvt.js`, `lib/ctrcd.js` |
| Stored as | `assessments` kind `BASELINE_RISK` | kind `CTR_CVT` / `CTRCD` |
| Current state | — | `patient_toxicity_status` |
| API | `POST /api/patients/:id/risk/assess` | `POST /api/patients/:id/ctr-cvt/assess` |

Neither writes to the other. `tests/integration/clinical-regression.test.ts`
takes a patient stratified before therapy, records a troponin rise, a GLS fall
and an ejection fraction fall, and asserts the stored baseline is unchanged.

## 10. Audit

Append-only, and enforced at three levels:

1. no update path in `lib/backend/services/audit-service.ts`,
2. no `UPDATE` or `DELETE` policy in row-level security,
3. a **database trigger** that rejects `UPDATE` and `DELETE` outright — so the
   guarantee holds against the application's own privileged connection.

A consequence, and an intended one: a patient with audit history cannot be
hard-deleted, because the cascade would have to delete audit rows.

Values are copied into the trail only for fields declared auditable in
`lib/audit-log.js`. Everything else is recorded as *changed*, with the value
withheld — the audit log must not become a second copy of the clinical narrative
under different access rules and different retention.

## 11. Migration from browser storage

Phased and non-destructive.

| Phase | State |
|---|---|
| 1 | Database, schema and API exist; the browser store still works. **done** |
| 2 | Frontend goes through `lib/client/patient-repository`. **done** |
| 3 | Import: read, validate, report, write, with a dry run first. **done** |
| 4 | The API driver is the default whenever the server is reachable. **done** |
| 5 | Remove the browser driver once services have migrated. **not yet** |

The rule: **nothing is lost and nothing is guessed.**

- Every record offered is accounted for — imported, skipped as a duplicate,
  flagged for review, or failed — with a reason.
- `commit: false` validates and reports without writing anything.
- Re-running does not duplicate: the browser identifier is kept on the patient
  row and in a `legacy_imports` ledger.
- A field that cannot be confidently mapped is **named in the report**, not
  guessed at. Mapping a regimen string onto a therapy class would be CORSC
  inventing a clinical fact.
- **The browser copy is never touched by the import.** Clearing it is a separate
  action, offered only for records the server confirmed it took.

Phase 5 has not been reached, deliberately. The browser driver remains as a
fallback when the server is unreachable mid-clinic, and the UI states in full
why that store is not safe for identifiable data.

## 12. Concurrency

Optimistic, using the record's `updatedAt` as a token. A save against a record
that has moved returns **409** with the server's timestamp, and the frontend
offers to reload rather than overwriting a colleague's entry.
`tests/api/security.test.ts` asserts that the colleague's entry survives.

## 13. Errors and observability

Every response is `{ data }` or `{ error: { code, message, details? } }`, with an
`x-request-id` header.

| Status | Meaning |
|---|---|
| 400 | malformed request |
| 401 | not authenticated |
| 403 | authenticated but not permitted |
| 404 | not found, or not visible to this caller |
| 409 | conflict — concurrent edit, archived patient, already-filed encounter |
| 422 | well-formed but clinically impossible |
| 503 | database not configured or unreachable |

Prisma internals, SQL, stack traces and environment values never reach a client.
The request log carries a request id, route pattern, status, duration, actor id
and role — and nothing else. It never carries a URL (which contains record ids),
a patient value, a token, or a query.

## 14. Testing

| Suite | Needs a database | What it covers |
|---|---|---|
| `lib/**/*.test.js` | no | the clinical engines — **unchanged**, 454 tests |
| `smoke/` | no | server-rendering the workflow sections |
| `tests/unit/` | no | the engine adapter, validation |
| `tests/database/` | yes | constraints, triggers, RLS, cascades |
| `tests/api/` | yes | authentication, authorisation, escalation, archiving |
| `tests/integration/` | yes | clinical behaviour end to end, migration |

Without a database the database-backed suites skip, so `npm test` works on a
laptop with nothing running. CI provides an ephemeral PostgreSQL and sets
`CORSC_REQUIRE_DB=1`, which turns a skip into a failure — the gate cannot be
passed by not having a database.

## 15. Deployment

```
Vercel / Node host                Supabase (or self-hosted PostgreSQL)
┌────────────────────┐            ┌──────────────────────────────┐
│  Next.js app       │            │  Auth  (users, sessions)     │
│  ├── React UI      │◀──────────▶│                              │
│  └── Route Handlers│            │  PostgreSQL                  │
│      └── Prisma    │◀──────────▶│   ├── CORSC schema           │
└────────────────────┘            │   └── RLS policies           │
                                  └──────────────────────────────┘
```

```
npm ci                     # runs prisma generate
npx prisma migrate deploy  # applies committed migrations
npm run db:import-formulary
npm run build
npm start
```

Never run `db:seed` against production — the script refuses on a
production-looking `DATABASE_URL` or `NODE_ENV`, and requires an explicit
override to proceed.

## 16. Future compatibility

The schema does not prevent, and was shaped to allow:

- multi-tenancy (care-team membership already exists; an institution column is
  additive),
- research and registry use (assessments carry inputs, outputs and versions),
- FHIR mapping — `Patient`, `Condition`, `MedicationStatement`, `Observation`,
  `Encounter`, `CarePlan`, `Procedure` and `DiagnosticReport` all have a
  structured counterpart here,
- structured export.

None of these is implemented. The point is only that the current design does not
foreclose them.

## Limitations

Stated plainly, because a document like this can otherwise read as a claim of
readiness.

1. **CORSC is not clinically validated by this work.** Software correctness and
   clinical validation are different things. Every test passing means the
   software behaves as its authors intended, not that the intentions are
   clinically correct.
2. **Some clinical sources are only partially verified.** The provenance
   registry marks these `partial` and the reason is rendered wherever the rule
   is. That was true before this change and is unchanged by it.
3. **Row-level security protects only the direct-to-database path.** The API
   path depends on `lib/backend/auth` being called by every handler.
4. **The document-shaped write endpoint is transitional.** See
   [API.md](./API.md).
5. **No end-to-end browser tests.** The frontend is covered by server-render
   smoke tests and by the API tests beneath it, not by a driven browser.
6. **Multi-tenancy is not implemented.** A second institution sharing one
   deployment would rely entirely on care-team membership being set correctly.
