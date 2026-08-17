/* =========================================================================
   The engine adapter.

   This is the test that the claim "the clinical engines were not modified"
   actually holds. The engines read one denormalised patient object; the
   database stores normalised rows; toEnginePatientRecord is the only thing in
   between. If it produces a subtly different shape — a blank ejection fraction
   as 0, a therapy list collapsed to its first entry, a symptom list detached
   from its detail — the engines will keep running and start being wrong.

   So these assertions are about shape and fidelity, not about clinical
   results: the clinical results are covered by the engines' own suites, which
   are unchanged.
   ========================================================================= */

import { describe, expect, it } from "vitest";

import { describeDose, toEnginePatientRecord } from "@/lib/backend/services/engine-patient";

type AnyRow = Parameters<typeof toEnginePatientRecord>[0];

function decimal(value: number) {
  // Prisma returns Decimal objects; the adapter must read them through
  // toString rather than assuming a JS number.
  return { toString: () => String(value) } as never;
}

function row(overrides: Record<string, unknown> = {}): AnyRow {
  return {
    id: "patient-1",
    hospitalPatientId: "MRN-1",
    mrn: null,
    name: "Test Patient",
    dateOfBirth: null,
    ageAtRegistration: 58,
    sex: "FEMALE",
    status: "ACTIVE",
    clinicalStatus: "Stable",
    registeredOn: new Date("2026-01-05T00:00:00Z"),
    archivedAt: null,
    archivedById: null,
    archiveReason: null,
    createdById: "clinician-1",
    createdAt: new Date("2026-01-05T00:00:00Z"),
    updatedAt: new Date("2026-01-05T00:00:00Z"),
    legacyId: null,
    baseline: null,
    toxicityStatus: null,
    historyEntries: [],
    riskFactors: [],
    contraindications: [],
    diagnoses: [],
    therapyPlans: [],
    medications: [],
    anthracyclineDoses: [],
    overrides: [],
    visits: [],
    ...overrides,
  } as unknown as AnyRow;
}

