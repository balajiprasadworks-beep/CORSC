/* =========================================================================
   Fitness to proceed.

   Every cardio-oncology review resolves to one decision: can this patient have
   their treatment today? Nothing in the application stated it. The clinician
   assembled the answer from a risk chip, a task counter, a warnings list and a
   symptoms panel spread across twelve sections.

   This module states it. Each finding names the verdict it forces, why, and
   what would have to change - so the banner is a starting point for the
   conversation with oncology, not an instruction.

   The verdict is deliberately conservative: anything that cannot be graded
   counts against proceeding rather than for it, because the failure that
   matters here is giving cardiotoxic therapy to someone who should have been
   held.
   ========================================================================= */

import { assessCumulativeDose } from "@/lib/anthracycline";
import {
  GRADE_MILD,
  GRADE_MODERATE,
  GRADE_SEVERE,
  GRADE_VERY_SEVERE,
  GRADE_INDETERMINATE,
} from "@/lib/ctrcd";
import { PHASES, phaseOf } from "@/lib/encounter-phase";
import { num } from "@/lib/vitals";

export const VERDICT = {
  proceed: {
    id: "proceed",
    rank: 0,
    label: "Proceed",
    headline: "No cardiac barrier to treatment today",
    tone: "ok",
  },
  caution: {
    id: "caution",
    rank: 1,
    label: "Proceed with caution",
    headline: "Treatment can proceed, with the actions below",
    tone: "warning",
  },
  hold: {
    id: "hold",
    rank: 2,
    label: "Hold",
    headline: "Do not give treatment before cardiology discussion",
    tone: "danger",
  },
};

export const VERDICT_ORDER = [VERDICT.proceed, VERDICT.caution, VERDICT.hold];

function worst(a, b) {
  return VERDICT[a].rank >= VERDICT[b].rank ? a : b;
}

/**
 * Assesses fitness to proceed with the next cycle.
 *
 * @param {object} input
 * @param {object} input.patient
 * @param {object} input.encounter
 * @param {object} input.signals   from getClinicalSignals
 * @param {object} [input.vitals]  from deriveVitals
 * @param {Array}  [input.outstanding] outstanding investigations
 * @param {object} [input.ledger]  anthracycline ledger
 */
