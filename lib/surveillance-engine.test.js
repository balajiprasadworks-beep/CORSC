import { describe, expect, it } from "vitest";

import { ACUITY } from "@/lib/acuity";
import { cycleOf, phaseOf } from "@/lib/encounter-phase";
import {
  ACKNOWLEDGED_TASKS,
  getClinicalSignals,
  getDynamicSurveillanceTasks,
  getNextFollowUpPlan,
  isTaskComplete,
} from "@/lib/surveillance-engine";

function patient(overrides = {}) {
  return {
    age: "58",
    gender: "Male",
    baselineLVEF: "62",
    therapy: ["anthracycline"],
    risk: { category: "Moderate" },
    cycle: 3,
    visits: [],
    ...overrides,
  };
}

function visit(overrides = {}) {
  return {
    id: "v1",
    type: "Cycle 3",
    date: "2026-03-10",
    symptoms: [],
    inv: {},
    exam: {},
    ...overrides,
  };
}

function taskIds(tasks) {
  return tasks.map((task) => task.id);
}

describe("phase resolution", () => {
  it("recognises every post-treatment milestone, including six months", () => {
    // The six-month case was previously classified as an active treatment
    // cycle by the surveillance engine while the investigation timeline
    // correctly placed it in survivorship.
    expect(phaseOf({ type: "Baseline" })).toBe("baseline");
    expect(phaseOf({ type: "Cycle 4" })).toBe("treatment");
    expect(phaseOf({ type: "End of treatment" })).toBe("end");
    expect(phaseOf({ type: "3 months post-treatment" })).toBe("threeMonth");
    expect(phaseOf({ type: "6 months post-treatment" })).toBe("sixMonth");
    expect(phaseOf({ type: "12 months post-treatment" })).toBe("twelveMonth");
  });

  it("does not mistake twelve months for two months", () => {
    expect(phaseOf({ type: "12 months post-treatment" })).not.toBe("treatment");
  });

  it("returns null rather than defaulting the cycle to one", () => {
    // Defaulting to 1 previously let the checkpoint-inhibitor early window be
    // skipped, because an unnumbered encounter looked like the first dose.
    expect(cycleOf({}, { type: "Baseline" })).toBeNull();
    expect(cycleOf({ cycle: 4 }, { type: "Review" })).toBe(4);
    expect(cycleOf({}, { type: "Cycle 6" })).toBe(6);
    expect(cycleOf({}, { firstReview: { cycle: "2" } })).toBe(2);
  });
});

describe("multi-therapy protocols", () => {
  it("applies every planned therapy, not only the first", () => {
    // AC-T with trastuzumab: the HER2 protocol was previously dropped.
    const tasks = getDynamicSurveillanceTasks(
      patient({ therapy: ["anthracycline", "her2"], risk: { category: "High" }, cycle: 6 }),
      visit({ type: "Cycle 6" })
    );
    const ids = taskIds(tasks);
    expect(ids).toContain("troponin");
    expect(ids).toContain("echo");
    expect(ids).toContain("gls");
  });

  it("gives a combined regimen at least the tasks of each therapy alone", () => {
    const both = taskIds(
      getDynamicSurveillanceTasks(patient({ therapy: ["anthracycline", "ici"], cycle: 2 }), visit({ type: "Cycle 2" }))
    );
    const iciOnly = taskIds(
      getDynamicSurveillanceTasks(patient({ therapy: ["ici"], cycle: 2 }), visit({ type: "Cycle 2" }))
    );
    iciOnly.forEach((id) => expect(both).toContain(id));
  });

  it("still works when a single therapy is stored as a bare string", () => {
    const tasks = getDynamicSurveillanceTasks(patient({ therapy: "anthracycline" }), visit());
    expect(taskIds(tasks)).toContain("ecg");
  });
});

