/* =========================================================================
   Read-only verification of a live database.

   Answers the only question that matters after a migration: can the
   application read the records that are already there?

   It does that by calling the application's own data-access path rather than
   by querying tables itself — `enginePatientInclude` through the patient
   repository, `toEnginePatientRecord`, the worklist row builder, the clinical
   picture and the therapy list. A hand-written SELECT could pass while the
   path the website actually uses still failed, because what broke was the
   column list Prisma generates from the schema, not any query anyone wrote.

   NOTHING HERE WRITES. No create, no update, no delete, no DDL. It is safe to
   run against production, and safe to run before the migration — before, it is
   expected to fail, and the failure it reports is the one the website shows.

   Run it either side of `prisma migrate deploy`:

     npm run db:verify -- --save     # before, records row counts
     npx prisma migrate deploy
     npm run db:verify               # after, compares against them

   Options:
     --patient <uuid>   verify this record rather than the most recent
     --save             write the row counts to the snapshot file
     --snapshot <path>  snapshot location (default .corsc-verify-snapshot.json)
   ========================================================================= */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";

import { enginePatientInclude, toEnginePatientRecord } from "@/lib/backend/services/engine-patient";
import { buildClinicalPicture } from "@/lib/clinical-picture";
import {
  isStructured, orderedPhases, activePhase,
  derivedTherapyClasses, activePhaseTherapyClasses,
} from "@/lib/treatment-course";
import { worklistRow } from "@/lib/worklist";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
};
const SNAPSHOT = flag("--snapshot") || ".corsc-verify-snapshot.json";
const SAVE = args.includes("--save");
const PATIENT_ID = flag("--patient");

const prisma = new PrismaClient();

let failures = 0;
const fail = (message: string) => {
  failures += 1;
  console.log(`  FAIL  ${message}`);
};
const pass = (message: string) => console.log(`  ok    ${message}`);
const section = (title: string) => console.log(`\n${title}\n${"-".repeat(title.length)}`);

/* ------------------------------------------------------------ connection */

