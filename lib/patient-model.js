/* =========================================================================
   Patient and encounter data model.

   The workflow stores rich, structured clinical data (per-system examination,
   per-symptom detail, structured vitals). The validated surveillance engine in
   lib/surveillance-engine.js reads an older, flat shape. Rather than duplicate
   state, `toEngineVisit` / `toEnginePatient` project the rich record onto the
   flat shape on demand, so the engine keeps working unchanged.
   ========================================================================= */

import { INVESTIGATIONS, EXAM_SYSTEMS, HISTORY_GROUPS } from "@/lib/clinical-data";
import { normaliseTreatmentCourse } from "@/lib/treatment-course";
import { calcBMI, deriveVitals, num } from "@/lib/vitals";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ------------------------------------------------------------- factories */

export function emptyInvestigations() {
  const out = {};
  INVESTIGATIONS.forEach((f) => {
    out[f.id] = { result: "", interp: "", date: "", comment: "" };
  });
  return out;
}

export function emptySystems() {
  const out = {};
  EXAM_SYSTEMS.forEach((system) => {
    const components = {};
    system.components.forEach((c) => {
      components[c.id] = { normal: false, text: "" };
    });
    out[system.id] = { status: "", components };
  });
  return out;
}

export function emptyHistory() {
  const out = {};
  HISTORY_GROUPS.forEach((group) => {
    out[group.id] = { checks: {}, fields: {} };
  });
  return out;
}

export function createEncounter(type = "Baseline", options = {}) {
  const cycleMatch = String(type || "").match(/(?:cycle|dose)\s*(\d+)/i);
  return {
    id: uid("v"),
    type,
    cycle: cycleMatch ? Number(cycleMatch[1]) : options.cycle ?? null,
    date: options.date || todayISO(),
    saved: false,
    firstReview: {
      cycle: options.cycle ?? (cycleMatch ? Number(cycleMatch[1]) : ""),
      tolerance: "",
      interimEvents: "",
      admissions: "",
      clinicalConcerns: "",
      earlyToxicity: "",
    },
    vitals: { height: "", weight: "", referenceWeight: "", sbp: "", dbp: "", pulse: "", temp: "", rr: "", spo2: "" },
    symptoms: [],
    symptomDetail: {},
    systems: emptySystems(),
    inv: emptyInvestigations(),
    medReview: "",
    medDecisions: {},
    plan: "",
    notes: "",
    nextFollowUpDate: "",
    taskCompletion: {},
    aiSummary: "",
    alerts: [],
  };
}

export function createPatient(input) {
  return {
    id: uid("p"),
    patientId: "",
    name: "",
    age: "",
    gender: "Male",
    diagnosis: "",
    stage: "",
    /**
     * The regimen as free text. Retained as the record of what the clinician
     * wrote, whichever entry path they used, and the only regimen field for a
     * free-text course.
     */
    regimen: "",
    /**
     * The structured course — phases and agents — when one was chosen from the
     * library or built by hand. Null for a free-text regimen, which CORSC does
     * not parse. See lib/treatment-course.js.
     */
    treatmentCourse: null,
    therapy: [],
    plannedCycles: "",
    cycleFrequency: "",
    totalPlannedDose: "",
    anthracyclineDoses: [],
    veryHigh: {},
    high: {},
    m2: {},
    m1: {},
    baselineLVEF: "",
    baselineGLS: "",
    baselineQTc: "",
    baselineTroponin: "",
    baselineNtProBnp: "",
    troponinAssay: "hs-cTnT",
    troponinURL: "",
    baselineWeight: "",
    cycle: 0,
    clinicalStatus: "Stable",
    registeredDate: todayISO(),
    history: emptyHistory(),
    medications: [],
    visits: [],
    contraindications: { absolute: {}, relative: {} },
    restratification: {},
    auditTrail: [],
    lastSummary: "",
    ...input,
  };
}

/* -------------------------------------------------------------- migration */

