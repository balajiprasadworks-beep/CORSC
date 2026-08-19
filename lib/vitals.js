/* =========================================================================
   Vitals derivation — BMI, BSA, weight change and blood-pressure grading.
   Every helper returns null rather than NaN when inputs are incomplete so
   that the UI can show an em dash instead of a broken number.
   ========================================================================= */

/**
 * First number in a value, or null when there is none.
 *
 * Stripping non-numeric characters and parsing the remainder is not safe here:
 * it turns "pending" into "" and then into 0, so a free-text placeholder in an
 * LVEF field would read as an ejection fraction of zero. Matching a number
 * instead means text without digits returns null, and "128/82" returns 128
 * rather than the concatenation 12882.
 */
export function num(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export const VITAL_FIELDS = [
  { id: "height", label: "Height", unit: "cm", placeholder: "170" },
  { id: "weight", label: "Weight", unit: "kg", placeholder: "72.4" },
  { id: "sbp", label: "Systolic BP", unit: "mmHg", placeholder: "128" },
  { id: "dbp", label: "Diastolic BP", unit: "mmHg", placeholder: "82" },
  { id: "pulse", label: "Pulse", unit: "bpm", placeholder: "78" },
  { id: "temp", label: "Temperature", unit: "°C", placeholder: "36.9" },
  { id: "rr", label: "Respiratory rate", unit: "/min", placeholder: "16" },
  { id: "spo2", label: "SpO₂", unit: "%", placeholder: "98" },
];

/** Body mass index in kg/m². */
export function calcBMI(heightCm, weightKg) {
  const h = num(heightCm);
  const w = num(weightKg);
  if (!h || !w || h <= 0) return null;
  const metres = h / 100;
  return Number((w / (metres * metres)).toFixed(1));
}

export function bmiCategory(bmi) {
  if (bmi === null) return null;
  if (bmi < 18.5) return { label: "Underweight", tone: "warning" };
  if (bmi < 25) return { label: "Normal range", tone: "ok" };
  if (bmi < 30) return { label: "Overweight", tone: "warning" };
  return { label: "Obese — counts as a moderate HFA-ICOS risk factor", tone: "danger" };
}

/** Body surface area in m² using the Mosteller formula. */
export function calcBSA(heightCm, weightKg) {
  const h = num(heightCm);
  const w = num(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  return Number(Math.sqrt((h * w) / 3600).toFixed(2));
}

/**
 * Percentage weight loss from a reference weight. Positive values are loss,
 * negative values are gain.
 */
export function calcWeightLossPercent(baselineKg, currentKg) {
  const base = num(baselineKg);
  const current = num(currentKg);
  if (!base || !current || base <= 0) return null;
  return Number((((base - current) / base) * 100).toFixed(1));
}

export function weightLossInterpretation(percent) {
  if (percent === null) return null;
  if (percent <= -5) {
    return {
      label: "Weight gain",
      tone: "warning",
      detail: "Gain of " + Math.abs(percent) + "% from reference weight. Exclude fluid retention and decompensated heart failure before attributing to nutrition.",
    };
  }
  if (percent < 5) {
    return {
      label: "No significant loss",
      tone: "ok",
      detail: "Weight is stable within 5% of the reference. No nutritional escalation triggered.",
    };
  }
  if (percent < 10) {
    return {
      label: "Clinically significant loss",
      tone: "warning",
      detail: "Loss of " + percent + "% meets the threshold for clinically significant weight loss. Arrange dietetic review and reassess chemotherapy dosing against current body surface area.",
    };
  }
  return {
    label: "Severe loss — cachexia risk",
    tone: "danger",
    detail: "Loss of " + percent + "% indicates severe depletion. Consider cancer cachexia, recalculate body surface area before the next dose, and involve nutrition support.",
  };
}

export function bpGrade(sbp, dbp) {
  const s = num(sbp);
  const d = num(dbp);
  if (s === null && d === null) return null;
  const systolic = s ?? 0;
  const diastolic = d ?? 0;
  if (systolic >= 180 || diastolic >= 110) return { label: "Grade 3 hypertension", tone: "danger", short: "Grade 3" };
  if (systolic >= 160 || diastolic >= 100) return { label: "Grade 2 hypertension", tone: "danger", short: "Grade 2" };
  if (systolic >= 140 || diastolic >= 90) return { label: "Grade 1 hypertension", tone: "warning", short: "Grade 1" };
  if (systolic >= 130 || diastolic >= 85) return { label: "High-normal blood pressure", tone: "warning", short: "High-normal" };
  if (systolic && systolic < 100) return { label: "Low blood pressure", tone: "warning", short: "Low" };
  return { label: "Blood pressure at target", tone: "ok", short: "At target" };
}

export function spo2Grade(value) {
  const v = num(value);
  if (v === null) return null;
  if (v < 90) return { label: "Significant hypoxaemia", tone: "danger" };
  if (v < 94) return { label: "Below target saturation", tone: "warning" };
  return { label: "Saturation adequate", tone: "ok" };
}

export function pulseGrade(value) {
  const v = num(value);
  if (v === null) return null;
  if (v > 120) return { label: "Marked tachycardia", tone: "danger" };
  if (v > 100) return { label: "Tachycardia", tone: "warning" };
  if (v < 50) return { label: "Bradycardia", tone: "warning" };
  return { label: "Rate within range", tone: "ok" };
}

/**
 * All derived values for a vitals block, ready for display.
 *
 * Height is recorded once at baseline and carried forward: an encounter's own
 * `vitals.height` only exists for legacy records or a clinician's explicit
 * correction, so it takes precedence when present but `baselineHeight` is the
 * expected source for every later visit.
 */
export function deriveVitals(vitals = {}, baselineWeight, baselineHeight) {
  const height = num(vitals.height) ?? num(baselineHeight);
  const bmi = calcBMI(height, vitals.weight);
  const bsa = calcBSA(height, vitals.weight);
  const reference = num(vitals.referenceWeight) ?? num(baselineWeight);
  const weightLoss = calcWeightLossPercent(reference, vitals.weight);
  return {
    height,
    bmi,
    bmiCategory: bmiCategory(bmi),
    bsa,
    referenceWeight: reference,
    weightLossPercent: weightLoss,
    weightLoss: weightLossInterpretation(weightLoss),
    bp: bpGrade(vitals.sbp, vitals.dbp),
    spo2: spo2Grade(vitals.spo2),
    pulse: pulseGrade(vitals.pulse),
  };
}
