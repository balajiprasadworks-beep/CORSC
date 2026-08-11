"use client";

/* =========================================================================
   Since last visit.

   Replaces four free-text boxes. The interval between contacts is where most
   of what matters actually happens, and a textarea cannot drive anything: a
   hospitalisation for breathlessness typed into "interim events" was invisible
   to the alert engine, the surveillance engine and the fitness verdict.

   Each answer here carries a signal that the engines read, so a positive
   response changes the plan rather than sitting in prose nobody re-reads.
   ========================================================================= */

import { History } from "lucide-react";

import { Callout, EmptyState, Panel, SourceNote, Stack, StatusChip, TextArea } from "@/components/kit";
import { SINCE_LAST_VISIT_GROUPS, interpretSinceLastVisit, itemsForGroup } from "@/lib/visit-types";

const ANSWERS = [
  { id: "yes", label: "Yes", present: true },
  { id: "no", label: "No", present: false },
];

export function SinceLastVisitSection({ encounter, setEncounter, picture }) {
  const answers = encounter?.sinceLastVisit || {};
  const interval = picture?.intervalHistory || interpretSinceLastVisit(encounter);

  function setAnswer(itemId, present) {
    setEncounter((current) => {
      const existing = current.sinceLastVisit || {};
      const previous = existing[itemId] || {};
      // Tapping the selected answer again clears it, so "not asked" stays
      // distinguishable from "asked and negative".
      const next = previous.present === present ? undefined : { ...previous, present };
      const updated = { ...existing };
      if (next === undefined) delete updated[itemId];
      else updated[itemId] = next;
      return { ...current, sinceLastVisit: updated };
    });
  }

  function setDetail(itemId, detail) {
    setEncounter((current) => ({
      ...current,
      sinceLastVisit: {
        ...(current.sinceLastVisit || {}),
        [itemId]: { ...((current.sinceLastVisit || {})[itemId] || {}), detail },
      },
    }));
  }

  return (
    <Stack gap="gap-4">
      {interval.requiresReview && (
        <Callout tone="warning" title="Something happened between visits that needs addressing today">
          {interval.escalating.map((item) => item.label).join(", ")}. These findings feed the alert and surveillance engines directly, whether or not
          anything measured at this encounter is abnormal.
        </Callout>
      )}

      {SINCE_LAST_VISIT_GROUPS.map((group) => (
        <Panel key={group.id} title={group.label} subtitle={group.hint}>
          <div className="space-y-1.5">
            {itemsForGroup(group.id).map((item) => {
              const answer = answers[item.id];
              const isPositive = answer?.present === true;
              return (
                <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 text-[13.5px] text-slate-800">
                      {item.label}
                      {item.escalates && (
                        <StatusChip tone="warning" className="ml-1.5 align-middle">
                          Escalates
                        </StatusChip>
                      )}
                    </span>
                    <span className="flex shrink-0 gap-1">
                      {ANSWERS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAnswer(item.id, option.present)}
                          aria-pressed={answer?.present === option.present}
                          className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition ${
                            answer?.present === option.present
                              ? option.present
                                ? "border-amber-500 bg-amber-500 text-white"
                                : "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </span>
                  </div>

                  {isPositive && (
                    <div className="mt-2">
                      {item.followUp && <p className="mb-1.5 text-[12px] leading-relaxed text-slate-500">{item.followUp}</p>}
                      <TextArea
                        label="Detail"
                        rows={2}
                        value={answer?.detail || ""}
                        onChange={(value) => setDetail(item.id, value)}
                        placeholder="Dates, circumstances, what was done"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      ))}

      <Panel title="Interval summary" subtitle="What the clinical engines will act on">
        {interval.positive.length === 0 ? (
          <EmptyState>{interval.summary}</EmptyState>
        ) : (
          <Stack gap="gap-2">
            <p className="text-[13px] leading-relaxed text-slate-700">{interval.summary}</p>
            {interval.intervalSymptoms.length > 0 && (
              <p className="text-[12.5px] leading-relaxed text-slate-500">
                Symptoms reported for the interval are merged into this encounter&rsquo;s symptom list, so a patient who was breathless every night this
                week but is comfortable sitting in clinic still registers as symptomatic.
              </p>
            )}
          </Stack>
        )}
        <SourceNote provenance={interval.provenance} />
      </Panel>
    </Stack>
  );
}

export const SINCE_LAST_VISIT_ICON = History;
