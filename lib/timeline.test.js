import { describe, expect, it } from "vitest";

import { buildPatientTimeline } from "@/lib/timeline";
import { courseFromPreset, setActivePhase } from "@/lib/treatment-course";

/**
 * The timeline is where spec item #5's acceptance criterion lives: "the
 * timeline records the exact phase transition". These tests exist to prove
 * that fact specifically, not to re-test buildPatientTimeline generally.
 */
describe("phase transitions on the patient timeline", () => {
  function courseWithTransition() {
    let course = courseFromPreset("breast_ac_th");
    course = setActivePhase(course, course.phases[0].id, { on: "2026-01-05" });
    course = setActivePhase(course, course.phases[1].id, { on: "2026-03-16" });
    return course;
  }

  it("adds one event per phase transition, dated when it actually happened", () => {
    const events = buildPatientTimeline({ treatmentCourse: courseWithTransition(), visits: [] }, null);
    const transitions = events.filter((event) => event.kind === "phaseTransition");

    expect(transitions).toHaveLength(1);
    expect(transitions[0].date).toBe("2026-03-16");
    expect(transitions[0].title).toBe("Moved from AC to TH");
  });

  it("carries the plain-language reason as the event detail", () => {
    const events = buildPatientTimeline({ treatmentCourse: courseWithTransition(), visits: [] }, null);
    const transition = events.find((event) => event.kind === "phaseTransition");
    expect(transition.detail).toContain("no longer receiving Anthracyclines");
  });

  it("adds no event for a course that has never transitioned", () => {
    const course = courseFromPreset("breast_ac_th");
    const events = buildPatientTimeline({ treatmentCourse: course, visits: [] }, null);
    expect(events.some((event) => event.kind === "phaseTransition")).toBe(false);
  });

  it("adds no event for a patient with no structured course", () => {
    const events = buildPatientTimeline({ regimen: "AC-T", visits: [] }, null);
    expect(events.some((event) => event.kind === "phaseTransition")).toBe(false);
  });

  it("orders a phase transition alongside encounters by date", () => {
    let course = courseFromPreset("breast_ac_th");
    course = setActivePhase(course, course.phases[0].id, { on: "2026-01-05" });
    course = setActivePhase(course, course.phases[1].id, { on: "2026-03-16" });

    const events = buildPatientTimeline(
      {
        treatmentCourse: course,
        registeredDate: "2026-01-01",
        visits: [
          { id: "v1", type: "Cycle 2", date: "2026-02-10", symptoms: [] },
          { id: "v2", type: "Cycle 5", date: "2026-04-01", symptoms: [] },
        ],
      },
      null
    );

    const dates = events.map((event) => event.date);
    expect(dates).toEqual([...dates].sort());
    const transitionIndex = events.findIndex((event) => event.kind === "phaseTransition");
    expect(events[transitionIndex - 1].date <= "2026-03-16").toBe(true);
    expect(events[transitionIndex + 1].date >= "2026-03-16").toBe(true);
  });
});
