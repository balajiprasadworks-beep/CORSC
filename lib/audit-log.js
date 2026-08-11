/* =========================================================================
   Audit trail.

   Records clinically meaningful events: what changed, who changed it, when, and
   what it was before. Two constraints shape this module.

   FIRST, it must not become a patient-data leak. An audit entry that stores the
   full previous and new patient object would duplicate the entire record —
   including free-text clinical notes — into a second store with different
   access rules. Entries here store field-level before/after values for the
   fields that were declared auditable, and nothing else. Free-text clinical
   narrative is recorded as "changed", not quoted.

   SECOND, it is not part of the normal clinical view. The audit trail answers
   governance questions, not clinical ones. It is available on request rather
   than rendered alongside the observations, so the encounter screen does not
   turn into a change log.
   ========================================================================= */

export const AUDIT_ACTIONS = {
  patientCreated: { id: "patientCreated", label: "Patient record created", category: "record" },
  patientEdited: { id: "patientEdited", label: "Patient record edited", category: "record" },
  encounterStarted: { id: "encounterStarted", label: "Encounter started", category: "encounter" },
  encounterFiled: { id: "encounterFiled", label: "Encounter filed", category: "encounter" },
  resultEdited: { id: "resultEdited", label: "Clinical result edited", category: "clinical" },
  riskCalculated: { id: "riskCalculated", label: "Baseline risk calculated", category: "clinical" },
  riskChanged: { id: "riskChanged", label: "Baseline risk category changed", category: "clinical" },
  toxicityGraded: { id: "toxicityGraded", label: "Current toxicity graded", category: "clinical" },
  overrideRecorded: { id: "overrideRecorded", label: "Clinician override recorded", category: "override" },
  overrideWithdrawn: { id: "overrideWithdrawn", label: "Clinician override withdrawn", category: "override" },
  surveillanceChanged: { id: "surveillanceChanged", label: "Surveillance plan changed", category: "clinical" },
  medicationRecommended: { id: "medicationRecommended", label: "Medication recommendation issued", category: "clinical" },
  medicationDecision: { id: "medicationDecision", label: "Medication recommendation actioned", category: "clinical" },
  therapyChanged: { id: "therapyChanged", label: "Cancer therapy changed", category: "record" },
  reportGenerated: { id: "reportGenerated", label: "Clinical report generated", category: "export" },
  dataExported: { id: "dataExported", label: "Patient data exported", category: "export" },
};

/**
 * Fields whose values may be written into the audit trail verbatim.
 *
 * Anything not listed here is recorded as having changed without its content
 * being copied. That is deliberate: the audit log must be able to answer "did
 * someone change the ejection fraction" without becoming a second copy of the
 * clinical narrative.
 */
export const AUDITABLE_FIELDS = new Set([
  "therapy",
  "regimen",
  "plannedCycles",
  "cycleFrequency",
  "totalPlannedDose",
  "baselineLVEF",
  "baselineGLS",
  "baselineQTc",
  "baselineTroponin",
  "baselineNtProBnp",
  "troponinAssay",
  "troponinURL",
  "baselineWeight",
  "cycle",
  "clinicalStatus",
  "age",
  "gender",
  "stage",
]);

const REDACTED = "[changed — value not copied to the audit trail]";

function safeValue(field, value) {
  if (!AUDITABLE_FIELDS.has(field)) return REDACTED;
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return REDACTED;
  return String(value);
}

export function auditEntry({ action, actor, field = null, previous = undefined, next = undefined, reason = null, detail = null, at } = {}) {
  const definition = AUDIT_ACTIONS[action];
  return {
    id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    action,
    actionLabel: definition?.label || action,
    category: definition?.category || "other",
    actor: {
      id: actor?.id || null,
      email: actor?.email || null,
      name: actor?.name || null,
    },
    field,
    previous: previous === undefined ? null : safeValue(field, previous),
    next: next === undefined ? null : safeValue(field, next),
    reason: reason || null,
    detail: detail || null,
    at: at || new Date().toISOString(),
  };
}

export function appendAudit(trail, entry) {
  return [...(Array.isArray(trail) ? trail : []), entry];
}

/**
 * Diffs two patient records and produces one entry per changed auditable field.
 *
 * Non-auditable fields still generate an entry, so the fact of the change is
 * recorded, but the values are not copied.
 */
export function diffPatient(previous, next, actor) {
  const entries = [];
  const keys = new Set([...Object.keys(previous || {}), ...Object.keys(next || {})]);

  keys.forEach((key) => {
    if (["visits", "draftEncounter", "auditTrail", "overrides", "lastSummary"].includes(key)) return;
    const before = previous?.[key];
    const after = next?.[key];
    if (JSON.stringify(before) === JSON.stringify(after)) return;

    const isRiskField = ["therapy", "baselineLVEF", "age"].includes(key);
    entries.push(
      auditEntry({
        action: key === "therapy" ? AUDIT_ACTIONS.therapyChanged.id : AUDIT_ACTIONS.patientEdited.id,
        actor,
        field: key,
        previous: before,
        next: after,
        detail: isRiskField ? "This field contributes to the baseline risk calculation." : null,
      })
    );
  });

  return entries;
}

/** Records a change in the computed baseline category, with the reason. */
export function auditRiskChange({ actor, previousCategory, nextCategory, reason }) {
  return auditEntry({
    action: AUDIT_ACTIONS.riskChanged.id,
    actor,
    field: "riskCategory",
    previous: previousCategory,
    next: nextCategory,
    reason,
    detail: "Recalculated from the recorded data; not a clinician override.",
  });
}

export function auditOverride({ actor, override }) {
  return auditEntry({
    action: AUDIT_ACTIONS.overrideRecorded.id,
    actor,
    field: override.target,
    previous: override.algorithmicValue,
    next: override.clinicianValue,
    reason: override.reason,
    detail: "Clinician override. The algorithmic result is retained unchanged.",
  });
}

/* -------------------------------------------------------------- retrieval */

export function auditTrail(patient, { category, since, limit } = {}) {
  let entries = Array.isArray(patient?.auditTrail) ? patient.auditTrail.slice() : [];
  if (category) entries = entries.filter((entry) => entry.category === category);
  if (since) entries = entries.filter((entry) => String(entry.at) >= String(since));
  entries.sort((a, b) => String(b.at).localeCompare(String(a.at)));
  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

/** Counts by category, for the governance view. */
export function auditSummary(patient) {
  const entries = Array.isArray(patient?.auditTrail) ? patient.auditTrail : [];
  const counts = {};
  entries.forEach((entry) => {
    counts[entry.category] = (counts[entry.category] || 0) + 1;
  });
  return {
    total: entries.length,
    counts,
    lastEntry: entries.length ? auditTrail(patient, { limit: 1 })[0] : null,
  };
}
