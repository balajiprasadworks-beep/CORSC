"use client";

/* =========================================================================
   Risk assessment.

   Same HFA-ICOS logic as before, presented as a clinical interpretation: the
   category, the reason for it, the factors that contributed, the baseline data
   still missing, and the monitoring plan that follows from it.
   ========================================================================= */

import { ShieldAlert, TrendingDown } from "lucide-react";

import {
  Callout,
  Checkbox,
  EmptyState,
  Grid,
  Panel,
  RiskBar,
  Stack,
  StatusChip,
  TextField,
  serif,
} from "@/components/kit";
import { RISK_MONITORING_PLAN, riskStyle, therapyNames } from "@/lib/clinical-data";
import { HF_STATUS_OPTIONS } from "@/lib/ctrcd";

const BASELINE_REQUIREMENTS = [
  { id: "baselineLVEF", label: "Baseline LVEF", get: (p) => p.baselineLVEF, why: "Every later ejection-fraction comparison is made against it." },
  { id: "plannedCycles", label: "Planned cycle count", get: (p) => p.plannedCycles, why: "Sets the treatment timeline and surveillance milestones." },
  { id: "totalPlannedDose", label: "Total planned dose", get: (p) => p.totalPlannedDose, why: "Cumulative anthracycline exposure drives dose-dependent risk." },
  { id: "baselineWeight", label: "Baseline weight", get: (p) => p.baselineWeight, why: "Reference point for weight-loss and body-surface-area recalculation." },
  { id: "age", label: "Age", get: (p) => p.age, why: "Age bands contribute directly to the HFA-ICOS score." },
];

