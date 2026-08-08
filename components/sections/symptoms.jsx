"use client";

/* =========================================================================
   Symptoms.

   Selecting a symptom immediately opens its detail block directly underneath,
   so characterisation happens in place. Nothing is shown for symptoms that were
   not selected.
   ========================================================================= */

import { ClipboardList, AlertTriangle } from "lucide-react";

import {
  Callout,
  Chip,
  EmptyState,
  Grid,
  Panel,
  SegmentedControl,
  Stack,
  StatusChip,
  TextArea,
  TextField,
} from "@/components/kit";
import { RED_FLAG_SYMPTOMS, SEVERITY_OPTIONS, SYMPTOMS, SYMPTOM_DETAIL_FIELDS } from "@/lib/clinical-data";

const SEVERITY_TONE = { Mild: "ok", Moderate: "warning", Severe: "danger" };

export function SymptomsSection({ encounter, setEncounter }) {
  const selected = encounter.symptoms || [];

  function toggle(symptom) {
    setEncounter((current) => {
      const existing = current.symptoms || [];
      const symptoms = existing.includes(symptom)
        ? existing.filter((s) => s !== symptom)
        : [...existing, symptom];
      return { ...current, symptoms };
    });
  }

  function setDetail(symptom, patch) {
    setEncounter((current) => ({
      ...current,
      symptomDetail: {
        ...current.symptomDetail,
        [symptom]: { ...(current.symptomDetail?.[symptom] || {}), ...patch },
      },
    }));
  }

  const redFlagsPresent = selected.filter((s) => RED_FLAG_SYMPTOMS.includes(s));

  return (
    <Stack gap="gap-4">
      <Panel title="Symptom screen" subtitle="Tap to select. Detail opens underneath each selected symptom.">
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOMS.map((symptom) => (
            <Chip key={symptom} size="sm" active={selected.includes(symptom)} onClick={() => toggle(symptom)}>
              {symptom}
            </Chip>
          ))}
        </div>
      </Panel>

      {redFlagsPresent.length > 0 && (
        <Callout tone="danger" title="Cardiovascular red-flag symptoms present" icon={AlertTriangle}>
          {redFlagsPresent.join(", ")} require focused cardiovascular examination, an ECG and troponin at this visit, and shorten the
          interval to the next surveillance contact.
        </Callout>
      )}

      {selected.length === 0 ? (
        <EmptyState>No symptoms selected. Symptom detail fields stay hidden until one is chosen.</EmptyState>
      ) : (
        <Stack gap="gap-2.5">
          {selected.map((symptom) => {
            const detail = encounter.symptomDetail?.[symptom] || {};
            const isRedFlag = RED_FLAG_SYMPTOMS.includes(symptom);
            return (
              <div
                key={symptom}
                className={`rounded-xl border p-3.5 ${isRedFlag ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"}`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-slate-900">{symptom}</span>
                    {isRedFlag && <StatusChip tone="danger">Red flag</StatusChip>}
                  </div>
                  <SegmentedControl
                    size="sm"
                    value={detail.severity || ""}
                    onChange={(value) => setDetail(symptom, { severity: value })}
                    options={SEVERITY_OPTIONS.map((option) => ({
                      value: option,
                      label: option,
                      tone: SEVERITY_TONE[option],
                      clearable: true,
                    }))}
                  />
                </div>
                <Grid cols="sm:grid-cols-2">
                  {SYMPTOM_DETAIL_FIELDS.map((field) => (
                    <TextField
                      key={field.id}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={detail[field.id] || ""}
                      onChange={(value) => setDetail(symptom, { [field.id]: value })}
                    />
                  ))}
                </Grid>
                <div className="mt-3">
                  <TextArea
                    label="Explanation"
                    rows={2}
                    placeholder="Free text — character, course, relieving factors, patient words"
                    value={detail.notes || ""}
                    onChange={(value) => setDetail(symptom, { notes: value })}
                  />
                </div>
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

export const SYMPTOMS_ICON = ClipboardList;
