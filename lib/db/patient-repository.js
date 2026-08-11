/* =========================================================================
   Patient data access.

   A single boundary between the application and wherever patient data lives.
   Today that is browser local storage; the Supabase schema in
   supabase/migrations is the target. Introducing this seam first means the
   backend migration is a change to one module rather than a change to every
   component that touches a patient.

   The local-storage driver is retained deliberately and is NOT presented as an
   acceptable production store. It carries a `warnings` list that the
   application surfaces, because identifiable clinical data in local storage is
   unencrypted at rest, readable by anything running in the page, lost when the
   browser is cleared, and impossible to audit or revoke.

   Nothing here interprets clinical data. Repositories move records; the engines
   decide what they mean.
   ========================================================================= */

import { migratePatient } from "@/lib/patient-model";
import { supabase, supabaseConfigurationError } from "@/lib/supabase";

export const DRIVERS = {
  local: {
    id: "local",
    label: "Browser local storage",
    durable: false,
    warnings: [
      "Patient data is held unencrypted in this browser only.",
      "It is lost if browser data is cleared, and it is not backed up.",
      "It cannot be shared with colleagues, audited centrally, or revoked.",
      "Do not use this driver for identifiable patient data outside evaluation.",
    ],
  },
  supabase: {
    id: "supabase",
    label: "Supabase PostgreSQL with row-level security",
    durable: true,
    warnings: [],
  },
};

/** Which driver is in force. Supabase when configured, local otherwise. */
export function activeDriver() {
  return supabaseConfigurationError || !supabase ? DRIVERS.local : DRIVERS.supabase;
}

/* --------------------------------------------------------- local storage */

function localKey(userId, patientId) {
  return `corsc:patient:${userId}:${patientId}`;
}

function localPrefix(userId) {
  return `corsc:patient:${userId}:`;
}

const localDriver = {
  id: "local",

  async list(userId) {
    if (typeof window === "undefined") return [];
    const prefix = localPrefix(userId);
    try {
      return Object.keys(window.localStorage).flatMap((key) => {
        if (!key.startsWith(prefix)) return [];
        try {
          const raw = window.localStorage.getItem(key);
          const parsed = raw ? migratePatient(JSON.parse(raw)) : null;
          return parsed ? [parsed] : [];
        } catch {
          // A single corrupt record must not take the whole caseload down.
          return [];
        }
      });
    } catch {
      return [];
    }
  },

  async save(userId, patient) {
    if (typeof window === "undefined") return patient;
    window.localStorage.setItem(localKey(userId, patient.id), JSON.stringify(patient));
    return patient;
  },

  async remove(userId, patientId) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(localKey(userId, patientId));
  },
};

/* -------------------------------------------------------------- supabase */

/**
 * Maps a database row onto the application's patient shape.
 *
 * Kept explicit rather than spreading the row, so that a column added to the
 * database does not silently appear in the client model — and so that a column
 * the client should not see cannot leak by accident.
 */
export function fromRow(row, encounters = [], doses = [], overrides = []) {
  if (!row) return null;
  return migratePatient({
    id: row.id,
    patientId: row.patient_ref || "",
    name: row.name || "",
    age: row.age ?? "",
    gender: row.sex || "Not recorded",
    diagnosis: row.diagnosis || "",
    stage: row.stage || "",
    regimen: row.regimen || "",
    therapy: Array.isArray(row.therapy) ? row.therapy : [],
    plannedCycles: row.planned_cycles ?? "",
    cycleFrequency: row.cycle_frequency || "",
    cycle: row.current_cycle ?? 0,
    baselineLVEF: row.baseline_lvef ?? "",
    baselineGLS: row.baseline_gls ?? "",
    baselineQTc: row.baseline_qtc ?? "",
    baselineTroponin: row.baseline_troponin ?? "",
    baselineNtProBnp: row.baseline_ntprobnp ?? "",
    baselineWeight: row.baseline_weight_kg ?? "",
    baselineHeight: row.baseline_height_cm ?? "",
    troponinAssay: row.troponin_assay_id || "hs-cTnT",
    troponinURL: row.troponin_local_url ?? "",
    totalPlannedDose: row.total_planned_dose ?? "",
    history: row.history || {},
    medications: row.medications || [],
    contraindications: row.contraindications || {},
    clinicalStatus: row.clinical_status || "Stable",
    registeredDate: row.registered_on || "",
    ...(row.risk_factor_ticks || {}),
    anthracyclineDoses: doses.map((dose) => ({
      id: dose.id,
      agent: dose.agent_id,
      dose: dose.dose,
      unit: dose.dose_unit,
      bsa: dose.bsa,
      cycle: dose.cycle,
      date: dose.given_on,
    })),
    overrides,
    visits: encounters,
  });
}

