/* =========================================================================
   DEVELOPMENT AND TEST DATA ONLY.

   Every patient created by this script is fictional. The names are obviously
   invented, the identifiers are prefixed "SEED-", and nothing here is derived
   from a real person or a real record. Do not add real patient data to this
   file, and do not run it against a production database — it refuses to,
   below.

   WHAT IT SEEDS, AND WHY THESE CASES

   The three synthetic patients are not arbitrary. Each exercises a part of the
   clinical model that is easy to get wrong and worth being able to look at
   while developing:

     1. Combination therapy — anthracycline followed by HER2 blockade, with a
        dose ledger. Tests that both therapy classes survive and that both
        HFA-ICOS proformas run.

     2. Baseline versus current toxicity — a patient stratified LOW before
        therapy who has since had a troponin rise and a GLS fall. The baseline
        assessment must still read Low.

     3. Checkpoint inhibitor with a troponin rise — the myocarditis screening
        pathway, which fires regardless of ejection fraction or symptoms.

   Run with:  npm run db:seed
   ========================================================================= */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Marks everything this script creates, so it can be recognised and replaced. */
const SEED_PREFIX = "SEED-";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

/**
 * Refuses to run anywhere that looks like production.
 *
 * Seeding fictional patients into a live clinical database would put invented
 * people on a real caseload. The check is deliberately broad: it is better to
 * refuse a legitimate run and be overridden explicitly than to succeed once
 * where it should not have.
 */
function assertNotProduction() {
  const url = process.env.DATABASE_URL || "";
  const override = process.env.CORSC_ALLOW_SEED === "yes-this-is-not-production";

  if (process.env.NODE_ENV === "production" && !override) {
    throw new Error(
      "Refusing to seed: NODE_ENV is production. Set CORSC_ALLOW_SEED=yes-this-is-not-production if this really is a scratch database."
    );
  }
  if (/prod|production|live/i.test(url) && !override) {
    throw new Error(
      "Refusing to seed: DATABASE_URL looks like a production database. Set CORSC_ALLOW_SEED=yes-this-is-not-production to override."
    );
  }
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
}

/**
 * Clears previously seeded data.
 *
 * Only records carrying the seed prefix, and only by removing the patients —
 * the cascades take their clinical data with them. Audit rows are removed
 * first with a raw TRUNCATE-free delete guarded by the seed patient ids,
 * because the append-only trigger blocks ordinary deletes on that table.
 */
async function clearSeedData(clinicianId: string) {
  const patients = await prisma.patient.findMany({
    where: { createdById: clinicianId },
    select: { id: true },
  });
  if (patients.length === 0) return;

  const ids = patients.map((patient) => patient.id);

  // audit_events is append-only by trigger. Disabling the trigger for the span
  // of a development reset is the only place in the codebase that touches it,
  // and it is guarded by assertNotProduction() above.
  await prisma.$executeRawUnsafe('ALTER TABLE "audit_events" DISABLE TRIGGER "audit_events_append_only"');
  await prisma.$executeRawUnsafe('ALTER TABLE "assessments" DISABLE TRIGGER "assessments_no_update"');
  try {
    await prisma.auditEvent.deleteMany({ where: { patientId: { in: ids } } });
    await prisma.legacyImport.deleteMany({ where: { clinicianId } });
    await prisma.patient.deleteMany({ where: { id: { in: ids } } });
  } finally {
    await prisma.$executeRawUnsafe('ALTER TABLE "audit_events" ENABLE TRIGGER "audit_events_append_only"');
    await prisma.$executeRawUnsafe('ALTER TABLE "assessments" ENABLE TRIGGER "assessments_no_update"');
  }
}

