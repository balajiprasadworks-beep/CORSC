"use client";

/* =========================================================================
   Changes Only vs Full Review — and the snapshot that makes Changes Only
   trustworthy to use.

   The choice itself is one control (spec #16). What makes a clinician
   actually pick Changes Only is seeing, in the same glance, that CORSC
   already knows where this patient stood last time — otherwise "changes
   only" reads as "skip questions" rather than "nothing here needs re-asking".
   ========================================================================= */

import { CheckCircle2, ListChecks } from "lucide-react";

import { SegmentedControl } from "@/components/kit";

export function ReviewModeToggle({ mode, onChange, snapshot, carriedForward }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListChecks size={15} className="text-slate-500" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-slate-800">How would you like to document this visit?</span>
        </div>
        <SegmentedControl
          value={mode}
          onChange={onChange}
          options={[
            { value: "quick", label: "Changes only" },
            { value: "full", label: "Full review" },
          ]}
          size="sm"
        />
      </div>

      {snapshot && (
        <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 sm:grid-cols-4">
          {snapshot.map((fact) => (
            <div key={fact.label}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{fact.label}</div>
              <div className="text-[13.5px] font-semibold text-slate-800">{fact.value}</div>
            </div>
          ))}
        </div>
      )}

      {mode === "quick" && (
        <div className="mt-2.5">
          <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-500">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
            Stable information — diagnosis, stage, history, baseline values, prior medications — is carried forward from
            the record automatically. Only what changed needs entering below.
          </p>
          {carriedForward && carriedForward.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 pl-5">
              {carriedForward.map((fact) => (
                <span key={fact} className="rounded-full bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-600 ring-1 ring-slate-200">
                  {fact}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
