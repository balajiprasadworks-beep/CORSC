"use client";

/* =========================================================================
   Vitals.

   Entry stays compact; everything derivable is derived. Weight change is shown
   as an interpreted statement rather than a bare percentage, because the number
   alone does not tell the clinician what to do about it.
   ========================================================================= */

import { HeartPulse } from "lucide-react";

import { Callout, Grid, MetricTile, Panel, Stack, TextField } from "@/components/kit";
import { deriveVitals } from "@/lib/vitals";

export function VitalsSection({ patient, encounter, setEncounter }) {
  const vitals = encounter.vitals || {};
  const derived = deriveVitals(vitals, patient.baselineWeight);
  const set = (patch) => setEncounter((current) => ({ ...current, vitals: { ...current.vitals, ...patch } }));

  const reference = derived.referenceWeight;
  const bpValue = vitals.sbp && vitals.dbp ? `${vitals.sbp}/${vitals.dbp}` : null;

  return (
    <Stack gap="gap-4">
      <Panel title="Measurements">
        <Grid cols="sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Height" value={vitals.height} onChange={(v) => set({ height: v })} type="number" unit="cm" placeholder="170" />
          <TextField label="Weight" value={vitals.weight} onChange={(v) => set({ weight: v })} type="number" unit="kg" placeholder="72.4" />
          <TextField label="Systolic BP" value={vitals.sbp} onChange={(v) => set({ sbp: v })} type="number" unit="mmHg" placeholder="128" />
          <TextField label="Diastolic BP" value={vitals.dbp} onChange={(v) => set({ dbp: v })} type="number" unit="mmHg" placeholder="82" />
          <TextField label="Pulse" value={vitals.pulse} onChange={(v) => set({ pulse: v })} type="number" unit="bpm" placeholder="78" />
          <TextField label="Temperature" value={vitals.temp} onChange={(v) => set({ temp: v })} type="number" unit="°C" placeholder="36.9" />
          <TextField label="Respiratory rate" value={vitals.rr} onChange={(v) => set({ rr: v })} type="number" unit="/min" placeholder="16" />
          <TextField label="SpO₂" value={vitals.spo2} onChange={(v) => set({ spo2: v })} type="number" unit="%" placeholder="98" />
        </Grid>
      </Panel>

      <Panel title="Derived values" subtitle="Calculated from height and weight as you type">
        <Grid cols="sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="BMI"
            value={derived.bmi ?? "—"}
            unit="kg/m²"
            caption={derived.bmiCategory?.label || "Enter height and weight"}
            tone={derived.bmiCategory?.tone}
          />
          <MetricTile
            label="BSA (Mosteller)"
            value={derived.bsa ?? "—"}
            unit="m²"
            caption={derived.bsa ? "Use for dose recalculation" : "Enter height and weight"}
          />
          <MetricTile
            label="Blood pressure"
            value={bpValue ?? "—"}
            unit={bpValue ? "mmHg" : undefined}
            caption={derived.bp?.label || "Not recorded"}
            tone={derived.bp?.tone}
          />
          <MetricTile
            label="Oxygen saturation"
            value={vitals.spo2 || "—"}
            unit={vitals.spo2 ? "%" : undefined}
            caption={derived.spo2?.label || "Not recorded"}
            tone={derived.spo2?.tone}
          />
        </Grid>
      </Panel>

      <Panel
        title="Weight change"
        subtitle={reference ? `Compared with a reference weight of ${reference} kg` : "Set a reference weight to track loss"}
      >
        <Stack>
          <Grid cols="sm:grid-cols-2">
            <TextField
              label="Reference weight for this encounter"
              value={vitals.referenceWeight}
              onChange={(v) => set({ referenceWeight: v })}
              type="number"
              unit="kg"
              placeholder={patient.baselineWeight ? String(patient.baselineWeight) : "Pre-treatment weight"}
              hint={patient.baselineWeight ? `Registration baseline is ${patient.baselineWeight} kg; leave blank to use it.` : "Usually the pre-treatment weight."}
            />
            <MetricTile
              label="Weight change"
              value={derived.weightLossPercent === null ? "—" : `${derived.weightLossPercent > 0 ? "−" : derived.weightLossPercent < 0 ? "+" : ""}${Math.abs(derived.weightLossPercent)}`}
              unit={derived.weightLossPercent === null ? undefined : "%"}
              caption={derived.weightLoss?.label || "Reference weight not set"}
              tone={derived.weightLoss?.tone}
            />
          </Grid>
          {derived.weightLoss && derived.weightLoss.tone !== "ok" && (
            <Callout tone={derived.weightLoss.tone} title={derived.weightLoss.label}>
              {derived.weightLoss.detail}
              {derived.bsa && derived.weightLossPercent >= 5
                ? ` Current body surface area is ${derived.bsa} m²; confirm the next dose is calculated against it.`
                : ""}
            </Callout>
          )}
          {derived.pulse && derived.pulse.tone !== "ok" && (
            <Callout tone={derived.pulse.tone} title={derived.pulse.label}>
              Recorded pulse of {vitals.pulse} bpm. Correlate with symptoms, anaemia, fever, and the ECG before attributing it to therapy.
            </Callout>
          )}
        </Stack>
      </Panel>
    </Stack>
  );
}

export const VITALS_ICON = HeartPulse;
