/* =========================================================================
   Clinical worklist.

   The patient list showed a name, a diagnosis and a risk chip. That is a filing
   cabinet, not a worklist: it answers "who is on my caseload" but not the
   question a cardio-oncology service actually starts the day with, which is
   "who needs me today, and who has fallen off the end of the list".

   Each row here is computed from the patient's own record — the last filed
   encounter, the outstanding surveillance, the alert level, the next review
   date — so that a patient who has quietly gone eight weeks past a due
   echocardiogram surfaces without anyone having to remember them.

   Row computation is deliberately independent of the encounter workflow. A
   worklist that only updates when someone opens the patient is a worklist that
   hides exactly the patients nobody has opened.
   ========================================================================= */

import { anthracyclineLedger } from "@/lib/anthracycline";
import { interpretNatriuretic, interpretTroponin } from "@/lib/cardiac-measurements";
import { therapyNames } from "@/lib/clinical-data";
import { assessCompleteness } from "@/lib/completeness";
import { assessCtrCvt } from "@/lib/ctrcvt";
import { assessBaselineRisk } from "@/lib/hfa-icos";
import { assessRedFlags } from "@/lib/red-flags";
import { activeOverride, resolveValue } from "@/lib/overrides";
import { num } from "@/lib/vitals";

const DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromISO, toISO) {
  const from = new Date(`${fromISO}T12:00:00`);
  const to = new Date(`${toISO}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to - from) / DAY);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------- row */

/**
 * Builds one worklist row from a stored patient record.
 *
 * Uses the last FILED encounter rather than any open draft. A draft is work in
 * progress; treating it as the patient's current state would mean a half-filled
 * form silently changed the worklist for everyone else.
 */
export function worklistRow(patient, { today = todayISO() } = {}) {
  const visits = (patient?.visits || []).filter((visit) => visit?.saved !== false);
  const last = visits.length ? visits[visits.length - 1] : null;

  const baseline = assessBaselineRisk(patient, baselineBiomarkerContext(patient));
  const completeness = assessCompleteness(patient);

  const troponin = interpretTroponin({
    value: last?.inv?.troponin?.value ?? last?.inv?.troponin?.result,
    baseline: patient?.baselineTroponin,
    assayId: patient?.troponinAssay,
    sex: patient?.gender,
    localURL: patient?.troponinURL,
  });
  const natriuretic = interpretNatriuretic({
    value: last?.inv?.ntprobnp?.value ?? last?.inv?.ntprobnp?.result,
    baseline: patient?.baselineNtProBnp,
    age: patient?.age,
  });

  const ctrCvt = assessCtrCvt({
    patient,
    encounter: last || {},
    troponin,
    natriuretic,
    ecg: {},
    currentLVEF: num(last?.inv?.lvef?.result),
    glsRelativeFall: null,
    symptoms: last?.symptoms || [],
  });

  const redFlags = assessRedFlags({
    patient,
    encounter: last || {},
    ctrCvt,
    troponin,
    ecg: {},
    symptoms: last?.symptoms || [],
  });

  const risk = resolveValue({
    overrides: patient?.overrides,
    target: "risk",
    algorithmicValue: baseline.applicable ? baseline.category : null,
  });

  const nextReview = last?.nextFollowUpDate || null;
  const daysUntilReview = nextReview ? daysBetween(today, nextReview) : null;
  const overdueDays = daysUntilReview !== null && daysUntilReview < 0 ? Math.abs(daysUntilReview) : 0;

  const outstanding = (last?.surveillanceOutstanding || []).length
    ? last.surveillanceOutstanding
    : deriveOutstanding(last);

  const ledger = anthracyclineLedger(patient);

  return {
    id: patient?.id,
    patientId: patient?.patientId || "",
    name: patient?.name || "Unnamed patient",
    age: patient?.age ?? null,
    diagnosis: patient?.diagnosis || "",
    therapy: therapyNames(patient?.therapy),
    therapyIds: Array.isArray(patient?.therapy) ? patient.therapy : patient?.therapy ? [patient.therapy] : [],
    cycle: num(patient?.cycle) ?? 0,

    baselineRisk: risk.value,
    baselineRiskOverridden: risk.overridden,
    baselineRiskApplicable: baseline.applicable,

    ctrCvtSeverity: ctrCvt.overall,
    ctrCvtLabel: ctrCvt.overallLabel,
    ctrCvtSummary: ctrCvt.summary,

    alertLevel: redFlags.level,
    alertCounts: redFlags.counts,
    topAlert: redFlags.flags[0] || null,

    completeness: completeness.percent,
    completenessBand: completeness.band,

    cumulativeDose: ledger.total,
    doseThreshold: ledger.assessment.reached?.id || null,

    lastVisitDate: last?.date || null,
    lastVisitType: last?.type || null,
    nextReview,
    daysUntilReview,
    overdueDays,
    isOverdue: overdueDays > 0,
    dueToday: daysUntilReview === 0,

    outstanding,
    outstandingCount: outstanding.length,

    biomarkerAbnormal: Boolean(troponin.newRise || natriuretic.newRise),
    ttedue: outstanding.some((item) => item.id === "echo" || item.id === "gls"),
    symptomatic: (last?.symptoms || []).length > 0,
    symptoms: last?.symptoms || [],

    hasOverrides: Boolean(activeOverride(patient?.overrides, "risk")),
  };
}

function baselineBiomarkerContext(patient) {
  const troponin = interpretTroponin({
    value: patient?.baselineTroponin,
    assayId: patient?.troponinAssay,
    sex: patient?.gender,
    localURL: patient?.troponinURL,
  });
  const natriuretic = interpretNatriuretic({ value: patient?.baselineNtProBnp, age: patient?.age });
  return {
    baselineTroponinElevated: Boolean(troponin.recorded && troponin.aboveURL),
    baselineNatrioureticElevated: Boolean(natriuretic.recorded && natriuretic.aboveThreshold),
  };
}

/** Surveillance items with no recorded result at the last encounter. */
function deriveOutstanding(visit) {
  if (!visit) return [];
  return (visit.tasks || [])
    .filter((task) => !task.completed)
    .map((task) => ({ id: task.id, label: task.label, why: task.why || task.detail || null }));
}

/* ---------------------------------------------------------------- filters */

export const FILTERS = {
  today: {
    id: "today",
    label: "Today",
    description: "Patients whose next review falls today.",
    test: (row) => row.dueToday,
  },
  overdue: {
    id: "overdue",
    label: "Overdue",
    description: "Patients whose review date has passed without a filed encounter.",
    test: (row) => row.isOverdue,
  },
  veryHigh: {
    id: "veryHigh",
    label: "Very high risk",
    description: "Baseline HFA-ICOS category of very high.",
    test: (row) => row.baselineRisk === "Very High",
  },
  high: {
    id: "high",
    label: "High risk",
    description: "Baseline HFA-ICOS category of high.",
    test: (row) => row.baselineRisk === "High",
  },
  moderate: {
    id: "moderate",
    label: "Moderate risk",
    description: "Baseline HFA-ICOS category of moderate.",
    test: (row) => row.baselineRisk === "Moderate",
  },
  biomarker: {
    id: "biomarker",
    label: "Biomarker abnormal",
    description: "Troponin or natriuretic peptide risen at the last encounter.",
    test: (row) => row.biomarkerAbnormal,
  },
  tteDue: {
    id: "tteDue",
    label: "TTE due",
    description: "Echocardiography or strain outstanding.",
    test: (row) => row.ttedue,
  },
  symptoms: {
    id: "symptoms",
    label: "Symptoms",
    description: "Cardiovascular symptoms recorded at the last encounter.",
    test: (row) => row.symptomatic,
  },
  urgent: {
    id: "urgent",
    label: "Urgent review",
    description: "A red or orange alert is active.",
    test: (row) => row.alertLevel === "red" || row.alertLevel === "orange",
  },
  incomplete: {
    id: "incomplete",
    label: "Data incomplete",
    description: "Critical baseline data missing, so the assessment is provisional.",
    test: (row) => row.completenessBand === "insufficient",
  },
};

export const FILTER_LIST = Object.values(FILTERS);

/**
 * Sort order: clinical urgency first, then how overdue, then the review date.
 *
 * Deliberately not alphabetical. A list sorted by name is a list where the
 * sickest patient's position is decided by their surname.
 */
const ALERT_RANK = { red: 0, orange: 1, yellow: 2, green: 3 };

export function sortRows(rows) {
  return rows.slice().sort((a, b) => {
    const alert = (ALERT_RANK[a.alertLevel] ?? 3) - (ALERT_RANK[b.alertLevel] ?? 3);
    if (alert !== 0) return alert;
    if (a.overdueDays !== b.overdueDays) return b.overdueDays - a.overdueDays;
    if (a.daysUntilReview !== null && b.daysUntilReview !== null && a.daysUntilReview !== b.daysUntilReview) {
      return a.daysUntilReview - b.daysUntilReview;
    }
    return String(a.name).localeCompare(String(b.name));
  });
}

/**
 * Builds the worklist.
 *
 * Multiple active filters are combined with OR, not AND. A clinician selecting
 * "Overdue" and "Urgent review" is asking to see both groups, not the small
 * intersection of patients who happen to be in each.
 */
export function buildWorklist(patients, { filters = [], search = "", today = todayISO() } = {}) {
  const rows = (Array.isArray(patients) ? patients : []).map((patient) => worklistRow(patient, { today }));

  const active = filters.map((id) => FILTERS[id]).filter(Boolean);
  const filtered = active.length ? rows.filter((row) => active.some((filter) => filter.test(row))) : rows;

  const term = String(search || "").trim().toLowerCase();
  const searched = term
    ? filtered.filter((row) =>
        [row.name, row.patientId, row.diagnosis, row.therapy].some((value) => String(value || "").toLowerCase().includes(term))
      )
    : filtered;

  return {
    rows: sortRows(searched),
    total: rows.length,
    shown: searched.length,
    counts: Object.fromEntries(FILTER_LIST.map((filter) => [filter.id, rows.filter(filter.test).length])),
  };
}
