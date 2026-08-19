"use client";

/* =========================================================================
   The encounter workflow.

   One continuous vertical page: twelve sections, each collapsible, with the
   clinical assistant alongside on wide screens. The draft encounter lives on
   the patient record so a single autosave keeps everything durable.
   ========================================================================= */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Save, Sparkles, X } from "lucide-react";

import { AiAssistant, AssistantBanner } from "@/components/ai-assistant";
import { ActionBar } from "@/components/fitness-banner";
import { RiskSurveillanceSummary } from "@/components/risk-surveillance-summary";
import { StickyPatientHeader } from "@/components/sticky-header";
import { PatientTimeline, TIMELINE_ICON } from "@/components/patient-timeline";
import { Callout, StatusChip, WorkflowSection } from "@/components/kit";
import { FirstReviewSection, FIRST_REVIEW_ICON } from "@/components/sections/first-review";
import { HistorySection, HISTORY_ICON } from "@/components/sections/history";
import { InvestigationsSection, INVESTIGATIONS_ICON } from "@/components/sections/investigations";
import { MedicationSection, MEDICATION_ICON } from "@/components/sections/medications";
import { OverviewSection, PrintReport, OVERVIEW_ICON } from "@/components/sections/overview";
import { RegistrationSection, REGISTRATION_ICON } from "@/components/sections/registration";
import { RiskSection, RISK_ICON } from "@/components/sections/risk";
import { SinceLastVisitSection, SINCE_LAST_VISIT_ICON } from "@/components/sections/since-last-visit";
import { SurveillanceSection, SURVEILLANCE_ICON } from "@/components/sections/surveillance";
import { SymptomsSection, SYMPTOMS_ICON } from "@/components/sections/symptoms";
import { ExaminationSection, EXAMINATION_ICON } from "@/components/sections/examination";
import { VitalsSection, VITALS_ICON } from "@/components/sections/vitals";
import { FollowUpSection, FOLLOW_UP_ICON } from "@/components/sections/follow-up";
import { EXAM_SYSTEMS, HISTORY_GROUPS, INVESTIGATIONS } from "@/lib/clinical-data";
import { buildClinicalPicture } from "@/lib/clinical-picture";
import { buildSummary } from "@/lib/ai-summary";
import { createEncounter, currentCycle, isFilled, latestLVEF, todayISO } from "@/lib/patient-model";
import { sectionsForVisit } from "@/lib/visit-types";

/* --------------------------------------------------------- section model */

/**
 * Section definitions in clinical order. `complete` decides the badge and the
 * auto-collapse behaviour, so it describes meaningful documentation rather than
 * any field being touched.
 */
