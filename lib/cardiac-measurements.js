/* =========================================================================
   Structured cardiac measurements.

   Replaces the substring matching this application previously relied on, where
   `isAbnormal(visit, "troponin", ["elev", "high", "raised"])` flagged the text
   "not elevated" as a positive result, and QTc was scraped out of a free-text
   sentence with a regular expression.

   Three measurements are given real structure because three clinical rules
   depend on them:

     troponin     the ESC criterion is a NEW RISE, which needs an assay upper
                  reference limit and a baseline to compare against
     natriuretic  thresholds are age-dependent
     QTc          needs a rate-corrected interval, not a number in a sentence

   Reference limits below are the manufacturers' published 99th-percentile
   values and are DEFAULTS ONLY. Assay cut-offs are laboratory-specific; each
   site should confirm its own against its lab handbook before relying on them.
   ========================================================================= */

import { num } from "@/lib/vitals";

/* ---------------------------------------------------------------- troponin */

/**
 * 99th-percentile upper reference limits in ng/L. Sex-specific values are used
 * when the patient's sex is recorded, because a single shared cut-off
 * under-detects injury in women and over-calls it in men.
 */
export const TROPONIN_ASSAYS = [
  {
    id: "hs-cTnT",
    label: "High-sensitivity troponin T (Roche)",
    unit: "ng/L",
    url: { overall: 14, male: 22, female: 14 },
  },
  {
    id: "hs-cTnI-abbott",
    label: "High-sensitivity troponin I (Abbott)",
    unit: "ng/L",
    url: { overall: 26, male: 34, female: 16 },
  },
  {
    id: "hs-cTnI-siemens",
    label: "High-sensitivity troponin I (Siemens)",
    unit: "ng/L",
    url: { overall: 47, male: 53, female: 39 },
  },
  {
    id: "custom",
    label: "Other assay — enter the local limit",
    unit: "ng/L",
    url: {},
  },
];

export function troponinAssay(id) {
  return TROPONIN_ASSAYS.find((assay) => assay.id === id) || TROPONIN_ASSAYS[0];
}

/** The applicable upper reference limit, preferring an explicit local value. */
export function troponinURL({ assayId, sex, localURL } = {}) {
  const explicit = num(localURL);
  if (explicit !== null && explicit > 0) return explicit;
  const assay = troponinAssay(assayId);
  const key = String(sex || "").toLowerCase();
  if (key === "male" && assay.url.male) return assay.url.male;
  if (key === "female" && assay.url.female) return assay.url.female;
  return assay.url.overall ?? null;
}

/**
 * Interprets a troponin against its reference limit and, where available, the
 * patient's own baseline.
 *
 * A rise from baseline matters even inside the reference range: on immune
 * checkpoint inhibitors any new rise warrants myocarditis work-up regardless of
 * the absolute value.
 */
export function interpretTroponin({ value, baseline, assayId, sex, localURL } = {}) {
  const current = num(value);
  const base = num(baseline);
  const url = troponinURL({ assayId, sex, localURL });

  if (current === null) {
    return { recorded: false, aboveURL: false, newRise: false, tone: "neutral", label: "Not recorded", detail: "", url };
  }

  const aboveURL = url !== null && current > url;
  // A doubling, or any crossing of the reference limit, counts as a new rise.
  const roseFromBaseline =
    base !== null && (current > url && base <= url ? true : base > 0 && current >= base * 2);
  const newRise = aboveURL || roseFromBaseline;

  const parts = [];
  if (url !== null) parts.push(`upper reference limit ${url} ng/L`);
  if (base !== null) parts.push(`baseline ${base} ng/L`);

  return {
    recorded: true,
    value: current,
    baseline: base,
    url,
    aboveURL,
    roseFromBaseline,
    newRise,
    tone: newRise ? "danger" : "ok",
    label: aboveURL
      ? `Elevated at ${current} ng/L`
      : roseFromBaseline
        ? `Risen from baseline to ${current} ng/L`
        : `Within reference range at ${current} ng/L`,
    detail: parts.join(" · "),
  };
}

/* ----------------------------------------------------------- natriuretic */

/**
 * Non-acute rule-out thresholds. Above these, heart failure is not excluded and
 * echocardiography is indicated.
 */
export const NATRIURETIC_THRESHOLDS = {
  ntprobnp: { label: "NT-proBNP", unit: "pg/mL", ruleOut: 125 },
  bnp: { label: "BNP", unit: "pg/mL", ruleOut: 35 },
};

/** Age-stratified rule-in thresholds for NT-proBNP in the acute setting. */
export function ntprobnpRuleIn(age) {
  const years = num(age);
  if (years === null) return 900;
  if (years < 50) return 450;
  if (years <= 75) return 900;
  return 1800;
}

