/* =========================================================================
   Investigation timeline.

   Builds the patient's investigation journey — baseline, each treatment cycle,
   end of treatment and the survivorship follow-ups — and resolves a status for
   every required test at every milestone. Also extracts numeric trends so the
   clinician can see direction of travel rather than a single value.
   ========================================================================= */

import { INVESTIGATIONS, TRENDED_INVESTIGATIONS, hasTherapy, primaryTherapy } from "@/lib/clinical-data";
import { num } from "@/lib/vitals";

export const STATUS_STYLES = {
  completed: { label: "Completed", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", order: 0 },
  due: { label: "Due", chip: "bg-teal-100 text-teal-700", dot: "bg-teal-600", order: 1 },
  overdue: { label: "Overdue", chip: "bg-orange-100 text-orange-700", dot: "bg-orange-500", order: 2 },
  missing: { label: "Missing", chip: "bg-red-100 text-red-700", dot: "bg-red-500", order: 3 },
  pending: { label: "Pending", chip: "bg-slate-100 text-slate-500", dot: "bg-slate-300", order: 4 },
};

const PHASE_ORDER = { baseline: 0, cycle: 1, end: 2, threeMonth: 3, sixMonth: 4, twelveMonth: 5 };

export function investigationLabel(id) {
  return INVESTIGATIONS.find((i) => i.id === id)?.label || id;
}

function phaseOfVisit(visit) {
  const type = String(visit?.type || "").toLowerCase();
  if (type.includes("baseline")) return "baseline";
  if (type.includes("end of treatment") || type.includes("completion")) return "end";
  if (type.includes("3 month") || type.includes("three month")) return "threeMonth";
  if (type.includes("6 month") || type.includes("six month")) return "sixMonth";
  if (type.includes("12 month") || type.includes("twelve month")) return "twelveMonth";
  return "cycle";
}

function visitCycleNumber(visit) {
  const explicit = num(visit?.firstReview?.cycle) ?? num(visit?.cycle);
  if (explicit !== null && explicit > 0) return Math.floor(explicit);
  const fromType = String(visit?.type || "").match(/(?:cycle|dose)\s*(\d+)/i);
  return fromType ? Number(fromType[1]) : null;
}

/* ------------------------------------------------------------ milestones */

/** The full planned journey, from baseline to twelve-month follow-up. */
export function buildMilestones(patient) {
  const planned = Math.min(Math.max(num(patient?.plannedCycles) || 0, 0), 24);
  const cycles = planned || Math.max(num(patient?.cycle) || 0, 1);
  const list = [{ id: "baseline", label: "Baseline", phase: "baseline", cycle: null, order: 0 }];
  for (let i = 1; i <= cycles; i += 1) {
    list.push({ id: `cycle-${i}`, label: `Cycle ${i}`, phase: "cycle", cycle: i, order: 1 + i * 0.001 });
  }
  list.push({ id: "end", label: "End of treatment", phase: "end", cycle: null, order: 2 });
  list.push({ id: "threeMonth", label: "3-month follow-up", phase: "threeMonth", cycle: null, order: 3 });
  list.push({ id: "sixMonth", label: "6-month follow-up", phase: "sixMonth", cycle: null, order: 4 });
  list.push({ id: "twelveMonth", label: "12-month follow-up", phase: "twelveMonth", cycle: null, order: 5 });
  return list;
}

/** Investigations required at a given milestone, each with its rationale. */
export function milestoneRequirements(patient, milestone) {
  const therapy = primaryTherapy(patient?.therapy);
  const risk = patient?.risk?.category || "Low";
  const highRisk = risk === "High" || risk === "Very High";
  const moderate = risk === "Moderate";
  const requirements = [];
  const add = (id, reason) => {
    if (!requirements.some((r) => r.id === id)) requirements.push({ id, reason });
  };

  if (milestone.phase === "baseline") {
    add("ecg", "Mandatory baseline ECG for every patient starting cardiotoxic therapy.");
    if (therapy !== "fluoropyrimidine") {
      add("echo", "Baseline ventricular function before the first dose.");
      add("lvef", "Baseline ejection fraction anchors every later comparison.");
      if (["anthracycline", "her2", "ici", "proteasome"].includes(therapy)) {
        add("gls", "Baseline strain detects subclinical dysfunction earlier than LVEF.");
      }
    }
    if (["anthracycline", "her2", "ici", "proteasome", "vegf"].includes(therapy)) {
      add("troponin", "Baseline biomarker; later rises are only interpretable against it.");
      add("ntprobnp", "Baseline natriuretic peptide for heart-failure surveillance.");
    }
    add("cbc", "Baseline haematology.");
    add("rft", "Baseline renal function before nephrotoxic or renally cleared agents.");
    add("lft", "Baseline hepatic function.");
    add("electrolytes", "Potassium and magnesium underpin arrhythmia risk.");
    if (therapy === "bcrabl") {
      add("ldl", "Full vascular risk profile before a BCR-ABL inhibitor.");
      add("hba1c", "Glycaemic assessment as part of vascular risk stratification.");
    }
    return requirements;
  }

  if (milestone.phase === "cycle") {
    const cycle = milestone.cycle || 1;
    if (therapy === "anthracycline") {
      if (highRisk) {
        add("ecg", "ECG every cycle at high or very-high risk.");
        add("troponin", "Troponin every cycle at high or very-high risk.");
        add("ntprobnp", "Natriuretic peptide every cycle at high or very-high risk.");
        if (cycle % 2 === 0) {
          add("echo", "Echocardiography every two cycles at high or very-high risk.");
          add("lvef", "Ejection fraction with the scheduled echocardiogram.");
          add("gls", "Strain with the scheduled echocardiogram.");
        }
      } else if (moderate) {
        add("ecg", "ECG every cycle at moderate risk.");
        if (cycle % 2 === 0) {
          add("troponin", "Troponin every two cycles at moderate risk.");
          add("ntprobnp", "Natriuretic peptide every two cycles at moderate risk.");
        }
        if (cycle % 4 === 0) {
          add("echo", "Echocardiography every four cycles at moderate risk.");
          add("lvef", "Ejection fraction with the scheduled echocardiogram.");
          add("gls", "Strain with the scheduled echocardiogram.");
        }
      } else if (cycle % 4 === 0) {
        add("echo", "Periodic echocardiography through treatment at low risk.");
        add("lvef", "Ejection fraction with the scheduled echocardiogram.");
      }
    }
    if (therapy === "her2" && cycle % 3 === 0) {
      add("echo", "Echocardiography approximately every three months on HER2-targeted therapy.");
      add("lvef", "Ejection fraction with the scheduled echocardiogram.");
      add("gls", "Strain with the scheduled echocardiogram.");
    }
    if (therapy === "ici") {
      if (cycle <= 3) {
        add("troponin", "Troponin before each of the first three doses — myocarditis risk peaks early.");
        add("ecg", "ECG alongside early myocarditis surveillance.");
      } else if (cycle === 4) {
        add("troponin", "Fourth-dose myocarditis surveillance.");
      }
    }
    if (therapy === "vegf" && cycle % 3 === 0) {
      add("echo", "Echocardiography every two to three months on VEGF-pathway therapy.");
      add("lvef", "Ejection fraction with the scheduled echocardiogram.");
    }
    if (therapy === "bcrabl") {
      if (cycle % 3 === 0) {
        add("ldl", "Lipid monitoring through BCR-ABL inhibitor therapy.");
        add("ecg", "QTc surveillance on a BCR-ABL inhibitor.");
      }
    }
    if (therapy === "proteasome") {
      if (cycle % 2 === 0) {
        add("troponin", "Troponin every two cycles on a proteasome inhibitor.");
        add("ntprobnp", "Natriuretic peptide every two cycles on a proteasome inhibitor.");
      }
      if (cycle % 3 === 0) {
        add("echo", "Echocardiography approximately every three months.");
        add("lvef", "Ejection fraction with the scheduled echocardiogram.");
      }
    }
    if (therapy === "rafmek" && cycle % 3 === 0) {
      add("echo", "Echocardiography every two to three months on RAF/MEK inhibition.");
      add("lvef", "Ejection fraction with the scheduled echocardiogram.");
      add("ecg", "QTc monitoring on RAF/MEK inhibition.");
    }
    if (highRisk) add("electrolytes", "Electrolytes maintained through treatment at high risk.");
    return requirements;
  }

  if (milestone.phase === "end") {
    add("echo", "End-of-treatment ventricular function.");
    add("lvef", "End-of-treatment ejection fraction for re-stratification.");
    if (["anthracycline", "her2"].includes(therapy)) add("gls", "End-of-treatment strain.");
    add("troponin", "End-of-treatment biomarker.");
    add("ntprobnp", "End-of-treatment natriuretic peptide.");
    add("ecg", "End-of-treatment ECG.");
    return requirements;
  }

  if (milestone.phase === "threeMonth") {
    add("echo", "Three-month post-treatment surveillance echocardiogram.");
    add("lvef", "Three-month ejection fraction.");
    if (therapy === "anthracycline") {
      add("gls", "Three-month strain after anthracycline exposure.");
      add("troponin", "Three-month biomarker after anthracycline exposure.");
    }
    return requirements;
  }

  if (milestone.phase === "sixMonth") {
    if (["anthracycline", "her2"].includes(therapy) || highRisk) {
      add("echo", "Six-month surveillance where risk or exposure was high.");
      add("lvef", "Six-month ejection fraction.");
    }
    add("ldl", "Cardiovascular risk-factor review in survivorship.");
    return requirements;
  }

  if (milestone.phase === "twelveMonth") {
    add("echo", "Twelve-month survivorship echocardiogram.");
    add("lvef", "Twelve-month ejection fraction.");
    if (["anthracycline", "her2"].includes(therapy)) add("gls", "Twelve-month strain.");
    add("ldl", "Annual cardiovascular risk review.");
    add("hba1c", "Annual metabolic review.");
    return requirements;
  }

  return requirements;
}

/* -------------------------------------------------------------- statuses */

function visitsForMilestone(visits, milestone) {
  return visits.filter((visit) => {
    const phase = phaseOfVisit(visit);
    if (milestone.phase === "cycle") return phase === "cycle" && visitCycleNumber(visit) === milestone.cycle;
    return phase === milestone.phase;
  });
}

function hasResult(visit, id) {
  const item = visit?.inv?.[id];
  return Boolean(item && (item.result || item.interp || item.comment));
}

function resultOf(visits, id) {
  for (let i = visits.length - 1; i >= 0; i -= 1) {
    if (hasResult(visits[i], id)) return visits[i].inv[id];
  }
  return null;
}

/**
 * Resolves the current position in the journey from the active encounter, so
 * milestones can be classified as past, current or future.
 */
function currentPosition(patient, encounter) {
  const phase = phaseOfVisit(encounter);
  const cycle = visitCycleNumber(encounter) || num(patient?.cycle) || 1;
  const order = phase === "cycle" ? 1 + cycle * 0.001 : PHASE_ORDER[phase] ?? 1;
  return { phase, cycle, order };
}

/**
 * Full timeline: every milestone with its required investigations resolved to
 * a status, plus a per-milestone completion count.
 */
export function buildInvestigationTimeline(patient, encounter) {
  const allVisits = [...(patient?.visits || [])];
  if (encounter) {
    const index = allVisits.findIndex((v) => v.id === encounter.id);
    if (index >= 0) allVisits[index] = encounter;
    else allVisits.push(encounter);
  }
  const position = currentPosition(patient, encounter);

  return buildMilestones(patient).map((milestone) => {
    const milestoneVisits = visitsForMilestone(allVisits, milestone);
    const isPast = milestone.order < position.order;
    const isCurrent = Math.abs(milestone.order - position.order) < 0.0005;
    const requirements = milestoneRequirements(patient, milestone);

    const items = requirements.map((requirement) => {
      const result = resultOf(milestoneVisits, requirement.id);
      let status = "pending";
      if (result) status = "completed";
      else if (isCurrent) status = "due";
      else if (isPast) status = milestoneVisits.length ? "missing" : "overdue";
      return {
        ...requirement,
        label: investigationLabel(requirement.id),
        status,
        result: result?.result || "",
        interp: result?.interp || "",
        date: result?.date || "",
        comment: result?.comment || "",
      };
    });

    const completed = items.filter((i) => i.status === "completed").length;
    const outstanding = items.filter((i) => i.status === "missing" || i.status === "overdue").length;

    return {
      ...milestone,
      state: isCurrent ? "current" : isPast ? "past" : "future",
      visitDates: milestoneVisits.map((v) => v.date).filter(Boolean),
      items,
      completed,
      total: items.length,
      outstanding,
    };
  });
}

/** Every outstanding item across the journey, most urgent first. */
export function outstandingInvestigations(timeline) {
  return timeline
    .flatMap((milestone) =>
      milestone.items
        .filter((item) => ["missing", "overdue", "due"].includes(item.status))
        .map((item) => ({ ...item, milestone: milestone.label, milestoneId: milestone.id }))
    )
    .sort((a, b) => STATUS_STYLES[b.status].order - STATUS_STYLES[a.status].order);
}

/* ---------------------------------------------------------------- trends */

/** Numeric series for the investigations worth trending. */
export function buildTrends(patient, encounter) {
  const visits = [...(patient?.visits || [])];
  if (encounter && !visits.some((v) => v.id === encounter.id)) visits.push(encounter);
  const ordered = visits.slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));

  return TRENDED_INVESTIGATIONS.map((definition) => {
    const points = ordered.flatMap((visit) => {
      const value = num(visit?.inv?.[definition.id]?.result);
      if (value === null) return [];
      return [{
        value,
        date: visit.date || "",
        label: visit.type || "",
        interp: visit?.inv?.[definition.id]?.interp || "",
      }];
    });

    if (definition.id === "lvef" && num(patient?.baselineLVEF) !== null) {
      const baselinePoint = { value: num(patient.baselineLVEF), date: patient.registeredDate || "", label: "Baseline", interp: "" };
      if (!points.length || points[0].label !== "Baseline") points.unshift(baselinePoint);
    }

    if (points.length === 0) return { ...definition, points: [], plotPoints: [], change: null, direction: null };

    // For magnitude series the sign carries no clinical meaning, so trend maths
    // runs on absolute values while the entered value stays visible.
    const stat = (value) => (definition.magnitude ? Math.abs(value) : value);
    const first = points[0].value;
    const last = points[points.length - 1].value;
    const statFirst = stat(first);
    const statLast = stat(last);
    const change = Number((statLast - statFirst).toFixed(1));
    const relative = statFirst !== 0 ? Number((((statLast - statFirst) / Math.abs(statFirst)) * 100).toFixed(1)) : null;
    const worsening = definition.direction === "lowerWorse" ? change < 0 : change > 0;

    return {
      ...definition,
      points,
      plotPoints: definition.magnitude ? points.map((point) => ({ ...point, value: stat(point.value) })) : points,
      first,
      last,
      change,
      relative,
      direction: change === 0 ? "flat" : worsening ? "worse" : "better",
    };
  }).filter((series) => series.points.length > 0);
}

