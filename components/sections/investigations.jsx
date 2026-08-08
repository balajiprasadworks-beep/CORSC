"use client";

/* =========================================================================
   Investigations.

   Three layers: what is due right now (with inline entry), how the trended
   values are moving, and the full journey from baseline to twelve months with
   a resolved status for every scheduled test.
   ========================================================================= */

import { useState } from "react";
import { Activity, ChevronDown, Plus } from "lucide-react";

import {
  Callout,
  Chip,
  Disclosure,
  EmptyState,
  Grid,
  Panel,
  SelectField,
  Sparkline,
  Stack,
  StatusChip,
  TextField,
  mono,
} from "@/components/kit";
import { INTERPRETATION_OPTIONS, INVESTIGATIONS } from "@/lib/clinical-data";
import { STATUS_STYLES } from "@/lib/investigation-timeline";

const STATUS_TONE = { completed: "ok", due: "info", overdue: "warning", missing: "danger", pending: "neutral" };

function InvestigationRow({ definition, value, onChange, reason }) {
  const abnormal = value.interp && value.interp !== "Normal";
  return (
    <div className={`rounded-xl border p-3 ${abnormal ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"}`}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900">{definition.label}</div>
          {reason && <div className="mt-0.5 text-[12px] leading-snug text-slate-500">{reason}</div>}
        </div>
        {abnormal && <StatusChip tone="danger">{value.interp}</StatusChip>}
      </div>
      <Grid cols="sm:grid-cols-2">
        <TextField
          label="Result"
          value={value.result}
          onChange={(v) => onChange({ result: v })}
          unit={definition.unit || undefined}
          placeholder={definition.unit ? "Value" : "Finding"}
        />
        <SelectField
          label="Interpretation"
          value={value.interp}
          onChange={(v) => onChange({ interp: v })}
          options={INTERPRETATION_OPTIONS}
          placeholder="Not interpreted"
        />
      </Grid>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Date performed" type="date" value={value.date} onChange={(v) => onChange({ date: v })} />
        <TextField label="Consultant comment" value={value.comment} onChange={(v) => onChange({ comment: v })} placeholder="Interpretation in context" />
      </div>
    </div>
  );
}

