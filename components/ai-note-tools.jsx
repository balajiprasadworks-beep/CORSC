"use client";

/* =========================================================================
   AI note tools.

   Two features, both a deliberate, clearly-labelled exception to "generated
   locally in this browser" (lib/ai-summary.js): pasted note text, or the
   already-computed local narrative, is sent to the configured AI provider on
   an explicit clinician action. Nothing here is applied to the record
   automatically — extraction offers each field for the clinician to accept,
   and the draft note is only ever a starting point in an editable textarea.
   ========================================================================= */

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Callout, Chip, Panel, Stack, TextArea } from "@/components/kit";
import { apiFetch, ApiRequestError } from "@/lib/client/api-client";

const VITAL_LABELS = { sbp: "Systolic BP", dbp: "Diastolic BP", pulse: "Pulse", weight: "Weight", temp: "Temp", spo2: "SpO₂", rr: "Resp. rate" };
const VITAL_UNITS = { sbp: "mmHg", dbp: "mmHg", pulse: "bpm", weight: "kg", temp: "°C", spo2: "%", rr: "/min" };
const INV_LABELS = { lvef: "LVEF", gls: "GLS", troponin: "Troponin", ntprobnp: "NT-proBNP" };

function aiUnavailableMessage(err) {
  if (err instanceof ApiRequestError && err.status === 503) return "AI note tools are not configured on this deployment.";
  if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) {
    return "This patient needs to be saved to the server before AI tools can be used.";
  }
  return "Could not reach the AI provider. Try again.";
}

/** Paste a note, extract only what it explicitly states, accept field by field. */
export function NoteExtractionPanel({ patientId, setEncounter }) {
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [accepted, setAccepted] = useState({});

  async function extract() {
    const text = noteText.trim();
    if (!text) return;
    setLoading(true);
    setError("");
    setExtracted(null);
    try {
      const result = await apiFetch(`/api/patients/${patientId}/ai/extract-note`, {
        method: "POST",
        body: { noteText: text },
      });
      setExtracted(result.extracted);
      const initial = {};
      (result.extracted.symptoms || []).forEach((symptom) => { initial[`symptom:${symptom}`] = true; });
      Object.keys(result.extracted.vitals || {}).forEach((key) => { initial[`vitals:${key}`] = true; });
      Object.keys(result.extracted.investigations || {}).forEach((key) => { initial[`inv:${key}`] = true; });
      setAccepted(initial);
    } catch (err) {
      setError(aiUnavailableMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function toggle(key) {
    setAccepted((current) => ({ ...current, [key]: !current[key] }));
  }

  function applyAccepted() {
    if (!extracted) return;
    setEncounter((current) => {
      const symptoms = new Set(current.symptoms || []);
      (extracted.symptoms || []).forEach((symptom) => {
        if (accepted[`symptom:${symptom}`]) symptoms.add(symptom);
      });

      const vitals = { ...current.vitals };
      Object.entries(extracted.vitals || {}).forEach(([key, value]) => {
        if (accepted[`vitals:${key}`]) vitals[key] = String(value);
      });

      const inv = { ...current.inv };
      Object.entries(extracted.investigations || {}).forEach(([key, value]) => {
        if (accepted[`inv:${key}`]) {
          inv[key] = { ...(inv[key] || { result: "", interp: "", date: "", comment: "" }), result: String(value) };
        }
      });

      return {
        ...current,
        symptoms: Array.from(symptoms),
        symptomsScreenComplete: symptoms.size > 0 ? true : current.symptomsScreenComplete,
        vitals,
        inv,
      };
    });
    setNoteText("");
    setExtracted(null);
    setAccepted({});
  }

  const hasSuggestions =
    extracted &&
    ((extracted.symptoms || []).length > 0 ||
      Object.keys(extracted.vitals || {}).length > 0 ||
      Object.keys(extracted.investigations || {}).length > 0 ||
      (extracted.medications || []).length > 0 ||
      extracted.notes);

  return (
    <Panel
      title="Extract from a pasted note"
      subtitle="Paste a referral letter or prior note. Sent to the configured AI provider on this action only — nothing is applied to the record until you approve it below."
    >
      <Stack gap="gap-2.5">
        <TextArea label="Note text" rows={5} placeholder="Paste clinical note text here" value={noteText} onChange={setNoteText} />
        <button
          type="button"
          onClick={extract}
          disabled={loading || !noteText.trim()}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={14} aria-hidden="true" />
          {loading ? "Extracting…" : "Extract fields"}
        </button>

        {error && <Callout tone="danger">{error}</Callout>}
        {extracted && !hasSuggestions && <Callout tone="neutral">Nothing in this note matched a structured field.</Callout>}

        {hasSuggestions && (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 text-[12px] font-semibold text-slate-600">Found in the note — tap to include, then apply</div>
            <div className="flex flex-wrap gap-1.5">
              {(extracted.symptoms || []).map((symptom) => (
                <Chip key={`symptom:${symptom}`} size="sm" active={Boolean(accepted[`symptom:${symptom}`])} onClick={() => toggle(`symptom:${symptom}`)}>
                  {symptom}
                </Chip>
              ))}
              {Object.entries(extracted.vitals || {}).map(([key, value]) => (
                <Chip key={`vitals:${key}`} size="sm" active={Boolean(accepted[`vitals:${key}`])} onClick={() => toggle(`vitals:${key}`)}>
                  {VITAL_LABELS[key] || key}: {value}
                  {VITAL_UNITS[key] || ""}
                </Chip>
              ))}
              {Object.entries(extracted.investigations || {}).map(([key, value]) => (
                <Chip key={`inv:${key}`} size="sm" active={Boolean(accepted[`inv:${key}`])} onClick={() => toggle(`inv:${key}`)}>
                  {INV_LABELS[key] || key}: {value}
                </Chip>
              ))}
            </div>
            {(extracted.medications || []).length > 0 && (
              <p className="mt-2 text-[12px] text-slate-500">
                Medications mentioned: {extracted.medications.join(", ")} — add these in the medication section.
              </p>
            )}
            {extracted.notes && <p className="mt-2 text-[12px] text-slate-500">Also noted: {extracted.notes}</p>}
            <button
              type="button"
              onClick={applyAccepted}
              className="mt-3 rounded-xl bg-teal-700 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-800"
            >
              Apply selected to this encounter
            </button>
          </div>
        )}
      </Stack>
    </Panel>
  );
}

/** Drafts a prose visit note from what has already been recorded, into the caller's textarea. */
export function DraftNoteButton({ patientId, context, onDraft }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function draft() {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch(`/api/patients/${patientId}/ai/draft-note`, {
        method: "POST",
        body: { context },
      });
      onDraft(result.draft);
    } catch (err) {
      setError(aiUnavailableMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={draft}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[12px] font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles size={13} aria-hidden="true" />
        {loading ? "Drafting…" : "Draft with AI"}
      </button>
      {error && <p className="mt-1.5 text-[11.5px] text-red-600">{error}</p>}
    </div>
  );
}