export function RiskSection({ patient, setPatient, encounter, setEncounter, picture }) {
  const { currentRisk, riskEscalation, signals, riskAssessment, ctrcd } = picture;
  const baseline = riskAssessment;
  const baselineStyles = riskStyle(baseline.category);
  const currentStyles = riskStyle(currentRisk);
  const contributing = riskAssessment.contributing;

  const missingBaseline = BASELINE_REQUIREMENTS.filter((requirement) => {
    const value = requirement.get(patient);
    return value === null || value === undefined || String(value).trim() === "";
  });

  const restrat = patient.restratification || {};
  function setRestrat(field, value) {
    setPatient((current) => ({ ...current, restratification: { ...current.restratification, [field]: value } }));
  }

  const escalationSignals = [
    signals.elevatedTroponin && "Troponin elevated above baseline",
    signals.glsDrop && "GLS relative fall greater than 15%",
    signals.lvefDecline && "LVEF fall of at least 10 points to below 50%",
    signals.qtProlongation && "QTc at or above 500 ms",
    signals.currentCardiacSymptoms.length > 0 && `Cardiac symptoms present: ${signals.currentCardiacSymptoms.join(", ")}`,
    signals.clinicalDeterioration && `Clinical status recorded as ${patient.clinicalStatus}`,
  ].filter(Boolean);

  return (
    <Stack gap="gap-4">
      <Grid cols="sm:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${baselineStyles.bg} ${baselineStyles.border}`}>
          <div className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">Baseline HFA-ICOS</div>
          <div className={`text-3xl font-bold ${baselineStyles.text}`} style={serif}>{baseline.category}</div>
          <div className="mb-3 mt-0.5 text-[13px] text-slate-500">{baseline.reason} · {baseline.points} points</div>
          <RiskBar category={baseline.category} styles={baselineStyles} />
        </div>
        <div className={`rounded-2xl border p-4 ${currentStyles.bg} ${currentStyles.border}`}>
          <div className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">Current risk status</div>
          <div className={`text-3xl font-bold ${currentStyles.text}`} style={serif}>{currentRisk}</div>
          <div className="mb-3 mt-0.5 text-[13px] text-slate-500">
            {riskEscalation ? `Escalated: ${riskEscalation}` : "Unchanged from baseline"}
          </div>
          <RiskBar category={currentRisk} styles={currentStyles} />
        </div>
      </Grid>

      <Panel
        title="Graded cardiac dysfunction"
        subtitle="ESC 2022 grading across both the severity and symptom axes"
      >
        <Stack gap="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-semibold text-slate-900" style={serif}>{ctrcd.label}</span>
            <StatusChip tone={ctrcd.tone}>{ctrcd.symptomatic ? "Symptomatic" : "Asymptomatic"}</StatusChip>
          </div>
          {ctrcd.criteria.length > 0 ? (
            <ul className="space-y-1 pl-4">
              {ctrcd.criteria.map((criterion) => (
                <li key={criterion} className="list-disc text-[13px] leading-relaxed text-slate-600">{criterion}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-slate-500">
              No ejection fraction, strain or biomarker change meeting any dysfunction criterion has been recorded.
            </p>
          )}
          {ctrcd.management.length > 0 && (
            <Callout tone={ctrcd.tone} title="What follows from this grade">
              <ul className="space-y-1 pl-4">
                {ctrcd.management.map((item) => <li key={item} className="list-disc">{item}</li>)}
              </ul>
            </Callout>
          )}
        </Stack>
      </Panel>

      <Panel title="Why this patient is in this category">
        <Stack gap="gap-2">
          <p className="text-[13.5px] leading-relaxed text-slate-700">
            {baseline.category === "Low"
              ? "No very-high or high-risk factor is present and the moderate-risk score is below the escalation threshold, so baseline risk is low."
              : baseline.category === "Very High"
                ? "At least one very-high-risk factor is present, which places the patient in the highest category regardless of the moderate-risk score."
                : baseline.category === "High"
                  ? "Either a high-risk factor is present, or the moderate-risk score reached two points or more, which escalates the category to high."
                  : "A single moderate-risk point is present, which places the patient in the moderate category."}
            {picture.therapies.length
              ? ` The planned therapy is ${therapyNames(patient.therapy).toLowerCase()}, and the proforma above matches ${
                  picture.therapies.length > 1 ? "that combination" : "it"
                }.`
              : ""}
          </p>
          {riskEscalation && (
            <Callout tone="danger" title="Live escalation above baseline">
              {riskEscalation}. The surveillance schedule and follow-up interval below already reflect the escalated category, not the
              baseline one.
            </Callout>
          )}
        </Stack>
      </Panel>

      <Panel
        title="Contributing risk factors"
        subtitle={`${contributing.length} present${baseline.derived.length ? `, ${baseline.derived.length} taken from recorded data` : ""}`}
      >
        {contributing.length === 0 ? (
          <EmptyState>No HFA-ICOS risk factors are present for this patient.</EmptyState>
        ) : (
          <div className="space-y-1.5">
            {contributing.map((factor) => (
              <div key={factor.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <span className="min-w-0">
                  <span className="block text-[13.5px] text-slate-800">{factor.label}</span>
                  {factor.sourceDetail && (
                    <span className="mt-0.5 block text-[12px] text-slate-500">{factor.sourceDetail}</span>
                  )}
                </span>
                <StatusChip tone={factor.tier === "veryHigh" ? "danger" : factor.tier === "high" ? "warning" : "neutral"}>
                  {factor.weight ? `${factor.weight} point${factor.weight === 1 ? "" : "s"}` : factor.tierLabel}
                </StatusChip>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {escalationSignals.length > 0 && (
        <Panel title="Live clinical signals" subtitle="Findings from this and previous encounters that modify risk">
          <div className="space-y-1.5">
            {escalationSignals.map((signal) => (
              <div key={signal} className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-2">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                <span className="text-[13px] text-slate-700">{signal}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Missing baseline data" subtitle="Gaps that weaken later comparisons">
        {missingBaseline.length === 0 ? (
          <Callout tone="ok" title="Baseline dataset complete">
            All baseline values needed for meaningful serial comparison are recorded.
          </Callout>
        ) : (
          <div className="space-y-1.5">
            {missingBaseline.map((requirement) => (
              <div key={requirement.id} className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
                <div className="text-[13.5px] font-medium text-amber-800">{requirement.label} not recorded</div>
                <div className="mt-0.5 text-[12.5px] text-slate-600">{requirement.why}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Recommended monitoring plan" subtitle={`Follows from the ${currentRisk.toLowerCase()} risk category`}>
        <div className="space-y-1.5">
          {(RISK_MONITORING_PLAN[currentRisk] || []).map((item) => (
            <div key={item} className="flex items-start gap-2.5 rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
              <span className="text-[13px] text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Heart-failure symptom status"
        subtitle="The second grading axis — the same ejection fraction means different things with and without symptoms"
      >
        <div className="flex flex-wrap gap-2">
          {HF_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setEncounter((current) => ({ ...current, hfStatus: current.hfStatus === option.id ? "" : option.id }))}
              aria-pressed={(encounter?.hfStatus || "none") === option.id}
              className={`rounded-xl border px-3.5 py-2 text-left text-[13px] font-medium transition ${
                (encounter?.hfStatus || "none") === option.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Dynamic re-stratification" subtitle="Findings recorded here override what the measurements alone would show">
        <Stack>
          <Grid cols="sm:grid-cols-2">
            <TextField label="GLS relative fall from baseline" value={restrat.glsFall || ""} onChange={(v) => setRestrat("glsFall", v)} type="number" unit="%" placeholder="12" hint="Leave blank to derive from the baseline and current strain values." />
            <TextField label="Current LVEF" value={restrat.currentLVEF || ""} onChange={(v) => setRestrat("currentLVEF", v)} type="number" unit="%" placeholder="46" hint="Leave blank to use the LVEF recorded in investigations." />
          </Grid>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-1">
            <Checkbox label="Significant troponin rise from baseline" checked={!!restrat.troponinRise} onChange={() => setRestrat("troponinRise", !restrat.troponinRise)} />
            <Checkbox label="High-grade myocarditis confirmed" checked={!!restrat.myocarditisConfirmed} onChange={() => setRestrat("myocarditisConfirmed", !restrat.myocarditisConfirmed)} />
          </div>
        </Stack>
      </Panel>

      <Panel title="Clinical status" subtitle="Current trajectory, independent of the baseline HFA-ICOS category">
        <div className="flex flex-wrap gap-2">
          {["Stable", "Improving", "Worsening", "Critical"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setPatient((current) => ({ ...current, clinicalStatus: status }))}
              aria-pressed={patient.clinicalStatus === status}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                patient.clinicalStatus === status
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Panel>
    </Stack>
  );
}

export const RISK_ICON = ShieldAlert;
export const RESTRAT_ICON = TrendingDown;