function TrendCard({ series }) {
  const changeLabel =
    series.change === null || series.points.length < 2
      ? "Single value"
      : `${series.change > 0 ? "+" : ""}${series.change}${series.unit ? ` ${series.unit}` : ""}${
          series.relative !== null ? ` (${series.relative > 0 ? "+" : ""}${series.relative}%)` : ""
        }`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-slate-900">{series.label}</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[19px] font-bold text-slate-900" style={mono}>{series.last}</span>
            {series.unit && <span className="text-[11.5px] text-slate-400">{series.unit}</span>}
          </div>
          <div className={`mt-0.5 text-[11.5px] font-medium ${series.direction === "worse" ? "text-red-600" : series.direction === "better" ? "text-emerald-600" : "text-slate-500"}`}>
            {changeLabel}
          </div>
        </div>
        <Sparkline points={series.plotPoints || series.points} direction={series.direction} width={92} height={40} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {series.points.slice(-4).map((point, index) => (
          <span key={`${point.date}-${index}`} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10.5px] text-slate-500" style={mono}>
            {point.date || point.label}: {point.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InvestigationsSection({ picture, encounter, setEncounter }) {
  const [showAll, setShowAll] = useState(false);
  // Investigations added by hand this session, before any value is entered.
  const [addedIds, setAddedIds] = useState(() => new Set());
  const { investigationTimeline, trends, trendFlags, outstanding } = picture;

  const currentMilestone = investigationTimeline.find((m) => m.state === "current");
  const dueItems = currentMilestone?.items || [];
  const dueIds = new Set(dueItems.map((i) => i.id));

  const extraFilled = INVESTIGATIONS.filter((definition) => {
    if (dueIds.has(definition.id)) return false;
    if (addedIds.has(definition.id)) return true;
    const entry = encounter.inv?.[definition.id];
    return Boolean(entry && (entry.result || entry.interp || entry.comment));
  });

  const optional = INVESTIGATIONS.filter((d) => !dueIds.has(d.id) && !extraFilled.some((e) => e.id === d.id));

  function setInv(id, patch) {
    setEncounter((current) => ({
      ...current,
      inv: { ...current.inv, [id]: { ...(current.inv?.[id] || {}), ...patch } },
    }));
  }

  const overdueCount = outstanding.filter((i) => i.status === "missing" || i.status === "overdue").length;

  return (
    <Stack gap="gap-4">
      {overdueCount > 0 && (
        <Callout tone="danger" title={`${overdueCount} investigation${overdueCount === 1 ? "" : "s"} outstanding from earlier milestones`}>
          {outstanding
            .filter((i) => i.status === "missing" || i.status === "overdue")
            .slice(0, 4)
            .map((item) => `${item.label} (${item.milestone})`)
            .join(" · ")}
        </Callout>
      )}

      <Panel
        title={`Due at this visit — ${currentMilestone?.label || "current review"}`}
        subtitle="Generated from the therapy, risk category and position in the treatment course"
        right={currentMilestone ? <StatusChip tone={currentMilestone.completed === currentMilestone.total ? "ok" : "info"}>{currentMilestone.completed}/{currentMilestone.total}</StatusChip> : null}
      >
        {dueItems.length === 0 ? (
          <EmptyState>No protocol investigations are scheduled at this point in the course.</EmptyState>
        ) : (
          <Stack gap="gap-2.5">
            {dueItems.map((item) => {
              const definition = INVESTIGATIONS.find((d) => d.id === item.id);
              if (!definition) return null;
              return (
                <InvestigationRow
                  key={item.id}
                  definition={definition}
                  reason={item.reason}
                  value={encounter.inv?.[item.id] || { result: "", interp: "", date: "", comment: "" }}
                  onChange={(patch) => setInv(item.id, patch)}
                />
              );
            })}
          </Stack>
        )}
      </Panel>

      {extraFilled.length > 0 && (
        <Panel title="Other investigations recorded at this visit">
          <Stack gap="gap-2.5">
            {extraFilled.map((definition) => (
              <InvestigationRow
                key={definition.id}
                definition={definition}
                value={encounter.inv?.[definition.id] || { result: "", interp: "", date: "", comment: "" }}
                onChange={(patch) => setInv(definition.id, patch)}
              />
            ))}
          </Stack>
        </Panel>
      )}

      {optional.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
          >
            <Plus size={14} aria-hidden="true" /> Add another investigation
            <ChevronDown size={14} className={`transition-transform ${showAll ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {showAll && (
            <>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {optional.map((definition) => (
                  <Chip
                    key={definition.id}
                    size="sm"
                    active={false}
                    onClick={() => setAddedIds((current) => new Set(current).add(definition.id))}
                  >
                    {definition.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-slate-400">
                Selecting an investigation adds it to the list above for entry.
              </p>
            </>
          )}
        </div>
      )}

      <Panel title="Trends" subtitle="Direction of travel across every recorded value">
        {trends.length === 0 ? (
          <EmptyState>No numeric results recorded yet. Trends appear once a value is entered.</EmptyState>
        ) : (
          <Stack>
            <Grid cols="sm:grid-cols-2 lg:grid-cols-3">
              {trends.map((series) => (
                <TrendCard key={series.id} series={series} />
              ))}
            </Grid>
            {trendFlags.length > 0 && (
              <Stack gap="gap-2">
                {trendFlags.map((flag) => (
                  <Callout key={flag.id} tone={flag.level}>{flag.text}</Callout>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Panel>

      <Panel title="Investigation journey" subtitle="Baseline through to twelve-month survivorship">
        <Stack gap="gap-2">
          {investigationTimeline.map((milestone) => {
            return (
              <Disclosure
                key={milestone.id}
                title={milestone.label}
                subtitle={
                  milestone.total === 0
                    ? "No investigations scheduled"
                    : `${milestone.completed} of ${milestone.total} complete${milestone.outstanding ? ` · ${milestone.outstanding} outstanding` : ""}`
                }
                defaultOpen={milestone.state === "current"}
                tone={milestone.state === "current" ? "info" : undefined}
                badge={
                  <>
                    {milestone.state === "current" && <StatusChip tone="info">Current</StatusChip>}
                    {milestone.outstanding > 0 && <StatusChip tone="danger">{milestone.outstanding} outstanding</StatusChip>}
                  </>
                }
              >
                {milestone.items.length === 0 ? (
                  <EmptyState>No protocol investigations at this milestone.</EmptyState>
                ) : (
                  <div className="space-y-1.5">
                    {milestone.items.map((item) => {
                      const style = STATUS_STYLES[item.status];
                      return (
                        <div key={item.id} className="flex items-start gap-2.5 rounded-lg border border-slate-100 px-3 py-2">
                          <span className={`mt-1.5 size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13.5px] font-medium text-slate-800">{item.label}</span>
                              <StatusChip tone={STATUS_TONE[item.status]}>{style.label}</StatusChip>
                              {item.result && (
                                <span className="text-[12px] text-slate-500" style={mono}>
                                  {item.result}{item.date ? ` · ${item.date}` : ""}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[12px] leading-snug text-slate-500">{item.reason}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Disclosure>
            );
          })}
        </Stack>
      </Panel>
    </Stack>
  );
}

export const INVESTIGATIONS_ICON = Activity;
