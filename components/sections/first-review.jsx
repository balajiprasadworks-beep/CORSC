"use client";

/* =========================================================================
   First OPD review.

   The cycle tracker lives here rather than on a separate administrative page,
   so the first thing the clinician does after registration is state where the
   patient is in treatment and how the last cycle went.
   ========================================================================= */

import { AlertTriangle, CalendarDays } from "lucide-react";

import {
  Callout,
  Chip,
  CyclePills,
  DateField,
  Field,
  Grid,
  Panel,
  Stack,
  Stepper,
  TextArea,
  mono,
} from "@/components/kit";
import { AnthracyclineLedger } from "@/components/anthracycline-ledger";
import { NoteExtractionPanel } from "@/components/ai-note-tools";
import { FIRST_REVIEW_FIELDS, SYMPTOMS, TOLERANCE_OPTIONS } from "@/lib/clinical-data";
import { therapyList } from "@/lib/hfa-icos";
import { num } from "@/lib/vitals";

const VISIT_TYPES = [
  { value: "Baseline", label: "Baseline" },
  { value: "cycle", label: "Treatment cycle" },
  { value: "End of treatment", label: "End of treatment" },
  { value: "3 months post-treatment", label: "3 months" },
  { value: "6 months post-treatment", label: "6 months" },
  { value: "12 months post-treatment", label: "12 months" },
];

const TOLERANCE_TONE = {
  "Well tolerated": "ok",
  "Minor toxicity": "warning",
  "Significant toxicity": "danger",
  "Treatment delayed": "warning",
  "Treatment stopped": "danger",
};

export function FirstReviewSection({ patient, setPatient, encounter, setEncounter }) {
  const isCycleVisit = /^(cycle|dose)/i.test(encounter.type || "");
  const onAnthracycline = therapyList(patient.therapy).includes("anthracycline");
  const cycle = encounter.firstReview?.cycle ?? encounter.cycle ?? "";
  const plannedCycles = num(patient.plannedCycles);

  const setReview = (patch) =>
    setEncounter((current) => ({ ...current, firstReview: { ...current.firstReview, ...patch } }));

  function setVisitType(value) {
    setEncounter((current) => {
      if (value === "cycle") {
        const next = num(current.firstReview?.cycle) || (num(patient.cycle) || 0) + 1 || 1;
        return { ...current, type: `Cycle ${next}`, cycle: next, firstReview: { ...current.firstReview, cycle: String(next) } };
      }
      return { ...current, type: value, cycle: null };
    });
  }

  function setCycle(value) {
    const parsed = value === "" ? null : Number(value);
    setEncounter((current) => ({
      ...current,
      cycle: parsed,
      type: parsed ? `Cycle ${parsed}` : current.type,
      firstReview: { ...current.firstReview, cycle: value },
    }));
  }

  function toggleNewSymptom(symptom) {
    setEncounter((current) => {
      const existing = current.symptoms || [];
      const symptoms = existing.includes(symptom)
        ? existing.filter((s) => s !== symptom)
        : [...existing, symptom];
      return { ...current, symptoms };
    });
  }

  const toleranceTone = TOLERANCE_TONE[encounter.firstReview?.tolerance];

  return (
    <Stack gap="gap-4">
      <NoteExtractionPanel patientId={patient.id} setEncounter={setEncounter} />

      <Panel title="Where is the patient in treatment?" subtitle="Sets the surveillance protocol for this encounter">
        <Stack>
          <Field label="Visit type">
            <div className="flex flex-wrap gap-2">
              {VISIT_TYPES.map((option) => (
                <Chip
                  key={option.value}
                  active={option.value === "cycle" ? isCycleVisit : encounter.type === option.value}
                  onClick={() => setVisitType(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </Field>

          {isCycleVisit && (
            <>
              <Field
                label="Current chemotherapy cycle"
                hint={plannedCycles ? `Cycle ${cycle || "—"} of ${plannedCycles} planned.` : "Set the planned cycle count in registration to show the full course."}
              >
                <CyclePills value={cycle} total={plannedCycles} onChange={setCycle} />
              </Field>
              <Grid>
                <Stepper label="Adjust cycle" value={cycle} onChange={setCycle} min={1} max={24} />
                <DateField label="Review date" value={encounter.date} onChange={(v) => setEncounter((c) => ({ ...c, date: v }))} />
              </Grid>
            </>
          )}
          {!isCycleVisit && <DateField label="Review date" value={encounter.date} onChange={(v) => setEncounter((c) => ({ ...c, date: v }))} />}
        </Stack>
      </Panel>

      {onAnthracycline && (
        <AnthracyclineLedger patient={patient} setPatient={setPatient} cycle={cycle} date={encounter.date} />
      )}

      <Panel title="Treatment tolerance" subtitle="How the patient has coped since the last contact">
        <div className="flex flex-wrap gap-2">
          {TOLERANCE_OPTIONS.map((option) => (
            <Chip
              key={option}
              active={encounter.firstReview?.tolerance === option}
              onClick={() => setReview({ tolerance: encounter.firstReview?.tolerance === option ? "" : option })}
              tone={TOLERANCE_TONE[option]}
            >
              {option}
            </Chip>
          ))}
        </div>
        {toleranceTone && toleranceTone !== "ok" && (
          <div className="mt-3">
            <Callout tone={toleranceTone} title="Tolerance flagged" icon={AlertTriangle}>
              Document what happened in the interim events and early toxicity fields below. Poor tolerance shortens the interval to the
              next surveillance contact.
            </Callout>
          </div>
        )}
      </Panel>

      <Panel title="New symptoms since last contact" subtitle="Selected symptoms open for detail in the symptoms section">
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              size="sm"
              active={(encounter.symptoms || []).includes(symptom)}
              onClick={() => toggleNewSymptom(symptom)}
            >
              {symptom}
            </Chip>
          ))}
        </div>
      </Panel>

      <Panel title="Interim clinical events">
        <Stack>
          {FIRST_REVIEW_FIELDS.map((field) => (
            <TextArea
              key={field.id}
              label={field.label}
              placeholder={field.placeholder}
              rows={2}
              value={encounter.firstReview?.[field.id] || ""}
              onChange={(v) => setReview({ [field.id]: v })}
            />
          ))}
        </Stack>
      </Panel>

      {patient.visits?.length > 0 && (
        <Panel title="Previous encounters" subtitle="Most recent first">
          <div className="space-y-1.5">
            {patient.visits.slice(-4).reverse().map((visit) => (
              <div key={visit.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <span className="truncate text-[13px] font-medium text-slate-700">{visit.type}</span>
                <span className="shrink-0 text-[12px] text-slate-400" style={mono}>{visit.date}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </Stack>
  );
}

export const FIRST_REVIEW_ICON = CalendarDays;
