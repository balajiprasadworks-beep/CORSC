"use client";

/* =========================================================================
   Patient registration.

   Deliberately short: identity, diagnosis, the planned treatment course, and
   the HFA-ICOS baseline factors. Risk factors that can be derived from age and
   baseline LVEF are set automatically so the clinician does not tick them twice.
   ========================================================================= */

import { useMemo } from "react";
import { Activity, AlertTriangle, Check, ClipboardList, ShieldAlert, Syringe, Users } from "lucide-react";

import { DiagnosisStageSelector } from "@/components/diagnosis-stage-selector";
import {
  Callout,
  Checkbox,
  CyclePills,
  Field,
  Grid,
  MetricTile,
  Panel,
  RiskBar,
  SelectField,
  Stack,
  Stepper,
  TextField,
  serif,
} from "@/components/kit";
import { CYCLE_FREQUENCIES, THERAPY_CLASSES, riskStyle } from "@/lib/clinical-data";
import { TROPONIN_ASSAYS } from "@/lib/cardiac-measurements";
import { TIERS, assessRisk, factorsByTier, therapyList } from "@/lib/hfa-icos";
import { num } from "@/lib/vitals";

/**
 * Recomputes the risk category after any change.
 *
 * Factors that follow from age, baseline LVEF or the recorded history are no
 * longer copied into the checkbox groups. They are derived at assessment time
 * instead, which keeps one source of truth and stops the derived ticks from
 * fighting the clinician's own.
 */
export function applyRegistrationChange(draft, patch) {
  const next = { ...draft, ...patch };
  next.risk = assessRisk(next);
  return next;
}

/* ------------------------------------------------------------------ form */

