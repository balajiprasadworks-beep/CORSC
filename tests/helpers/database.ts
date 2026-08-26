/* =========================================================================
   Test database helpers.

   The database-backed tests need a real PostgreSQL, because most of what they
   assert cannot be tested against a fake: CHECK constraints, the append-only
   trigger on the audit table, cascade behaviour, and row-level security are
   all database behaviour. A mocked client would pass while the real schema
   allowed a negative dose through.

   WHEN THERE IS NO DATABASE, these tests skip rather than fail — so `npm test`
   works on a laptop with nothing running. CI provides a PostgreSQL service and
   sets CORSC_REQUIRE_DB=1, which turns a skip into a failure, so the gate
   cannot be passed by simply not having a database.
   ========================================================================= */

import { PrismaClient } from "@prisma/client";

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const databaseAvailable = Boolean(DATABASE_URL);

if (!databaseAvailable && process.env.CORSC_REQUIRE_DB === "1") {
  throw new Error(
    "CORSC_REQUIRE_DB is set but DATABASE_URL is not. The database-backed tests are a release gate and must not be skipped in CI."
  );
}

let client: PrismaClient | null = null;

export function db(): PrismaClient {
  if (!client) client = new PrismaClient();
  return client;
}

export async function disconnect() {
  if (client) await client.$disconnect();
  client = null;
}

/**
 * Refuses to run against anything that does not look like a test database.
 *
 * resetDatabase() TRUNCATEs every clinical table. Pointed at production by a
 * stray DATABASE_URL — a copied shell, a runbook followed one line too far —
 * it would destroy the record of every patient, and nothing in the suite would
 * look wrong while it happened. The cost of the check is nil; the cost of not
 * having it is unrecoverable, so this is deliberately paranoid rather than
 * clever: a local host or a database whose name says "test", nothing else.
 *
 * CORSC_ALLOW_DESTRUCTIVE_TEST_DB=1 overrides it, for a CI database that
 * satisfies neither. Setting that against production is on whoever sets it.
 */
function assertDisposable(url: string) {
  if (process.env.CORSC_ALLOW_DESTRUCTIVE_TEST_DB === "1") return;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL is not a URL, so it cannot be checked before TRUNCATE. Refusing.");
  }

  const host = parsed.hostname.toLowerCase();
  const name = parsed.pathname.replace(/^\//, "").toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "postgres" || host === "db";
  const named = /test|rehearsal/.test(name);

  if (!local && !named) {
    throw new Error(
      `Refusing to TRUNCATE: "${name}" on host "${host}" does not look like a test database. ` +
      "resetDatabase() empties every clinical table. If this really is disposable, " +
      "set CORSC_ALLOW_DESTRUCTIVE_TEST_DB=1."
    );
  }
}

/**
 * Empties every table between tests.
 *
 * TRUNCATE rather than DELETE: the audit table's append-only trigger is a
 * BEFORE DELETE trigger and does not fire on TRUNCATE, which is exactly the
 * distinction we want — the guarantee holds for the application while a test
 * fixture can still be reset.
 */
export async function resetDatabase() {
  assertDisposable(DATABASE_URL);
  const prisma = db();
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "audit_events", "legacy_imports", "clinical_overrides", "follow_ups",
      "surveillance_recommendations", "assessments", "investigations",
      "visit_medication_decisions", "visit_task_completions", "visit_interval_answers",
      "visit_system_exam_components", "visit_system_exams", "visit_symptoms",
      "visit_vitals", "visits", "anthracycline_doses", "therapy_cycles",
      "therapy_agents", "therapy_phases", "therapy_class_assignments", "therapy_plans",
      "patient_medications", "cancer_diagnoses", "contraindication_assertions",
      "risk_factor_assertions", "patient_history_entries", "patient_toxicity_status",
      "patient_baselines", "care_team_members", "patients", "clinicians"
    RESTART IDENTITY CASCADE
  `);
}

/** A clinician row with a deterministic id, so tokens can be mapped to it. */
export async function makeClinician(
  id: string,
  role: "ADMIN" | "CARDIO_ONCOLOGIST" | "ONCOLOGIST" | "CLINICIAN" | "RESEARCHER" | "READ_ONLY" = "CLINICIAN",
  email = `${id}@example.invalid`
) {
  return db().clinician.upsert({
    where: { id },
    create: { id, email, role, displayName: `Test ${role}` },
    update: { role, email },
  });
}

export const CLINICIAN_A = "11111111-1111-4111-8111-111111111111";
export const CLINICIAN_B = "22222222-2222-4222-8222-222222222222";
export const READ_ONLY = "33333333-3333-4333-8333-333333333333";
export const ADMIN = "44444444-4444-4444-8444-444444444444";
