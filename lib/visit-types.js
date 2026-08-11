/* =========================================================================
   Visit types and the "since last visit" interval history.

   Two related problems.

   FIRST, every encounter previously showed all twelve workflow sections. A
   twelve-month survivorship visit asked for treatment tolerance and the current
   cycle number; a baseline assessment asked what had changed since the last
   visit, when there had not been one. Sections that do not apply are not merely
   noise — they invite documentation that is meaningless, and they bury the
   sections that do apply.

   SECOND, the interval between visits was captured as free text. "Interim
   events since last contact" as a textarea cannot drive anything: a
   hospitalisation for breathlessness recorded there is invisible to the alert
   engine, the surveillance engine and the fitness verdict. Structuring the
   interval history is what lets an admission with heart failure change the plan
   rather than sit in a paragraph nobody re-reads.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { PHASES } from "@/lib/encounter-phase";

/* -------------------------------------------------------------- visit types */

/**
 * `sections` lists the workflow sections this visit type shows.
 *
 * Sections not listed are hidden rather than merely collapsed, because a
 * collapsed section still reads as "something you have not done yet".
 */
export const VISIT_TYPES = {
  baseline: {
    id: "baseline",
    label: "Baseline assessment",
    shortLabel: "Baseline",
    phase: PHASES.baseline.id,
    order: 0,
    purpose: "Establish the pre-treatment cardiovascular state and the baseline risk category before the first dose.",
    sections: [
      "registration",
      "history",
      "vitals",
      "symptoms",
      "examination",
      "investigations",
      "medication",
      "risk",
      "surveillance",
      "follow-up",
      "overview",
    ],
    requiresSinceLastVisit: false,
    requiresCycle: false,
  },

  preTreatment: {
    id: "preTreatment",
    label: "Pre-treatment assessment",
    shortLabel: "Pre-treatment",
    phase: PHASES.baseline.id,
    order: 1,
    purpose: "Confirm fitness to start after baseline work-up, and close any outstanding baseline investigation.",
    sections: [
      "registration",
      "since-last-visit",
      "vitals",
      "symptoms",
      "examination",
      "investigations",
      "medication",
      "risk",
      "surveillance",
      "follow-up",
      "overview",
    ],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },

  cycleReview: {
    id: "cycleReview",
    label: "Treatment-cycle review",
    shortLabel: "Cycle review",
    phase: PHASES.treatment.id,
    order: 2,
    purpose: "Assess fitness for the next cycle and detect treatment-emergent cardiovascular toxicity.",
    sections: [
      "registration",
      "first-review",
      "since-last-visit",
      "vitals",
      "symptoms",
      "examination",
      "investigations",
      "medication",
      "risk",
      "surveillance",
      "follow-up",
      "timeline",
      "overview",
    ],
    requiresSinceLastVisit: true,
    requiresCycle: true,
  },

  unscheduled: {
    id: "unscheduled",
    label: "Unscheduled cardiovascular review",
    shortLabel: "Unscheduled",
    phase: PHASES.treatment.id,
    order: 3,
    purpose: "Assess a new cardiovascular problem arising between scheduled contacts.",
    sections: [
      "registration",
      "since-last-visit",
      "vitals",
      "symptoms",
      "examination",
      "investigations",
      "medication",
      "risk",
      "surveillance",
      "follow-up",
      "overview",
    ],
    requiresSinceLastVisit: true,
    requiresCycle: false,
    urgent: true,
  },

  endOfTreatment: {
    id: "endOfTreatment",
    label: "End-of-treatment assessment",
    shortLabel: "End of treatment",
    phase: PHASES.end.id,
    order: 4,
    purpose: "Record the cardiovascular state at completion, and set the survivorship surveillance plan.",
    sections: [
      "registration",
      "since-last-visit",
      "vitals",
      "symptoms",
      "examination",
      "investigations",
      "medication",
      "risk",
      "surveillance",
      "follow-up",
      "timeline",
      "overview",
    ],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },

  threeMonth: {
    id: "threeMonth",
    label: "3-month follow-up",
    shortLabel: "3 months",
    phase: PHASES.threeMonth.id,
    order: 5,
    purpose: "Detect cardiac dysfunction emerging after treatment completion, when most early events occur.",
    sections: ["registration", "since-last-visit", "vitals", "symptoms", "examination", "investigations", "medication", "risk", "surveillance", "follow-up", "overview"],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },

  sixMonth: {
    id: "sixMonth",
    label: "6-month follow-up",
    shortLabel: "6 months",
    phase: PHASES.sixMonth.id,
    order: 6,
    purpose: "Continue post-treatment surveillance after high cardiotoxic exposure.",
    sections: ["registration", "since-last-visit", "vitals", "symptoms", "investigations", "medication", "risk", "surveillance", "follow-up", "overview"],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },

  twelveMonth: {
    id: "twelveMonth",
    label: "12-month follow-up",
    shortLabel: "12 months",
    phase: PHASES.twelveMonth.id,
    order: 7,
    purpose: "Confirm recovery or establish persistent dysfunction one year after treatment.",
    sections: ["registration", "since-last-visit", "vitals", "symptoms", "examination", "investigations", "medication", "risk", "surveillance", "follow-up", "timeline", "overview"],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },

  longTerm: {
    id: "longTerm",
    label: "Long-term follow-up",
    shortLabel: "Long term",
    phase: PHASES.twelveMonth.id,
    order: 8,
    purpose: "Survivorship review for patients with high cumulative exposure or established dysfunction.",
    sections: ["registration", "since-last-visit", "vitals", "symptoms", "investigations", "medication", "risk", "surveillance", "follow-up", "timeline", "overview"],
    requiresSinceLastVisit: true,
    requiresCycle: false,
  },
};

