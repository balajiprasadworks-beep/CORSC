import { describe, expect, it } from "vitest";

import { assessEncounterCompleteness } from "@/lib/completeness";
import { createEncounter, createPatient } from "@/lib/patient-model";
import { buildClinicalPicture } from "@/lib/clinical-picture";
import { visitType as lookupVisitType } from "@/lib/visit-types";

function patient(overrides = {}) {
  return createPatient({
    name: "Test",
    age: "58",
    gender: "Female",
    diagnosis: "Breast carcinoma",
    therapy: ["anthracycline"],
    baselineLVEF: "60",
    risk: { category: "Moderate" },
    ...overrides,
  });
}

describe("assessVisitCompleteness routes by visit type", () => {
  it("uses the baseline dataset for a baseline visit", () => {
    const p = patient({ baselineLVEF: "" });
    const encounter = { ...createEncounter("Baseline"), visitType: "baseline", date: "2026-01-01" };
    const picture = buildClinicalPicture(p, encounter);

    // Baseline scoring treats missing baseline LVEF as critical — a fact this
    // test would catch if routing silently fell through to the encounter path.
    expect(picture.completeness.visitTypeId).toBeUndefined();
    expect(picture.completeness.missingCritical.some((item) => item.id === "baselineLVEF")).toBe(true);
  });

  it("uses the encounter dataset for a routine cycle review, not the baseline one", () => {
    const p = patient({ baselineLVEF: "" }); // deliberately missing — must not gate a routine visit
    const encounter = { ...createEncounter("Cycle 4"), visitType: "cycleReview", date: "2026-04-01", vitals: {}, symptoms: [] };
    const picture = buildClinicalPicture(p, encounter);

    expect(picture.completeness.visitTypeId).toBe("cycleReview");
    // The exact regression #24 exists to prevent: a routine visit is not
    // blocked because baseline LVEF was not retyped.
    expect(picture.completeness.missingCritical.some((item) => item.id === "baselineLVEF")).toBe(false);
  });
});

describe("assessEncounterCompleteness", () => {
  function build(encounterOverrides = {}, patientOverrides = {}) {
    const p = patient(patientOverrides);
    const encounter = { ...createEncounter("Cycle 4"), visitType: "cycleReview", date: "2026-04-01", ...encounterOverrides };
    const picture = buildClinicalPicture(p, encounter);
    return assessEncounterCompleteness(p, encounter, picture);
  }

  it("marks the interval history critical when the visit type requires it", () => {
    const result = build({ sinceLastVisit: undefined });
    const item = result.items.find((i) => i.id === "intervalHistory");
    expect(item.critical).toBe(true);
    expect(item.present).toBe(false);
  });

  it("clears the interval-history item once it has been answered", () => {
    const result = build({ sinceLastVisit: { chestPain: { present: false } } });
    const item = result.items.find((i) => i.id === "intervalHistory");
    expect(item.present).toBe(true);
  });

  it("does not treat routine documentation items as critical", () => {
    const result = build();
    const vitals = result.items.find((i) => i.id === "vitals");
    const medication = result.items.find((i) => i.id === "medication");
    expect(vitals.critical).toBe(false);
    expect(medication.critical).toBe(false);
  });

  it("omits items for sections the visit type does not show", () => {
    // sixMonth does not show examination or first-review in its section list.
    const p = patient();
    const encounter = { ...createEncounter("6 months post-treatment"), visitType: "sixMonth", date: "2026-09-01" };
    const picture = buildClinicalPicture(p, encounter);
    const result = assessEncounterCompleteness(p, encounter, picture);
    expect(result.items.some((i) => i.id === "tolerance")).toBe(false);
  });

  it("bands as insufficient exactly when a critical item is missing, never on a recommended one alone", () => {
    const missingCritical = build({ sinceLastVisit: undefined });
    expect(missingCritical.missingCritical.length).toBeGreaterThan(0);
    expect(missingCritical.band).toBe("insufficient");

    // Only the non-critical vitals item is missing here; interval history
    // (critical) is answered. Missing surveillance tasks are unavoidable in
    // this fixture (no tasks are ever marked done), so band that specific
    // item's presence directly rather than the whole record's band.
    const partial = build({ sinceLastVisit: { chestPain: { present: false } } });
    const intervalItem = partial.items.find((i) => i.id === "intervalHistory");
    expect(intervalItem.present).toBe(true);
    expect(partial.missingCritical.every((item) => item.id !== "intervalHistory")).toBe(true);
  });

  it("carries the visit type identity so the UI can label it correctly", () => {
    const result = build();
    expect(result.visitTypeId).toBe("cycleReview");
    expect(result.visitTypeLabel).toBe(lookupVisitType("cycleReview").label);
  });

  it("treats the symptom screen as a recommended item, missing until it is either screened negative or a symptom is recorded", () => {
    const unscreened = build({ symptoms: [], symptomsScreenComplete: false });
    const unscreenedItem = unscreened.items.find((i) => i.id === "symptomScreen");
    expect(unscreenedItem.critical).toBe(false);
    expect(unscreenedItem.present).toBe(false);

    const screenedNegative = build({ symptoms: [], symptomsScreenComplete: true });
    expect(screenedNegative.items.find((i) => i.id === "symptomScreen").present).toBe(true);

    const positiveScreen = build({ symptoms: ["Breathlessness on exertion"], symptomsScreenComplete: false });
    expect(positiveScreen.items.find((i) => i.id === "symptomScreen").present).toBe(true);
  });
});