export function RegistrationFields({ value, onChange, showRiskPreview = true }) {
  const risk = useMemo(() => assessRisk(value), [value]);
  const tiers = useMemo(() => factorsByTier(value.therapy), [value.therapy]);
  const derivedById = useMemo(
    () => Object.fromEntries(risk.factors.map((factor) => [factor.id, factor])),
    [risk.factors]
  );
  const styles = riskStyle(risk.category);
  const set = (patch) => onChange(patch);
  const toggle = (group, id) =>
    set({ [group]: { ...(value[group] || {}), [id]: !(value[group] || {})[id] } });

  const selectedTherapies = therapyList(value.therapy);
  function toggleTherapy(id) {
    const next = selectedTherapies.includes(id)
      ? selectedTherapies.filter((therapy) => therapy !== id)
      : [...selectedTherapies, id];
    set({ therapy: next });
  }

  /** Renders one tier of the proforma, showing where each factor came from. */
  const renderTier = (factors) =>
    factors.map((factor) => {
      const resolved = derivedById[factor.id];
      const auto = resolved?.source === "derived";
      return (
        <Checkbox
          key={factor.id}
          label={factor.label}
          points={TIERS[factor.tier].weight || undefined}
          checked={Boolean(resolved?.present)}
          hint={auto ? resolved.sourceDetail : undefined}
          onChange={() => {
            // Derived factors are read-only: the underlying value is the record.
            if (!auto) toggle(TIERS[factor.tier].group, factor.id);
          }}
        />
      );
    });

  const plannedCycles = num(value.plannedCycles);
  const totalDose = num(value.totalPlannedDose);
  const perCycleDose = plannedCycles && totalDose ? Number((totalDose / plannedCycles).toFixed(1)) : null;

  return (
    <Stack gap="gap-4">
      <Panel title="Identity" subtitle="Minimum needed to open the record">
        <Grid>
          <TextField label="Full name" value={value.name} onChange={(v) => set({ name: v })} placeholder="Patient name" />
          <TextField label="Patient ID" value={value.patientId} onChange={(v) => set({ patientId: v })} placeholder="Hospital identifier" />
          <TextField label="Age" value={value.age} onChange={(v) => set({ age: v })} type="number" unit="yrs" />
          <SelectField label="Gender" value={value.gender} onChange={(v) => set({ gender: v })} options={["Male", "Female", "Other"]} placeholder="Select gender" />
        </Grid>
      </Panel>

      <Panel title="Diagnosis" subtitle="Search the catalogue, then pick the matching stage">
        <DiagnosisStageSelector
          diagnosis={value.diagnosis || ""}
          stage={value.stage || ""}
          onDiagnosisChange={(v) => set({ diagnosis: v })}
          onStageChange={(v) => set({ stage: v })}
        />
      </Panel>

      <Panel title="Planned treatment" subtitle="Course details drive the surveillance schedule">
        <Stack>
          <TextField
            label="Chemotherapy regimen"
            value={value.regimen}
            onChange={(v) => set({ regimen: v })}
            placeholder="e.g. AC-T with trastuzumab"
          />
          <Field label="Number of planned cycles" hint="Tap a cycle or use the stepper. This sets the treatment timeline.">
            <CyclePills
              value={value.plannedCycles}
              total={value.plannedCycles}
              onChange={(v) => set({ plannedCycles: v })}
            />
          </Field>
          <Grid>
            <Stepper
              label="Adjust cycle count"
              value={value.plannedCycles}
              onChange={(v) => set({ plannedCycles: v })}
              min={0}
              max={24}
            />
            <SelectField
              label="Frequency"
              value={value.cycleFrequency}
              onChange={(v) => set({ cycleFrequency: v })}
              options={CYCLE_FREQUENCIES}
              placeholder="Select schedule"
            />
          </Grid>
          <TextField
            label="Total planned chemotherapy dose"
            value={value.totalPlannedDose}
            onChange={(v) => set({ totalPlannedDose: v })}
            type="number"
            unit="mg/m²"
            hint={
              perCycleDose
                ? `Approximately ${perCycleDose} mg/m² per cycle across ${plannedCycles} cycles.`
                : "Doxorubicin-equivalent cumulative dose where applicable."
            }
          />
          {totalDose !== null && totalDose >= 250 && (
            <Callout tone={totalDose >= 400 ? "danger" : "warning"} title="Cumulative anthracycline exposure" icon={AlertTriangle}>
              A planned dose of {totalDose} mg/m² sits in the range where cardiotoxicity risk rises steeply. Consider dexrazoxane above
              300 mg/m² and plan echocardiography with strain every two cycles.
            </Callout>
          )}
        </Stack>
      </Panel>

      <Panel
        title="Planned anticancer therapy"
        subtitle="Select every class the patient will receive — each contributes its own surveillance protocol"
      >
        <div className="space-y-2" role="group" aria-label="Planned anticancer therapy">
          {THERAPY_CLASSES.map((therapy) => {
            const active = selectedTherapies.includes(therapy.id);
            return (
              <button
                key={therapy.id}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggleTherapy(therapy.id)}
                className={`flex w-full gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                  active ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600/20" : "border-slate-200 bg-white hover:border-teal-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                    active ? "border-teal-700 bg-teal-700" : "border-slate-300 bg-white"
                  }`}
                >
                  {active && <Check size={13} className="text-white" strokeWidth={3} aria-hidden="true" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-slate-900">{therapy.name}</span>
                  <span className="mt-0.5 block text-[12.5px] text-slate-500">{therapy.examples}</span>
                  <span className="mt-1 block text-[12.5px] text-teal-700">{therapy.note}</span>
                </span>
              </button>
            );
          })}
        </div>
        {selectedTherapies.length > 1 && (
          <div className="mt-3">
            <Callout tone="info" title={`${selectedTherapies.length} therapy classes selected`}>
              Surveillance will be the union of every applicable protocol, with the shortest interval taking precedence.
              Sequential anthracycline and HER2-targeted exposure carries higher risk than either alone.
            </Callout>
          </div>
        )}
      </Panel>

      <Panel title="Baseline measurements" subtitle="Anchor values every later comparison is made against">
        <Stack>
          <Grid>
            <TextField label="Baseline LVEF" value={value.baselineLVEF} onChange={(v) => set({ baselineLVEF: v })} type="number" unit="%" hint="Without this, no later fall can be identified as new." />
            <TextField label="Baseline GLS" value={value.baselineGLS} onChange={(v) => set({ baselineGLS: v })} type="number" unit="%" hint="Enter as measured, usually negative. A relative fall over 15% is significant." />
            <TextField label="Baseline weight" value={value.baselineWeight} onChange={(v) => set({ baselineWeight: v })} type="number" unit="kg" hint="Reference for weight-loss tracking." />
            <TextField label="Baseline QTc" value={value.baselineQTc} onChange={(v) => set({ baselineQTc: v })} type="number" unit="ms" hint="A later rise of 60 ms or more is actionable in itself." />
          </Grid>
          <Grid cols="sm:grid-cols-3">
            <SelectField
              label="Troponin assay"
              value={TROPONIN_ASSAYS.find((a) => a.id === value.troponinAssay)?.label || ""}
              onChange={(label) => set({ troponinAssay: TROPONIN_ASSAYS.find((a) => a.label === label)?.id || "" })}
              options={TROPONIN_ASSAYS.map((assay) => assay.label)}
              placeholder="Select the local assay"
              hint="Sets the reference limit used to judge a rise."
            />
            <TextField label="Local upper reference limit" value={value.troponinURL} onChange={(v) => set({ troponinURL: v })} type="number" unit="ng/L" hint="Overrides the published default." />
            <TextField label="Baseline troponin" value={value.baselineTroponin} onChange={(v) => set({ baselineTroponin: v })} type="number" unit="ng/L" />
          </Grid>
        </Stack>
      </Panel>

      <Panel
        title="HFA-ICOS baseline risk factors"
        subtitle={
          selectedTherapies.length
            ? "The proforma shown matches the therapies selected above"
            : "Select a therapy above to see the matching proforma"
        }
      >
        <Stack gap="gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-600">
              <ShieldAlert size={13} aria-hidden="true" /> Very high risk
            </div>
            {renderTier(tiers.veryHigh)}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-600">
              <AlertTriangle size={13} aria-hidden="true" /> High risk
            </div>
            {renderTier(tiers.high)}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-600">
              <ClipboardList size={13} aria-hidden="true" /> Moderate risk
            </div>
            {renderTier(tiers.moderate2)}
            {renderTier(tiers.moderate1)}
          </div>
          {risk.derived.length > 0 && (
            <Callout tone="info" title={`${risk.derived.length} factor${risk.derived.length === 1 ? "" : "s"} taken from data already recorded`}>
              These are ticked from the age, baseline measurements and history rather than by hand, so the same fact is never
              entered twice. Change the underlying value to change the factor.
            </Callout>
          )}
        </Stack>
      </Panel>

      {showRiskPreview && (
        <div className={`rounded-2xl border p-4 ${styles.bg} ${styles.border}`}>
          <div className="mb-1 text-[11px] uppercase tracking-widest text-slate-500">Baseline HFA-ICOS category</div>
          <div className={`text-3xl font-bold ${styles.text}`} style={serif}>{risk.category}</div>
          <div className="mb-3 mt-0.5 text-[13px] text-slate-500">{risk.reason} · {risk.points} points</div>
          <RiskBar category={risk.category} styles={styles} />
        </div>
      )}
    </Stack>
  );
}

/* -------------------------------------------------- in-workflow section */

export function RegistrationSection({ patient, setPatient }) {
  const plannedCycles = num(patient.plannedCycles);
  const totalDose = num(patient.totalPlannedDose);

  return (
    <Stack gap="gap-4">
      <Grid cols="sm:grid-cols-3">
        <MetricTile label="Planned cycles" value={plannedCycles ?? "—"} caption={patient.cycleFrequency || "Frequency not set"} />
        <MetricTile label="Total planned dose" value={totalDose ?? "—"} unit="mg/m²" caption={totalDose && plannedCycles ? `${(totalDose / plannedCycles).toFixed(1)} per cycle` : "Not recorded"} />
        <MetricTile label="Baseline LVEF" value={patient.baselineLVEF || "—"} unit="%" caption="Reference for all later comparisons" />
      </Grid>
      <RegistrationFields
        value={patient}
        onChange={(patch) => setPatient((current) => applyRegistrationChange(current, patch))}
      />
    </Stack>
  );
}

export const REGISTRATION_ICON = Users;
export const THERAPY_ICON = Syringe;
export const BASELINE_ICON = Activity;
