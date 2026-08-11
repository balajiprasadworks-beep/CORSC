"use client";

/* =========================================================================
   Fitness to proceed.

   The first thing on screen, because it is the question the visit exists to
   answer. Everything else in the workflow feeds it.

   The verdict is a prompt for the conversation with oncology, not an
   instruction, so the findings that produced it and the actions that would
   change it are shown alongside rather than behind a click.
   ========================================================================= */

import { useState } from "react";
import { AlertOctagon, CheckCircle2, ChevronDown, ShieldAlert } from "lucide-react";

import { serif } from "@/components/kit";

const STYLES = {
  proceed: {
    icon: CheckCircle2,
    surface: "border-emerald-300 bg-emerald-50",
    accent: "text-emerald-800",
    chip: "bg-emerald-600 text-white",
    rule: "border-emerald-200",
  },
  caution: {
    icon: ShieldAlert,
    surface: "border-amber-300 bg-amber-50",
    accent: "text-amber-900",
    chip: "bg-amber-500 text-white",
    rule: "border-amber-200",
  },
  hold: {
    icon: AlertOctagon,
    surface: "border-red-300 bg-red-50",
    accent: "text-red-900",
    chip: "bg-red-600 text-white",
    rule: "border-red-200",
  },
};

function Finding({ finding, style }) {
  return (
    <div className={`rounded-xl border bg-white/70 p-3 ${style.rule}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.chip}`}>
          {finding.verdict === "hold" ? "Hold" : "Action"}
        </span>
        <span className="text-[13.5px] font-semibold text-slate-900">{finding.title}</span>
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{finding.detail}</p>
      {finding.actions?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {finding.actions.map((action) => (
            <li key={action} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-700">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FitnessBanner({ fitness, onJump }) {
  const style = STYLES[fitness.verdict] || STYLES.caution;
  const Icon = style.icon;
  const [open, setOpen] = useState(fitness.verdict === "hold");
  const hasDetail = fitness.findings.length > 0;

  return (
    <section
      aria-label="Fitness to proceed with treatment"
      className={`rounded-2xl border-2 ${style.surface} shadow-[0_1px_3px_rgba(15,23,42,0.06)]`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={22} className={`mt-0.5 shrink-0 ${style.accent}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Fitness to proceed
            </span>
          </div>
          <div className={`mt-0.5 text-[24px] font-bold leading-tight ${style.accent}`} style={serif}>
            {fitness.label}
          </div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-slate-700">{fitness.headline}</p>

          {fitness.actions.length > 0 && (
            <ul className="mt-2.5 space-y-1">
              {fitness.actions.slice(0, 4).map((action) => (
                <li key={action} className="flex gap-2 text-[13px] leading-relaxed text-slate-800">
                  <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${style.chip}`} aria-hidden="true" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          )}

          {hasDetail && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {open ? "Hide" : "Show"} {fitness.findings.length} finding{fitness.findings.length === 1 ? "" : "s"}
              <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {open && hasDetail && (
        <div className={`space-y-2 border-t px-4 pb-4 pt-3 ${style.rule}`}>
          {[...fitness.holds, ...fitness.cautions].map((finding) => (
            <Finding key={finding.id} finding={finding} style={style} />
          ))}
          <p className="pt-1 text-[11.5px] leading-relaxed text-slate-500">
            This verdict is generated from the data recorded in this encounter. The decision to give, delay or stop cancer
            therapy rests with the treating oncologist and cardio-oncologist together.
            {onJump && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => onJump("investigations")}
                  className="font-semibold text-teal-700 underline underline-offset-2"
                >
                  Review the investigations
                </button>{" "}
                if a finding looks wrong.
              </>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