describe("checkpoint inhibitor myocarditis", () => {
  const iciPatient = patient({ therapy: ["ici"], risk: { category: "Low" }, cycle: 2 });

  it("escalates on a troponin rise alone, without symptoms", () => {
    const signals = getClinicalSignals(
      iciPatient,
      visit({ inv: { troponin: { value: 60 } }, symptoms: [] })
    );
    expect(signals.suspectedICIMyocarditis).toBe(true);
  });

  it("holds immunotherapy pending assessment", () => {
    const tasks = getDynamicSurveillanceTasks(
      iciPatient,
      visit({ type: "Cycle 2", inv: { troponin: { value: 60 } } })
    );
    expect(taskIds(tasks)).toContain("chemo-continuation");
    expect(taskIds(tasks)).toContain("urgent-cardiology");
  });

  it("returns assess-now acuity", () => {
    const plan = getNextFollowUpPlan(iciPatient, visit({ type: "Cycle 2", inv: { troponin: { value: 60 } } }));
    expect(plan.band).toBe(ACUITY.now.id);
  });

  it("does not raise the flag for a non-checkpoint therapy", () => {
    const signals = getClinicalSignals(patient(), visit({ inv: { troponin: { value: 60 } } }));
    expect(signals.suspectedICIMyocarditis).toBe(false);
  });

  it("screens the early window even when the cycle is unrecorded", () => {
    const tasks = getDynamicSurveillanceTasks(
      { therapy: ["ici"], risk: { category: "Low" }, visits: [] },
      visit({ type: "Review", cycle: null })
    );
    expect(taskIds(tasks)).toContain("troponin");
  });
});

describe("task completion", () => {
  it("does not mark a referral complete because the plan field has text", () => {
    // Eight safety tasks previously shared Boolean(visit.plan) as their test.
    const task = { id: "urgent-cardiology" };
    expect(isTaskComplete(task, visit({ plan: "review in 3 weeks" }))).toBe(false);
  });

  it("keeps every action task outstanding until explicitly acknowledged", () => {
    ACKNOWLEDGED_TASKS.forEach((id) => {
      expect(isTaskComplete({ id }, visit({ plan: "some text", notes: "more text" }))).toBe(false);
    });
  });

  it("accepts an explicit acknowledgement", () => {
    const task = { id: "urgent-cardiology" };
    expect(isTaskComplete(task, visit({ taskCompletion: { "urgent-cardiology": true } }))).toBe(true);
  });

  it("resolves tasks that leave an objective trace", () => {
    expect(isTaskComplete({ id: "ecg" }, visit({ inv: { ecg: { result: "Sinus rhythm" } } }))).toBe(true);
    expect(isTaskComplete({ id: "echo" }, visit({ inv: { lvef: { result: "58" } } }))).toBe(true);
    expect(isTaskComplete({ id: "medication-review" }, visit({ medReview: "No changes" }))).toBe(true);
  });

  it("honours an explicit false over inferred evidence", () => {
    const encounter = visit({ inv: { ecg: { result: "Sinus" } }, taskCompletion: { ecg: false } });
    expect(isTaskComplete({ id: "ecg" }, encounter)).toBe(false);
  });
});

