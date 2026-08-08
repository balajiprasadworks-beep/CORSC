"use client";

/* =========================================================================
   Overview — the final section.

   The complete OPD summary a cardiologist would want to read, and the single
   place the encounter can be printed or exported. A hidden print document is
   rendered alongside so the exported report is a clean clinical letter rather
   than a screenshot of the interface.
   ========================================================================= */

import { FileDown, FileText, Printer } from "lucide-react";

import {
  Callout,
  EmptyState,
  Grid,
  KeyValue,
  Panel,
  Stack,
  StatusChip,
  TextArea,
  mono,
  serif,
} from "@/components/kit";
import {
  APP_FULL_NAME,
  EXAM_SYSTEMS,
  HISTORY_GROUPS,
  INVESTIGATIONS,
  primaryTherapy,
  riskStyle,
  therapyName,
} from "@/lib/clinical-data";
import { medClassLabel } from "@/lib/medication-engine";
import { systemSummaryText } from "@/lib/patient-model";

/* --------------------------------------------------------- report model */

function historySummary(patient) {
  return HISTORY_GROUPS.map((group) => {
    const entry = patient.history?.[group.id] || {};
    const positives = Object.entries(entry.checks || {})
      .filter(([, value]) => value)
      .map(([key]) => group.checklist?.find((c) => c.id === key)?.label)
      .filter(Boolean);
    const fields = Object.entries(entry.fields || {})
      .filter(([, value]) => String(value || "").trim())
      .map(([key, value]) => {
        const definition = group.fields?.find((f) => f.id === key);
        return `${definition?.label || key}: ${value}`;
      });
    const parts = [...positives, ...fields];
    return { label: group.label, text: parts.length ? parts.join(" · ") : "Nothing recorded" };
  });
}

function investigationSummary(encounter) {
  return INVESTIGATIONS.flatMap((definition) => {
    const entry = encounter.inv?.[definition.id];
    if (!entry || (!entry.result && !entry.interp && !entry.comment)) return [];
    return [{
      label: definition.label,
      text: [
        entry.result ? `${entry.result}${definition.unit ? ` ${definition.unit}` : ""}` : null,
        entry.interp || null,
        entry.date || null,
        entry.comment || null,
      ].filter(Boolean).join(" · "),
      abnormal: entry.interp && entry.interp !== "Normal",
    }];
  });
}

function examinationSummary(encounter) {
  return EXAM_SYSTEMS.map((system) => ({
    label: `${system.label} — ${system.full}`,
    text: systemSummaryText(encounter.systems?.[system.id], system),
    abnormal: encounter.systems?.[system.id]?.status === "findings",
  }));
}

function vitalsSummary(encounter, derived) {
  const vitals = encounter.vitals || {};
  return [
    ["Blood pressure", vitals.sbp && vitals.dbp ? `${vitals.sbp}/${vitals.dbp} mmHg${derived.bp ? ` (${derived.bp.short})` : ""}` : null],
    ["Pulse", vitals.pulse ? `${vitals.pulse} bpm` : null],
    ["Respiratory rate", vitals.rr ? `${vitals.rr} /min` : null],
    ["SpO₂", vitals.spo2 ? `${vitals.spo2}%` : null],
    ["Temperature", vitals.temp ? `${vitals.temp} °C` : null],
    ["Height", vitals.height ? `${vitals.height} cm` : null],
    ["Weight", vitals.weight ? `${vitals.weight} kg` : null],
    ["BMI", derived.bmi ? `${derived.bmi} kg/m² (${derived.bmiCategory?.label})` : null],
    ["BSA", derived.bsa ? `${derived.bsa} m²` : null],
    ["Weight change", derived.weightLossPercent === null ? null : `${derived.weightLossPercent}% — ${derived.weightLoss?.label}`],
  ].filter(([, value]) => value);
}

/* ------------------------------------------------------------- on screen */

