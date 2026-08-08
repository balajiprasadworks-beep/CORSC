"use client";

/* =========================================================================
   Longitudinal timeline.

   Every event is selectable and opens its detail inline, so the clinician can
   move from "something happened at cycle 4" to the underlying documentation
   without leaving the workflow.
   ========================================================================= */

import { useState } from "react";
import { GitCommitVertical } from "lucide-react";

import { Chip, EmptyState, Stack, StatusChip, mono } from "@/components/kit";
import { EVENT_KINDS } from "@/lib/timeline";

const LEVEL_TONE = { danger: "danger", warning: "warning", info: "neutral" };

const FILTERS = [
  { id: "all", label: "All events" },
  { id: "clinical", label: "Clinical", kinds: ["cycle", "baseline", "treatmentStart", "endOfTreatment", "followUp", "diagnosis"] },
  { id: "signals", label: "Signals", kinds: ["biomarker", "imaging", "admission"] },
  { id: "medication", label: "Medication", kinds: ["medication"] },
];

export function PatientTimeline({ events, encounter }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const activeFilter = FILTERS.find((f) => f.id === filter);
  const visible = activeFilter?.kinds ? events.filter((event) => activeFilter.kinds.includes(event.kind)) : events;

  if (events.length === 0) {
    return <EmptyState>No events recorded yet. The timeline builds as encounters are saved.</EmptyState>;
  }

  return (
    <Stack gap="gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <Chip key={option.id} size="sm" active={filter === option.id} onClick={() => setFilter(option.id)}>
            {option.label}
          </Chip>
        ))}
      </div>

      <div className="relative pl-6">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" aria-hidden="true" />
        <div className="space-y-2">
          {visible.map((event) => {
            const kind = EVENT_KINDS[event.kind] || EVENT_KINDS.cycle;
            const isOpen = selected === event.id;
            const isCurrent = event.encounterId && encounter && event.encounterId === encounter.id;
            return (
              <div key={event.id} className="relative">
                <span
                  className={`absolute -left-6 top-3 size-3 rounded-full border-2 border-white ${event.level === "danger" ? "bg-red-500" : kind.dot}`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => setSelected(isOpen ? null : event.id)}
                  aria-expanded={isOpen}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition ${
                    event.level === "danger"
                      ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                      : isCurrent
                        ? "border-teal-300 bg-teal-50/60"
                        : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-slate-900">{event.title}</span>
                    <StatusChip tone={LEVEL_TONE[event.level] || "neutral"}>{kind.label}</StatusChip>
                    {isCurrent && <StatusChip tone="info">This encounter</StatusChip>}
                    <span className="ml-auto shrink-0 text-[12px] text-slate-400" style={mono}>{event.date}</span>
                  </div>
                  {isOpen && <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{event.detail}</p>}
                  {!isOpen && <p className="mt-1 truncate text-[12.5px] text-slate-500">{event.detail}</p>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {visible.length === 0 && <EmptyState>No events match this filter.</EmptyState>}
    </Stack>
  );
}

export const TIMELINE_ICON = GitCommitVertical;