/** Brings records saved by earlier builds up to the current shape. */
export function migratePatient(raw) {
  if (!raw || typeof raw !== "object") return null;
  const patient = {
    ...createPatient({}),
    ...raw,
    patientId: raw.patientId || raw.uhid || "",
    history: { ...emptyHistory(), ...(raw.history || {}) },
    medications: Array.isArray(raw.medications) ? raw.medications : [],
    // Therapy became a list when combined regimens were supported; records
    // saved before that hold a single id.
    therapy: Array.isArray(raw.therapy) ? raw.therapy : raw.therapy ? [raw.therapy] : [],
    // Records saved before structured courses existed carry only a regimen
    // string. It becomes a free-text course holding that exact text — never
    // parsed into phases, because migrating a record must not invent clinical
    // facts that were never recorded.
    treatmentCourse: raw.treatmentCourse
      ? normaliseTreatmentCourse(raw.treatmentCourse, raw.regimen || "")
      : null,
    anthracyclineDoses: Array.isArray(raw.anthracyclineDoses) ? raw.anthracyclineDoses : [],
    contraindications: raw.contraindications || { absolute: {}, relative: {} },
    restratification: raw.restratification || {},
    auditTrail: Array.isArray(raw.auditTrail) ? raw.auditTrail : [],
  };
  delete patient.uhid;
  patient.visits = (Array.isArray(raw.visits) ? raw.visits : []).map(migrateEncounter);
  return patient;
}

export function migrateEncounter(raw) {
  if (!raw || typeof raw !== "object") return createEncounter();
  const base = createEncounter(raw.type || "Baseline");
  const legacyExam = raw.exam || {};
  const bpMatch = String(legacyExam.bp || "").match(/(\d+)\s*\/\s*(\d+)/);

  return {
    ...base,
    ...raw,
    id: raw.id || base.id,
    firstReview: { ...base.firstReview, ...(raw.firstReview || {}) },
    vitals: {
      ...base.vitals,
      ...(raw.vitals || {}),
      // Recover structured vitals from the legacy flat exam block.
      sbp: (raw.vitals && raw.vitals.sbp) || (bpMatch ? bpMatch[1] : ""),
      dbp: (raw.vitals && raw.vitals.dbp) || (bpMatch ? bpMatch[2] : ""),
      pulse: (raw.vitals && raw.vitals.pulse) || legacyExam.pulse || "",
      rr: (raw.vitals && raw.vitals.rr) || legacyExam.rr || "",
      spo2: (raw.vitals && raw.vitals.spo2) || legacyExam.spo2 || "",
      temp: (raw.vitals && raw.vitals.temp) || legacyExam.temp || "",
      weight: (raw.vitals && raw.vitals.weight) || legacyExam.weight || "",
    },
    symptoms: Array.isArray(raw.symptoms) ? raw.symptoms : [],
    symptomDetail: raw.symptomDetail || {},
    systems: mergeSystems(raw.systems, legacyExam),
    inv: { ...emptyInvestigations(), ...(raw.inv || {}) },
    medDecisions: raw.medDecisions || {},
    taskCompletion: raw.taskCompletion || {},
  };
}

function mergeSystems(saved, legacyExam) {
  const systems = emptySystems();
  EXAM_SYSTEMS.forEach((system) => {
    const savedSystem = saved && saved[system.id];
    if (savedSystem) {
      systems[system.id] = {
        status: savedSystem.status || "",
        components: { ...systems[system.id].components, ...(savedSystem.components || {}) },
      };
    }
  });
  // Carry legacy free-text heart/lung findings into the new structure.
  if (!saved && legacyExam) {
    if (legacyExam.heart) {
      systems.cvs.status = "findings";
      systems.cvs.components.auscultation = { normal: false, text: legacyExam.heart };
    }
    if (legacyExam.lungs) {
      systems.rs.status = "findings";
      systems.rs.components.auscultation = { normal: false, text: legacyExam.lungs };
    }
  }
  return systems;
}

/* ------------------------------------------------- engine projection layer */

