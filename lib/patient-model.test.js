import { describe, expect, it } from "vitest";

import { isEstablishedPatient } from "@/lib/patient-model";

describe("isEstablishedPatient", () => {
  it("is false for a brand-new patient with no filed visits", () => {
    expect(isEstablishedPatient({ visits: [] })).toBe(false);
    expect(isEstablishedPatient({})).toBe(false);
  });

  it("is true once at least one visit has been filed", () => {
    expect(isEstablishedPatient({ visits: [{ id: "v1" }] })).toBe(true);
  });
});