function sectionDefinitions({ patient, encounter, picture }) {
  const historyTouched = HISTORY_GROUPS.filter((group) => {
    const entry = patient.history?.[group.id];
    return isFilled(entry?.checks) || isFilled(entry?.fields);
  }).length;
  const systemsDone = EXAM_SYSTEMS.filter((system) => encounter.systems?.[system.id]?.status).length;
  const investigationsRecorded = INVESTIGATIONS.filter((definition) => {
    const entry = encounter.inv?.[definition.id];
    return entry && (entry.result || entry.interp);
  }).length;
  const currentMilestone = picture.investigationTimeline.find((m) => m.state === "current");

  return [
    {
      id: "registration",
      label: "Patient registration",
      shortLabel: "Registration",
      icon: REGISTRATION_ICON,
      subtitle: "Identity, diagnosis and the planned treatment course",
      complete: Boolean(patient.name && patient.diagnosis && patient.therapy),
      status: patient.name && patient.diagnosis && patient.therapy ? "Registered" : "Incomplete",
      statusTone: patient.name && patient.diagnosis && patient.therapy ? "ok" : "warning",
    },
    {
      id: "first-review",
      label: "First OPD review",
      shortLabel: "OPD review",
      icon: FIRST_REVIEW_ICON,
      subtitle: "Cycle, tolerance and interim events since the last contact",
      complete: Boolean(encounter.firstReview?.tolerance),
      status: encounter.firstReview?.tolerance || encounter.type,
      statusTone: encounter.firstReview?.tolerance ? "ok" : "neutral",
    },
    {
      id: "since-last-visit",
      label: "Since last visit",
      shortLabel: "Interval",
      icon: SINCE_LAST_VISIT_ICON,
      subtitle: "Structured interval history — answers here feed the alert and surveillance engines",
      complete: picture.intervalHistory.answered,
      status: picture.intervalHistory.positive.length
        ? `${picture.intervalHistory.positive.length} positive`
        : picture.intervalHistory.answered
          ? "Nothing reported"
          : "Not taken",
      statusTone: picture.intervalHistory.requiresReview ? "danger" : picture.intervalHistory.answered ? "ok" : "warning",
    },
    {
      id: "history",
      label: "History",
      shortLabel: "History",
      icon: HISTORY_ICON,
      subtitle: "Cancer, cardiovascular, risk factors, family, lifestyle and prior treatment",
      complete: historyTouched >= 3,
      status: `${historyTouched}/${HISTORY_GROUPS.length} groups`,
      statusTone: historyTouched >= 3 ? "ok" : "neutral",
    },
    {
      id: "vitals",
      label: "Vitals",
      shortLabel: "Vitals",
      icon: VITALS_ICON,
      subtitle: "Measurements with BMI, BSA and interpreted weight change",
      complete: Boolean(encounter.vitals?.sbp && encounter.vitals?.dbp && encounter.vitals?.weight),
      status: encounter.vitals?.sbp && encounter.vitals?.dbp ? `${encounter.vitals.sbp}/${encounter.vitals.dbp} mmHg` : "Not recorded",
      statusTone: picture.vitals.bp?.tone === "danger" ? "danger" : picture.vitals.bp?.tone === "warning" ? "warning" : encounter.vitals?.sbp ? "ok" : "neutral",
    },
    {
      id: "symptoms",
      label: "Symptoms",
      shortLabel: "Symptoms",
      icon: SYMPTOMS_ICON,
      subtitle: "Selecting a symptom opens its detail underneath",
      complete: true,
      status: encounter.symptoms?.length ? `${encounter.symptoms.length} reported` : "None reported",
      statusTone: encounter.symptoms?.length ? "warning" : "ok",
    },
    {
      id: "examination",
      label: "Systemic examination",
      shortLabel: "Examination",
      icon: EXAMINATION_ICON,
      subtitle: "CVS, RS, P/A and CNS with one-tap normal",
      complete: systemsDone === EXAM_SYSTEMS.length,
      status: `${systemsDone}/${EXAM_SYSTEMS.length} systems`,
      statusTone: systemsDone === EXAM_SYSTEMS.length ? "ok" : "neutral",
    },
    {
      id: "investigations",
      label: "Investigations",
      shortLabel: "Investigations",
      icon: INVESTIGATIONS_ICON,
      subtitle: "What is due now, how values are trending, and the full journey",
      complete: currentMilestone ? currentMilestone.completed === currentMilestone.total : investigationsRecorded > 0,
      status: currentMilestone ? `${currentMilestone.completed}/${currentMilestone.total} due` : `${investigationsRecorded} recorded`,
      statusTone: picture.outstanding.some((i) => i.status === "missing" || i.status === "overdue") ? "danger" : currentMilestone && currentMilestone.completed === currentMilestone.total ? "ok" : "info",
    },
    {
      id: "medication",
      label: "Medication review",
      shortLabel: "Medication",
      icon: MEDICATION_ICON,
      subtitle: "Cardioprotective analysis, interaction and QT screening",
      complete: Boolean(encounter.medReview) || (patient.medications || []).length > 0,
      status: picture.warnings.filter((w) => w.level === "danger").length
        ? `${picture.warnings.filter((w) => w.level === "danger").length} alerts`
        : `${(patient.medications || []).length} medicines`,
      statusTone: picture.warnings.some((w) => w.level === "danger") ? "danger" : (patient.medications || []).length ? "ok" : "neutral",
    },
    {
      id: "risk",
      label: "Risk assessment",
      shortLabel: "Risk",
      icon: RISK_ICON,
      subtitle: "Category, contributing factors, gaps and the monitoring plan",
      complete: Boolean(patient.risk?.category),
      status: picture.currentRisk,
      statusTone: picture.currentRisk === "Low" ? "ok" : picture.currentRisk === "Moderate" ? "warning" : "danger",
    },
    {
      id: "surveillance",
      label: "Surveillance and HFA-ICOS",
      shortLabel: "Surveillance",
      icon: SURVEILLANCE_ICON,
      subtitle: "Live monitoring plan, overdue items and fitness to proceed",
      complete: picture.tasksDone === picture.tasks.length,
      status: `${picture.tasksDone}/${picture.tasks.length} tasks`,
      statusTone: picture.tasksDone === picture.tasks.length ? "ok" : "info",
    },
    {
      id: "follow-up",
      label: "Follow-up planner",
      shortLabel: "Follow-up",
      icon: FOLLOW_UP_ICON,
      subtitle: "Milestone-based journey with escalation triggers",
      complete: Boolean(encounter.nextFollowUpDate && encounter.plan),
      status: encounter.nextFollowUpDate || picture.nextFollowUp.date,
      statusTone: encounter.nextFollowUpDate ? "ok" : "warning",
    },
    {
      id: "timeline",
      label: "Longitudinal timeline",
      shortLabel: "Timeline",
      icon: TIMELINE_ICON,
      subtitle: "The whole course, with every event expandable",
      complete: true,
      status: `${picture.events.length} events`,
      statusTone: "neutral",
    },
    {
      id: "overview",
      label: "Overview, summary and print",
      shortLabel: "Overview",
      icon: OVERVIEW_ICON,
      subtitle: "The final OPD summary and the single export point",
      complete: Boolean(encounter.notes),
      status: "Final",
      statusTone: "neutral",
    },
  ];
}