function summariseSystem(system) {
  if (!system) return "";
  if (system.status === "normal") return "Normal";
  const parts = [];
  Object.entries(system.components || {}).forEach(([key, value]) => {
    if (!value) return;
    if (value.normal) parts.push(`${key}: normal`);
    else if (value.text) parts.push(`${key}: ${value.text}`);
  });
  return parts.join("; ");
}

/** Human-readable one-line summary of a system, for reports. */
export function systemSummaryText(system, definition) {
  if (!system || !system.status) return "Not examined";
  if (system.status === "normal") return "Normal";
  const parts = (definition?.components || []).flatMap((component) => {
    const value = system.components?.[component.id];
    if (!value) return [];
    if (value.normal) return [`${component.label}: normal`];
    if (value.text) return [`${component.label}: ${value.text}`];
    return [];
  });
  return parts.length ? parts.join(" · ") : "Findings recorded, no detail entered";
}

/** Flat exam block expected by the surveillance engine. */
export function toEngineExam(visit) {
  const vitals = visit.vitals || {};
  const systems = visit.systems || {};
  const bp = vitals.sbp && vitals.dbp ? `${vitals.sbp}/${vitals.dbp}` : "";
  const cvs = summariseSystem(systems.cvs);
  const rs = summariseSystem(systems.rs);
  return {
    bp,
    pulse: vitals.pulse || "",
    rr: vitals.rr || "",
    spo2: vitals.spo2 || "",
    temp: vitals.temp || "",
    weight: vitals.weight || "",
    bmi: calcBMI(vitals.height, vitals.weight) ?? "",
    jvp: systems.cvs?.components?.palpation?.text || (systems.cvs?.status === "normal" ? "Not raised" : ""),
    heart: cvs,
    lungs: rs,
    oedema: systems.cvs?.status === "normal" ? "None" : "",
  };
}

/**
 * Projects a rich encounter onto the flat visit shape the surveillance engine
 * reads. Medication review counts as documented when either free-text notes or
 * a structured medication list exists.
 */
export function toEngineVisit(visit) {
  if (!visit) return visit;
  const medicationNote = visit.medReview || "";
  return {
    ...visit,
    exam: toEngineExam(visit),
    medReview: medicationNote,
    notes: visit.notes || "",
    plan: visit.plan || "",
  };
}

export function toEnginePatient(patient) {
  if (!patient) return patient;
  return {
    ...patient,
    visits: (patient.visits || []).map(toEngineVisit),
  };
}

/* ------------------------------------------------------- display helpers */

export function latestNumericInvestigation(patient, encounter, id) {
  const visits = [...(patient?.visits || []), encounter].filter(Boolean);
  for (let i = visits.length - 1; i >= 0; i -= 1) {
    const value = num(visits[i]?.inv?.[id]?.result);
    if (value !== null) return value;
  }
  return null;
}

export function latestLVEF(patient, encounter) {
  const fromVisits = latestNumericInvestigation(patient, encounter, "lvef");
  if (fromVisits !== null) return fromVisits;
  const baseline = num(patient?.baselineLVEF);
  return baseline;
}

export function currentCycle(patient, encounter) {
  const fromEncounter = num(encounter?.firstReview?.cycle) ?? num(encounter?.cycle);
  if (fromEncounter !== null && fromEncounter > 0) return fromEncounter;
  const fromPatient = num(patient?.cycle);
  return fromPatient !== null ? fromPatient : 0;
}

export function encounterVitals(patient, encounter) {
  return deriveVitals(encounter?.vitals || {}, patient?.baselineWeight);
}

/**
 * True once a patient has at least one filed visit.
 *
 * "Established" in the sense spec #16 uses it — a patient CORSC already has a
 * longitudinal record for, as opposed to one still being registered. This is
 * what decides whether "Changes Only" has anything to carry forward from.
 */
export function isEstablishedPatient(patient) {
  return (patient?.visits || []).length > 0;
}

/** Counts how much of a section has been filled, for the progress indicators. */
export function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.values(value).some(isFilled);
  return Boolean(value);
}
