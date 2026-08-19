"use client";

/* =========================================================================
   Cardiac Risk & Surveillance — the unified decision block.

   Spec requirement: "A doctor can look at one block and answer: How risky is
   this patient? What am I monitoring? What is due? What do I do?" without
   navigating from Risk to a separate Surveillance section.

   This does not replace the detailed Risk and Surveillance sections further
   down the workflow — those carry the full HFA-ICOS working, the CTR-CVT
   domains, contraindication screening and the fitness audit trail, and a
   clinician who wants that detail still has it. This is the answer at a
   glance; the sections below are the working-out.
   ========================================================================= */

import { ArrowRight, CalendarClock, ShieldAlert } from "lucide-react";

import { mono, serif } from "@/components/kit";
import { riskStyle } from "@/lib/clinical-data";

export function RiskSurveillanceSummary({ picture, onJump }) {
  const { currentRisk, riskEscalation, baselineRisk, activeTreatmentPhase, treatmentPhasePosition, tasks, tasksDone, nextFollowUp, outstanding } = picture;
  const styles = riskStyle(currentRisk);
  const outstandingCount = outstanding.filter((item) => item.status === "missing" || item.status === "overdue").length;
  const dueTasks = tasks.filter((task) => !task.completed);

  const phaseLabel =
    activeTreatmentPhase && treatmentPhasePosition?.total > 1
      ? `Phase ${treatmentPhasePosition.index} of ${treatmentPhasePosition.total} · ${activeTreatmentPhase.name}`
      : activeTreatmentPhase?.name || null;

  return (
    <section
      aria-label="Cardiac risk and surveillance"
      className={`rounded-2xl border p-4 ${styles.bg} ${styles.border}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert size={16} className={styles.text} aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Cardiac risk &amp; surveillance</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Risk</div>
          <div className={`text-[22px] font-bold leading-tight ${styles.text}`} style={serif}>{currentRisk}</div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">
            {riskEscalation || `Baseline HFA-ICOS ${baselineRisk.applicable ? baselineRisk.category : "not applicable"}.`}
          </p>
        </div>

        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Active therapy</div>
          {phaseLabel ? (
            <>
              <div className="text-[15px] font-semibold text-slate-900">{phaseLabel}</div>
              <p className="mt-0.5 text-[12px] text-slate-500">from the recorded treatment course</p>
            </>
          ) : (
            <div className="text-[13px] text-slate-500">No structured treatment course recorded.</div>
          )}
        </div>

        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Due now</div>
          <div className="text-[15px] font-semibold text-slate-900" style={mono}>
            {tasksDone}/{tasks.length} tasks
          </div>
          {outstandingCount > 0 && (
            <p className="mt-0.5 text-[12px] font-medium text-red-700">{outstandingCount} overdue investigation{outstandingCount === 1 ? "" : "s"}</p>
          )}
        </div>
      </div>

      {dueTasks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dueTasks.slice(0, 5).map((task) => (
            <span key={task.id} className="rounded-full bg-white/70 px-2.5 py-1 text-[11.5px] font-medium text-slate-700 ring-1 ring-slate-200">
              {task.label}
            </span>
          ))}
          {dueTasks.length > 5 && (
            <span className="rounded-full px-2.5 py-1 text-[11.5px] text-slate-500">+{dueTasks.length - 5} more</span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-2.5">
        <p className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
          <CalendarClock size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
          Next: <span className="font-semibold text-slate-800">{nextFollowUp.date}</span> — {nextFollowUp.reason}
        </p>
        {onJump && (
          <button
            type="button"
            onClick={() => onJump("surveillance")}
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-teal-700 hover:text-teal-900"
          >
            Full risk &amp; surveillance detail <ArrowRight size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