describe("follow-up acuity", () => {
  it("returns assess-now for chest pain rather than a date tomorrow", () => {
    const plan = getNextFollowUpPlan(patient(), visit({ symptoms: ["Chest pain"] }));
    expect(plan.band).toBe(ACUITY.now.id);
    expect(plan.days).toBe(0);
  });

  it("separates pedal oedema from chest pain", () => {
    const oedema = getNextFollowUpPlan(patient(), visit({ symptoms: ["Pedal oedema"] }));
    const chestPain = getNextFollowUpPlan(patient(), visit({ symptoms: ["Chest pain"] }));
    expect(oedema.band).not.toBe(chestPain.band);
    expect(oedema.band).toBe(ACUITY.soon.id);
  });

  it("uses the routine interval when nothing is abnormal", () => {
    const plan = getNextFollowUpPlan(patient({ risk: { category: "Low" } }), visit());
    expect(plan.band).toBe(ACUITY.routine.id);
    expect(plan.days).toBe(42);
  });

  it("shortens the routine interval for a higher risk category", () => {
    expect(getNextFollowUpPlan(patient({ risk: { category: "Very High" } }), visit()).days).toBe(14);
  });

  it("brings follow-up forward for a troponin rise", () => {
    const plan = getNextFollowUpPlan(patient(), visit({ inv: { troponin: { value: 80 } } }));
    expect(plan.band).toBe(ACUITY.urgent.id);
    expect(plan.days).toBe(2);
  });

  it("reports every reason that reached the winning band", () => {
    const plan = getNextFollowUpPlan(patient(), visit({ symptoms: ["Chest pain", "Syncope"] }));
    expect(plan.reasons[0]).toMatch(/chest pain and syncope/i);
  });

  it("lengthens the interval in survivorship", () => {
    const plan = getNextFollowUpPlan(patient(), visit({ type: "12 months post-treatment" }));
    expect(plan.days).toBe(365);
  });

  it("derives a date from the encounter date", () => {
    const plan = getNextFollowUpPlan(patient({ risk: { category: "High" } }), visit({ date: "2026-03-10" }));
    expect(plan.date).toBe("2026-03-31");
  });
});

describe("signals", () => {
  it("grades cardiac dysfunction rather than returning a boolean", () => {
    const signals = getClinicalSignals(
      patient({ baselineLVEF: "62" }),
      visit({ inv: { lvef: { result: "45" } } })
    );
    expect(signals.ctrcd.grade).toBe("moderate");
    expect(signals.lvefDecline).toBe(true);
  });

  it("does not read a free-text placeholder as a result", () => {
    const signals = getClinicalSignals(patient(), visit({ inv: { lvef: { result: "awaited" } } }));
    expect(signals.ctrcd.grade).toBe("none");
  });

  it("uses the structured QTc rather than scraping free text", () => {
    const signals = getClinicalSignals(
      patient(),
      visit({ inv: { ecg: { measurements: { qt: 480, rate: 60 } } } })
    );
    expect(signals.ecg.value).toBe(480);
    expect(signals.qtProlongation).toBe(false);
  });

  it("flags an actionable QTc", () => {
    const signals = getClinicalSignals(
      patient(),
      visit({ inv: { ecg: { measurements: { qt: 520, rate: 60 } } } })
    );
    expect(signals.qtProlongation).toBe(true);
  });

  it("still reads legacy free-text records so old encounters do not read as normal", () => {
    const signals = getClinicalSignals(
      patient(),
      visit({ inv: { troponin: { interp: "Elevated" } } })
    );
    expect(signals.elevatedTroponin).toBe(true);
  });
});

describe("phase-appropriate tasks", () => {
  it("orders baseline imaging and biomarkers before the first dose", () => {
    const ids = taskIds(getDynamicSurveillanceTasks(patient(), visit({ type: "Baseline" })));
    expect(ids).toContain("echo");
    expect(ids).toContain("gls");
    expect(ids).toContain("troponin");
  });

  it("orders survivorship imaging at six months instead of cycle tasks", () => {
    const ids = taskIds(
      getDynamicSurveillanceTasks(patient(), visit({ type: "6 months post-treatment" }))
    );
    expect(ids).toContain("echo");
    expect(ids).not.toContain("anthracycline-dose-review");
  });

  it("always schedules the next visit", () => {
    expect(taskIds(getDynamicSurveillanceTasks(patient(), visit()))).toContain("next-follow-up");
  });

  it("marks action tasks as requiring acknowledgement", () => {
    const tasks = getDynamicSurveillanceTasks(patient(), visit({ symptoms: ["Chest pain"] }));
    const referral = tasks.find((task) => task.id === "urgent-cardiology");
    expect(referral.requiresAcknowledgement).toBe(true);
  });
});
