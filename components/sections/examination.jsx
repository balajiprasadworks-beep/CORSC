"use client";

/* =========================================================================
   Systemic examination.

   Each system carries a Normal / Findings switch on the right. Normal collapses
   the system to a single line; Findings opens inspection, palpation, percussion
   and auscultation, each of which can itself be marked normal in one tap.
   ========================================================================= */

import { CheckCheck, Stethoscope } from "lucide-react";

import {
  Chip,
  SegmentedControl,
  Stack,
  StatusChip,
  TextField,
} from "@/components/kit";
import { EXAM_SYSTEMS } from "@/lib/clinical-data";

const STATUS_OPTIONS = [
  { value: "normal", label: "Normal", tone: "ok", clearable: true },
  { value: "findings", label: "Findings", tone: "warning", clearable: true },
];

export function ExaminationSection({ encounter, setEncounter }) {
  const systems = encounter.systems || {};

  function setStatus(systemId, status) {
    setEncounter((current) => ({
      ...current,
      systems: {
        ...current.systems,
        [systemId]: { ...current.systems?.[systemId], status },
      },
    }));
  }

  function setComponent(systemId, componentId, patch) {
    setEncounter((current) => {
      const system = current.systems?.[systemId] || { status: "findings", components: {} };
      return {
        ...current,
        systems: {
          ...current.systems,
          [systemId]: {
            ...system,
            status: system.status || "findings",
            components: {
              ...system.components,
              [componentId]: { ...(system.components?.[componentId] || {}), ...patch },
            },
          },
        },
      };
    });
  }

  function markAllNormal() {
    setEncounter((current) => {
      const next = { ...current.systems };
      EXAM_SYSTEMS.forEach((system) => {
        next[system.id] = { ...next[system.id], status: "normal" };
      });
      return { ...current, systems: next };
    });
  }

  const examined = EXAM_SYSTEMS.filter((system) => systems[system.id]?.status).length;

  return (
    <Stack gap="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
        <span className="text-[13px] text-slate-600">
          {examined} of {EXAM_SYSTEMS.length} systems documented
        </span>
        <button
          type="button"
          onClick={markAllNormal}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          <CheckCheck size={14} aria-hidden="true" /> Mark all systems normal
        </button>
      </div>

      {EXAM_SYSTEMS.map((system) => {
        const entry = systems[system.id] || { status: "", components: {} };
        const isNormal = entry.status === "normal";
        const hasFindings = entry.status === "findings";

        return (
          <div
            key={system.id}
            className={`rounded-xl border transition-colors ${
              isNormal ? "border-emerald-200 bg-emerald-50/40" : hasFindings ? "border-amber-200 bg-white" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-slate-900">{system.label}</span>
                  {isNormal && <StatusChip tone="ok">Normal</StatusChip>}
                  {hasFindings && <StatusChip tone="warning">Findings</StatusChip>}
                </div>
                <div className="mt-0.5 text-[12.5px] text-slate-500">{system.full}</div>
              </div>
              <SegmentedControl
                value={entry.status || ""}
                onChange={(value) => setStatus(system.id, value)}
                options={STATUS_OPTIONS}
              />
            </div>

            {hasFindings && (
              <div className="border-t border-slate-100 px-3.5 py-3.5">
                <Stack gap="gap-2.5">
                  {system.components.map((component) => {
                    const value = entry.components?.[component.id] || {};
                    return (
                      <div key={component.id} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <TextField
                            label={component.label}
                            placeholder={value.normal ? "Marked normal" : component.placeholder}
                            value={value.normal ? "" : value.text || ""}
                            disabled={Boolean(value.normal)}
                            onChange={(text) => setComponent(system.id, component.id, { text })}
                          />
                        </div>
                        <div className="shrink-0 pb-0.5">
                          <Chip
                            size="sm"
                            tone="ok"
                            active={Boolean(value.normal)}
                            onClick={() => setComponent(system.id, component.id, { normal: !value.normal })}
                          >
                            Normal
                          </Chip>
                        </div>
                      </div>
                    );
                  })}
                </Stack>
              </div>
            )}
          </div>
        );
      })}
    </Stack>
  );
}

export const EXAMINATION_ICON = Stethoscope;