export function OverviewSection({ patient, encounter, setEncounter, picture, summary, onExportCsv, onPrint }) {
  const styles = riskStyle(picture.currentRisk);
  const derived = picture.vitals;
  const investigations = investigationSummary(encounter);
  const examination = examinationSummary(encounter);
  const history = historySummary(patient);
  const medications = patient.medications || [];

  return (
    <Stack gap="gap-4">
      <Panel title="AI clinical summary" subtitle="Print-ready narrative generated from this encounter">
        <p className="text-[14px] leading-relaxed text-slate-700">{summary.narrative}</p>
        {summary.structured.redFlags.length > 0 && (
          <div className="mt-3">
            <Callout tone="danger" title="Red flags requiring attention">
              <ul className="space-y-1 pl-4">
                {summary.structured.redFlags.map((flag) => <li key={flag} className="list-disc">{flag}</li>)}
              </ul>
            </Callout>
          </div>
        )}
      </Panel>

      <Panel title="Patient">
        <Grid cols="sm:grid-cols-3 lg:grid-cols-4">
          <KeyValue label="Name" value={patient.name} mono={false} />
          <KeyValue label="Patient ID" value={patient.patientId} />
          <KeyValue label="Age" value={patient.age ? `${patient.age} yrs` : null} />
          <KeyValue label="Gender" value={patient.gender} mono={false} />
          <KeyValue label="Registered" value={patient.registeredDate} />
          <KeyValue label="Clinical status" value={patient.clinicalStatus} mono={false} />
        </Grid>
      </Panel>

      <Panel title="Cancer diagnosis and treatment">
        <Grid cols="sm:grid-cols-3">
          <KeyValue label="Diagnosis" value={patient.diagnosis} mono={false} />
          <KeyValue label="Stage" value={patient.stage} mono={false} />
          <KeyValue label="Therapy class" value={therapyName(primaryTherapy(patient.therapy))} mono={false} />
          <KeyValue label="Regimen" value={patient.regimen} mono={false} />
          <KeyValue label="Planned cycles" value={patient.plannedCycles} />
          <KeyValue label="Frequency" value={patient.cycleFrequency} mono={false} />
          <KeyValue label="Total planned dose" value={patient.totalPlannedDose ? `${patient.totalPlannedDose} mg/m²` : null} />
          <KeyValue label="Current cycle" value={encounter.firstReview?.cycle || patient.cycle} />
          <KeyValue label="Tolerance" value={encounter.firstReview?.tolerance} mono={false} />
        </Grid>
      </Panel>

      <Panel title="History">
        <div className="space-y-1.5">
          {history.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-100 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{item.label}</div>
              <div className="mt-0.5 text-[13px] text-slate-700">{item.text}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Vitals">
        {vitalsSummary(encounter, derived).length === 0 ? (
          <EmptyState>No vitals recorded at this encounter.</EmptyState>
        ) : (
          <Grid cols="sm:grid-cols-3 lg:grid-cols-4">
            {vitalsSummary(encounter, derived).map(([label, value]) => (
              <KeyValue key={label} label={label} value={value} />
            ))}
          </Grid>
        )}
      </Panel>

      <Panel title="Symptoms">
        {(encounter.symptoms || []).length === 0 ? (
          <p className="text-[13px] text-slate-600">No cardiovascular symptoms reported at this visit.</p>
        ) : (
          <div className="space-y-1.5">
            {encounter.symptoms.map((symptom) => {
              const detail = encounter.symptomDetail?.[symptom] || {};
              const parts = [detail.severity, detail.duration, detail.trigger, detail.radiation, detail.associated, detail.notes].filter(Boolean);
              return (
                <div key={symptom} className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="text-[13.5px] font-medium text-slate-800">{symptom}</div>
                  {parts.length > 0 && <div className="mt-0.5 text-[12.5px] text-slate-600">{parts.join(" · ")}</div>}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Systemic examination">
        <div className="space-y-1.5">
          {examination.map((item) => (
            <div key={item.label} className={`rounded-lg border px-3 py-2 ${item.abnormal ? "border-amber-200 bg-amber-50/40" : "border-slate-100"}`}>
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{item.label}</div>
              <div className="mt-0.5 text-[13px] text-slate-700">{item.text}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Investigations">
        {investigations.length === 0 ? (
          <EmptyState>No investigation results recorded at this encounter.</EmptyState>
        ) : (
          <div className="space-y-1.5">
            {investigations.map((item) => (
              <div key={item.label} className={`flex flex-wrap items-baseline justify-between gap-2 rounded-lg border px-3 py-2 ${item.abnormal ? "border-red-200 bg-red-50/40" : "border-slate-100"}`}>
                <span className="text-[13.5px] font-medium text-slate-800">{item.label}</span>
                <span className="text-[12.5px] text-slate-600" style={mono}>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Medication review">
        <Stack gap="gap-2">
          {medications.length === 0 ? (
            <p className="text-[13px] text-slate-600">No regular medication recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {medications.map((medication) => (
                <span key={medication.id} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] text-slate-700">
                  {medication.name}{medication.dose ? ` ${medication.dose}` : ""} · {medClassLabel(medication.klass)}
                </span>
              ))}
            </div>
          )}
          {picture.recommendations.length > 0 && (
            <div className="space-y-1">
              {picture.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="flex flex-wrap items-center gap-2 text-[13px] text-slate-700">
                  <StatusChip tone={recommendation.onTreatment ? "ok" : recommendation.strength === "Indicated" ? "danger" : "warning"}>
                    {recommendation.onTreatment ? "On treatment" : recommendation.strength}
                  </StatusChip>
                  <span>{recommendation.title}</span>
                </div>
              ))}
            </div>
          )}
          {encounter.medReview && <p className="text-[13px] leading-relaxed text-slate-700">{encounter.medReview}</p>}
        </Stack>
      </Panel>

      <Panel title="Risk assessment">
        <div className={`rounded-xl border p-3 ${styles.bg} ${styles.border}`}>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={`text-xl font-bold ${styles.text}`} style={serif}>{picture.currentRisk}</span>
            <span className="text-[13px] text-slate-600">
              baseline {patient.risk?.category} · {patient.risk?.reason}
            </span>
          </div>
          {picture.riskEscalation && <p className="mt-1 text-[13px] text-slate-600">Escalated because of {picture.riskEscalation}.</p>}
        </div>
      </Panel>

      <Panel title="Surveillance and follow-up plan">
        <Stack gap="gap-2">
          <div className="rounded-lg border border-teal-100 bg-teal-50/50 px-3 py-2 text-[13px] text-slate-700">
            Next contact {encounter.nextFollowUpDate || picture.nextFollowUp.date} — {picture.nextFollowUp.reason}.
          </div>
          {summary.structured.surveillance.map((item) => (
            <div key={item} className="flex items-start gap-2 text-[13px] text-slate-700">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
          {encounter.plan && (
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">Management plan</div>
              <p className="mt-0.5 text-[13px] leading-relaxed text-slate-700">{encounter.plan}</p>
            </div>
          )}
        </Stack>
      </Panel>

      <Panel title="Consultant notes">
        <TextArea
          label="Notes for the record"
          rows={4}
          placeholder="Consultant impression, discussion with patient, multidisciplinary input"
          value={encounter.notes || ""}
          onChange={(value) => setEncounter((current) => ({ ...current, notes: value }))}
        />
      </Panel>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
        >
          <Printer size={16} aria-hidden="true" /> Print OPD report
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <FileDown size={16} aria-hidden="true" /> Export CSV
        </button>
      </div>
      <p className="text-center text-[12px] text-slate-400">
        Printing produces the full OPD-style report including the clinical summary. This is the only print action in the app.
      </p>
    </Stack>
  );
}

/* ----------------------------------------------------------- print sheet */

function ReportBlock({ title, children }) {
  return (
    <section className="report-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ReportRows({ rows }) {
  const filled = rows.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "");
  if (filled.length === 0) return <p className="report-empty">Not recorded.</p>;
  return (
    <dl className="report-grid">
      {filled.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Hidden on screen, rendered on print as a clean clinical document. */
export function PrintReport({ patient, encounter, picture, summary }) {
  const derived = picture.vitals;
  const investigations = investigationSummary(encounter);
  const examination = examinationSummary(encounter);
  const history = historySummary(patient);

  return (
    <div id="corsc-print-report" className="hidden print:block">
      <header className="report-header">
        <div>
          <h1>{APP_FULL_NAME}</h1>
          <p className="report-subtitle">Outpatient cardio-oncology review</p>
        </div>
        <div className="report-meta">
          <div><strong>{patient.name || "Unnamed patient"}</strong></div>
          <div>Patient ID: {patient.patientId || "—"}</div>
          <div>Encounter: {encounter.type} · {encounter.date}</div>
          <div>Printed: {new Date().toLocaleDateString()}</div>
        </div>
      </header>

      <ReportBlock title="Patient">
        <ReportRows
          rows={[
            ["Name", patient.name],
            ["Patient ID", patient.patientId],
            ["Age", patient.age ? `${patient.age} years` : null],
            ["Gender", patient.gender],
            ["Registered", patient.registeredDate],
            ["Clinical status", patient.clinicalStatus],
          ]}
        />
      </ReportBlock>

      <ReportBlock title="Cancer diagnosis and planned treatment">
        <ReportRows
          rows={[
            ["Diagnosis", patient.diagnosis],
            ["Stage", patient.stage],
            ["Therapy class", patient.therapy ? therapyName(primaryTherapy(patient.therapy)) : null],
            ["Regimen", patient.regimen],
            ["Planned cycles", patient.plannedCycles],
            ["Frequency", patient.cycleFrequency],
            ["Total planned dose", patient.totalPlannedDose ? `${patient.totalPlannedDose} mg/m²` : null],
            ["Current cycle", encounter.firstReview?.cycle || patient.cycle],
            ["Treatment tolerance", encounter.firstReview?.tolerance],
          ]}
        />
      </ReportBlock>

      <ReportBlock title="History">
        <ul className="report-list">
          {history.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.text}</li>)}
        </ul>
      </ReportBlock>

      <ReportBlock title="Vitals">
        <ReportRows rows={vitalsSummary(encounter, derived)} />
      </ReportBlock>

      <ReportBlock title="Symptoms">
        {(encounter.symptoms || []).length === 0 ? (
          <p>No cardiovascular symptoms reported at this visit.</p>
        ) : (
          <ul className="report-list">
            {encounter.symptoms.map((symptom) => {
              const detail = encounter.symptomDetail?.[symptom] || {};
              const parts = [detail.severity, detail.duration, detail.trigger, detail.radiation, detail.associated, detail.notes].filter(Boolean);
              return <li key={symptom}><strong>{symptom}</strong>{parts.length ? `: ${parts.join(" · ")}` : ""}</li>;
            })}
          </ul>
        )}
      </ReportBlock>

      <ReportBlock title="Systemic examination">
        <ul className="report-list">
          {examination.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.text}</li>)}
        </ul>
      </ReportBlock>

      <ReportBlock title="Investigations">
        {investigations.length === 0 ? (
          <p>No investigation results recorded at this encounter.</p>
        ) : (
          <ul className="report-list">
            {investigations.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.text}</li>)}
          </ul>
        )}
      </ReportBlock>

      <ReportBlock title="Medication review">
        {(patient.medications || []).length === 0 ? (
          <p>No regular medication recorded.</p>
        ) : (
          <ul className="report-list">
            {patient.medications.map((medication) => (
              <li key={medication.id}>{medication.name}{medication.dose ? ` — ${medication.dose}` : ""} ({medClassLabel(medication.klass)})</li>
            ))}
          </ul>
        )}
        {picture.recommendations.length > 0 && (
          <ul className="report-list">
            {picture.recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <strong>{recommendation.title}:</strong> {recommendation.onTreatment ? "already prescribed" : recommendation.strength.toLowerCase()} — {recommendation.reasons[0]}
              </li>
            ))}
          </ul>
        )}
        {encounter.medReview && <p>{encounter.medReview}</p>}
      </ReportBlock>

      <ReportBlock title="Risk assessment">
        <ReportRows
          rows={[
            ["Baseline HFA-ICOS", `${patient.risk?.category} — ${patient.risk?.reason}`],
            ["Current risk", picture.currentRisk],
            ["Escalation", picture.riskEscalation],
            ["Baseline LVEF", patient.baselineLVEF ? `${patient.baselineLVEF}%` : null],
          ]}
        />
      </ReportBlock>

      <ReportBlock title="Surveillance and follow-up">
        <ul className="report-list">
          {summary.structured.surveillance.map((item) => <li key={item}>{item}</li>)}
          <li>Next contact {encounter.nextFollowUpDate || picture.nextFollowUp.date} — {picture.nextFollowUp.reason}.</li>
        </ul>
        {encounter.plan && <p><strong>Management plan:</strong> {encounter.plan}</p>}
      </ReportBlock>

      <ReportBlock title="Clinical summary">
        <p>{summary.narrative}</p>
        {summary.structured.redFlags.length > 0 && (
          <>
            <h3>Red flags</h3>
            <ul className="report-list">
              {summary.structured.redFlags.map((flag) => <li key={flag}>{flag}</li>)}
            </ul>
          </>
        )}
        {summary.structured.nextActions.length > 0 && (
          <>
            <h3>Next actions</h3>
            <ul className="report-list">
              {summary.structured.nextActions.map((action) => <li key={action}>{action}</li>)}
            </ul>
          </>
        )}
      </ReportBlock>

      {encounter.notes && (
        <ReportBlock title="Consultant notes">
          <p>{encounter.notes}</p>
        </ReportBlock>
      )}

      <footer className="report-footer">
        Decision support based on the HFA-ICOS risk framework and ESC 2022 cardio-oncology guidelines. It does not replace clinical
        judgement, full guideline review, or multidisciplinary cardio-oncology input. For use by qualified clinicians only.
      </footer>
    </div>
  );
}

export const OVERVIEW_ICON = FileText;
