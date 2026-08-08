"use client";

/* =========================================================================
   Follow-up planner.

   Organised around the patient journey rather than a list of dates. Each
   milestone expands into what the visit is for: clinical review, imaging,
   biomarkers, other investigations, medication review, and the findings that
   should trigger escalation before the next scheduled contact.
   ========================================================================= */

import { useMemo } from "react";
import { CalendarRange, AlertTriangle } from "lucide-react";

import {
  Callout,
  DateField,
  Disclosure,
  Grid,
  Panel,
  Stack,
  StatusChip,
  TextArea,
  mono,
} from "@/components/kit";
import { DRUG_DB, FOLLOW_UP_DAYS, primaryTherapy, riskStyle } from "@/lib/clinical-data";
import { investigationLabel, milestoneRequirements } from "@/lib/investigation-timeline";
import { num } from "@/lib/vitals";

const IMAGING_IDS = ["echo", "lvef", "gls"];
const BIOMARKER_IDS = ["troponin", "ntprobnp"];

const GENERIC_TRIGGERS = [
  "New or worsening breathlessness, orthopnoea or ankle swelling",
  "Chest pain, palpitations, presyncope or syncope",
  "Any troponin rise from the patient's own baseline",
  "LVEF fall of 10 points or more, or any fall below 50%",
  "GLS relative fall greater than 15% from baseline",
  "Blood pressure at or above 160/100 mmHg",
];

/** Days between cycles, parsed from the recorded frequency. */
function frequencyDays(cycleFrequency) {
  const match = String(cycleFrequency || "").match(/(\d+)\s*days/i);
  if (match) return Number(match[1]);
  if (/daily|continuous/i.test(cycleFrequency || "")) return 28;
  return 21;
}

