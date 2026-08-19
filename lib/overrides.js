/* =========================================================================
   Clinician overrides.

   A decision-support system that a clinician cannot disagree with is a system
   that will be worked around. But an override that erases the algorithm's
   answer is worse than no override at all: the next reader cannot tell whether
   the displayed category was computed or chosen, and the service loses the
   ability to audit whether its own tool is any good.

   So overrides here are ADDITIVE. The algorithmic result is never mutated. Each
   override stores the original result, the clinician's result, the reason, who
   made it and when, and the final displayed value is derived from the two.

   A reason is mandatory. An override with no reason is indistinguishable from a
   mis-click three months later, and "the algorithm was wrong" is the kind of
   claim that has to be attributable to a person.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";

export const OVERRIDABLE = {
  risk: {
    id: "risk",
    label: "Baseline risk category",
    valueLabel: "Risk category",
    options: ["Low", "Moderate", "High", "Very High"],
    note: "Overriding the baseline category changes the surveillance schedule and the follow-up interval derived from it.",
  },
  ctrcvt: {
    id: "ctrcvt",
    label: "Current toxicity severity",
    valueLabel: "Severity",
    options: ["none", "mild", "moderate", "severe", "verySevere"],
    note: "Overriding the current severity changes the alerts and the fitness verdict.",
  },
  alert: {
    id: "alert",
    label: "Alert severity",
    valueLabel: "Alert level",
    options: ["red", "orange", "yellow", "green"],
    note: "Downgrading an alert removes it from the urgent worklist filters.",
  },
  surveillance: {
    id: "surveillance",
    label: "Surveillance recommendation",
    valueLabel: "Decision",
    options: ["accepted", "deferred", "declined", "brought-forward"],
    note: "Deferring or declining a surveillance item leaves the item on the record with the reason attached.",
  },
  medication: {
    id: "medication",
    label: "Medication recommendation",
    valueLabel: "Decision",
    options: ["accepted", "deferred", "declined", "already-considered"],
    note: "The recommendation stays visible; the clinician's decision is recorded alongside it.",
  },
  followUp: {
    id: "followUp",
    label: "Follow-up interval",
    valueLabel: "Interval",
    options: [],
    note: "Overriding the interval does not change the clinical triggers that produced it.",
  },
  fitness: {
    id: "fitness",
    label: "Fitness-to-proceed verdict",
    valueLabel: "Decision",
    options: ["proceed", "caution", "hold"],
    note: "The verdict is a decision-support prompt, not an instruction — the treating team decides. This records that a different decision was reached, and why, without erasing what the software said.",
  },
};

export function overridableTargets() {
  return Object.values(OVERRIDABLE);
}

export class OverrideError extends Error {}

/**
 * Builds an override record.
 *
 * Throws rather than silently producing an unattributable record: a clinical
 * override with no clinician and no reason is not a thing this application is
 * willing to store.
 */
export function createOverride({ target, subjectId = null, algorithmicValue, clinicianValue, reason, clinician, at } = {}) {
  if (!OVERRIDABLE[target]) throw new OverrideError(`Unknown override target: ${target}`);
  if (clinicianValue === undefined || clinicianValue === null || clinicianValue === "") {
    throw new OverrideError("An override must state the clinician's value.");
  }
  if (!String(reason || "").trim()) {
    throw new OverrideError("An override must record why the algorithmic result was not accepted.");
  }
  if (!String(clinician?.id || clinician?.email || "").trim()) {
    throw new OverrideError("An override must be attributable to an identified clinician.");
  }

  return {
    id: `ovr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    target,
    subjectId,
    algorithmicValue: algorithmicValue ?? null,
    clinicianValue,
    reason: String(reason).trim(),
    clinician: {
      id: clinician.id || null,
      email: clinician.email || null,
      name: clinician.name || null,
    },
    at: at || new Date().toISOString(),
    active: true,
  };
}

/** The most recent active override for a target, or null. */
export function activeOverride(overrides, target, subjectId = null) {
  return (
    (Array.isArray(overrides) ? overrides : [])
      .filter((item) => item && item.active !== false && item.target === target && (subjectId === null || item.subjectId === subjectId))
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))[0] || null
  );
}

/**
 * Resolves what to display.
 *
 * Always returns BOTH values plus which one is being shown, so no consumer can
 * render the final value without also being able to render where it came from.
 */
export function resolveValue({ overrides, target, subjectId = null, algorithmicValue }) {
  const override = activeOverride(overrides, target, subjectId);
  if (!override) {
    return {
      value: algorithmicValue,
      algorithmicValue,
      clinicianValue: null,
      overridden: false,
      override: null,
      attribution: "Calculated by CORSC",
      provenance: provenance("corsc-operational", { locator: "Algorithmic result, not overridden" }),
    };
  }
  return {
    value: override.clinicianValue,
    algorithmicValue,
    clinicianValue: override.clinicianValue,
    overridden: true,
    override,
    attribution: `Clinician decision by ${override.clinician.name || override.clinician.email || override.clinician.id}`,
    provenance: provenance("corsc-operational", {
      locator: "Clinician override",
      note: `CORSC calculated ${formatValue(algorithmicValue)}; the clinician recorded ${formatValue(override.clinicianValue)}. Reason: ${override.reason}`,
    }),
  };
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "no value";
  return String(value);
}

/** Withdraws an override without deleting it — the history stays intact. */
export function withdrawOverride(overrides, overrideId, { clinician, reason, at } = {}) {
  return (Array.isArray(overrides) ? overrides : []).map((item) =>
    item.id === overrideId
      ? {
          ...item,
          active: false,
          withdrawnAt: at || new Date().toISOString(),
          withdrawnBy: clinician?.id || clinician?.email || null,
          withdrawnReason: reason || null,
        }
      : item
  );
}

/** Every override on a record, newest first, for the report and the audit view. */
export function overrideHistory(overrides) {
  return (Array.isArray(overrides) ? overrides : [])
    .slice()
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .map((item) => ({
      ...item,
      targetLabel: OVERRIDABLE[item.target]?.label || item.target,
      summary: `${OVERRIDABLE[item.target]?.label || item.target}: CORSC calculated ${formatValue(item.algorithmicValue)}, clinician recorded ${formatValue(
        item.clinicianValue
      )}${item.active === false ? " (withdrawn)" : ""}`,
    }));
}
