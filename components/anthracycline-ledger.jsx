"use client";

/* =========================================================================
   Cumulative anthracycline exposure.

   Recorded where the cycle is recorded, because the dose given is part of
   saying which cycle this is. The running total is in doxorubicin equivalents
   so mixed and sequential regimens accumulate onto one scale.
   ========================================================================= */

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  Callout,
  EmptyState,
  Grid,
  MetricTile,
  Panel,
  SelectField,
  Stack,
  StatusChip,
  TextField,
  mono,
} from "@/components/kit";
import { ANTHRACYCLINE_AGENTS, anthracyclineLedger } from "@/lib/anthracycline";
import { uid } from "@/lib/patient-model";

function AddDose({ defaultCycle, defaultDate, onAdd }) {
  const [agent, setAgent] = useState("Doxorubicin");
  const [dose, setDose] = useState("");

  function submit() {
    const agentId = ANTHRACYCLINE_AGENTS.find((item) => item.label === agent)?.id;
    if (!agentId || !dose.trim()) return;
    onAdd({ id: uid("dose"), agent: agentId, dose: dose.trim(), cycle: defaultCycle, date: defaultDate });
    setDose("");
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3">
      <Grid cols="sm:grid-cols-2">
        <SelectField
          label="Agent"
          value={agent}
          onChange={setAgent}
          options={ANTHRACYCLINE_AGENTS.map((item) => item.label)}
          placeholder="Select agent"
        />
        <TextField
          label="Dose given this cycle"
          value={dose}
          onChange={setDose}
          type="number"
          unit="mg/m²"
          placeholder="60"
        />
      </Grid>
      <button
        type="button"
        onClick={submit}
        disabled={!dose.trim()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Plus size={14} aria-hidden="true" /> Record dose
      </button>
    </div>
  );
}

export function AnthracyclineLedger({ patient, setPatient, cycle, date }) {
  const ledger = anthracyclineLedger(patient);
  const { assessment } = ledger;

  function addDose(entry) {
    setPatient((current) => ({
      ...current,
      anthracyclineDoses: [...(current.anthracyclineDoses || []), entry],
    }));
  }

  function removeDose(id) {
    setPatient((current) => ({
      ...current,
      anthracyclineDoses: (current.anthracyclineDoses || []).filter((entry) => entry.id !== id),
    }));
  }

  return (
    <Panel
      title="Cumulative anthracycline exposure"
      subtitle="Delivered dose, converted to doxorubicin equivalents"
      right={<StatusChip tone={assessment.tone}>{assessment.total} mg/m²</StatusChip>}
    >
      <Stack>
        <Grid cols="sm:grid-cols-3">
          <MetricTile
            label="Cumulative"
            value={assessment.total}
            unit="mg/m²"
            caption={assessment.reached ? `${assessment.reached.label} passed` : "Doxorubicin-equivalent"}
            tone={assessment.tone}
          />
          <MetricTile
            label="Given before registration"
            value={ledger.prior || "—"}
            unit={ledger.prior ? "mg/m²" : undefined}
            caption={ledger.prior ? "From prior treatment history" : "None recorded"}
          />
          <MetricTile
            label="Next threshold"
            value={assessment.next?.at ?? "—"}
            unit={assessment.next ? "mg/m²" : undefined}
            caption={assessment.next ? assessment.next.label : "All thresholds passed"}
          />
        </Grid>

        {assessment.guidance && (
          <Callout tone={assessment.tone} title={assessment.reached ? assessment.reached.label : "Approaching a threshold"}>
            {assessment.guidance}
          </Callout>
        )}

        {ledger.entries.length === 0 ? (
          <EmptyState>No anthracycline doses recorded yet.</EmptyState>
        ) : (
          <div className="space-y-1.5">
            {ledger.entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-slate-900">{entry.agentLabel}</span>
                    {entry.cycle && <StatusChip tone="neutral">Cycle {entry.cycle}</StatusChip>}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-slate-500" style={mono}>
                    {entry.dose} mg/m²
                    {entry.factor !== 1 ? ` × ${entry.factor} = ${entry.equivalent}` : ""} · running total {entry.runningTotal} mg/m²
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDose(entry.id)}
                  aria-label={`Remove ${entry.agentLabel} dose`}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <AddDose defaultCycle={cycle} defaultDate={date} onAdd={addDose} />
      </Stack>
    </Panel>
  );
}