async function reportConnection() {
  section("Connection");
  // The URL is read back from the server rather than printed from the
  // environment, so no credential is ever echoed.
  const [row] = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT current_database() AS db,
           current_user       AS usr,
           inet_server_addr()::text AS server,
           inet_server_port() AS port,
           version()          AS version
  `;
  console.log(`  database ${row.db}  user ${row.usr}`);
  console.log(`  server   ${row.server ?? "(pooled)"}:${row.port ?? "?"}`);
  console.log(`  ${String(row.version).split(" on ")[0]}`);
}

/* ---------------------------------------------------------------- schema */

const REQUIRED_COLUMNS: Array<[string, string]> = [
  ["therapy_plans", "entry_method"],
  ["therapy_plans", "regimen_library_id"],
  ["therapy_plans", "regimen_family"],
  ["therapy_plans", "active_phase_key"],
  ["therapy_agents", "phase_id"],
  ["therapy_agents", "position"],
  ["therapy_agents", "drug_class"],
  ["therapy_agents", "therapy_class"],
  ["therapy_agents", "corsc_therapy_class"],
  ["therapy_phases", "activated_on"],
];

const REQUIRED_INDEXES = [
  "therapy_phases_therapy_plan_id_position_idx",
  "therapy_phases_therapy_plan_id_key_key",
  "therapy_agents_phase_id_position_idx",
];

const REQUIRED_CONSTRAINTS = [
  "therapy_phases_pkey",
  "therapy_phases_therapy_plan_id_fkey",
  "therapy_agents_phase_id_fkey",
];

const REQUIRED_POLICIES = [
  "therapy_phases_select",
  "therapy_phases_insert",
  "therapy_phases_update",
];

async function verifySchema() {
  section("Schema objects the current code requires");

  const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>`
    SELECT migration_name, finished_at, rolled_back_at
    FROM _prisma_migrations ORDER BY started_at
  `;
  for (const row of migrations) {
    const state = row.rolled_back_at ? "ROLLED BACK" : row.finished_at ? "applied" : "UNFINISHED";
    if (state === "applied") pass(`migration ${row.migration_name}`);
    else fail(`migration ${row.migration_name} is ${state}`);
  }
  for (const name of ["20260819030028_treatment_course_phases", "20260819040551_therapy_phase_activated_on"]) {
    if (!migrations.some((row) => row.migration_name === name)) fail(`migration ${name} is not recorded as applied`);
  }

  const [{ exists: phasesTable }] = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT to_regclass('public.therapy_phases') IS NOT NULL AS exists
  `;
  phasesTable ? pass("table therapy_phases") : fail("table therapy_phases is missing");

  const columns = await prisma.$queryRaw<Array<{ table_name: string; column_name: string }>>`
    SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'
  `;
  const haveColumn = new Set(columns.map((c) => `${c.table_name}.${c.column_name}`));
  for (const [table, column] of REQUIRED_COLUMNS) {
    haveColumn.has(`${table}.${column}`)
      ? pass(`column ${table}.${column}`)
      : fail(`column ${table}.${column} is missing`);
  }

  const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
  `;
  const haveIndex = new Set(indexes.map((i) => i.indexname));
  for (const name of REQUIRED_INDEXES) {
    haveIndex.has(name) ? pass(`index ${name}`) : fail(`index ${name} is missing`);
  }

  const constraints = await prisma.$queryRaw<Array<{ conname: string }>>`
    SELECT conname FROM pg_constraint WHERE connamespace = 'public'::regnamespace
  `;
  const haveConstraint = new Set(constraints.map((c) => c.conname));
  for (const name of REQUIRED_CONSTRAINTS) {
    haveConstraint.has(name) ? pass(`constraint ${name}`) : fail(`constraint ${name} is missing`);
  }

  const rls = await prisma.$queryRaw<Array<{ enabled: boolean; forced: boolean }>>`
    SELECT c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'therapy_phases'
  `;
  if (!rls.length) fail("therapy_phases not present, so RLS cannot be checked");
  else if (rls[0].enabled && rls[0].forced) pass("row-level security enabled and forced on therapy_phases");
  else fail(`row-level security on therapy_phases: enabled=${rls[0].enabled} forced=${rls[0].forced}`);

  const policies = await prisma.$queryRaw<Array<{ policyname: string }>>`
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'therapy_phases'
  `;
  const havePolicy = new Set(policies.map((p) => p.policyname));
  const anyPolicies = havePolicy.size > 0;
  for (const name of REQUIRED_POLICIES) {
    if (havePolicy.has(name)) pass(`policy ${name}`);
    else if (anyPolicies) fail(`policy ${name} is missing`);
    else console.log(`  note  policy ${name} absent — expected when the database has no auth.users (not a Supabase project)`);
  }
}

/* ------------------------------------------------------------ row counts */

const COUNTED = [
  "patients", "therapy_plans", "therapy_agents", "therapy_class_assignments",
  "therapy_cycles", "anthracycline_doses", "visits", "investigations",
  "assessments", "surveillance_recommendations", "clinical_overrides", "audit_events",
] as const;

async function rowCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const table of COUNTED) {
    const [row] = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT count(*)::bigint AS n FROM "${table}"`
    );
    counts[table] = Number(row.n);
  }
  return counts;
}

function compareCounts(now: Record<string, number>) {
  section("Row counts");
  const previous: Record<string, number> | null =
    existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, "utf8")).counts : null;

  for (const table of COUNTED) {
    if (!previous) {
      console.log(`  ${String(now[table]).padStart(7)}  ${table}`);
      continue;
    }
    const before = previous[table];
    const delta = now[table] - before;
    if (delta === 0) pass(`${table}: ${now[table]} (unchanged)`);
    else if (delta < 0) fail(`${table}: ${before} -> ${now[table]} (${delta}) — ROWS WERE LOST`);
    else console.log(`  note  ${table}: ${before} -> ${now[table]} (+${delta}), expected only if the app was in use`);
  }

  if (SAVE) {
    writeFileSync(SNAPSHOT, JSON.stringify({ at: new Date().toISOString(), counts: now }, null, 2));
    console.log(`\n  snapshot written to ${SNAPSHOT}`);
  } else if (!previous) {
    console.log(`\n  note  no snapshot at ${SNAPSHOT}; re-run with --save before migrating to enable comparison`);
  }
}

/* --------------------------------------------------- application read path */

