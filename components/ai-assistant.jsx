"use client";

/* =========================================================================
   Living clinical assistant.

   Present throughout the workflow rather than only at the end. It restates the
   case as categories a clinician acts on: red flags, risks, abnormal findings,
   documentation gaps, next actions, surveillance and medication.
   ========================================================================= */

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  ClipboardCheck,
  FileWarning,
  Pill,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";

import { EmptyState, StatusChip, mono } from "@/components/kit";

const GROUPS = [
  { key: "redFlags", label: "Red flags", icon: AlertOctagon, tone: "danger" },
  { key: "keyRisks", label: "Key cardio-oncology risks", icon: ShieldAlert, tone: "warning" },
  { key: "abnormal", label: "Abnormal findings", icon: Activity, tone: "warning" },
  { key: "nextActions", label: "Suggested next actions", icon: Target, tone: "info" },
  { key: "medication", label: "Medication considerations", icon: Pill, tone: "info" },
  { key: "surveillance", label: "Surveillance implications", icon: ClipboardCheck, tone: "neutral" },
  { key: "missing", label: "Missing documentation", icon: FileWarning, tone: "neutral" },
];

const TONE_STYLES = {
  danger: { dot: "bg-red-500", text: "text-red-700" },
  warning: { dot: "bg-amber-500", text: "text-amber-700" },
  info: { dot: "bg-sky-500", text: "text-sky-700" },
  neutral: { dot: "bg-slate-400", text: "text-slate-600" },
};

function Group({ group, items }) {
  const [open, setOpen] = useState(group.tone === "danger" || group.key === "nextActions");
  const styles = TONE_STYLES[group.tone];
  if (!items || items.length === 0) return null;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <group.icon size={14} className={styles.text} aria-hidden="true" />
        <span className="flex-1 text-[12.5px] font-semibold text-slate-800">{group.label}</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ${group.tone === "danger" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
          {items.length}
        </span>
      </button>
      {open && (
        <ul className="space-y-1.5 px-3 pb-3">
          {items.map((item, index) => (
            <li key={`${group.key}-${index}`} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-600">
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AiAssistant({ summary, compact = false }) {
  const { structured } = summary;
  const hasContent = GROUPS.some((group) => (structured[group.key] || []).length > 0);

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${compact ? "" : "shadow-[0_1px_3px_rgba(15,23,42,0.06)]"}`}>
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-2.5">
        <Sparkles size={15} className="text-teal-600" aria-hidden="true" />
        <span className="flex-1 text-[13px] font-semibold text-slate-900">Clinical assistant</span>
        {structured.counts.redFlags > 0 && <StatusChip tone="danger">{structured.counts.redFlags} red flag{structured.counts.redFlags === 1 ? "" : "s"}</StatusChip>}
      </div>
      {hasContent ? (
        <div>
          {GROUPS.map((group) => (
            <Group key={group.key} group={group} items={structured[group.key]} />
          ))}
        </div>
      ) : (
        <div className="p-3">
          <EmptyState>Documentation has not started yet. The assistant updates as the encounter is filled in.</EmptyState>
        </div>
      )}
      <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 text-[10.5px] leading-relaxed text-slate-400">
        Generated locally in this browser from the recorded data. It supports clinical judgement and does not replace it.
      </div>
    </div>
  );
}

/** Condensed banner used inline at the top of the workflow on small screens. */
export function AssistantBanner({ summary, onOpen }) {
  const { structured } = summary;
  const counts = structured.counts;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition hover:border-teal-300"
    >
      <Sparkles size={16} className="shrink-0 text-teal-600" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-slate-900">Clinical assistant</span>
        <span className="block truncate text-[12px] text-slate-500" style={mono}>
          {counts.redFlags} red flags · {counts.abnormal} findings · {counts.actions} actions · {counts.missing} gaps
        </span>
      </span>
      {counts.redFlags > 0 && <StatusChip tone="danger">{counts.redFlags}</StatusChip>}
    </button>
  );
}
