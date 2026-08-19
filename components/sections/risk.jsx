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
  CompletenessBar,
  EmptyState,
  FlagCard,
  Grid,
  Panel,
  RiskBar,
  SourceNote,
  Stack,
  StatusChip,
  TextField,
  serif,
} from "@/components/kit";
import { RISK_MONITORING_PLAN, riskStyle, therapyNames } from "@/lib/clinical-data";
import { HF_STATUS_OPTIONS } from "@/lib/ctrcd";

export function RiskSection({ patient, setPatient, encounter, setEncounter, picture }) {
  const { currentRisk, riskEscalation, signals, riskAssessment, ctrcd, baselineRisk, ctrCvt, redFlags, completeness, pathways, unexpectedDeterioration } =
    picture;
  const baseline = riskAssessment;
  const baselineStyles = riskStyle(baseline.category);
  const currentStyles = riskStyle(currentRisk);
  const contributing = riskAssessment.contributing;

  // The missing-baseline list is now computed by lib/completeness.js, which
  // weights each item by what it actually changes and marks the ones without
  // which a downstream conclusion cannot be drawn at all.

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
      {/* ------------------------------------------------------------------
          The two axes, side by side and clearly different things.

          Axis one is fixed at registration and never moves. Axis two is what
          has happened since, on its own scale. The previous build showed the
          second escalating the first, using the same four words, so the record
          could not distinguish a risky patient from a damaged one.
          ---------------------------------------------------------------- */}
      <Grid cols="sm:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${baselineStyles.bg} ${baselineStyles.border}`}>
          <div className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">
            Baseline cardiovascular risk {baselineRisk.applicable ? "· HFA-ICOS" : ""}
          </div>
          {baselineRisk.applicable ? (
            <>
              <div className={`text-3xl font-bold ${baselineStyles.text}`} style={serif}>{baseline.category}</div>
              <div className="mb-3 mt-0.5 text-[13px] text-slate-500">
                {baseline.points} moderate-risk point{baseline.points === 1 ? "" : "s"} · fixed at registration
              </div>
              <RiskBar category={baseline.category} styles={baselineStyles} />
            </>
          ) : (
            <>
              <div className="text-[19px] font-bold text-slate-700" style={serif}>Not applicable</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">
                {baselineRisk.unscoredNotes.map((item) => item.note).filter(Boolean)[0] || baselineRisk.reason}
              </p>
            </>
          )}
          {completeness?.caveat && (
            <p className="mt-2 text-[12px] font-medium text-amber-700">{completeness.caveat}</p>
          )}
          <SourceNote provenance={baselineRisk.provenance} />
        </div>

        <div className={`rounded-2xl border p-4 ${riskStyle(ctrCvt.overall === "none" ? "Low" : ctrCvt.overall === "mild" ? "Moderate" : "High").bg} border-slate-200`}>
          <div className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">Current cardiovascular status · CTR-CVT</div>
          <div className="text-3xl font-bold text-slate-900" style={serif}>{ctrCvt.overallLabel}</div>
          <div className="mb-3 mt-0.5 text-[13px] leading-relaxed text-slate-500">{ctrCvt.summary}</div>
          <div className="space-y-1">
            {ctrCvt.domains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className={domain.present ? "text-slate-800" : "text-slate-400"}>{domain.label}</span>
                <StatusChip tone={domain.present ? domain.tone : "neutral"}>{domain.severityLabel}</StatusChip>
              </div>
            ))}
          </div>
          <SourceNote provenance={ctrCvt.provenance} />
        </div>
      </Grid>

      {unexpectedDeterioration && (
        <Callout tone="warning" title="Toxicity in a patient who was not stratified as high risk">
          This patient&rsquo;s baseline category was {String(baseline.category).toLowerCase()} and they have developed{" "}
          {ctrCvt.overallLabel.toLowerCase()} toxicity anyway. Baseline stratification identifies who is most likely to run into trouble; it does not
          identify everyone who will. Do not let the baseline category argue against what is being measured now.
        </Callout>
      )}

      {redFlags.flags.length > 0 && (
        <Panel
          title="Current alerts"
          subtitle={`${redFlags.counts.red} emergency · ${redFlags.counts.orange} urgent · ${redFlags.counts.yellow} for review`}
        >
          <div className="space-y-2">
            {redFlags.flags.map((flag) => (
              <FlagCard key={`${flag.id}-${flag.level}`} flag={flag} />
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Management level" subtitle="How intensively to monitor now — derived from both axes, and not itself a risk category">
        <Stack gap="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[19px] font-bold ${currentStyles.text}`} style={serif}>{currentRisk}</span>
            <StatusChip tone={riskEscalation ? "warning" : "ok"}>
              {riskEscalation ? "Raised above baseline" : "At the baseline level"}
            </StatusChip>
          </div>
          <RiskBar category={currentRisk} styles={currentStyles} />
          <p className="text-[13px] leading-relaxed text-slate-600">
            {riskEscalation
              ? `Raised because: ${riskEscalation}. The surveillance schedule and follow-up interval below reflect this level, not the baseline category.`
              : "Nothing found at this encounter raises monitoring above the level the baseline category calls for."}
          </p>
        </Stack>
      </Panel>

      {completeness && <CompletenessBar completeness={completeness} />}

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

      {/* The arithmetic, shown in full so the category can be reproduced by
          hand. A risk tool a clinician cannot check is a risk tool they have to
          take on trust. */}
      {baselineRisk.applicable && (
        <Panel
          title="How this category was reached"
          subtitle={`Planned therapy: ${therapyNames(patient.therapy)}`}
        >
          <Stack gap="gap-3">
            {baselineRisk.results.map((result) => (
              <div key={result.therapyId} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-slate-900">{result.label}</span>
                  <StatusChip tone={result.category === "Low" ? "ok" : result.category === "Moderate" ? "warning" : "danger"}>
                    {result.category}
                  </StatusChip>
                </div>
                <ol className="mt-2 space-y-1">
                  {result.workings.map((step) => (
                    <li key={step} className="text-[12.5px] leading-relaxed text-slate-600">{step}</li>
                  ))}
                </ol>
                {result.limitation && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[12px] leading-relaxed text-amber-800">{result.limitation}</p>
                )}
                <SourceNote provenance={result.provenance} />
              </div>
            ))}

            {baselineRisk.composition && (
              <Callout tone="info" title="More than one therapy is planned">
                {baselineRisk.composition.detail}
              </Callout>
            )}

            {baselineRisk.modifiers.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[13px] font-semibold text-slate-900">Additional risk factors outside the proforma</div>
                <p className="mt-0.5 text-[12.5px] text-slate-500">
                  Real risk factors that are not rows in the published proforma, so they add no points to the category above.
                </p>
                {baselineRisk.modifiers.map((modifier) => (
                  <div key={modifier.id} className="mt-2">
                    <div className="text-[13px] text-slate-800">{modifier.label}</div>
                    <SourceNote provenance={modifier.provenance} />
                  </div>
                ))}
              </div>
            )}
          </Stack>
        </Panel>
      )}

      {/* Therapies with no published proforma get a named pathway instead of a
          number that would look like an HFA-ICOS score but is not one. */}
      {pathways.filter((entry) => !entry.usesHfaIcos && entry.baseline).map((entry) => (
        <Panel key={entry.therapyId} title={entry.baseline.label} subtitle={entry.baseline.summary}>
          <Stack gap="gap-2">
            <Callout tone="info" title="This is not a risk score">
              {entry.baseline.disclaimer}
            </Callout>
            {entry.baseline.concerns.length === 0 ? (
              <EmptyState>No pathway-specific baseline concern identified from the data recorded.</EmptyState>
            ) : (
              <div className="space-y-1.5">
                {entry.baseline.concerns.map((concern) => (
                  <div key={concern.id} className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
                    <div className="text-[13.5px] font-medium text-amber-900">{concern.label}</div>
                    <div className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">{concern.detail}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="text-[12.5px] font-medium text-slate-800">What this pathway watches for</div>
              <div className="mt-0.5 text-[12.5px] text-slate-600">{entry.pathway.watchFor.join(" · ")}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-slate-500">{entry.pathway.note}</div>
            </div>
            <SourceNote provenance={entry.baseline.provenance} />
          </Stack>
        </Panel>
      ))}

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

      <Panel
        title={completeness.visitTypeId ? "Missing for this visit" : "Missing baseline data"}
        subtitle={
          completeness.visitTypeId
            ? "What this visit type still needs, split into what the plan depends on and what is documentation only"
            : "Gaps that weaken later comparisons, weighted by what they actually change"
        }
      >
        {completeness.missing.length === 0 ? (
          <Callout tone="ok" title={completeness.visitTypeId ? "Visit complete" : "Baseline dataset complete"}>
            {completeness.visitTypeId
              ? "Everything this visit type calls for is recorded."
              : "All baseline values needed for meaningful serial comparison are recorded."}
          </Callout>
        ) : (
          <div className="space-y-1.5">
            {completeness.missing.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border px-3 py-2 ${item.critical ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/50"}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`text-[13.5px] font-medium ${item.critical ? "text-red-800" : "text-amber-800"}`}>
                    {item.label} not recorded
                  </span>
                  {item.critical && <StatusChip tone="danger">Critical</StatusChip>}
                </div>
                <div className="mt-0.5 text-[12.5px] leading-relaxed text-slate-600">{item.why}</div>
              </div>
            ))}
          </div>
        )}
        <SourceNote provenance={completeness.provenance} />
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
