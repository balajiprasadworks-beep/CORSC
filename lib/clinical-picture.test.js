import { describe, expect, it } from "vitest";

import { buildClinicalPicture } from "@/lib/clinical-picture";
import { GRADE_MODERATE, GRADE_NONE, GRADE_SEVERE } from "@/lib/ctrcd";
import { createEncounter, createPatient } from "@/lib/patient-model";

function build({ patient = {}, encounter = {} } = {}) {
  const fullPatient = createPatient({
    name: "Test patient",
    age: "58",
    gender: "Male",
    diagnosis: "Breast carcinoma",
    therapy: ["anthracycline"],
    baselineLVEF: "62",
    plannedCycles: "6",
    risk: { category: "Moderate", reason: "1 moderate-risk point", points: 1 },
    ...patient,
  });
  const fullEncounter = {
    ...createEncounter("Cycle 3"),
    date: "2026-03-10",
    ...encounter,
  };
  return buildClinicalPicture(fullPatient, fullEncounter);
}

function withLvef(value, extra = {}) {
  const base = createEncounter("Cycle 3");
  return { ...base, inv: { ...base.inv, lvef: { result: String(value), interp: "", date: "", comment: "" } }, ...extra };
}

describe("one definition of cardiac dysfunction", () => {
  it("agrees across the graded verdict, the alerts and the fitness banner", () => {
    // The regression this guards: four modules previously carried their own
    // LVEF thresholds - 53% in one, 50% in three - so the same patient could
    // be flagged in one panel and clear in another.
    const picture = build({ encounter: withLvef(45) });

    expect(picture.ctrcd.grade).toBe(GRADE_MODERATE);
    expect(picture.alerts.some((alert) => alert.id === "ctrcd")).toBe(true);
    expect(picture.fitness.findings.some((finding) => finding.id === "ctrcd-moderate")).toBe(true);
    expect(picture.signals.ctrcd.grade).toBe(picture.ctrcd.grade);
  });

  it("agrees that a preserved ejection fraction is not dysfunction", () => {
    const picture = build({ encounter: withLvef(58) });

    expect(picture.ctrcd.grade).toBe(GRADE_NONE);
    expect(picture.alerts.some((alert) => alert.id === "ctrcd")).toBe(false);
    expect(picture.fitness.findings.some((finding) => finding.id.startsWith("ctrcd"))).toBe(false);
  });

  it("clears a patient whose surveillance is up to date", () => {
    // A mid-course encounter with no earlier results recorded legitimately
    // carries outstanding investigations, so the baseline milestone is filled
    // in here to isolate the dysfunction question.
    const baseline = {
      ...createEncounter("Baseline"),
      id: "v-baseline",
      date: "2026-01-06",
      inv: {
        ...createEncounter("Baseline").inv,
        ecg: { result: "Sinus rhythm", interp: "Normal", date: "2026-01-06", comment: "" },
        echo: { result: "Structurally normal", interp: "Normal", date: "2026-01-06", comment: "" },
        lvef: { result: "62", interp: "Normal", date: "2026-01-06", comment: "" },
        gls: { result: "-21", interp: "Normal", date: "2026-01-06", comment: "" },
        troponin: { result: "5", interp: "Normal", date: "2026-01-06", comment: "" },
        ntprobnp: { result: "60", interp: "Normal", date: "2026-01-06", comment: "" },
        cbc: { result: "Normal", interp: "Normal", date: "2026-01-06", comment: "" },
        rft: { result: "Normal", interp: "Normal", date: "2026-01-06", comment: "" },
        lft: { result: "Normal", interp: "Normal", date: "2026-01-06", comment: "" },
        electrolytes: { result: "Normal", interp: "Normal", date: "2026-01-06", comment: "" },
      },
    };

    const picture = build({
      patient: { visits: [baseline], plannedCycles: "1", cycle: 1, risk: { category: "Low", reason: "None", points: 0 } },
      encounter: { ...withLvef(60), type: "Cycle 1", vitals: { sbp: "124", dbp: "78" } },
    });

    expect(picture.ctrcd.grade).toBe(GRADE_NONE);
    expect(picture.fitness.verdict).toBe("proceed");
  });

  it("does not flag a 52% ejection fraction that the old 53% threshold would have caught", () => {
    // clinical-data.js used < 53%, so a fall from 62 to 52 raised a CTRCD
    // alert there while every other module read it as normal.
    const picture = build({ encounter: withLvef(52) });

    expect(picture.ctrcd.grade).toBe(GRADE_NONE);
    expect(picture.alerts.some((alert) => alert.id === "ctrcd")).toBe(false);
  });

  it("escalates the medication engine from the same grade", () => {
    const picture = build({ encounter: withLvef(45) });
    const acei = picture.recommendations.find((rec) => rec.id === "acei-arb");

    expect(acei).toBeDefined();
    expect(acei.strength).toBe("Indicated");
    expect(picture.warnings.some((warning) => warning.id === "missing-acei-arb")).toBe(true);
  });

  it("carries severe dysfunction all the way to a hold", () => {
    const picture = build({ encounter: withLvef(33) });

    expect(picture.ctrcd.grade).toBe(GRADE_SEVERE);
    expect(picture.currentRisk).toBe("Very High");
    expect(picture.fitness.verdict).toBe("hold");
  });
});