export function interpretNatriuretic({ value, baseline, peptide = "ntprobnp", age } = {}) {
  const current = num(value);
  const base = num(baseline);
  const config = NATRIURETIC_THRESHOLDS[peptide] || NATRIURETIC_THRESHOLDS.ntprobnp;

  if (current === null) {
    return { recorded: false, aboveThreshold: false, newRise: false, tone: "neutral", label: "Not recorded", detail: "" };
  }

  const aboveThreshold = current >= config.ruleOut;
  const ruleIn = peptide === "ntprobnp" ? ntprobnpRuleIn(age) : null;
  const stronglyElevated = ruleIn !== null && current >= ruleIn;
  const roseFromBaseline = base !== null && base > 0 && current >= base * 2;
  const newRise = aboveThreshold || roseFromBaseline;

  return {
    recorded: true,
    value: current,
    baseline: base,
    threshold: config.ruleOut,
    ruleIn,
    aboveThreshold,
    stronglyElevated,
    roseFromBaseline,
    newRise,
    tone: stronglyElevated ? "danger" : newRise ? "warning" : "ok",
    label: stronglyElevated
      ? `${config.label} markedly elevated at ${current} ${config.unit}`
      : aboveThreshold
        ? `${config.label} elevated at ${current} ${config.unit}`
        : roseFromBaseline
          ? `${config.label} risen from baseline to ${current} ${config.unit}`
          : `${config.label} within range at ${current} ${config.unit}`,
    detail: `Heart failure not excluded above ${config.ruleOut} ${config.unit}${
      ruleIn ? `; age-adjusted rule-in threshold ${ruleIn} ${config.unit}` : ""
    }`,
  };
}

/* ------------------------------------------------------------------- QTc */

export const RHYTHM_OPTIONS = [
  "Sinus rhythm",
  "Sinus tachycardia",
  "Sinus bradycardia",
  "Atrial fibrillation",
  "Atrial flutter",
  "Paced",
  "Other",
];

/**
 * Fridericia correction: QTcF = QT / RR^(1/3), RR in seconds.
 *
 * Fridericia rather than Bazett because Bazett over-corrects at the higher
 * heart rates that are common during chemotherapy, producing false QT alarms
 * in tachycardic patients.
 */
export function qtcFridericia(qtMs, heartRate, rrSeconds) {
  const qt = num(qtMs);
  const rr = num(rrSeconds) ?? (num(heartRate) ? 60 / num(heartRate) : null);
  if (qt === null || rr === null || rr <= 0) return null;
  return Math.round(qt / Math.cbrt(rr));
}

/** Bazett, retained because many ECG machines print it and clinicians compare. */
export function qtcBazett(qtMs, heartRate, rrSeconds) {
  const qt = num(qtMs);
  const rr = num(rrSeconds) ?? (num(heartRate) ? 60 / num(heartRate) : null);
  if (qt === null || rr === null || rr <= 0) return null;
  return Math.round(qt / Math.sqrt(rr));
}

export const QTC_UPPER_NORMAL = { male: 450, female: 460 };
export const QTC_ACTION = 500;
export const QTC_DELTA_ACTION = 60;

/**
 * Grades a corrected QT interval.
 *
 * Two independent triggers matter: an absolute QTc at or above 500 ms, and a
 * rise of 60 ms or more from the patient's own baseline. The second fires even
 * when the absolute value still looks acceptable.
 */
export function interpretQTc({ qtc, sex, baselineQtc } = {}) {
  const value = num(qtc);
  const base = num(baselineQtc);
  const key = String(sex || "").toLowerCase();
  const upperNormal = key === "female" ? QTC_UPPER_NORMAL.female : QTC_UPPER_NORMAL.male;

  if (value === null) {
    return { recorded: false, prolonged: false, actionable: false, tone: "neutral", label: "Not recorded", reasons: [] };
  }

  const delta = base !== null ? value - base : null;
  const reasons = [];

  if (value >= QTC_ACTION) reasons.push(`QTc ${value} ms is at or above the ${QTC_ACTION} ms action threshold`);
  if (delta !== null && delta >= QTC_DELTA_ACTION) {
    reasons.push(`QTc has risen ${delta} ms from a baseline of ${base} ms, at or above the ${QTC_DELTA_ACTION} ms action threshold`);
  }

  const actionable = reasons.length > 0;
  const prolonged = actionable || value > upperNormal;
  if (!actionable && prolonged) {
    reasons.push(`QTc ${value} ms is above the upper limit of normal of ${upperNormal} ms for this patient`);
  }

  return {
    recorded: true,
    value,
    baseline: base,
    delta,
    upperNormal,
    prolonged,
    actionable,
    tone: actionable ? "danger" : prolonged ? "warning" : "ok",
    label: actionable
      ? `QTc ${value} ms — action threshold reached`
      : prolonged
        ? `QTc ${value} ms — prolonged`
        : `QTc ${value} ms — within normal limits`,
    reasons,
  };
}

/** Derives QTc from a structured ECG block, preferring an explicitly entered value. */
export function ecgQTc(ecg = {}) {
  const entered = num(ecg.qtc);
  if (entered !== null) return entered;
  return qtcFridericia(ecg.qt, ecg.rate, ecg.rr);
}

/**
 * Full interpretation of a structured ECG block against the patient.
 * Returns the QTc reading plus the correction actually used, so the report can
 * state whether the value was measured or derived.
 */
export function interpretECG({ ecg = {}, sex, baselineQtc } = {}) {
  const entered = num(ecg.qtc);
  const derived = qtcFridericia(ecg.qt, ecg.rate, ecg.rr);
  const qtc = entered ?? derived;
  const interpretation = interpretQTc({ qtc, sex, baselineQtc });

  return {
    ...interpretation,
    source: entered !== null ? "entered" : derived !== null ? "Fridericia" : null,
    bazett: qtcBazett(ecg.qt, ecg.rate, ecg.rr),
    rate: num(ecg.rate),
    rhythm: ecg.rhythm || "",
  };
}

/* --------------------------------------------------------------- summary */

/**
 * Whether any cardiac biomarker shows a new rise — the input the CTRCD grading
 * module needs for its mild and moderate criteria.
 */
export function hasBiomarkerRise({ troponin, natriuretic } = {}) {
  return Boolean(troponin?.newRise || natriuretic?.newRise);
}