/** Maps the application's patient shape onto a database row. */
export function toRow(patient, ownerId) {
  const numeric = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    id: patient.id,
    owner_id: ownerId,
    patient_ref: patient.patientId || null,
    name: patient.name || "",
    age: numeric(patient.age),
    sex: patient.gender || null,
    diagnosis: patient.diagnosis || null,
    stage: patient.stage || null,
    regimen: patient.regimen || null,
    therapy: Array.isArray(patient.therapy) ? patient.therapy : patient.therapy ? [patient.therapy] : [],
    planned_cycles: numeric(patient.plannedCycles),
    cycle_frequency: patient.cycleFrequency || null,
    current_cycle: numeric(patient.cycle) ?? 0,
    baseline_lvef: numeric(patient.baselineLVEF),
    baseline_gls: numeric(patient.baselineGLS),
    baseline_qtc: numeric(patient.baselineQTc),
    baseline_troponin: numeric(patient.baselineTroponin),
    baseline_ntprobnp: numeric(patient.baselineNtProBnp),
    baseline_weight_kg: numeric(patient.baselineWeight),
    baseline_height_cm: numeric(patient.baselineHeight),
    troponin_assay_id: patient.troponinAssay || null,
    troponin_local_url: numeric(patient.troponinURL),
    total_planned_dose: numeric(patient.totalPlannedDose),
    history: patient.history || {},
    risk_factor_ticks: {
      veryHigh: patient.veryHigh || {},
      high: patient.high || {},
      m2: patient.m2 || {},
      m1: patient.m1 || {},
    },
    contraindications: patient.contraindications || {},
    medications: patient.medications || [],
    clinical_status: patient.clinicalStatus || "Stable",
    registered_on: patient.registeredDate || null,
  };
}

const supabaseDriver = {
  id: "supabase",

  // No user filter here: row-level security scopes the result to the caller,
  // and filtering client-side as well would imply the policy is optional.
  async list() {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw error;

    const ids = (data || []).map((row) => row.id);
    if (ids.length === 0) return [];

    const [{ data: encounters }, { data: doses }, { data: overrides }] = await Promise.all([
      supabase.from("encounters").select("*").in("patient_id", ids).order("occurred_on", { ascending: true }),
      supabase.from("anthracycline_doses").select("*").in("patient_id", ids).order("cycle", { ascending: true }),
      supabase.from("overrides").select("*").in("patient_id", ids).order("created_at", { ascending: false }),
    ]);

    const group = (rows, key) =>
      (rows || []).reduce((groups, row) => {
        groups[row[key]] = groups[row[key]] || [];
        groups[row[key]].push(row);
        return groups;
      }, {});

    const byPatientEncounters = group(encounters, "patient_id");
    const byPatientDoses = group(doses, "patient_id");
    const byPatientOverrides = group(overrides, "patient_id");

    return (data || []).map((row) =>
      fromRow(
        row,
        (byPatientEncounters[row.id] || []).map(encounterFromRow),
        byPatientDoses[row.id] || [],
        (byPatientOverrides[row.id] || []).map(overrideFromRow)
      )
    );
  },

  async save(ownerId, patient) {
    const { error } = await supabase.from("patients").upsert(toRow(patient, ownerId));
    if (error) throw error;
    return patient;
  },

  async remove() {
    // Deliberately unsupported. Patient records are archived, never deleted:
    // a removed clinical record cannot be audited. The schema carries
    // archived_at and there is no DELETE policy.
    throw new Error("Patient records are archived rather than deleted.");
  },
};

function encounterFromRow(row) {
  return {
    id: row.id,
    visitType: row.visit_type,
    type: row.visit_type,
    cycle: row.cycle,
    date: row.occurred_on,
    saved: row.filed,
    vitals: row.vitals || {},
    symptoms: row.symptoms || [],
    symptomDetail: row.symptom_detail || {},
    sinceLastVisit: row.since_last_visit || {},
    systems: row.systems || {},
    inv: row.investigations || {},
    hfStatus: row.hf_status || "",
    medReview: row.medication_review || "",
    medDecisions: row.medication_decisions || {},
    taskCompletion: row.task_completion || {},
    plan: row.plan || "",
    notes: row.notes || "",
    nextFollowUpDate: row.next_review_on || "",
  };
}

function overrideFromRow(row) {
  return {
    id: row.id,
    target: row.target,
    subjectId: row.subject_id,
    algorithmicValue: row.algorithmic_value,
    clinicianValue: row.clinician_value,
    reason: row.reason,
    clinician: { id: row.clinician_id },
    at: row.created_at,
    active: !row.withdrawn_at,
    withdrawnAt: row.withdrawn_at,
    withdrawnReason: row.withdrawn_reason,
  };
}

/* ----------------------------------------------------------------- facade */

export function patientRepository() {
  const driver = activeDriver();
  const implementation = driver.id === "supabase" ? supabaseDriver : localDriver;
  return {
    driver,
    list: (userId) => implementation.list(userId),
    save: (userId, patient) => implementation.save(userId, patient),
    remove: (userId, patientId) => implementation.remove(userId, patientId),
  };
}
