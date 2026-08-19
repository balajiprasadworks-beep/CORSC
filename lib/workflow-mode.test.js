import { describe, expect, it } from "vitest";

import { quickSectionIds, resolveWorkflowMode, WORKFLOW_MODES } from "@/lib/workflow-mode";
import { visitType as lookupVisitType } from "@/lib/visit-types";

describe("resolveWorkflowMode", () => {
  it("recommends BASELINE for a baseline or pre-treatment visit unconditionally", () => {
    const baseline = resolveWorkflowMode({ visitType: lookupVisitType("baseline"), intervalHistory: {}, redFlags: [] });
    expect(baseline.mode).toBe(WORKFLOW_MODES.baseline.id);

    // Even with an escalation trigger present — establishing the reference
    // point is still the point of a baseline visit.
    const withTrigger = resolveWorkflowMode({
      visitType: lookupVisitType("preTreatment"),
      intervalHistory: { requiresReview: true },
      redFlags: [{ level: "red" }],
      fitnessVerdict: "hold",
    });
    expect(withTrigger.mode).toBe(WORKFLOW_MODES.baseline.id);
  });

  it("recommends ROUTINE REVIEW for a stable established patient", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: { requiresReview: false },
      redFlags: [],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.routine.id);
  });

  it("recommends ABNORMAL REVIEW for an unscheduled visit type", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("unscheduled"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.abnormal.id);
    expect(result.reasons.join(" ")).toContain("unscheduled");
  });

  it("recommends ABNORMAL REVIEW when the interval history requires review", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: { requiresReview: true },
      redFlags: [],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.abnormal.id);
  });

  it("recommends ABNORMAL REVIEW on a red or orange alert", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: {},
      redFlags: [{ level: "orange" }],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.abnormal.id);
  });

  it("recommends ABNORMAL REVIEW when the Action Bar verdict is caution or hold", () => {
    const caution = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "caution",
    });
    expect(caution.mode).toBe(WORKFLOW_MODES.abnormal.id);

    const hold = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "hold",
    });
    expect(hold.mode).toBe(WORKFLOW_MODES.abnormal.id);
  });

  it("recommends ABNORMAL REVIEW when the treatment phase transitioned at this visit", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "proceed",
      phaseTransitioned: true,
    });
    expect(result.mode).toBe(WORKFLOW_MODES.abnormal.id);
    expect(result.reasons.join(" ")).toContain("phase changed");
  });

  it("recommends SURVIVORSHIP for a stable post-treatment visit", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("twelveMonth"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.survivorship.id);
  });

  it("still finds an abnormal trigger during survivorship follow-up", () => {
    // A red flag at twelve months post-treatment is still a red flag.
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("twelveMonth"),
      intervalHistory: {},
      redFlags: [{ level: "red" }],
      fitnessVerdict: "proceed",
    });
    expect(result.mode).toBe(WORKFLOW_MODES.abnormal.id);
  });

  it("gives every mode a reason, so the clinician can see why it was recommended", () => {
    const result = resolveWorkflowMode({
      visitType: lookupVisitType("cycleReview"),
      intervalHistory: {},
      redFlags: [],
      fitnessVerdict: "proceed",
    });
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.automatic).toBe(true);
  });
});

describe("quickSectionIds", () => {
  it("gives baseline the registration-first compact sequence", () => {
    const ids = quickSectionIds("baseline");
    expect(ids[0]).toBe("registration");
    expect(ids).toContain("overview");
    // Full-record-only sections are not in the compact set at all.
    expect(ids).not.toContain("history");
    expect(ids).not.toContain("examination");
  });

  it("gives routine the interval-history-first compact sequence, matching the spec's own cycle-3 example", () => {
    const ids = quickSectionIds("routine");
    expect(ids).toEqual(["first-review", "since-last-visit", "symptoms", "vitals", "investigations", "overview"]);
  });

  it("falls back to the routine set for an unrecognised mode", () => {
    expect(quickSectionIds("not-a-real-mode")).toEqual(quickSectionIds("routine"));
  });

  it("never includes risk or surveillance as a collapsible section", () => {
    // They render unconditionally above every section instead — see
    // components/risk-surveillance-summary.jsx and components/fitness-banner.jsx.
    for (const mode of Object.keys(WORKFLOW_MODES)) {
      expect(quickSectionIds(mode)).not.toContain("risk");
      expect(quickSectionIds(mode)).not.toContain("surveillance");
    }
  });
});
