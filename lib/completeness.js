/* =========================================================================
   Data completeness.

   A risk category computed from four recorded facts looks exactly like a risk
   category computed from twenty. That is the problem this module exists to fix.

   The point is not the percentage. The point is that a confident-looking
   "Low risk" badge on a patient with no baseline ejection fraction, no
   biomarkers and no history is a false reassurance, and the interface should
   refuse to present it as equivalent to a fully worked-up assessment.

   Items are weighted by what they actually change. A missing baseline LVEF is
   not the same size of problem as a missing pack-year count: without the LVEF
   no later ejection fraction can be interpreted at all, so every CTRCD grade
   for the rest of the patient's treatment is degraded. Items marked `critical`
   therefore gate the confidence band independently of the percentage.
   ========================================================================= */

import { provenance } from "@/lib/clinical-sources";
import { therapyList } from "@/lib/hfa-icos";
import { pathwayFor } from "@/lib/therapy-pathways";
import { num } from "@/lib/vitals";

export const BANDS = {
  complete: {
    id: "complete",
    label: "Complete",
    tone: "ok",
    detail: "The dataset supports the assessment shown.",
  },
  partial: {
    id: "partial",
    label: "Partially complete",
    tone: "warning",
    detail: "The assessment is usable but some inputs are missing. Treat borderline results with caution.",
  },
  insufficient: {
    id: "insufficient",
    label: "Insufficient data",
    tone: "danger",
    detail:
      "Critical inputs are missing. The risk category and toxicity grade shown are provisional and should not be relied on for a treatment decision until the gaps are filled.",
  },
};

const filled = (value) => value !== null && value !== undefined && String(value).trim() !== "";

/**
 * The baseline dataset.
 *
 * `critical` means the item is load-bearing: without it a downstream clinical
 * conclusion cannot be drawn at all, as opposed to being drawn less precisely.
 */
function baselineItems(patient) {
  const therapies = therapyList(patient?.therapy);
  const history = patient?.history || {};
  const anyChecked = (group) => Object.values(history?.[group]?.checks || {}).some(Boolean);
  const anyFilled = (group) => Object.values(history?.[group]?.fields || {}).some(filled);

  const items = [
    {
      id: "identity",
      label: "Patient identifier",
      section: "registration",
      weight: 1,
      critical: false,
      present: filled(patient?.patientId),
      why: "Needed to reconcile CORSC with the hospital record.",
    },
    {
      id: "age",
      label: "Age",
      section: "registration",
      weight: 3,
      critical: true,
      present: num(patient?.age) !== null,
      why: "Age bands contribute directly to the baseline risk proforma. Without it the category is computed from an incomplete factor set.",
    },
    {
      id: "sex",
      label: "Sex",
      section: "registration",
      weight: 2,
      critical: false,
      present: filled(patient?.gender),
      why: "Troponin and QTc reference limits are sex-specific.",
    },
    {
      id: "therapy",
      label: "Planned cancer therapy",
      section: "registration",
      weight: 4,
      critical: true,
      present: therapies.length > 0,
      why: "The whole assessment is therapy-specific. Without it no proforma and no surveillance pathway can be selected.",
    },
    {
      id: "baselineLVEF",
      label: "Baseline LVEF",
      section: "registration",
      weight: 4,
      critical: true,
      present: num(patient?.baselineLVEF) !== null,
      why: "Every later ejection fraction is interpreted against it. Without a baseline, a low reading cannot be attributed to therapy and CTRCD cannot be graded.",
    },
    {
      id: "cardiovascularHistory",
      label: "Cardiovascular history",
      section: "history",
      weight: 3,
      critical: false,
      present: anyChecked("cardiovascular") || anyFilled("cardiovascular"),
      why: "Supplies the very-high and high-risk factors in the proforma.",
    },
    {
      id: "riskFactorHistory",
      label: "Cardiovascular risk factors",
      section: "history",
      weight: 2,
      critical: false,
      present: anyChecked("riskFactors") || anyFilled("riskFactors"),
      why: "Supplies most of the moderate-risk points.",
    },
    {
      id: "priorTreatment",
      label: "Prior cardiotoxic treatment",
      section: "history",
      weight: 3,
      critical: false,
      present: anyFilled("priorTreatment"),
      why: "Prior anthracycline and prior chest radiotherapy are two-point moderate factors, and prior cardiotoxicity is a very-high-risk factor.",
    },
    {
      id: "lifestyle",
      label: "Smoking status",
      section: "history",
      weight: 1,
      critical: false,
      present: filled(history?.lifestyle?.fields?.smoking),
      why: "A one-point moderate factor.",
    },
    {
      id: "medications",
      label: "Current medication list",
      section: "medication",
      weight: 2,
      critical: false,
      present: (patient?.medications || []).length > 0,
      why: "Needed for QT-stacking and interaction checks, and to know whether cardioprotection is already in place.",
    },
    {
      id: "baselineWeightHeight",
      label: "Baseline height and weight",
      section: "vitals",
      weight: 2,
      critical: false,
      present: num(patient?.baselineWeight) !== null,
      why: "Needed for body surface area, so that absolute drug doses can be converted, and as the reference for weight change.",
    },
  ];

  /* ------------------------------------------- therapy-specific requirements */

  if (therapies.includes("ici")) {
    items.push({
      id: "baselineTroponinIci",
      label: "Baseline troponin (checkpoint inhibitor)",
      section: "investigations",
      weight: 5,
      critical: true,
      present: num(patient?.baselineTroponin) !== null,
      why: pathwayFor("ici").note,
    });
    items.push({
      id: "baselineEcgIci",
      label: "Baseline ECG (checkpoint inhibitor)",
      section: "investigations",
      weight: 3,
      critical: false,
      present: num(patient?.baselineQTc) !== null,
      why: "A baseline ECG is needed to attribute any later conduction abnormality to therapy.",
    });
  }

  if (therapies.some((id) => ["anthracycline", "her2", "proteasome"].includes(id))) {
    items.push({
      id: "baselineBiomarkers",
      label: "Baseline troponin and natriuretic peptide",
      section: "investigations",
      weight: 3,
      critical: false,
      present: num(patient?.baselineTroponin) !== null || num(patient?.baselineNtProBnp) !== null,
      why: "Elevated baseline biomarkers are two-point moderate factors, and the baseline is what later rises are measured against.",
    });
    items.push({
      id: "baselineGLS",
      label: "Baseline global longitudinal strain",
      section: "investigations",
      weight: 3,
      critical: false,
      present: num(patient?.baselineGLS) !== null,
      why: "A relative fall in strain is the earliest detectable marker of cardiac injury, and it cannot be computed without a baseline.",
    });
  }

  if (therapies.includes("anthracycline")) {
    items.push({
      id: "plannedDose",
      label: "Planned cumulative anthracycline dose",
      section: "registration",
      weight: 3,
      critical: false,
      present: num(patient?.totalPlannedDose) !== null,
      why: "Needed to project cumulative exposure against the dose thresholds before the doses are given.",
    });
  }

  if (therapies.some((id) => ["bcrabl", "vegf", "rafmek"].includes(id))) {
    items.push({
      id: "baselineQtc",
      label: "Baseline QTc",
      section: "investigations",
      weight: 3,
      critical: false,
      present: num(patient?.baselineQTc) !== null,
      why: "These therapies prolong the QT interval, and the action threshold includes a rise of 60 ms from the patient's own baseline.",
    });
  }

  if (num(patient?.baselineTroponin) !== null) {
    items.push({
      id: "troponinReference",
      label: "Troponin assay and local reference limit",
      section: "investigations",
      weight: 2,
      critical: false,
      present: filled(patient?.troponinAssay) && patient.troponinAssay !== "custom" ? true : num(patient?.troponinURL) !== null,
      why: "A troponin value compared against the wrong assay's reference limit is worse than no troponin at all.",
    });
  }

  return items;
}

