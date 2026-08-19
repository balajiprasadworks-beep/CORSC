"use client";

/* =========================================================================
   Sticky patient header.

   Stays visible for the whole encounter so the clinician never loses track of
   who they are documenting, where the patient is in treatment, and what the
   current risk and ejection fraction are.
   ========================================================================= */

import { ArrowLeft, Check, CloudOff, Heart, Loader2 } from "lucide-react";

import { mono } from "@/components/kit";
import { riskStyle } from "@/lib/clinical-data";

function SaveIndicator({ state }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-400">
        <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Saving
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] text-red-500">
        <CloudOff size={12} aria-hidden="true" /> Not saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] text-emerald-600">
      <Check size={12} aria-hidden="true" /> Saved
    </span>
  );
}

const MODE_STYLES = {
  baseline: "bg-slate-100 text-slate-700",
  routine: "bg-emerald-50 text-emerald-700",
  abnormal: "bg-red-50 text-red-700",
  survivorship: "bg-violet-50 text-violet-700",
};

export function StickyPatientHeader({
  patient,
  cycle,
  risk,
  latestLVEF,
  treatmentPhase,
  treatmentPhasePosition,
  workflowMode,
  saveState,
  onBack,
  sections,
  activeSection,
  onJump,
}) {
  const styles = riskStyle(risk);
  const phaseLabel =
    treatmentPhase && treatmentPhasePosition?.total > 1
      ? `Phase ${treatmentPhasePosition.index} of ${treatmentPhasePosition.total} · ${treatmentPhase.name}`
      : treatmentPhase?.name || null;

  const facts = [
    { label: "Patient ID", value: patient.patientId || "—" },
    { label: "Age / sex", value: [patient.age, patient.gender].filter(Boolean).join(" / ") || "—" },
    { label: "Cycle", value: cycle ? String(cycle) : "—" },
    { label: "Latest LVEF", value: latestLVEF !== null && latestLVEF !== undefined ? `${latestLVEF}%` : "—" },
  ];

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3 py-2.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to patient list"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>

          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]">
            <Heart size={15} className="text-teal-300" fill="currentColor" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate text-[15px] font-semibold text-slate-900">{patient.name || "Unnamed patient"}</span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles.bg} ${styles.text}`}>{risk}</span>
              {phaseLabel && (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                  {phaseLabel}
                </span>
              )}
              {workflowMode && (
                <span
                  title={workflowMode.reasons?.join(" ")}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${MODE_STYLES[workflowMode.mode] || MODE_STYLES.routine}`}
                >
                  {workflowMode.label}
                </span>
              )}
            </div>
            <div className="truncate text-[12px] text-slate-500">
              {[patient.diagnosis, patient.stage].filter(Boolean).join(" · ") || "Diagnosis not recorded"}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {facts.map((fact) => (
              <div key={fact.label} className="text-right">
                <div className="text-[9.5px] uppercase tracking-widest text-slate-400">{fact.label}</div>
                <div className="text-[13px] font-semibold text-slate-800" style={mono}>{fact.value}</div>
              </div>
            ))}
          </div>

          <div className="shrink-0 pl-1">
            <SaveIndicator state={saveState} />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
          {facts.map((fact) => (
            <div key={fact.label} className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1">
              <span className="text-[9.5px] uppercase tracking-widest text-slate-400">{fact.label} </span>
              <span className="text-[12px] font-semibold text-slate-800" style={mono}>{fact.value}</span>
            </div>
          ))}
        </div>

        <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2" aria-label="Workflow sections">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onJump(section.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                activeSection === section.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : section.complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="opacity-60" style={mono}>{index + 1}</span>
              {section.shortLabel || section.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