describe("toEnginePatientRecord", () => {
  it("maps identity onto the shape the engines read", () => {
    const patient = toEnginePatientRecord(row());
    expect(patient.id).toBe("patient-1");
    expect(patient.patientId).toBe("MRN-1");
    expect(patient.name).toBe("Test Patient");
    expect(patient.age).toBe(58);
    expect(patient.gender).toBe("Female");
    expect(patient.registeredDate).toBe("2026-01-05");
  });

  it("renders a missing measurement as not recorded, never as zero", () => {
    // The single most dangerous mapping error available here: a null ejection
    // fraction arriving as 0 reads as profound cardiac dysfunction.
    const patient = toEnginePatientRecord(row({ baseline: null }));
    expect(patient.baselineLVEF).toBe("");
    expect(patient.baselineLVEF).not.toBe(0);
    expect(patient.baselineTroponin).toBe("");
  });

  it("reads Prisma decimals as numbers", () => {
    const patient = toEnginePatientRecord(
      row({
        baseline: {
          patientId: "patient-1",
          lvef: decimal(62),
          gls: decimal(-20.5),
          qtc: 420,
          troponin: decimal(4),
          ntProBnp: decimal(90),
          weightKg: decimal(68),
          heightCm: decimal(162),
          troponinAssayId: "hs-cTnT",
          troponinLocalUrl: null,
          recordedAt: new Date(),
          updatedAt: new Date(),
        },
      })
    );
    expect(patient.baselineLVEF).toBe(62);
    expect(patient.baselineGLS).toBe(-20.5);
    expect(patient.troponinAssay).toBe("hs-cTnT");
  });

  it("unions therapy classes across active plans", () => {
    // Combination therapy is the case that matters. A patient on an
    // anthracycline plan and a HER2 plan is on both, and dropping either
    // changes which HFA-ICOS proformas run.
    const patient = toEnginePatientRecord(
      row({
        therapyPlans: [
          {
            id: "plan-1",
            active: true,
            regimen: "AC",
            plannedCycles: 4,
            cycleFrequency: "Every 21 days",
            currentCycle: 2,
            plannedCumulativeDose: decimal(240),
            classes: [{ therapyClass: "anthracycline", position: 0 }],
            agents: [],
            cycles: [],
          },
          {
            id: "plan-2",
            active: true,
            regimen: "Trastuzumab",
            plannedCycles: 18,
            cycleFrequency: "Every 21 days",
            currentCycle: 0,
            plannedCumulativeDose: null,
            classes: [{ therapyClass: "her2", position: 0 }],
            agents: [],
            cycles: [],
          },
        ],
      })
    );

    expect(patient.therapy).toEqual(["anthracycline", "her2"]);
    // The lead plan supplies the regimen-level fields the engines read.
    expect(patient.regimen).toBe("AC");
    expect(patient.cycle).toBe(2);
  });

  it("rebuilds the risk factor tiers the proformas read", () => {
    const patient = toEnginePatientRecord(
      row({
        riskFactors: [
          { tier: "MODERATE_2", factorId: "hypertension", present: true },
          { tier: "HIGH", factorId: "priorHF", present: true },
          // A withdrawn factor must not be scored.
          { tier: "VERY_HIGH", factorId: "severeVHD", present: false },
        ],
      })
    );

    expect(patient.m2).toEqual({ hypertension: true });
    expect(patient.high).toEqual({ priorHF: true });
    expect(patient.veryHigh).toEqual({});
  });

  it("rebuilds history groups as checks and fields", () => {
    const patient = toEnginePatientRecord(
      row({
        historyEntries: [
          { groupId: "cardiovascular", itemId: "hypertension", kind: "CHECK", checked: true },
          { groupId: "cardiovascular", itemId: "diabetes", kind: "CHECK", checked: false },
          { groupId: "lifestyle", itemId: "smoking", kind: "FIELD", value: "Never smoked" },
        ],
      })
    );

    expect(patient.history.cardiovascular.checks).toEqual({ hypertension: true });
    expect(patient.history.lifestyle.fields).toEqual({ smoking: "Never smoked" });
  });

  it("keeps the toxicity status on its own axis", () => {
    const patient = toEnginePatientRecord(
      row({
        toxicityStatus: {
          patientId: "patient-1",
          myocarditisConfirmed: false,
          severeHeartFailure: false,
          troponinRise: true,
          glsFallPercent: decimal(18.5),
          currentLvef: decimal(51),
          updatedById: null,
          updatedAt: new Date(),
        },
      })
    );

    expect(patient.restratification.troponinRise).toBe(true);
    expect(patient.restratification.glsFall).toBe(18.5);
    expect(patient.restratification.currentLVEF).toBe(51);
  });

  it("projects a visit into the flat shape the engines consume", () => {
    const patient = toEnginePatientRecord(
      row({
        visits: [
          {
            id: "visit-1",
            visitType: "cycleReview",
            label: "Cycle 4",
            cycleNumber: 4,
            occurredOn: new Date("2026-03-01T00:00:00Z"),
            status: "FILED",
            tolerance: "Minor toxicity",
            interimEvents: null,
            admissions: null,
            clinicalConcerns: null,
            earlyToxicity: null,
            heartFailureStatus: "asymptomatic",
            medicationReview: "Reviewed",
            plan: "Continue",
            notes: "Note",
            nextFollowUpOn: new Date("2026-03-22T00:00:00Z"),
            generatedSummary: null,
            vitals: {
              visitId: "visit-1",
              heightCm: decimal(162),
              weightKg: decimal(66),
              referenceWeightKg: null,
              systolicBp: 128,
              diastolicBp: 78,
              pulse: 88,
              respiratoryRate: 16,
              spo2: 98,
              temperatureC: decimal(36.8),
              updatedAt: new Date(),
            },
            symptoms: [
              {
                symptom: "Chest pain",
                severity: "Moderate",
                duration: "3 days",
                trigger: "On exertion",
                radiation: null,
                associated: null,
              },
            ],
            systemExams: [
              {
                systemId: "cvs",
                status: "FINDINGS",
                components: [{ componentId: "auscultation", normal: false, findings: "Soft systolic murmur" }],
              },
            ],
            intervalAnswers: [{ itemId: "chestPain", present: true, detail: "On exertion" }],
            taskCompletions: [{ taskId: "echo", completed: true }],
            medicationDecisions: [{ recommendationId: "acei", decision: "accepted" }],
            investigations: [
              {
                investigationId: "troponin",
                numericValue: decimal(28),
                resultText: null,
                interpretation: "Elevated",
                measuredOn: new Date("2026-03-01T00:00:00Z"),
                comment: null,
                unit: "ng/L",
                assayId: "hs-cTnT",
                referenceUpperLimit: decimal(14),
                laboratory: "Lab",
                measurements: null,
              },
            ],
          },
        ],
      })
    );

    const visit = patient.visits[0];
    expect(visit.type).toBe("Cycle 4");
    expect(visit.date).toBe("2026-03-01");
    expect(visit.saved).toBe(true);
    expect(visit.vitals.sbp).toBe(128);
    expect(visit.symptoms).toEqual(["Chest pain"]);
    expect(visit.symptomDetail["Chest pain"].duration).toBe("3 days");
    expect(visit.systems.cvs.status).toBe("findings");
    expect(visit.systems.cvs.components.auscultation.text).toBe("Soft systolic murmur");
    expect(visit.sinceLastVisit.chestPain).toEqual({ present: true, detail: "On exertion" });
    expect(visit.taskCompletion.echo).toBe(true);
    expect(visit.medDecisions.acei).toBe("accepted");

    // The assay travels with the value, because troponin results from
    // different assays are not comparable.
    expect(visit.inv.troponin.value).toBe(28);
    expect(visit.inv.troponin.assayId).toBe("hs-cTnT");
    expect(visit.inv.troponin.referenceUpperLimit).toBe(14);
    // `result` is what the engines read for numeric investigations too.
    expect(visit.inv.troponin.result).toBe("28");
  });

  it("attaches a computed risk category rather than a stored one", () => {
    const patient = toEnginePatientRecord(row());
    // Computed by the engine on read, so it cannot go stale when a risk factor
    // is recorded.
    expect(patient.risk).toBeDefined();
    expect(patient.risk).toHaveProperty("category");
  });

  it("keeps a dose that could not be converted, with the reason", () => {
    const patient = toEnginePatientRecord(
      row({
        anthracyclineDoses: [
          {
            id: "dose-1",
            agentId: "doxorubicin",
            dose: decimal(60),
            doseUnit: "MG_PER_M2",
            bsa: decimal(1.72),
            cycleNumber: 1,
            givenOn: new Date("2026-01-10T00:00:00Z"),
            equivalenceModelId: "feijen2019",
            conversionFailureReason: null,
          },
          {
            id: "dose-2",
            agentId: "unknown",
            dose: decimal(0),
            doseUnit: "MG",
            bsa: null,
            cycleNumber: 2,
            givenOn: null,
            equivalenceModelId: "feijen2019",
            conversionFailureReason: "The agent is not one CORSC holds an equivalence factor for.",
          },
        ],
      })
    );

    // A cumulative total that silently dropped a dose would understate the
    // exposure, which is the one number the ledger exists to get right.
    expect(patient.anthracyclineDoses).toHaveLength(2);
    expect(patient.anthracyclineDoses[1].conversionFailureReason).toContain("equivalence factor");
  });

  it("exposes only active medications to the engines", () => {
    const patient = toEnginePatientRecord(
      row({
        medications: [
          {
            id: "med-1",
            displayName: "Ramipril",
            medicationClass: "acei",
            strength: "5 mg",
            doseAmount: null,
            doseUnit: null,
            morning: decimal(1),
            afternoon: decimal(0),
            evening: decimal(0),
            night: decimal(0),
            frequencyNote: null,
            active: true,
          },
          {
            id: "med-2",
            displayName: "Bisoprolol",
            medicationClass: "betaBlocker",
            strength: "2.5 mg",
            doseAmount: null,
            doseUnit: null,
            morning: decimal(1),
            afternoon: decimal(0),
            evening: decimal(0),
            night: decimal(0),
            frequencyNote: null,
            // Stopped. The row is kept for the history, but a stopped drug must
            // not count towards duplication or interaction screening.
            active: false,
          },
        ],
      })
    );

    expect(patient.medications).toHaveLength(1);
    expect(patient.medications[0].name).toBe("Ramipril");
    expect(patient.medications[0].klass).toBe("acei");
  });
});

describe("describeDose", () => {
  const base = {
    strength: null,
    doseAmount: null,
    doseUnit: null,
    morning: decimal(0),
    afternoon: decimal(0),
    evening: decimal(0),
    night: decimal(0),
    frequencyNote: null,
  };

  it("renders the four prescription slots", () => {
    expect(
      describeDose({ ...base, strength: "5 mg", morning: decimal(1), night: decimal(1) })
    ).toBe("5 mg 1-0-0-1");
  });

  it("omits the slots when none is prescribed", () => {
    expect(describeDose({ ...base, strength: "5 mg" })).toBe("5 mg");
  });

  it("keeps a free-text frequency the four slots cannot express", () => {
    expect(
      describeDose({ ...base, strength: "2.5 mg", frequencyNote: "alternate days" })
    ).toBe("2.5 mg alternate days");
  });
});