function addDays(iso, days) {
  const base = new Date(`${iso || new Date().toISOString().slice(0, 10)}T12:00:00`);
  if (Number.isNaN(base.getTime())) return "";
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function FollowUpSection({ patient, encounter, setEncounter, picture }) {
  const { nextFollowUp, currentRisk } = picture;
  const styles = riskStyle(currentRisk);
  const therapy = primaryTherapy(patient.therapy);
  const drug = DRUG_DB[therapy];

  const milestones = useMemo(() => {
    const currentCycle = num(encounter.firstReview?.cycle) ?? num(encounter.cycle) ?? num(patient.cycle) ?? 0;
    const planned = num(patient.plannedCycles) || 0;
    const interval = frequencyDays(patient.cycleFrequency);
    const baseDate = encounter.date;
    const midCycle = planned ? Math.max(Math.ceil(planned / 2), currentCycle + 1) : currentCycle + 2;
    const cyclesToEnd = planned ? Math.max(planned - currentCycle, 1) : 3;
    const endDate = addDays(baseDate, interval * cyclesToEnd);

    const definitions = [
      {
        id: "today",
        label: "Today",
        caption: encounter.type || "This review",
        date: baseDate,
        milestone: { phase: currentCycle > 0 ? "cycle" : "baseline", cycle: currentCycle || null },
        review: ["Symptom review and cardiovascular examination", "Blood pressure, pulse and weight", "Confirm tolerance of the last cycle"],
      },
      {
        id: "next-cycle",
        label: "Next cycle",
        caption: `Cycle ${currentCycle + 1}`,
        date: nextFollowUp.date,
        milestone: { phase: "cycle", cycle: currentCycle + 1 },
        review: ["Pre-dose symptom screen", "Blood pressure and pulse before the infusion", "Confirm fitness to proceed"],
      },
      {
        id: "mid-treatment",
        label: "Mid-treatment",
        caption: planned ? `Around cycle ${midCycle} of ${planned}` : "Mid-course review",
        date: addDays(baseDate, interval * Math.max(midCycle - currentCycle, 1)),
        milestone: { phase: "cycle", cycle: midCycle },
        review: ["Cumulative dose review against the planned total", "Re-stratify cardiovascular risk", "Reassess cardioprotective therapy"],
      },
      {
        id: "end",
        label: "End of therapy",
        caption: planned ? `After cycle ${planned}` : "Treatment completion",
        date: endDate,
        milestone: { phase: "end", cycle: null },
        review: ["Full cardiovascular re-stratification", "Document total delivered dose", "Agree the survivorship surveillance plan"],
      },
      {
        id: "three",
        label: "3 months",
        caption: "Post-treatment surveillance",
        date: addDays(endDate, 90),
        milestone: { phase: "threeMonth", cycle: null },
        review: ["Symptom review for late-onset dysfunction", "Blood pressure and cardiovascular risk factors"],
      },
      {
        id: "six",
        label: "6 months",
        caption: "Post-treatment surveillance",
        date: addDays(endDate, 180),
        milestone: { phase: "sixMonth", cycle: null },
        review: ["Symptom review", "Cardiovascular risk-factor optimisation"],
      },
      {
        id: "twelve",
        label: "12 months",
        caption: "Survivorship review",
        date: addDays(endDate, 365),
        milestone: { phase: "twelveMonth", cycle: null },
        review: ["Annual cardiovascular review", "Decide whether long-term surveillance continues to three and five years"],
      },
    ];

    return definitions.map((definition) => {
      const requirements = milestoneRequirements(patient, definition.milestone);
      return {
        ...definition,
        imaging: requirements.filter((r) => IMAGING_IDS.includes(r.id)),
        biomarkers: requirements.filter((r) => BIOMARKER_IDS.includes(r.id)),
        other: requirements.filter((r) => !IMAGING_IDS.includes(r.id) && !BIOMARKER_IDS.includes(r.id)),
      };
    });
  }, [patient, encounter, nextFollowUp.date]);

  const triggers = [...GENERIC_TRIGGERS, ...(drug?.redFlags || [])].filter(
    (value, index, all) => all.indexOf(value) === index
  );

  return (
    <Stack gap="gap-4">
      <div className={`rounded-2xl border p-4 ${styles.bg} ${styles.border}`}>
        <div className="text-[11px] uppercase tracking-widest text-slate-500">Recommended next contact</div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900" style={mono}>{nextFollowUp.date}</span>
          <span className="text-[13px] text-slate-500">in {nextFollowUp.days} days</span>
        </div>
        <p className="mt-1 text-[13px] text-slate-600">
          Based on {nextFollowUp.reason}. The routine interval for {currentRisk.toLowerCase()} risk is {FOLLOW_UP_DAYS[currentRisk]} days.
        </p>
      </div>

      <Panel title="Patient journey" subtitle="Expand a milestone to see what that visit is for">
        <Stack gap="gap-2">
          {milestones.map((milestone) => {
            const total = milestone.imaging.length + milestone.biomarkers.length + milestone.other.length;
            return (
              <Disclosure
                key={milestone.id}
                title={milestone.label}
                subtitle={`${milestone.caption}${milestone.date ? ` · ${milestone.date}` : ""}`}
                defaultOpen={milestone.id === "today" || milestone.id === "next-cycle"}
                tone={milestone.id === "today" ? "info" : undefined}
                badge={total > 0 ? <StatusChip tone="neutral">{total} investigation{total === 1 ? "" : "s"}</StatusChip> : null}
              >
                <Stack gap="gap-3">
                  <MilestoneBlock title="Clinical review" items={milestone.review} tone="teal" />
                  {milestone.imaging.length > 0 && (
                    <MilestoneBlock title="Imaging due" items={milestone.imaging.map((r) => `${investigationLabel(r.id)} — ${r.reason}`)} tone="sky" />
                  )}
                  {milestone.biomarkers.length > 0 && (
                    <MilestoneBlock title="Biomarkers due" items={milestone.biomarkers.map((r) => `${investigationLabel(r.id)} — ${r.reason}`)} tone="amber" />
                  )}
                  {milestone.other.length > 0 && (
                    <MilestoneBlock title="Other investigations due" items={milestone.other.map((r) => `${investigationLabel(r.id)} — ${r.reason}`)} tone="slate" />
                  )}
                  <MilestoneBlock
                    title="Medication review"
                    items={[
                      "Confirm cardioprotective therapy is prescribed and titrated where indicated",
                      "Re-screen for QT-prolonging combinations and duplicate classes",
                      "Check adherence and tolerance of any new agent",
                    ]}
                    tone="indigo"
                  />
                </Stack>
              </Disclosure>
            );
          })}
        </Stack>
      </Panel>

      <Panel title="Escalation triggers" subtitle="Contact cardio-oncology before the next scheduled visit if any of these appear">
        <div className="space-y-1.5">
          {triggers.map((trigger) => (
            <div key={trigger} className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
              <span className="text-[13px] text-slate-700">{trigger}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Plan for this encounter">
        <Stack>
          <TextArea
            label="Management plan"
            rows={3}
            placeholder="Decisions taken, dose changes, referrals, patient advice"
            value={encounter.plan || ""}
            onChange={(value) => setEncounter((current) => ({ ...current, plan: value }))}
          />
          <Grid cols="sm:grid-cols-2">
            <DateField
              label="Next follow-up date"
              value={encounter.nextFollowUpDate || ""}
              onChange={(value) => setEncounter((current) => ({ ...current, nextFollowUpDate: value }))}
              hint={`Recommended: ${nextFollowUp.date}`}
            />
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setEncounter((current) => ({ ...current, nextFollowUpDate: nextFollowUp.date }))}
                className="w-full rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-[13px] font-semibold text-teal-700 transition hover:bg-teal-100"
              >
                Use recommended date
              </button>
            </div>
          </Grid>
        </Stack>
      </Panel>

      {!encounter.nextFollowUpDate && (
        <Callout tone="warning" title="No follow-up date set">
          Set the next follow-up date before completing this encounter so the surveillance schedule stays continuous.
        </Callout>
      )}
    </Stack>
  );
}

const BLOCK_TONES = {
  teal: "border-teal-100 bg-teal-50/50",
  sky: "border-sky-100 bg-sky-50/50",
  amber: "border-amber-100 bg-amber-50/50",
  indigo: "border-indigo-100 bg-indigo-50/50",
  slate: "border-slate-200 bg-slate-50/60",
};

function MilestoneBlock({ title, items, tone: toneName = "slate" }) {
  return (
    <div className={`rounded-xl border p-3 ${BLOCK_TONES[toneName]}`}>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</div>
      <ul className="space-y-1 pl-4 text-[13px] leading-relaxed text-slate-700">
        {items.map((item) => <li key={item} className="list-disc">{item}</li>)}
      </ul>
    </div>
  );
}

export const FOLLOW_UP_ICON = CalendarRange;