/**
 * Scores the baseline dataset.
 *
 * The percentage is weighted, so filling in five trivial fields does not move
 * the bar as much as recording the baseline ejection fraction.
 */
export function assessCompleteness(patient) {
  const items = baselineItems(patient);
  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  const presentWeight = items.filter((item) => item.present).reduce((total, item) => total + item.weight, 0);
  const percent = totalWeight === 0 ? 0 : Math.round((presentWeight / totalWeight) * 100);

  const missing = items.filter((item) => !item.present);
  const missingCritical = missing.filter((item) => item.critical);

  /* A critical gap sets the band regardless of the percentage: a record can be
     90% complete and still be missing the one value everything depends on. */
  let band = BANDS.complete.id;
  if (missingCritical.length > 0) band = BANDS.insufficient.id;
  else if (percent < 80) band = BANDS.partial.id;
  else if (missing.length > 0) band = BANDS.partial.id;

  return {
    percent,
    band,
    bandLabel: BANDS[band].label,
    bandTone: BANDS[band].tone,
    bandDetail: BANDS[band].detail,
    items,
    present: items.filter((item) => item.present),
    missing,
    missingCritical,
    /** Grouped by workflow section, so the UI can link straight to the gap. */
    missingBySection: missing.reduce((groups, item) => {
      groups[item.section] = groups[item.section] || [];
      groups[item.section].push(item);
      return groups;
    }, {}),
    /**
     * The sentence to show next to any risk category derived from this record.
     * Rendered wherever the category is rendered, so a provisional result is
     * never displayed as if it were a complete one.
     */
    caveat:
      band === BANDS.insufficient.id
        ? `Provisional: ${missingCritical.map((item) => item.label.toLowerCase()).join(", ")} not recorded.`
        : band === BANDS.partial.id
          ? `Based on ${percent}% of the baseline dataset.`
          : null,
    provenance: provenance("corsc-operational", {
      locator: "Baseline dataset completeness",
      note: "A CORSC service-quality measure, not a guideline recommendation.",
    }),
  };
}

/** True when the record is too thin to present a confident category. */
export function isProvisional(completeness) {
  return completeness?.band === BANDS.insufficient.id;
}