/* ------------------------------------------------------------------ CSV */

function exportCsv(patient, encounter) {
  const rows = [
    ["Field", "Value"],
    ["Name", patient.name], ["Patient ID", patient.patientId], ["Age", patient.age], ["Gender", patient.gender],
    ["Diagnosis", patient.diagnosis], ["Stage", patient.stage], ["Regimen", patient.regimen],
    ["Planned cycles", patient.plannedCycles], ["Cycle frequency", patient.cycleFrequency],
    ["Total planned dose", patient.totalPlannedDose],
    ["HFA-ICOS", patient.risk?.category], ["Baseline LVEF", patient.baselineLVEF],
    ["Current cycle", patient.cycle], ["Clinical status", patient.clinicalStatus],
  ];

  [...(patient.visits || []), encounter].filter(Boolean).forEach((visit, index) => {
    rows.push([`Encounter ${index + 1} type`, visit.type]);
    rows.push([`Encounter ${index + 1} date`, visit.date]);
    rows.push([`Encounter ${index + 1} tolerance`, visit.firstReview?.tolerance]);
    rows.push([`Encounter ${index + 1} symptoms`, (visit.symptoms || []).join("; ")]);
    rows.push([`Encounter ${index + 1} blood pressure`, visit.vitals?.sbp && visit.vitals?.dbp ? `${visit.vitals.sbp}/${visit.vitals.dbp}` : ""]);
    INVESTIGATIONS.forEach((definition) => {
      const entry = visit.inv?.[definition.id];
      if (entry && (entry.result || entry.interp)) {
        rows.push([`Encounter ${index + 1} ${definition.label}`, `${entry.result || ""} (${entry.interp || ""})`]);
      }
    });
  });

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(patient.name || "patient").replace(/\s+/g, "_")}_corsc.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------- workflow */

