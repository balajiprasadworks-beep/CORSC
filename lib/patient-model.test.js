import { describe, expect, it } from "vitest";

import { createEncounter, isEstablishedPatient, seedBaselineDefaults } from "@/lib/patient-model";

describe("isEstablishedPatient", () => {
  it("is false for a brand-new patient with no filed visits", () => {
    expect(isEstablishedPatient({ visits: [] })).toBe(false);
    expect(isEstablishedPatient({})).toBe(false);
  });

  it("is true once at least one visit has been filed", () => {
    expect(isEstablishedPatient({ visits: [{ id: "v1" }] })).toBe(true);
  });
});

describe("seedBaselineDefaults", () => {
  const patient = { baselineLVEF: "55", baselineGLS: "-19", baselineWeight: "72", registeredDate: "2026-01-05" };

  it("leaves a non-baseline encounter untouched", () => {
    const encounter = createEncounter("Cycle 3");
    expect(seedBaselineDefaults(encounter, patient)).toBe(encounter);
  });

  it("fills the baseline echo LVEF, GLS and today's weight from the registration values", () => {
    const encounter = createEncounter("Baseline");
    const seeded = seedBaselineDefaults(encounter, patient);
    expect(seeded.inv.lvef.result).toBe("55");
    expect(seeded.inv.gls.result).toBe("-19");
    expect(seeded.vitals.weight).toBe("72");
  });

  it("never overwrites a value the clinician already entered for this encounter", () => {
    const encounter = createEncounter("Baseline");
    encounter.inv.lvef.result = "48";
    encounter.vitals.weight = "68";
    const seeded = seedBaselineDefaults(encounter, patient);
    expect(seeded.inv.lvef.result).toBe("48");
    expect(seeded.vitals.weight).toBe("68");
  });

  it("returns the same object when there is nothing to seed", () => {
    const encounter = createEncounter("Baseline");
    expect(seedBaselineDefaults(encounter, {})).toBe(encounter);
  });
});