describe("risk category", () => {
  it("recomputes the baseline category so history factors count", () => {
    const picture = build({
      patient: {
        risk: { category: "Low", reason: "No risk factors present", points: 0 },
        history: {
          ...createPatient({}).history,
          riskFactors: { checks: { htn: true, dm: true }, fields: {} },
        },
      },
      encounter: withLvef(60),
    });

    // Two moderate points from the history alone.
    //
    // RECLASSIFICATION, EXPECTED. This assertion previously read "High",
    // because the engine escalated at two moderate points. The published
    // HFA-ICOS bands put 2 to 4 points in the moderate category and require 5
    // for high, so the corrected engine returns Moderate. The change is a fix,
    // not a regression: see lib/hfa-icos.js.
    expect(picture.riskAssessment.points).toBe(2);
    expect(picture.riskAssessment.category).toBe("Moderate");
  });

  it("reports which factors were derived rather than ticked", () => {
    const picture = build({
      patient: {
        history: { ...createPatient({}).history, riskFactors: { checks: { htn: true }, fields: {} } },
      },
      encounter: withLvef(60),
    });

    // Factor ids are now the clinical concept rather than the position in the
    // old flat list. Records that carry the legacy "m1e" tick still resolve to
    // this factor — that is covered in lib/hfa-icos.test.js.
    expect(picture.riskAssessment.derived.map((factor) => factor.id)).toContain("hypertension");
  });
});

describe("picture shape", () => {
  it("exposes everything the workflow renders", () => {
    const picture = build({ encounter: withLvef(58) });

    ["ctrcd", "fitness", "ledger", "riskAssessment", "therapies", "tasks", "nextFollowUp", "alerts"].forEach((key) => {
      expect(picture[key]).toBeDefined();
    });
  });

  it("carries the acuity band and a single-sentence reason on the follow-up plan", () => {
    const picture = build({ encounter: withLvef(58) });

    expect(picture.nextFollowUp.band).toBeTruthy();
    expect(picture.nextFollowUp.label).toBeTruthy();
    expect(typeof picture.nextFollowUp.reason).toBe("string");
  });

  it("lists every planned therapy", () => {
    const picture = build({ patient: { therapy: ["anthracycline", "her2"] }, encounter: withLvef(58) });
    expect(picture.therapies).toEqual(["anthracycline", "her2"]);
  });
});

describe("checkpoint inhibitor pathway end to end", () => {
  it("takes an asymptomatic troponin rise from signal to hold", () => {
    const base = createEncounter("Cycle 2");
    const picture = build({
      patient: { therapy: ["ici"], risk: { category: "Low", reason: "None", points: 0 } },
      encounter: {
        ...base,
        inv: { ...base.inv, troponin: { result: "58", interp: "", date: "", comment: "" } },
        symptoms: [],
      },
    });

    expect(picture.signals.suspectedICIMyocarditis).toBe(true);
    expect(picture.alerts.some((alert) => alert.id === "ici-myocarditis")).toBe(true);
    expect(picture.fitness.verdict).toBe("hold");
    expect(picture.currentRisk).toBe("Very High");
    expect(picture.nextFollowUp.band).toBe("now");
  });
});