async function main() {
  assertNotProduction();

  // A fixed identifier so re-seeding replaces rather than accumulates. It is
  // not a Supabase user, so this clinician cannot sign in — the seed data is
  // for looking at during development, not for logging in as.
  const clinicianId = "00000000-0000-4000-8000-000000000001";

  const clinician = await prisma.clinician.upsert({
    where: { id: clinicianId },
    create: {
      id: clinicianId,
      email: "seed.clinician@example.invalid",
      displayName: "Dr Seed Clinician (development data)",
      role: "CARDIO_ONCOLOGIST",
    },
    update: { displayName: "Dr Seed Clinician (development data)" },
  });

  await clearSeedData(clinician.id);

  /* ------------------------------------------------------------ patient 1
     Combination anthracycline and HER2 therapy, with a dose ledger. */

  const combination = await prisma.patient.create({
    data: {
      name: "Anita Testcase",
      hospitalPatientId: `${SEED_PREFIX}0001`,
      ageAtRegistration: 58,
      sex: "FEMALE",
      clinicalStatus: "Stable",
      registeredOn: daysAgo(120),
      createdById: clinician.id,
      baseline: {
        create: {
          lvef: 62,
          gls: -20.5,
          qtc: 420,
          troponin: 4,
          ntProBnp: 90,
          weightKg: 68,
          heightCm: 162,
          troponinAssayId: "hs-cTnT",
        },
      },
      diagnoses: {
        create: {
          primarySite: "Breast",
          cancerType: "Invasive ductal carcinoma",
          stage: "Stage IIB",
          intent: "CURATIVE",
          diagnosedOn: daysAgo(150),
          isPrimary: true,
        },
      },
      riskFactors: {
        create: [
          { tier: "MODERATE_1", factorId: "age65to74", present: false },
          { tier: "MODERATE_2", factorId: "hypertension", present: true },
        ],
      },
      historyEntries: {
        create: [
          { groupId: "cardiovascular", itemId: "hypertension", kind: "CHECK", checked: true },
          { groupId: "lifestyle", itemId: "smoking", kind: "FIELD", value: "Never smoked" },
        ],
      },
      medications: {
        create: [
          {
            displayName: "Ramipril",
            medicationClass: "acei",
            strength: "5 mg",
            morning: 1,
            route: "ORAL",
            indication: "Hypertension",
            startedOn: daysAgo(300),
          },
          {
            displayName: "Bisoprolol",
            medicationClass: "betaBlocker",
            strength: "2.5 mg",
            morning: 1,
            route: "ORAL",
            startedOn: daysAgo(90),
          },
        ],
      },
    },
  });

  const combinationPlan = await prisma.therapyPlan.create({
    data: {
      patientId: combination.id,
      regimen: "AC-T followed by trastuzumab",
      plannedCycles: 8,
      cycleFrequency: "Every 21 days",
      currentCycle: 4,
      plannedStartOn: daysAgo(110),
      plannedCumulativeDose: 240,
      // Both classes. A record that kept only one of these would run only one
      // HFA-ICOS proforma and would understate the risk.
      classes: {
        create: [
          { therapyClass: "anthracycline", position: 0 },
          { therapyClass: "her2", position: 1 },
        ],
      },
      agents: {
        create: [
          { agentId: "doxorubicin", name: "Doxorubicin", plannedDose: 60, doseUnit: "MG_PER_M2" },
          { name: "Trastuzumab" },
        ],
      },
    },
  });

  for (let cycleNumber = 1; cycleNumber <= 4; cycleNumber += 1) {
    const cycle = await prisma.therapyCycle.create({
      data: {
        therapyPlanId: combinationPlan.id,
        cycleNumber,
        plannedOn: daysAgo(110 - (cycleNumber - 1) * 21),
        administeredOn: daysAgo(110 - (cycleNumber - 1) * 21),
        status: "ADMINISTERED",
      },
    });
    await prisma.anthracyclineDose.create({
      data: {
        patientId: combination.id,
        cycleId: cycle.id,
        agentId: "doxorubicin",
        dose: 60,
        doseUnit: "MG_PER_M2",
        bsa: 1.72,
        cycleNumber,
        givenOn: daysAgo(110 - (cycleNumber - 1) * 21),
        equivalenceModelId: "feijen2019",
      },
    });
  }

  await prisma.visit.create({
    data: {
      patientId: combination.id,
      clinicianId: clinician.id,
      visitType: "baseline",
      label: "Baseline",
      occurredOn: daysAgo(115),
      status: "FILED",
      filedAt: daysAgo(115),
      tolerance: "Well tolerated",
      notes: "Synthetic development record. Not a real patient.",
      vitals: { create: { systolicBp: 132, diastolicBp: 80, pulse: 74, weightKg: 68, heightCm: 162 } },
      investigations: {
        create: [
          {
            patientId: combination.id,
            investigationId: "lvef",
            numericValue: 62,
            unit: "%",
            measuredOn: daysAgo(115),
            isBaseline: true,
          },
          {
            patientId: combination.id,
            investigationId: "gls",
            numericValue: -20.5,
            unit: "%",
            measuredOn: daysAgo(115),
            isBaseline: true,
          },
        ],
      },
    },
  });

  /* ------------------------------------------------------------ patient 2
     Low baseline risk, current toxicity after therapy started. The point of
     this record is that the two must stay separate. */

  const twoAxis = await prisma.patient.create({
    data: {
      name: "Brian Fixture",
      hospitalPatientId: `${SEED_PREFIX}0002`,
      ageAtRegistration: 44,
      sex: "MALE",
      clinicalStatus: "Worsening",
      registeredOn: daysAgo(200),
      createdById: clinician.id,
      baseline: {
        create: {
          lvef: 60,
          gls: -21,
          troponin: 3,
          ntProBnp: 40,
          weightKg: 82,
          heightCm: 178,
          troponinAssayId: "hs-cTnT",
        },
      },
      // The current axis. Recorded here, and never written back into the
      // baseline risk assessment.
      toxicityStatus: {
        create: { troponinRise: true, glsFallPercent: 18.5, currentLvef: 51 },
      },
      diagnoses: {
        create: {
          primarySite: "Lymphoma",
          cancerType: "Diffuse large B-cell lymphoma",
          stage: "Stage III",
          intent: "CURATIVE",
          diagnosedOn: daysAgo(220),
          isPrimary: true,
        },
      },
      therapyPlans: {
        create: {
          regimen: "R-CHOP",
          plannedCycles: 6,
          currentCycle: 4,
          cycleFrequency: "Every 21 days",
          classes: { create: [{ therapyClass: "anthracycline", position: 0 }] },
        },
      },
    },
  });

  await prisma.visit.create({
    data: {
      patientId: twoAxis.id,
      clinicianId: clinician.id,
      visitType: "cycleReview",
      label: "Cycle 4",
      cycleNumber: 4,
      occurredOn: daysAgo(10),
      status: "FILED",
      filedAt: daysAgo(10),
      tolerance: "Minor toxicity",
      heartFailureStatus: "asymptomatic",
      notes: "Synthetic development record. Not a real patient.",
      vitals: { create: { systolicBp: 128, diastolicBp: 78, pulse: 88, weightKg: 80 } },
      symptoms: { create: [{ symptom: "Reduced exercise tolerance", severity: "Mild" }] },
      investigations: {
        create: [
          {
            patientId: twoAxis.id,
            investigationId: "lvef",
            numericValue: 51,
            unit: "%",
            measuredOn: daysAgo(10),
          },
          {
            patientId: twoAxis.id,
            investigationId: "gls",
            numericValue: -17.1,
            unit: "%",
            measuredOn: daysAgo(10),
          },
          {
            patientId: twoAxis.id,
            investigationId: "troponin",
            numericValue: 28,
            unit: "ng/L",
            measuredOn: daysAgo(10),
            // The assay and the limit that was applied travel with the value.
            assayId: "hs-cTnT",
            referenceUpperLimit: 14,
            laboratory: "Development laboratory",
          },
        ],
      },
    },
  });

  /* ------------------------------------------------------------ patient 3
     Checkpoint inhibitor with a troponin rise: the myocarditis screening
     pathway, which does not wait for symptoms or a fall in ejection fraction. */

  const checkpoint = await prisma.patient.create({
    data: {
      name: "Carla Sample",
      hospitalPatientId: `${SEED_PREFIX}0003`,
      ageAtRegistration: 67,
      sex: "FEMALE",
      clinicalStatus: "Stable",
      registeredOn: daysAgo(60),
      createdById: clinician.id,
      baseline: {
        create: { lvef: 58, troponin: 6, ntProBnp: 120, troponinAssayId: "hs-cTnI-Abbott" },
      },
      toxicityStatus: { create: { troponinRise: true } },
      diagnoses: {
        create: {
          primarySite: "Lung",
          cancerType: "Non-small-cell lung cancer",
          stage: "Stage IV",
          intent: "PALLIATIVE",
          diagnosedOn: daysAgo(80),
          isPrimary: true,
        },
      },
      therapyPlans: {
        create: {
          regimen: "Pembrolizumab",
          plannedCycles: 12,
          currentCycle: 2,
          cycleFrequency: "Every 21 days",
          classes: { create: [{ therapyClass: "ici", position: 0 }] },
        },
      },
    },
  });

  await prisma.visit.create({
    data: {
      patientId: checkpoint.id,
      clinicianId: clinician.id,
      visitType: "cycleReview",
      label: "Cycle 2",
      cycleNumber: 2,
      occurredOn: daysAgo(3),
      status: "DRAFT",
      notes: "Synthetic development record. Not a real patient.",
      vitals: { create: { systolicBp: 138, diastolicBp: 84, pulse: 92 } },
      investigations: {
        create: [
          {
            patientId: checkpoint.id,
            investigationId: "troponin",
            numericValue: 34,
            unit: "ng/L",
            measuredOn: daysAgo(3),
            // A different assay from patient 2, deliberately: the two values
            // are not comparable and nothing in CORSC should treat them as if
            // they were.
            assayId: "hs-cTnI-Abbott",
            referenceUpperLimit: 16,
            laboratory: "Development laboratory",
          },
        ],
      },
    },
  });

  console.info(
    [
      "Seed complete. THREE SYNTHETIC PATIENTS created — development and test data only.",
      `  1. ${combination.name} (${SEED_PREFIX}0001) — anthracycline + HER2 combination with a dose ledger`,
      `  2. ${twoAxis.name} (${SEED_PREFIX}0002) — low baseline risk with current toxicity`,
      `  3. ${checkpoint.name} (${SEED_PREFIX}0003) — checkpoint inhibitor with a troponin rise`,
      "",
      "None of these people exist. Do not add real patient data to prisma/seed.ts.",
    ].join("\n")
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
