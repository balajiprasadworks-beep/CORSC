/* =========================================================================
   Longitudinal patient timeline.

   Merges recorded encounters with derived clinical events (biomarker rises,
   strain and ejection-fraction falls, admissions, medication changes) into a
   single ordered course that a clinician can read at a glance.
   ========================================================================= */

import { num } from "@/lib/vitals";
import { therapyNames } from "@/lib/clinical-data";

export const EVENT_KINDS = {
  diagnosis: { label: "Diagnosis", dot: "bg-slate-700", chip: "bg-slate-100 text-slate-700" },
  baseline: { label: "Baseline assessment", dot: "bg-teal-600", chip: "bg-teal-50 text-teal-700" },
  treatmentStart: { label: "Treatment start", dot: "bg-teal-600", chip: "bg-teal-50 text-teal-700" },
  cycle: { label: "Cycle", dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700" },
  biomarker: { label: "Biomarker", dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700" },
  imaging: { label: "Imaging", dot: "bg-orange-500", chip: "bg-orange-50 text-orange-700" },
  medication: { label: "Medication", dot: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-700" },
  admission: { label: "Admission", dot: "bg-red-500", chip: "bg-red-50 text-red-700" },
  endOfTreatment: { label: "End of treatment", dot: "bg-slate-700", chip: "bg-slate-100 text-slate-700" },
  followUp: { label: "Follow-up", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
};

function cycleNumber(visit) {
  const explicit = num(visit?.firstReview?.cycle) ?? num(visit?.cycle);
  if (explicit !== null && explicit > 0) return Math.floor(explicit);
  const fromType = String(visit?.type || "").match(/(?:cycle|dose)\s*(\d+)/i);
  return fromType ? Number(fromType[1]) : null;
}

function isCycleVisit(visit) {
  return /^(cycle|dose)/i.test(String(visit?.type || ""));
}

/**
 * Builds the ordered event list. Every event carries the encounter it came
 * from so the UI can expand into the underlying documentation.
 */
export function buildPatientTimeline(patient, encounter) {
  const events = [];
  const visits = [...(patient?.visits || [])];
  if (encounter) {
    const index = visits.findIndex((v) => v.id === encounter.id);
    if (index >= 0) visits[index] = encounter;
    else visits.push(encounter);
  }
  const ordered = visits.slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));

  const diagnosisDate = patient?.history?.cancer?.fields?.diagnosisDate;
  if (diagnosisDate) {
    events.push({
      id: "diagnosis",
      kind: "diagnosis",
      date: diagnosisDate,
      title: patient.diagnosis || "Cancer diagnosis",
      detail: [patient.stage, patient?.history?.cancer?.fields?.histology].filter(Boolean).join(" · ") || "Diagnosis recorded.",
      level: "info",
    });
  }

  if (patient?.registeredDate) {
    events.push({
      id: "registration",
      kind: "baseline",
      date: patient.registeredDate,
      title: "Registered for cardio-oncology surveillance",
      detail: `Baseline HFA-ICOS risk ${patient?.risk?.category || "not calculated"}${patient?.baselineLVEF ? `, baseline LVEF ${patient.baselineLVEF}%` : ""}.`,
      level: "info",
    });
  }

  const firstCycle = ordered.find(isCycleVisit);
  if (firstCycle) {
    events.push({
      id: `start-${firstCycle.id}`,
      kind: "treatmentStart",
      date: firstCycle.date,
      title: `Started ${therapyNames(patient?.therapy)}`,
      detail: patient?.regimen ? `Regimen: ${patient.regimen}.` : "Anticancer therapy commenced.",
      level: "info",
      encounterId: firstCycle.id,
    });
  }

  let previousGLS = null;
  let previousTroponinFlagged = false;
  const baselineLVEF = num(patient?.baselineLVEF);

  ordered.forEach((visit) => {
    const cycle = cycleNumber(visit);

    if (isCycleVisit(visit)) {
      events.push({
        id: `visit-${visit.id}`,
        kind: "cycle",
        date: visit.date,
        title: `Cycle ${cycle ?? "—"} review`,
        detail: [
          visit?.firstReview?.tolerance ? `Tolerance: ${visit.firstReview.tolerance}.` : "",
          visit.symptoms?.length ? `Symptoms: ${visit.symptoms.join(", ")}.` : "No cardiovascular symptoms recorded.",
        ].filter(Boolean).join(" "),
        level: "info",
        encounterId: visit.id,
      });
    } else if (String(visit.type || "").toLowerCase().includes("end of treatment")) {
      events.push({
        id: `visit-${visit.id}`,
        kind: "endOfTreatment",
        date: visit.date,
        title: "End of treatment review",
        detail: "Full cardiovascular re-stratification point.",
        level: "info",
        encounterId: visit.id,
      });
    } else if (String(visit.type || "").toLowerCase().includes("month")) {
      events.push({
        id: `visit-${visit.id}`,
        kind: "followUp",
        date: visit.date,
        title: `${visit.type} review`,
        detail: "Survivorship surveillance visit.",
        level: "info",
        encounterId: visit.id,
      });
    } else if (String(visit.type || "").toLowerCase().includes("baseline")) {
      events.push({
        id: `visit-${visit.id}`,
        kind: "baseline",
        date: visit.date,
        title: "Baseline cardio-oncology assessment",
        detail: "Pre-treatment documentation and risk stratification.",
        level: "info",
        encounterId: visit.id,
      });
    }

    /* Derived clinical signals */
    const troponin = visit?.inv?.troponin;
    const troponinElevated = /elev|rais|high|positive/i.test([troponin?.result, troponin?.interp].join(" "));
    if (troponinElevated && !previousTroponinFlagged) {
      previousTroponinFlagged = true;
      events.push({
        id: `troponin-${visit.id}`,
        kind: "biomarker",
        date: visit?.inv?.troponin?.date || visit.date,
        title: "Troponin rise",
        detail: `Troponin recorded as ${troponin?.result || troponin?.interp}. Any rise from baseline warrants work-up, particularly on immune checkpoint therapy.`,
        level: "danger",
        encounterId: visit.id,
      });
    }

    // GLS is reported as a negative number; deterioration is a fall in
    // magnitude, so the comparison runs on absolute values.
    const gls = num(visit?.inv?.gls?.result);
    if (gls !== null) {
      if (previousGLS !== null && Math.abs(previousGLS) !== 0) {
        const relative = ((Math.abs(gls) - Math.abs(previousGLS)) / Math.abs(previousGLS)) * 100;
        if (relative <= -15) {
          events.push({
            id: `gls-${visit.id}`,
            kind: "imaging",
            date: visit?.inv?.gls?.date || visit.date,
            title: "GLS fall greater than 15%",
            detail: `Global longitudinal strain moved from ${previousGLS}% to ${gls}%, a relative fall of ${Math.abs(relative).toFixed(0)}%. This is an early marker of subclinical LV dysfunction.`,
            level: "danger",
            encounterId: visit.id,
          });
        }
      }
      previousGLS = gls;
    }

    const lvef = num(visit?.inv?.lvef?.result);
    if (lvef !== null && baselineLVEF !== null && baselineLVEF - lvef >= 10 && lvef < 50) {
      events.push({
        id: `lvef-${visit.id}`,
        kind: "imaging",
        date: visit?.inv?.lvef?.date || visit.date,
        title: "LVEF drop meeting CTRCD criteria",
        detail: `LVEF fell from a baseline of ${baselineLVEF}% to ${lvef}%. Start cardioprotection and repeat imaging in three to four weeks.`,
        level: "danger",
        encounterId: visit.id,
      });
    }

    if (visit?.firstReview?.admissions && visit.firstReview.admissions.trim()) {
      events.push({
        id: `admission-${visit.id}`,
        kind: "admission",
        date: visit.date,
        title: "Hospital admission recorded",
        detail: visit.firstReview.admissions,
        level: "warning",
        encounterId: visit.id,
      });
    }
  });

  (patient?.medicationLog || []).forEach((entry) => {
    events.push({
      id: `med-${entry.id}`,
      kind: "medication",
      date: entry.date,
      title: `${entry.action === "removed" ? "Stopped" : "Started"} ${entry.name}`,
      detail: entry.reason || `${entry.klassLabel || "Medication"} ${entry.action === "removed" ? "discontinued" : "added"} at review.`,
      level: "info",
    });
  });

  return events
    .filter((event) => event.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