export const VISIT_TYPE_LIST = Object.values(VISIT_TYPES).sort((a, b) => a.order - b.order);

export function visitType(id) {
  return VISIT_TYPES[id] || null;
}

/**
 * Resolves a visit type from a record.
 *
 * Records saved before typed visits existed carry a free-text `type` such as
 * "Cycle 3" or "12 months post-treatment", so those are mapped rather than
 * discarded.
 */
export function resolveVisitType(encounter) {
  const explicit = encounter?.visitType;
  if (explicit && VISIT_TYPES[explicit]) return VISIT_TYPES[explicit];

  const text = String(encounter?.type || "").toLowerCase();
  if (!text) return VISIT_TYPES.cycleReview;
  if (text.includes("baseline")) return VISIT_TYPES.baseline;
  if (text.includes("pre-treatment") || text.includes("pretreatment")) return VISIT_TYPES.preTreatment;
  if (text.includes("unscheduled") || text.includes("urgent")) return VISIT_TYPES.unscheduled;
  if (text.includes("end of treatment") || text.includes("completion")) return VISIT_TYPES.endOfTreatment;
  if (text.includes("long term") || text.includes("long-term")) return VISIT_TYPES.longTerm;
  if (text.includes("12 month") || text.includes("twelve month")) return VISIT_TYPES.twelveMonth;
  if (text.includes("6 month") || text.includes("six month")) return VISIT_TYPES.sixMonth;
  if (text.includes("3 month") || text.includes("three month")) return VISIT_TYPES.threeMonth;
  return VISIT_TYPES.cycleReview;
}

/** True when a workflow section belongs on this visit. */
export function sectionApplies(encounter, sectionId) {
  return resolveVisitType(encounter).sections.includes(sectionId);
}

/** Filters a section list down to the ones this visit type shows. */
export function sectionsForVisit(encounter, sections) {
  const type = resolveVisitType(encounter);
  return (sections || []).filter((section) => type.sections.includes(section.id));
}

/* --------------------------------------------------- since the last visit */

/**
 * The structured interval history.
 *
 * Each item declares what it feeds. `signal` is read by the clinical engines,
 * so a "yes" here reaches the alert list and the fitness verdict rather than
 * sitting in prose. `escalates` marks the answers that are themselves a reason
 * to escalate, independent of anything measured today.
 */