export function PatientWorkflow({ patient, setPatient, onBack, saveState }) {
  const encounter = patient.draftEncounter || createEncounter("Baseline");
  const [openSections, setOpenSections] = useState(() => new Set(["first-review"]));
  const [activeSection, setActiveSection] = useState("first-review");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sectionRefs = useRef({});

  const setEncounter = useCallback(
    (updater) => {
      setPatient((current) => {
        const draft = current.draftEncounter || createEncounter("Baseline");
        return { ...current, draftEncounter: typeof updater === "function" ? updater(draft) : { ...draft, ...updater } };
      });
    },
    [setPatient]
  );

  const picture = useMemo(() => buildClinicalPicture(patient, encounter), [patient, encounter]);
  const summary = useMemo(() => buildSummary(picture), [picture]);

  /** Merges a newly recorded override into local state immediately, rather
      than waiting for the next autosave round trip to reflect it. */
  const handleOverrideRecorded = useCallback(
    (raw) => {
      setPatient((current) => ({
        ...current,
        overrides: [{ ...raw, at: raw.createdAt, active: raw.withdrawnAt === null }, ...(current.overrides || [])],
      }));
    },
    [setPatient]
  );
  /* Only the sections this visit type calls for. A twelve-month survivorship
     review has no treatment tolerance and no current cycle, and a baseline
     assessment has no interval to report on — showing those sections invites
     documentation that means nothing and buries the sections that matter. */
  const sections = useMemo(
    () => sectionsForVisit(encounter, sectionDefinitions({ patient, encounter, picture })),
    [patient, encounter, picture]
  );

  /* Track which section is in view so the header nav reflects position. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
    // Section ids are stable; re-observing on every picture change is wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);

  function toggleSection(id) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function jumpTo(id) {
    setOpenSections((current) => new Set(current).add(id));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /** Collapse the finished section and open the next one — the continuous flow. */
  function advance(currentId) {
    const index = sections.findIndex((section) => section.id === currentId);
    const next = sections[index + 1];
    setOpenSections((current) => {
      const updated = new Set(current);
      updated.delete(currentId);
      if (next) updated.add(next.id);
      return updated;
    });
    if (next) {
      requestAnimationFrame(() => {
        document.getElementById(next.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function completeEncounter() {
    setPatient((current) => {
      const draft = current.draftEncounter;
      if (!draft) return current;
      const finished = {
        ...draft,
        saved: true,
        nextFollowUpDate: draft.nextFollowUpDate || picture.nextFollowUp.date,
        alerts: picture.alerts,
        aiSummary: summary.narrative,
      };
      const existing = (current.visits || []).findIndex((visit) => visit.id === finished.id);
      const visits = existing >= 0
        ? current.visits.map((visit, index) => (index === existing ? finished : visit))
        : [...(current.visits || []), finished];
      const nextCycle = Number(finished.firstReview?.cycle) || Number(finished.cycle) || Number(current.cycle) || 0;

      return {
        ...current,
        visits,
        cycle: Math.max(Number(current.cycle) || 0, nextCycle),
        lastSummary: summary.narrative,
        draftEncounter: createEncounter(`Cycle ${nextCycle + 1}`, { cycle: nextCycle + 1, date: todayISO() }),
      };
    });
    setCompleted(true);
    setOpenSections(new Set(["first-review"]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const renderSection = (section) => {
    switch (section.id) {
      case "registration":
        return <RegistrationSection patient={patient} setPatient={setPatient} />;
      case "first-review":
        return <FirstReviewSection patient={patient} setPatient={setPatient} encounter={encounter} setEncounter={setEncounter} />;
      case "since-last-visit":
        return <SinceLastVisitSection encounter={encounter} setEncounter={setEncounter} picture={picture} />;
      case "history":
        return <HistorySection patient={patient} setPatient={setPatient} />;
      case "vitals":
        return <VitalsSection patient={patient} encounter={encounter} setEncounter={setEncounter} />;
      case "symptoms":
        return <SymptomsSection encounter={encounter} setEncounter={setEncounter} />;
      case "examination":
        return <ExaminationSection encounter={encounter} setEncounter={setEncounter} />;
      case "investigations":
        return <InvestigationsSection picture={picture} encounter={encounter} setEncounter={setEncounter} />;
      case "medication":
        return <MedicationSection patient={patient} setPatient={setPatient} encounter={encounter} setEncounter={setEncounter} picture={picture} />;
      case "risk":
        return <RiskSection patient={patient} setPatient={setPatient} encounter={encounter} setEncounter={setEncounter} picture={picture} />;
      case "surveillance":
        return <SurveillanceSection patient={patient} setPatient={setPatient} encounter={encounter} setEncounter={setEncounter} picture={picture} />;
      case "follow-up":
        return <FollowUpSection patient={patient} encounter={encounter} setEncounter={setEncounter} picture={picture} />;
      case "timeline":
        return <PatientTimeline events={picture.events} encounter={encounter} />;
      case "overview":
        return (
          <OverviewSection
            patient={patient}
            encounter={encounter}
            setEncounter={setEncounter}
            picture={picture}
            summary={summary}
            onExportCsv={() => exportCsv(patient, encounter)}
            onPrint={() => window.print()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          #corsc-print-report { font-size: 11pt; color: #111; line-height: 1.45; }
          #corsc-print-report .report-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #0B1F3A; padding-bottom: 10px; margin-bottom: 16px; }
          #corsc-print-report h1 { font-size: 16pt; font-weight: 700; color: #0B1F3A; margin: 0; }
          #corsc-print-report .report-subtitle { font-size: 10pt; color: #555; margin: 2px 0 0; }
          #corsc-print-report .report-meta { font-size: 9.5pt; text-align: right; line-height: 1.5; }
          #corsc-print-report .report-block { margin-bottom: 14px; break-inside: avoid; }
          #corsc-print-report .report-block h2 { font-size: 11pt; font-weight: 700; color: #0B1F3A; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin: 0 0 6px; }
          #corsc-print-report .report-block h3 { font-size: 10pt; font-weight: 700; margin: 8px 0 3px; }
          #corsc-print-report .report-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; margin: 0; }
          #corsc-print-report .report-grid dt { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #777; }
          #corsc-print-report .report-grid dd { font-size: 10pt; margin: 0; font-weight: 600; }
          #corsc-print-report .report-list { margin: 0; padding-left: 16px; }
          #corsc-print-report .report-list li { margin-bottom: 3px; }
          #corsc-print-report .report-empty { color: #888; font-style: italic; }
          #corsc-print-report p { margin: 0 0 6px; }
          #corsc-print-report .report-footer { margin-top: 18px; border-top: 1px solid #ddd; padding-top: 8px; font-size: 8.5pt; color: #666; }
          @page { margin: 16mm; }
        }
      `}</style>

      <div className="no-print">
        <StickyPatientHeader
          patient={patient}
          cycle={currentCycle(patient, encounter)}
          risk={picture.currentRisk}
          latestLVEF={latestLVEF(patient, encounter)}
          treatmentPhase={picture.activeTreatmentPhase}
          treatmentPhasePosition={picture.treatmentPhasePosition}
          saveState={saveState}
          onBack={onBack}
          sections={sections}
          activeSection={activeSection}
          onJump={jumpTo}
        />

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-4">
          {completed && (
            <div className="mb-3">
              <Callout tone="ok" title="Encounter saved to the patient record" icon={CheckCircle2}>
                A new draft has been opened for the next cycle. The saved encounter now appears in the timeline and the investigation journey.
              </Callout>
            </div>
          )}

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-5">
            <div className="space-y-3">
              <ActionBar
                fitness={picture.fitness}
                nextFollowUp={picture.nextFollowUp}
                patientId={patient.id}
                onOverride={handleOverrideRecorded}
                onJump={jumpTo}
              />

              <RiskSurveillanceSummary picture={picture} onJump={jumpTo} />

              <div className="lg:hidden">
                <AssistantBanner summary={summary} onOpen={() => setAssistantOpen(true)} />
              </div>

              {sections.map((section, index) => {
                const isLast = index === sections.length - 1;
                const next = sections[index + 1];
                return (
                  <div key={section.id} ref={(node) => { sectionRefs.current[section.id] = node; }}>
                    <WorkflowSection
                      id={section.id}
                      index={index + 1}
                      icon={section.icon}
                      title={section.label}
                      subtitle={section.subtitle}
                      status={section.status}
                      statusTone={section.statusTone}
                      open={openSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      actions={
                        !isLast ? (
                          <button
                            type="button"
                            onClick={() => advance(section.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                          >
                            Continue to {next.shortLabel || next.label} <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        ) : null
                      }
                    >
                      {renderSection(section)}
                    </WorkflowSection>
                  </div>
                );
              })}

              {/* Repeated immediately before completion — a clinician about to
                  file the encounter should see the current verdict one more
                  time, not have to scroll back to the top to check it. */}
              <ActionBar
                fitness={picture.fitness}
                nextFollowUp={picture.nextFollowUp}
                patientId={patient.id}
                onOverride={handleOverrideRecorded}
                onJump={jumpTo}
              />

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold text-slate-900">Finish this encounter</span>
                  <StatusChip tone={picture.gaps.length ? "warning" : "ok"}>
                    {picture.gaps.length ? `${picture.gaps.length} gaps` : "Complete"}
                  </StatusChip>
                </div>
                <p className="mb-3 text-[13px] leading-relaxed text-slate-600">
                  Filing this encounter saves it into the patient record and opens a fresh draft for the next cycle. Work is autosaved
                  continuously, so nothing is lost before you do this.
                </p>
                <button
                  type="button"
                  onClick={completeEncounter}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-teal-800"
                >
                  <Save size={16} aria-hidden="true" /> Complete and file encounter
                </button>
              </div>

              <p className="px-2 pb-4 text-center text-[11.5px] leading-relaxed text-slate-400">
                Decision support built on the HFA-ICOS risk framework and ESC 2022 cardio-oncology guidelines. It does not replace clinical
                judgement, full guideline review, or multidisciplinary cardio-oncology input. For use by qualified clinicians only.
              </p>
            </div>

            <aside className="hidden lg:sticky lg:top-[152px] lg:block">
              <AiAssistant summary={summary} />
            </aside>
          </div>
        </main>

        {assistantOpen && (
          <div className="fixed inset-0 z-40 flex items-end bg-slate-900/40 lg:hidden" role="dialog" aria-label="Clinical assistant">
            <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-[#F6F7F5] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                  <Sparkles size={14} className="text-teal-600" aria-hidden="true" /> Clinical assistant
                </span>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  aria-label="Close assistant"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <AiAssistant summary={summary} compact />
            </div>
          </div>
        )}
      </div>

      <PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />
    </div>
  );
}
