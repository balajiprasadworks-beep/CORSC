"use client";

/* =========================================================================
   Medication review.

   More than a list: the section decides whether cardioprotective therapy is
   indicated at this point in treatment, states the finding that triggered each
   suggestion, and flags QT stacking, duplication and interaction risk.
   ========================================================================= */

import { useState } from "react";
import { AlertTriangle, Info, Pill, Plus, ShieldCheck, Trash2 } from "lucide-react";

import {
  Callout,
  Chip,
  EmptyState,
  Grid,
  Panel,
  SelectField,
  Stack,
  StatusChip,
  TextArea,
  TextField,
  mono,
} from "@/components/kit";
import { MED_CLASSES, classifyDrug, medClassLabel } from "@/lib/medication-engine";
import { todayISO, uid } from "@/lib/patient-model";

const WARNING_ICON = { danger: AlertTriangle, warning: AlertTriangle, info: Info };

function AddMedication({ onAdd }) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [klass, setKlass] = useState("");

  const suggested = name ? classifyDrug(name) : "";
  const resolved = klass || suggested;

  function submit() {
    if (!name.trim()) return;
    onAdd({ id: uid("m"), name: name.trim(), dose: dose.trim(), klass: resolved || "other" });
    setName("");
    setDose("");
    setKlass("");
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3">
      <Grid cols="sm:grid-cols-3">
        <TextField label="Medicine" value={name} onChange={setName} placeholder="e.g. Bisoprolol" />
        <TextField label="Dose and frequency" value={dose} onChange={setDose} placeholder="e.g. 2.5 mg once daily" />
        <SelectField
          label="Class"
          value={resolved}
          onChange={setKlass}
          options={MED_CLASSES.map((c) => c.label)}
          placeholder={suggested ? `Detected: ${medClassLabel(suggested)}` : "Select class"}
        />
      </Grid>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Plus size={14} aria-hidden="true" /> Add to list
        </button>
        {suggested && suggested !== "other" && !klass && (
          <span className="text-[12px] text-slate-500">Classified automatically as {medClassLabel(suggested).toLowerCase()}.</span>
        )}
      </div>
    </div>
  );
}