export const SINCE_LAST_VISIT_ITEMS = [
  {
    id: "chestPain",
    group: "symptoms",
    label: "New or worsening chest pain",
    signal: "symptom:Chest pain",
    escalates: true,
    followUp: "Describe the character, duration, and relationship to the infusion.",
  },
  { id: "dyspnoea", group: "symptoms", label: "New or worsening breathlessness", signal: "symptom:Dyspnoea", escalates: false },
  { id: "orthopnoea", group: "symptoms", label: "Orthopnoea", signal: "symptom:Orthopnoea", escalates: true },
  {
    id: "pnd",
    group: "symptoms",
    label: "Paroxysmal nocturnal dyspnoea",
    signal: "symptom:Paroxysmal nocturnal dyspnoea",
    escalates: true,
  },
  { id: "oedema", group: "symptoms", label: "New ankle or leg swelling", signal: "symptom:Pedal oedema", escalates: false },
  { id: "palpitations", group: "symptoms", label: "Palpitations", signal: "symptom:Palpitations", escalates: false },
  { id: "syncope", group: "symptoms", label: "Blackout or near-blackout", signal: "symptom:Syncope", escalates: true },

  {
    id: "hospitalisation",
    group: "events",
    label: "Hospital admission",
    signal: "event:hospitalisation",
    escalates: true,
    followUp: "Record the dates, the reason, and whether a cardiac cause was considered.",
  },
  {
    id: "emergencyVisit",
    group: "events",
    label: "Emergency department attendance",
    signal: "event:emergency",
    escalates: true,
    followUp: "Record the presenting problem and the outcome.",
  },
  {
    id: "newCvDiagnosis",
    group: "events",
    label: "New cardiovascular diagnosis",
    signal: "event:newCvDiagnosis",
    escalates: true,
    followUp: "This changes the baseline risk factor set — record it in the cardiovascular history as well.",
  },
  {
    id: "newCvMedication",
    group: "events",
    label: "New cardiovascular medication started elsewhere",
    signal: "event:newCvMedication",
    escalates: false,
    followUp: "Add it to the medication list so the interaction and QT checks see it.",
  },

  {
    id: "therapyChange",
    group: "treatment",
    label: "Cancer therapy changed",
    signal: "treatment:changed",
    escalates: false,
    followUp: "A change of agent changes the surveillance pathway and may change the baseline proforma.",
  },
  {
    id: "doseInterruption",
    group: "treatment",
    label: "Dose delayed, reduced or interrupted",
    signal: "treatment:interrupted",
    escalates: false,
    followUp: "Record whether the reason was cardiovascular.",
  },
  {
    id: "doseOmitted",
    group: "treatment",
    label: "Dose omitted entirely",
    signal: "treatment:omitted",
    escalates: false,
  },

  {
    id: "newBiomarker",
    group: "results",
    label: "Abnormal biomarker result elsewhere",
    signal: "result:biomarker",
    escalates: true,
    followUp: "Enter the value and the assay in investigations so it can be compared with the baseline.",
  },
  {
    id: "newImaging",
    group: "results",
    label: "Abnormal cardiac imaging elsewhere",
    signal: "result:imaging",
    escalates: true,
    followUp: "Enter the ejection fraction and, if available, the strain, with the modality.",
  },
];

export const SINCE_LAST_VISIT_GROUPS = [
  { id: "symptoms", label: "Cardiovascular symptoms", hint: "New or worsening since the last contact" },
  { id: "events", label: "Health events", hint: "Admissions, new diagnoses and new medicines" },
  { id: "treatment", label: "Cancer treatment", hint: "Changes to the planned course" },
  { id: "results", label: "Results from elsewhere", hint: "Anything measured outside this service" },
];

export function itemsForGroup(groupId) {
  return SINCE_LAST_VISIT_ITEMS.filter((item) => item.group === groupId);
}

/**
 * Reads the interval history into signals the clinical engines consume.
 *
 * Symptoms reported for the interval are merged into the encounter's symptom
 * list, because a patient who was breathless every night this week but happens
 * to be comfortable sitting in clinic is still a patient with heart failure
 * symptoms — and the previous free-text field meant the engines never saw it.
 */
export function interpretSinceLastVisit(encounter) {
  const answers = encounter?.sinceLastVisit || {};
  const positive = SINCE_LAST_VISIT_ITEMS.filter((item) => Boolean(answers[item.id]?.present ?? answers[item.id]));

  const symptoms = positive
    .filter((item) => item.signal.startsWith("symptom:"))
    .map((item) => item.signal.slice("symptom:".length));

  const events = positive.filter((item) => item.signal.startsWith("event:")).map((item) => item.signal.slice("event:".length));
  const treatment = positive.filter((item) => item.signal.startsWith("treatment:")).map((item) => item.signal.slice("treatment:".length));
  const results = positive.filter((item) => item.signal.startsWith("result:")).map((item) => item.signal.slice("result:".length));

  const escalating = positive.filter((item) => item.escalates);

  return {
    answered: Object.keys(answers).length > 0,
    positive,
    intervalSymptoms: symptoms,
    events,
    treatmentChanges: treatment,
    externalResults: results,
    escalating,
    /** True when something in the interval warrants review regardless of today's measurements. */
    requiresReview: escalating.length > 0,
    detail: Object.fromEntries(positive.map((item) => [item.id, answers[item.id]?.detail || ""])),
    summary: positive.length
      ? `${positive.length} positive finding${positive.length === 1 ? "" : "s"} since the last visit: ${positive.map((item) => item.label.toLowerCase()).join(", ")}.`
      : answers && Object.keys(answers).length
        ? "Nothing reported since the last visit."
        : "Interval history not yet taken.",
    provenance: provenance("corsc-operational", {
      locator: "Structured interval history",
      note: "A CORSC data-capture structure. The individual items are drawn from the symptoms and events that the guideline pathways act on.",
    }),
  };
}

/** Merges interval symptoms into the encounter's symptom list, de-duplicated. */
export function mergeIntervalSymptoms(encounter) {
  const interval = interpretSinceLastVisit(encounter);
  const today = Array.isArray(encounter?.symptoms) ? encounter.symptoms : [];
  return Array.from(new Set([...today, ...interval.intervalSymptoms]));
}