/** Flags a clinically meaningful trend change worth surfacing in the summary. */
export function trendFlags(trends, patient) {
  const flags = [];
  trends.forEach((series) => {
    if (series.points.length < 2) return;
    if (series.id === "lvef" && series.change <= -10 && series.last < 50) {
      flags.push({ id: "lvef", level: "danger", text: `LVEF has fallen ${Math.abs(series.change)} points to ${series.last}%, meeting CTRCD criteria.` });
    } else if (series.id === "gls" && series.relative !== null && series.relative <= -15) {
      flags.push({ id: "gls", level: "danger", text: `GLS has fallen ${Math.abs(series.relative)}% in magnitude from the first recorded value (${series.first}% to ${series.last}%), indicating subclinical LV dysfunction.` });
    } else if (series.id === "troponin" && series.direction === "worse") {
      flags.push({ id: "troponin", level: "warning", text: `Troponin is rising (${series.first} to ${series.last} ${series.unit}).` });
    } else if (series.id === "ntprobnp" && series.direction === "worse") {
      flags.push({ id: "ntprobnp", level: "warning", text: `Natriuretic peptide is rising (${series.first} to ${series.last} ${series.unit}).` });
    } else if (series.id === "ldl" && series.last > 2.6) {
      flags.push({ id: "ldl", level: "info", text: `LDL-cholesterol is ${series.last} mmol/L, above the secondary-prevention target.` });
    }
  });
  if (hasTherapy(patient?.therapy, "ici") && !trends.some((t) => t.id === "troponin")) {
    flags.push({ id: "ici-troponin", level: "warning", text: "No troponin values are recorded on immune checkpoint therapy, where troponin is the primary myocarditis screen." });
  }
  return flags;
}