export function MedicationSection({ patient, setPatient, encounter, setEncounter, picture }) {
  const medications = patient.medications || [];
  const { recommendations, warnings } = picture;

  function addMedication(medication) {
    const klassId = MED_CLASSES.find((c) => c.label === medication.klass)?.id || medication.klass;
    setPatient((current) => ({
      ...current,
      medications: [...(current.medications || []), { ...medication, klass: klassId }],
      medicationLog: [
        ...(current.medicationLog || []),
        { id: uid("log"), date: encounter.date || todayISO(), action: "added", name: medication.name, klassLabel: medClassLabel(klassId) },
      ],
    }));
  }

  function removeMedication(medication) {
    setPatient((current) => ({
      ...current,
      medications: (current.medications || []).filter((m) => m.id !== medication.id),
      medicationLog: [
        ...(current.medicationLog || []),
        { id: uid("log"), date: encounter.date || todayISO(), action: "removed", name: medication.name, klassLabel: medClassLabel(medication.klass) },
      ],
    }));
  }

  function setDecision(recommendationId, decision) {
    setEncounter((current) => ({
      ...current,
      medDecisions: {
        ...current.medDecisions,
        [recommendationId]: current.medDecisions?.[recommendationId] === decision ? "" : decision,
      },
    }));
  }

  const indicated = recommendations.filter((r) => r.strength === "Indicated" && !r.onTreatment);

  return (
    <Stack gap="gap-4">
      {indicated.length > 0 && (
        <Callout tone="danger" title={`${indicated.length} cardioprotective therap${indicated.length === 1 ? "y is" : "ies are"} indicated but not prescribed`} icon={ShieldCheck}>
          {indicated.map((r) => r.title).join(", ")}. Each recommendation below states the finding that triggered it.
        </Callout>
      )}

      <Panel title="Current medication" subtitle="Carried forward between visits and reviewed each encounter">
        <Stack>
          {medications.length === 0 ? (
            <EmptyState>No medicines recorded yet.</EmptyState>
          ) : (
            <div className="space-y-1.5">
              {medications.map((medication) => (
                <div key={medication.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-semibold text-slate-900">{medication.name}</span>
                      <StatusChip tone="neutral">{medClassLabel(medication.klass)}</StatusChip>
                    </div>
                    {medication.dose && <div className="mt-0.5 text-[12.5px] text-slate-500" style={mono}>{medication.dose}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(medication)}
                    aria-label={`Remove ${medication.name}`}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <AddMedication onAdd={addMedication} />
        </Stack>
      </Panel>

      <Panel title="Cardioprotective therapy analysis" subtitle="Assessed against this patient's therapy, risk category and current findings">
        {recommendations.length === 0 ? (
          <EmptyState>No cardioprotective therapy is triggered by the current findings.</EmptyState>
        ) : (
          <Stack gap="gap-2.5">
            {recommendations.map((recommendation) => {
              const decision = encounter.medDecisions?.[recommendation.id] || "";
              const toneName = recommendation.onTreatment ? "ok" : recommendation.strength === "Indicated" ? "danger" : "warning";
              return (
                <div
                  key={recommendation.id}
                  className={`rounded-xl border p-3.5 ${
                    recommendation.onTreatment ? "border-emerald-200 bg-emerald-50/40" : recommendation.strength === "Indicated" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/30"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-slate-900">{recommendation.title}</span>
                      <StatusChip tone={toneName}>
                        {recommendation.onTreatment ? "Already prescribed" : recommendation.strength}
                      </StatusChip>
                    </div>
                    {recommendation.current && <span className="text-[12px] text-emerald-700">{recommendation.current}</span>}
                  </div>

                  <div className="text-[12.5px] font-medium uppercase tracking-wide text-slate-400">Why this is showing</div>
                  <ul className="mt-1 space-y-1 pl-4 text-[13px] leading-relaxed text-slate-600">
                    {recommendation.reasons.map((reason) => (
                      <li key={reason} className="list-disc">{reason}</li>
                    ))}
                  </ul>

                  <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{recommendation.guidance}</p>

                  {!recommendation.onTreatment && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip size="sm" tone="ok" active={decision === "accepted"} onClick={() => setDecision(recommendation.id, "accepted")}>
                        Starting this
                      </Chip>
                      <Chip size="sm" tone="warning" active={decision === "deferred"} onClick={() => setDecision(recommendation.id, "deferred")}>
                        Deferred
                      </Chip>
                      <Chip size="sm" tone="neutral" active={decision === "declined"} onClick={() => setDecision(recommendation.id, "declined")}>
                        Not appropriate
                      </Chip>
                    </div>
                  )}
                </div>
              );
            })}
          </Stack>
        )}
      </Panel>

      <Panel title="Safety review" subtitle="Interaction, duplication and QT screening across the full list">
        {warnings.length === 0 ? (
          <Callout tone="ok" title="No medication safety concerns detected">
            The current list shows no duplicate classes, QT-prolonging combinations or interaction risks against this therapy.
          </Callout>
        ) : (
          <Stack gap="gap-2">
            {warnings.map((warning) => {
              const Icon = WARNING_ICON[warning.level] || Info;
              return (
                <Callout key={warning.id} tone={warning.level} title={warning.title} icon={Icon}>
                  <span className="block">{warning.detail}</span>
                  <span className="mt-1 block text-[12px] italic text-slate-500">{warning.why}</span>
                </Callout>
              );
            })}
          </Stack>
        )}
      </Panel>

      <Panel title="Review note">
        <TextArea
          label="Medication review documentation"
          rows={3}
          placeholder="Changes made this visit, counselling given, adherence, monitoring arranged"
          value={encounter.medReview || ""}
          onChange={(value) => setEncounter((current) => ({ ...current, medReview: value }))}
        />
      </Panel>
    </Stack>
  );
}

export const MEDICATION_ICON = Pill;
