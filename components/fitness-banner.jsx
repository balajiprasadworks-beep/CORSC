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
import { AlertOctagon, CheckCircle2, ChevronDown, Loader2, ShieldAlert } from "lucide-react";

import { serif } from "@/components/kit";
import { apiFetch, ApiRequestError } from "@/lib/client/api-client";
import { VERDICT } from "@/lib/fitness";

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

/**
 * Records the clinician's decision when it differs from the verdict above.
 *
 * Posts to the granular overrides endpoint rather than folding into the
 * document autosave: an override is a distinct clinical event with its own
 * mandatory reason, and the API enforces that reason at three levels. This
 * only works for a record already saved to the server — a patient still held
 * only in the browser has no id the override table can reference.
 */
function OverrideControl({ patientId, algorithmicVerdict, onRecorded }) {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!decision || reason.trim().length < 10) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await apiFetch(`/api/patients/${patientId}/overrides`, {
        method: "POST",
        body: {
          target: "fitness",
          algorithmicValue: algorithmicVerdict,
          clinicianValue: decision,
          reason: reason.trim(),
        },
      });
      onRecorded(result);
      setOpen(false);
      setDecision("");
      setReason("");
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 400
          ? "This record needs to be saved to the server before a decision can be logged against it."
          : "Could not record the decision. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2.5 text-[12.5px] font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
      >
        Proceeding differently? Record the decision
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-300 bg-white p-3">
      <div className="mb-2 text-[12.5px] font-semibold text-slate-800">
        Record a different decision from this verdict
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {Object.values(VERDICT).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setDecision(option.id)}
            aria-pressed={decision === option.id}
            className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition ${
              decision === option.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Why (at least 10 characters) — this is recorded alongside the algorithmic verdict, not instead of it."
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
      />
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!decision || reason.trim().length < 10 || submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
          Record decision
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * The Action Bar.
 *
 * Three questions, in order, because that is the order a clinician actually
 * asks them: what happened, what it means, what to do next. Everything below
 * that line is the working-out; this line is the answer.
 */
export function ActionBar({ fitness, nextFollowUp, patientId, onOverride, onJump }) {
  const displayVerdict = fitness.overridden ? fitness.clinicianValue : fitness.verdict;
  const displayed = VERDICT[displayVerdict] || VERDICT[fitness.verdict];
  const style = STYLES[displayVerdict] || STYLES.caution;
  const Icon = style.icon;
  const [open, setOpen] = useState(fitness.verdict === "hold");
  const hasDetail = fitness.findings.length > 0;

  const whatHappened =
    fitness.holds.length || fitness.cautions.length
      ? [...fitness.holds, ...fitness.cautions][0].title
      : "No cardiac finding at this encounter argues against proceeding.";

  return (
    <section aria-label="Action bar" className={`rounded-2xl border-2 ${style.surface} shadow-[0_1px_3px_rgba(15,23,42,0.06)]`}>
      <div className="flex items-start gap-3 p-4">
        <Icon size={22} className={`mt-0.5 shrink-0 ${style.accent}`} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Action bar</span>
          <div className={`mt-0.5 text-[24px] font-bold leading-tight ${style.accent}`} style={serif}>
            {displayed.label}
          </div>

          {fitness.overridden && (
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              Algorithmic verdict was {VERDICT[fitness.algorithmicVerdict]?.label || fitness.algorithmicVerdict}, overridden by{" "}
              {fitness.override?.clinician?.displayName || fitness.override?.clinician?.email || "a clinician"}: “{fitness.override?.reason}”
            </p>
          )}

          <dl className="mt-2.5 space-y-1.5">
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">What happened</dt>
              <dd className="text-[13.5px] leading-relaxed text-slate-800">{whatHappened}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">What it means</dt>
              <dd className="text-[13.5px] leading-relaxed text-slate-800">{fitness.headline}</dd>
            </div>
            {fitness.actions.length > 0 && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">What to do next</dt>
                <dd>
                  <ul className="mt-0.5 space-y-1">
                    {fitness.actions.slice(0, 4).map((action) => (
                      <li key={action} className="flex gap-2 text-[13px] leading-relaxed text-slate-800">
                        <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${style.chip}`} aria-hidden="true" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {nextFollowUp && (
            <p className="mt-2.5 text-[12.5px] text-slate-600">
              <span className="font-semibold text-slate-700">Next surveillance:</span> {nextFollowUp.date}
              {nextFollowUp.days != null ? ` (${nextFollowUp.days} days)` : ""} — {nextFollowUp.reason}
            </p>
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

          {patientId && onOverride && (
            <OverrideControl patientId={patientId} algorithmicVerdict={fitness.verdict} onRecorded={onOverride} />
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

/** Retained so any existing import of the old name keeps working. */
export const FitnessBanner = ActionBar;