async function verifyReadPath() {
  section("Application read path against existing records");

  // patient-repository -> findPatientWithClinicalData -> enginePatientInclude.
  // This is the query that was failing with 42703.
  const target = PATIENT_ID
    ? await prisma.patient.findUnique({ where: { id: PATIENT_ID }, include: enginePatientInclude })
    : await prisma.patient.findFirst({ orderBy: { updatedAt: "desc" }, include: enginePatientInclude });

  if (!target) {
    console.log("  note  no patient records in this database; the read path could not be exercised");
    return;
  }
  pass(`loaded patient ${target.id} through enginePatientInclude`);
  pass(`  ${target.therapyPlans.length} therapy plan(s), ${target.visits.length} visit(s)`);

  // engine-patient -> the shape every engine consumes.
  const record = toEnginePatientRecord(target);
  pass("toEnginePatientRecord produced the engine record");

  // clinical-service -> buildPicture calls this over the same record.
  buildClinicalPicture(record, null);
  pass("buildClinicalPicture ran over the stored record");

  // worklist route, over every active patient.
  const active = await prisma.patient.findMany({
    where: { status: "ACTIVE" },
    include: enginePatientInclude,
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  active.forEach((patient) => worklistRow(toEnginePatientRecord(patient)));
  pass(`worklist built for ${active.length} active patient(s)`);

  // therapy-service reads plans with its own include; exercise it too.
  const plans = await prisma.therapyPlan.findMany({
    include: {
      classes: { orderBy: { position: "asc" } },
      agents: true,
      cycles: { orderBy: { cycleNumber: "asc" }, include: { doses: true } },
      phases: { orderBy: { position: "asc" }, include: { agents: true } },
    },
  });
  pass(`read ${plans.length} therapy plan(s) with phases and agents`);

  section("Treatment courses as stored");
  let freeText = 0;
  let structured = 0;
  for (const patient of active.length ? active : [target]) {
    const course = toEnginePatientRecord(patient).treatmentCourse;
    if (!course) continue;
    if (isStructured(course)) {
      structured += 1;
      const phases = orderedPhases(course);
      const current = activePhase(course);
      const cumulative = derivedTherapyClasses(course);
      const active = activePhaseTherapyClasses(course);
      console.log(
        `  structured  ${patient.id}  ${phases.length} phase(s), active "${current?.name ?? "?"}"\n` +
        `              cumulative [${cumulative.join(", ") || "none"}]  active phase [${active.join(", ") || "none"}]`
      );
      // The distinction the surveillance engine depends on: an exposure the
      // patient has finished must stay in the cumulative set. If the active
      // phase ever carried a class the cumulative set had dropped, a completed
      // anthracycline would have stopped counting.
      const missing = active.filter((cls) => !cumulative.includes(cls));
      if (missing.length) fail(`${patient.id}: active-phase classes not in cumulative: ${missing.join(", ")}`);
    } else {
      freeText += 1;
      const text = String(course.freeTextDescription || "").slice(0, 60);
      console.log(`  free text   ${patient.id}  "${text}" — phases: ${orderedPhases(course).length}`);
      if (orderedPhases(course).length !== 0) fail(`free-text course on ${patient.id} has phases; text must never be parsed`);
      if (derivedTherapyClasses(course).length !== 0) fail(`free-text course on ${patient.id} derived therapy classes; it must derive none`);
    }
  }
  pass(`${structured} structured course(s), ${freeText} free-text course(s), all readable`);
}

/* ------------------------------------------------------------------ main */

async function main() {
  console.log("CORSC live verification — read-only\n===================================");
  await reportConnection();
  await verifySchema();
  // Counts are taken before the read path, not after: on a database that has
  // not been migrated yet the read path throws, and the pre-migration run is
  // exactly the one whose counts we need to compare against afterwards.
  compareCounts(await rowCounts());
  await verifyReadPath();

  section("Result");
  if (failures === 0) {
    console.log("  Everything checked passed. The application can read the existing records.");
  } else {
    console.log(`  ${failures} check(s) failed. See FAIL lines above.`);
  }
  return failures;
}

main()
  .then(async (code) => {
    await prisma.$disconnect();
    process.exit(code === 0 ? 0 : 1);
  })
  .catch(async (error) => {
    console.error("\nVerification aborted:", error instanceof Error ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