export function assessFitness({ patient, encounter, signals, vitals, outstanding = [], ledger } = {}) {
  const findings = [];
  const push = (verdict, finding) => findings.push({ verdict, ...finding });

  const therapies = signals?.therapies || [];
  const ctrcd = signals?.ctrcd;
  const phase = phaseOf(encounter);
  const onTreatment = phase === PHASES.treatment.id || phase === PHASES.baseline.id;

  /* ------------------------------------------------------------- hold */

  if (signals?.myocarditisConfirmed) {
    push("hold", {
      id: "myocarditis",
      title: "Confirmed myocarditis",
      detail: "Immunotherapy must not be given. Admission and high-dose corticosteroids are indicated.",
      actions: ["Stop immunotherapy", "Admit under cardiology", "Start high-dose corticosteroids", "Urgent cardiac MRI"],
    });
  }

  if (signals?.suspectedICIMyocarditis) {
    push("hold", {
      id: "ici-myocarditis",
      title: "Troponin risen on a checkpoint inhibitor",
      detail:
        "Any troponin rise on immunotherapy requires myocarditis to be excluded before the next dose, whether or not the patient has symptoms and whatever the ejection fraction.",
      actions: [
        "Withhold the next immunotherapy dose",
        "ECG and repeat troponin today",
        "Echocardiography, noting a normal ejection fraction does not exclude myocarditis",
        "Urgent cardio-oncology review",
      ],
    });
  }

  if (ctrcd && (ctrcd.grade === GRADE_VERY_SEVERE || ctrcd.grade === GRADE_SEVERE)) {
    push("hold", {
      id: "ctrcd-severe",
      title: ctrcd.label,
      detail: ctrcd.criteria[0] || "Graded from this encounter.",
      actions: ctrcd.management,
    });
  }

  if (signals?.qtProlongation) {
    push("hold", {
      id: "qt",
      title: "QTc at or above the action threshold",
      detail:
        "Further QT-prolonging therapy risks torsades de pointes until the interval and the electrolytes are corrected.",
      actions: [
        "Repeat 12-lead ECG today",
        "Check and correct potassium, magnesium and calcium",
        "Review every QT-prolonging medicine on the list",
        "Discuss interruption of QT-prolonging cancer therapy with oncology",
      ],
    });
  }

  if (signals?.immediateSymptoms?.length) {
    push("hold", {
      id: "acute-symptoms",
      title: `${signals.immediateSymptoms.join(" and ")} reported today`,
      detail: "Assess before the patient leaves the department and before any further cardiotoxic therapy.",
      actions: ["ECG now", "Troponin now", "Cardiovascular examination", "Urgent cardiology review"],
    });
  }

  const bp = vitals?.bp;
  if (bp && bp.short === "Grade 3") {
    push("hold", {
      id: "severe-hypertension",
      title: "Grade 3 hypertension",
      detail: `Blood pressure ${encounter?.vitals?.sbp}/${encounter?.vitals?.dbp} mmHg. Treat before giving therapy that raises blood pressure further.`,
      actions: ["Treat blood pressure today", "Recheck before dosing", "Review antihypertensive therapy"],
    });
  }

  const absoluteCI = Object.entries(patient?.contraindications?.absolute || {}).filter(([, on]) => on);
  if (absoluteCI.length && therapies.includes("ici")) {
    push("hold", {
      id: "absolute-ci",
      title: "Absolute contraindication to immunotherapy recorded",
      detail: "An absolute contraindication has been ticked for this patient.",
      actions: ["Review the contraindication with oncology before proceeding"],
    });
  }

  /* ---------------------------------------------------------- caution */

  if (ctrcd && ctrcd.grade === GRADE_MODERATE) {
    push("caution", {
      id: "ctrcd-moderate",
      title: ctrcd.label,
      detail: `${ctrcd.criteria[0] || "Graded from this encounter."} Continuing therapy needs an explicit decision with oncology.`,
      actions: ctrcd.management,
    });
  }

  if (ctrcd && ctrcd.grade === GRADE_MILD) {
    push("caution", {
      id: "ctrcd-mild",
      title: ctrcd.label,
      detail: ctrcd.criteria[0] || "Subclinical dysfunction detected.",
      actions: ctrcd.management,
    });
  }

  if (ctrcd && ctrcd.grade === GRADE_INDETERMINATE) {
    push("caution", {
      id: "ctrcd-unresolved",
      title: "Cardiac dysfunction cannot be graded",
      detail: ctrcd.criteria[0] || "The available measurements cannot confirm or exclude dysfunction.",
      actions: ctrcd.management,
    });
  }

  if (signals?.elevatedTroponin && !signals?.suspectedICIMyocarditis) {
    push("caution", {
      id: "troponin",
      title: "Troponin risen from baseline",
      detail: "A rise from baseline warrants repeat measurement and cardiology input before further cardiotoxic exposure.",
      actions: ["Repeat troponin within 24 to 48 hours", "ECG", "Echocardiography", "Cardio-oncology review"],
    });
  }

  if (signals?.glsDrop) {
    push("caution", {
      id: "gls",
      title: "Global longitudinal strain has fallen more than 15%",
      detail: "An early marker of subclinical dysfunction, usually preceding any fall in ejection fraction.",
      actions: ["Start or optimise an ACE inhibitor or ARB and a beta-blocker", "Repeat echocardiography before the next cycle"],
    });
  }

  const otherCardiacSymptoms = (signals?.currentCardiacSymptoms || []).filter(
    (symptom) => !(signals?.immediateSymptoms || []).includes(symptom)
  );
  if (otherCardiacSymptoms.length) {
    push("caution", {
      id: "symptoms",
      title: `Cardiac symptoms reported: ${otherCardiacSymptoms.join(", ")}`,
      detail: "New cardiovascular symptoms on cardiotoxic therapy need examination and a documented explanation.",
      actions: ["Cardiovascular examination", "ECG", "Consider natriuretic peptide and echocardiography"],
    });
  }

  if (bp && (bp.short === "Grade 2" || (bp.short === "Grade 1" && therapies.includes("vegf")))) {
    push("caution", {
      id: "hypertension",
      title: `${bp.label} on treatment`,
      detail: therapies.includes("vegf")
        ? "Hypertension is an on-target effect of VEGF-pathway inhibition and should be treated to below 140/90 mmHg rather than accepted."
        : "Treat towards target before the next cycle.",
      actions: ["Start or intensify antihypertensive therapy", "Recheck blood pressure before the next cycle"],
    });
  }

  if (signals?.clinicalDeterioration) {
    push("caution", {
      id: "deterioration",
      title: `Clinical status recorded as ${patient?.clinicalStatus}`,
      detail: "The overall trajectory is against proceeding without review.",
      actions: ["Review with oncology before the next cycle"],
    });
  }

  /* Cumulative anthracycline exposure. */
  const doseAssessment = ledger?.assessment || (therapies.includes("anthracycline") ? assessCumulativeDose(0) : null);
  if (doseAssessment?.reached) {
    push(doseAssessment.reached.tone === "danger" ? "hold" : "caution", {
      id: "anthracycline-dose",
      title: `Cumulative anthracycline ${doseAssessment.total} mg/m² — ${doseAssessment.reached.label.toLowerCase()} passed`,
      detail: doseAssessment.reached.guidance,
      actions:
        doseAssessment.reached.tone === "danger"
          ? ["Echocardiography before any further dose", "Documented cardio-oncology agreement before continuing"]
          : ["Echocardiography with strain", "Discuss dexrazoxane with oncology"],
    });
  } else if (doseAssessment?.approaching && doseAssessment.guidance) {
    push("caution", {
      id: "anthracycline-approaching",
      title: "Approaching a cumulative anthracycline threshold",
      detail: doseAssessment.guidance,
      actions: ["Plan echocardiography with strain before the threshold is crossed"],
    });
  }

  /* Baseline data that later comparisons depend on. */
  if (onTreatment && num(patient?.baselineLVEF) === null) {
    push("caution", {
      id: "no-baseline",
      title: "No baseline ejection fraction recorded",
      detail:
        "Without a baseline, no later fall can be identified as new, so cardiac dysfunction cannot be graded for this patient at any future visit.",
      actions: ["Record the pre-treatment ejection fraction", "Arrange baseline echocardiography if none was performed"],
    });
  }

  const criticalOverdue = outstanding.filter(
    (item) => (item.status === "missing" || item.status === "overdue") && ["echo", "lvef", "troponin", "ecg", "gls"].includes(item.id)
  );
  if (criticalOverdue.length) {
    push("caution", {
      id: "overdue",
      title: `${criticalOverdue.length} cardiac investigation${criticalOverdue.length === 1 ? "" : "s"} outstanding`,
      detail: criticalOverdue.map((item) => `${item.label} (${item.milestone})`).join(" · "),
      actions: ["Obtain the outstanding results before the next cycle"],
    });
  }

  /* -------------------------------------------------------- resolution */

  const verdict = findings.reduce((current, finding) => worst(current, finding.verdict), VERDICT.proceed.id);
  const holds = findings.filter((f) => f.verdict === "hold");
  const cautions = findings.filter((f) => f.verdict === "caution");

  return {
    verdict,
    ...VERDICT[verdict],
    findings,
    holds,
    cautions,
    /** Deduplicated actions from whichever findings set the verdict. */
    actions: Array.from(
      new Set((holds.length ? holds : cautions).flatMap((finding) => finding.actions || []))
    ),
    summary:
      verdict === VERDICT.proceed.id
        ? "No cardiac finding at this encounter argues against giving the next cycle."
        : `${holds.length ? `${holds.length} finding${holds.length === 1 ? "" : "s"} against proceeding` : ""}${
            holds.length && cautions.length ? "; " : ""
          }${cautions.length ? `${cautions.length} requiring action` : ""}.`,
  };
}
