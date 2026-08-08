"use client";

/* =========================================================================
   Patient registration.

   Deliberately short: identity, diagnosis, the planned treatment course, and
   the HFA-ICOS baseline factors. Risk factors that can be derived from age and
   baseline LVEF are set automatically so the clinician does not tick them twice.
   ========================================================================= */

import { useMemo } from "react";
import { Activity, AlertTriangle, ClipboardList, ShieldAlert, Syringe, Users } from "lucide-react";

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
import {
  CYCLE_FREQUENCIES,
  HIGH_FACTORS,
  MODERATE1_FACTORS,
  MODERATE2_FACTORS,
  THERAPY_CLASSES,
  VERY_HIGH_FACTORS,
  calcRisk,
  riskStyle,
} from "@/lib/clinical-data";
import { num } from "@/lib/vitals";

/**
 * Age and baseline LVEF determine four HFA-ICOS factors outright. Deriving
 * them on change keeps the checklist and the entered values consistent without
 * an effect that fights the clinician.
 */
export function deriveAutoFactors(draft) {
  const age = num(draft.age);
  const lvef = num(draft.baselineLVEF);
  const high = { ...(draft.high || {}) };
  const m2 = { ...(draft.m2 || {}) };

  if (lvef !== null) {
    high.h1 = lvef < 50;
    m2.m2a = lvef >= 50 && lvef <= 54;
  }
  if (age !== null) {
    high.h3 = age >= 80;
    m2.m2b = age >= 65 && age < 80;
  }
  return { high, m2 };
}

export function applyRegistrationChange(draft, patch) {
  const next = { ...draft, ...patch };
  if ("age" in patch || "baselineLVEF" in patch) {
    Object.assign(next, deriveAutoFactors(next));
  }
  next.risk = calcRisk(next.veryHigh, next.high, next.m2, next.m1);
  return next;
}

/* ------------------------------------------------------------------ form */

export function RegistrationFields({ value, onChange, showRiskPreview = true }) {
  const risk = useMemo(
    () => value.risk || calcRisk(value.veryHigh, value.high, value.m2, value.m1),
    [value.risk, value.veryHigh, value.high, value.m2, value.m1]
  );
  const styles = riskStyle(risk.category);
  const set = (patch) => onChange(patch);
  const toggle = (group, id) =>
    set({ [group]: { ...(value[group] || {}), [id]: !(value[group] || {})[id] } });

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

      <Panel title="Planned anticancer therapy" subtitle="Determines which surveillance protocol applies">
        <div className="space-y-2" role="radiogroup" aria-label="Planned anticancer therapy">
          {THERAPY_CLASSES.map((therapy) => {
            const active = value.therapy === therapy.id;
            return (
              <button
                key={therapy.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set({ therapy: therapy.id })}
                className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${
                  active ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600/20" : "border-slate-200 bg-white hover:border-teal-300"
                }`}
              >
                <div className="text-[14px] font-semibold text-slate-900">{therapy.name}</div>
                <div className="mt-0.5 text-[12.5px] text-slate-500">{therapy.examples}</div>
                <div className="mt-1 text-[12.5px] text-teal-700">{therapy.note}</div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Baseline measurements" subtitle="Anchor values every later comparison is made against">
        <Grid>
          <TextField label="Baseline LVEF" value={value.baselineLVEF} onChange={(v) => set({ baselineLVEF: v })} type="number" unit="%" />
          <TextField label="Baseline weight" value={value.baselineWeight} onChange={(v) => set({ baselineWeight: v })} type="number" unit="kg" hint="Used as the reference for weight-loss tracking." />
        </Grid>
      </Panel>

      <Panel title="HFA-ICOS baseline risk factors" subtitle="Age and LVEF factors are set automatically from the values above">
        <Stack gap="gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-600">
              <ShieldAlert size={13} aria-hidden="true" /> Very high risk
            </div>
            {VERY_HIGH_FACTORS.map((factor) => (
              <Checkbox key={factor.id} label={factor.label} checked={!!(value.veryHigh || {})[factor.id]} onChange={() => toggle("veryHigh", factor.id)} />
            ))}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-600">
              <AlertTriangle size={13} aria-hidden="true" /> High risk
            </div>
            {HIGH_FACTORS.map((factor) => (
              <Checkbox key={factor.id} label={factor.label} checked={!!(value.high || {})[factor.id]} onChange={() => toggle("high", factor.id)} />
            ))}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-600">
              <ClipboardList size={13} aria-hidden="true" /> Moderate risk
            </div>
            {MODERATE2_FACTORS.map((factor) => (
              <Checkbox key={factor.id} label={factor.label} points={2} checked={!!(value.m2 || {})[factor.id]} onChange={() => toggle("m2", factor.id)} />
            ))}
            {MODERATE1_FACTORS.map((factor) => (
              <Checkbox key={factor.id} label={factor.label} points={1} checked={!!(value.m1 || {})[factor.id]} onChange={() => toggle("m1", factor.id)} />
            ))}
          </div>
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
