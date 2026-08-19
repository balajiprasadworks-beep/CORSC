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
  riskStyle,
  therapyNames,
} from "@/lib/clinical-data";
import { DraftNoteButton } from "@/components/ai-note-tools";
import { RULES_VERSION, clinicalSource } from "@/lib/clinical-sources";
import { medClassLabel } from "@/lib/medication-engine";
import { systemSummaryText } from "@/lib/patient-model";

/* --------------------------------------------------------- report model */

/**
 * Every distinct source behind anything in this report, de-duplicated.
 *
 * Collected from the provenance objects the engines already attach, rather
 * than from a hand-maintained list — a hand-maintained bibliography drifts out
 * of step with what the software actually did.
 */
function reportSources(picture) {
  const provenances = [
    picture.baselineRisk?.provenance,
    ...(picture.baselineRisk?.results || []).map((result) => result.provenance),
    ...(picture.baselineRisk?.modifiers || []).map((modifier) => modifier.provenance),
    picture.ctrCvt?.provenance,
    ...(picture.ctrCvt?.domains || []).map((domain) => domain.provenance),
    ...(picture.redFlags?.flags || []).map((flag) => flag.provenance),
    ...(picture.tasks || []).map((task) => task.provenance),
    ...(picture.series || []).map((series) => series.provenance),
    ...(picture.recommendations || []).map((rec) => rec.provenance),
    picture.ledger?.model?.provenance,
    picture.ledger?.assessment?.provenance,
    picture.completeness?.provenance,
    picture.baselineTroponin?.reference?.provenance,
  ].filter(Boolean);

  const seen = new Map();
  provenances.forEach((item) => {
    const source = clinicalSource(item.sourceId);
    if (source && !seen.has(source.id)) seen.set(source.id, source);
  });
  return Array.from(seen.values());
}

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
          <KeyValue label="Therapy class" value={therapyNames(patient.therapy)} mono={false} />
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
              baseline {picture.riskAssessment.category} · {picture.riskAssessment.reason}
            </span>
          </div>
          {picture.riskEscalation && <p className="mt-1 text-[13px] text-slate-600">Escalated because of {picture.riskEscalation}.</p>}
        </div>
        <div className="mt-2 rounded-xl border border-slate-200 px-3 py-2">
          <div className="text-[11px] font-medium uppercase tracking-widest text-slate-400">Cardiac dysfunction</div>
          <div className="mt-0.5 text-[13.5px] font-semibold text-slate-900">{picture.ctrcd.label}</div>
          {picture.ctrcd.criteria.length > 0 && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{picture.ctrcd.criteria.join(". ")}.</p>
          )}
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

      <Panel
        title="Consultant notes"
        right={<DraftNoteButton patientId={patient.id} context={summary.narrative} onDraft={(draft) => setEncounter((current) => ({ ...current, notes: draft }))} />}
      >
        <TextArea
          label="Notes for the record"
          rows={4}
          placeholder="Consultant impression, discussion with patient, multidisciplinary input"
          value={encounter.notes || ""}
          onChange={(value) => setEncounter((current) => ({ ...current, notes: value }))}
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          &ldquo;Draft with AI&rdquo; sends the already-computed clinical summary to the configured AI provider and fills this field with an
          editable starting point — it replaces nothing without being reviewed here first.
        </p>
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

<div>
  Printed:{" "}
  {new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })}
</div>

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
            ["Therapy class", patient.therapy ? therapyNames(patient.therapy) : null],
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

      <ReportBlock title="Fitness to proceed">
        <p><strong>{picture.fitness.label}.</strong> {picture.fitness.headline}.</p>
        {picture.fitness.findings.length > 0 && (
          <ul className="report-list">
            {picture.fitness.findings.map((finding) => (
              <li key={finding.id}>
                <strong>{finding.verdict === "hold" ? "Against proceeding" : "Action"}:</strong> {finding.title} — {finding.detail}
              </li>
            ))}
          </ul>
        )}
        <p className="report-empty">
          Generated from the data recorded at this encounter. The decision to give, delay or stop cancer therapy rests with the
          treating oncologist and cardio-oncologist together.
        </p>
      </ReportBlock>

      {/* The two axes are reported as separate blocks, in the order a reader
          needs them: what the patient was before treatment, then what has
          happened since. Merging them into one "risk" line is what made the old
          report unable to say "low risk, deteriorated anyway". */}
      <ReportBlock title="Baseline cardiovascular risk">
        {picture.baselineRisk.applicable ? (
          <>
            <ReportRows
              rows={[
                ["HFA-ICOS category", picture.baselineRisk.category],
                ["Moderate-risk total", `${picture.baselineRisk.points} point${picture.baselineRisk.points === 1 ? "" : "s"}`],
                ["Rule applied", picture.baselineRisk.rule],
                ["Baseline LVEF", patient.baselineLVEF ? `${patient.baselineLVEF}%` : null],
                ["Baseline GLS", patient.baselineGLS ? `${patient.baselineGLS}%` : null],
                ["Baseline dataset", `${picture.completeness.percent}% complete — ${picture.completeness.bandLabel.toLowerCase()}`],
              ]}
            />
            <h3>Contributing factors</h3>
            {picture.baselineRisk.contributing.length === 0 ? (
              <p className="report-empty">No risk factor from this proforma is present.</p>
            ) : (
              <ul className="report-list">
                {picture.baselineRisk.contributing.map((factor) => (
                  <li key={factor.id}>
                    {factor.label} — {factor.tierLabel.toLowerCase()}
                    {factor.weight ? ` (${factor.weight} point${factor.weight === 1 ? "" : "s"})` : ""}
                  </li>
                ))}
              </ul>
            )}
            <h3>Workings</h3>
            <ul className="report-list">
              {picture.baselineRisk.workings.map((step) => <li key={step}>{step}</li>)}
            </ul>
            {picture.baselineRisk.limitation && <p><strong>Limitation:</strong> {picture.baselineRisk.limitation}</p>}
            {picture.completeness.caveat && <p><strong>Data completeness:</strong> {picture.completeness.caveat}</p>}
          </>
        ) : (
          <p>
            No published HFA-ICOS baseline proforma applies to the planned therapy.{" "}
            {picture.baselineRisk.unscoredNotes.map((item) => item.note).filter(Boolean).join(" ")}
          </p>
        )}
      </ReportBlock>

      <ReportBlock title="Current cardiovascular status (CTR-CVT)">
        <ReportRows
          rows={[
            ["Overall severity", picture.ctrCvt.overallLabel],
            ["Cardiac dysfunction", picture.ctrCvt.byId.cardiacDysfunction.severityLabel],
            ["Myocarditis", picture.ctrCvt.byId.myocarditis.severityLabel],
            ["Vascular / ischaemic", picture.ctrCvt.byId.vascularIschaemic.severityLabel],
            ["Hypertension", picture.ctrCvt.byId.hypertension.severityLabel],
            ["Arrhythmia / QTc", picture.ctrCvt.byId.arrhythmiaQt.severityLabel],
            ["Management level", `${picture.currentRisk}${picture.riskEscalation ? ` — raised: ${picture.riskEscalation}` : ""}`],
          ]}
        />
        {picture.ctrCvt.active.length > 0 && (
          <ul className="report-list">
            {picture.ctrCvt.active.flatMap((domain) => domain.findings.map((finding) => <li key={`${domain.id}-${finding}`}>{finding}</li>))}
          </ul>
        )}
        {picture.unexpectedDeterioration && (
          <p>
            <strong>Note:</strong> this patient&rsquo;s baseline category was {String(picture.baselineRisk.category).toLowerCase()} and toxicity has
            developed anyway. Baseline stratification identifies who is most likely to run into trouble; it does not identify everyone who will.
          </p>
        )}
      </ReportBlock>

      {picture.series.some((series) => series.current !== null) && (
        <ReportBlock title="Measurement trends">
          <ul className="report-list">
            {picture.series
              .filter((series) => series.current !== null)
              .map((series) => <li key={series.id}>{series.statement}</li>)}
          </ul>
        </ReportBlock>
      )}

      {picture.ledger.total > 0 && (
        <ReportBlock title="Treatment exposure">
          <ReportRows
            rows={[
              ["Cumulative doxorubicin-equivalent", `${picture.ledger.total} mg/m²`],
              ["Given before registration", picture.ledger.prior ? `${picture.ledger.prior} mg/m²` : null],
              ["Equivalence model", `${picture.ledger.model.label} (${picture.ledger.model.citation})`],
              ["Threshold reached", picture.ledger.assessment.reached?.label || "None"],
              ["Projected on completion", `${picture.ledger.assessment.projected} mg/m²`],
            ]}
          />
          {picture.ledger.entries.filter((entry) => entry.scored).length > 0 && (
            <>
              <h3>Dose ledger</h3>
              <ul className="report-list">
                {picture.ledger.entries
                  .filter((entry) => entry.scored)
                  .map((entry) => (
                    <li key={entry.key}>
                      {entry.agentLabel} {entry.enteredDose} {entry.unit === "mg" ? "mg" : "mg/m²"} × factor {entry.factor} ={" "}
                      {entry.equivalent} mg/m² doxorubicin-equivalent (running total {entry.runningTotal} mg/m²)
                    </li>
                  ))}
              </ul>
            </>
          )}
          {picture.ledger.divergenceNote && <p><strong>Equivalence models:</strong> {picture.ledger.divergenceNote}</p>}
          {picture.ledger.unscoredNote && <p><strong>Not counted:</strong> {picture.ledger.unscoredNote}</p>}
        </ReportBlock>
      )}

      {picture.redFlags.flags.length > 0 && (
        <ReportBlock title="Current alerts">
          <ul className="report-list">
            {picture.redFlags.flags.map((flag) => (
              <li key={`${flag.id}-${flag.level}`}>
                <strong>{flag.levelLabel.toUpperCase()} — {flag.title}.</strong> {flag.finding} Action: {flag.action} ({flag.provenance.shortLabel})
              </li>
            ))}
          </ul>
        </ReportBlock>
      )}

      {/* Surveillance is reported with the reason and the source for each item,
          so a colleague reading this can see why a test was asked for rather
          than only that it was. */}
      <ReportBlock title="Surveillance due">
        {picture.tasks.filter((task) => !task.completed).length === 0 ? (
          <p className="report-empty">Nothing outstanding at this encounter.</p>
        ) : (
          <ul className="report-list">
            {picture.tasks
              .filter((task) => !task.completed)
              .map((task) => (
                <li key={task.id}>
                  <strong>{task.what || task.label}</strong> — {task.when}. Why: {task.why} ({task.provenance?.shortLabel || "source not recorded"})
                </li>
              ))}
          </ul>
        )}
      </ReportBlock>

      <ReportBlock title="Next review">
        <ReportRows
          rows={[
            ["Acuity", picture.nextFollowUp.label],
            ["Date", encounter.nextFollowUpDate || picture.nextFollowUp.date],
            ["Reason", picture.nextFollowUp.reason],
          ]}
        />
        {encounter.plan && <p><strong>Management plan:</strong> {encounter.plan}</p>}
      </ReportBlock>

      <ReportBlock title="Clinical decision support">
        {picture.recommendations.length === 0 ? (
          <p className="report-empty">No cardioprotection prompt raised at this encounter.</p>
        ) : (
          <ul className="report-list">
            {picture.recommendations.map((rec) => (
              <li key={rec.id}>
                <strong>{rec.title} — {rec.strength.toLowerCase()}.</strong> {rec.statement || rec.guidance} Triggered by: {rec.reasons.join("; ")}.
                {rec.onTreatment ? ` Already prescribed: ${rec.current}.` : ""}
                {rec.provenance ? ` (${rec.provenance.shortLabel})` : ""}
              </li>
            ))}
          </ul>
        )}
        <p>
          These are prompts for clinical consideration, not prescriptions. CORSC does not hold renal function, electrolytes, standing blood pressure or
          allergy history, and cannot determine that a medicine is indicated for this patient.
        </p>
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

      <ReportBlock title="Clinician assessment">
        {encounter.notes ? <p>{encounter.notes}</p> : <p className="report-empty">No clinician narrative recorded for this encounter.</p>}
      </ReportBlock>

      {/* Overrides are reported in full — the algorithmic result, the
          clinician's result, and the reason. A report that showed only the
          final value would make a computed category and a clinical decision
          indistinguishable to the next reader. */}
      <ReportBlock title="Clinician overrides">
        {picture.overrides.length === 0 ? (
          <p className="report-empty">No result on this record has been overridden. Every value above is as CORSC calculated it.</p>
        ) : (
          <ul className="report-list">
            {picture.overrides.map((override) => (
              <li key={override.id}>
                <strong>{override.targetLabel}.</strong> CORSC calculated {override.algorithmicValue || "no value"}; clinician recorded{" "}
                {override.clinicianValue}. Reason: {override.reason}. Recorded by{" "}
                {override.clinician.name || override.clinician.email || override.clinician.id} on {String(override.at).slice(0, 10)}
                {override.active === false ? " (subsequently withdrawn)" : ""}.
              </li>
            ))}
          </ul>
        )}
      </ReportBlock>

      {/* The provenance appendix. Every rule that produced anything above is
          citable from one place, so a clinician disagreeing with an output can
          go to the source rather than to the source code. */}
      <ReportBlock title="Clinical sources and provenance">
        <div>
          {reportSources(picture).map((source) => (
            <div key={source.id} style={{ marginBottom: "8px" }}>
              <div><strong>{source.shortLabel}</strong>{source.version ? ` · ${source.version}` : ""}</div>
              <div style={{ fontSize: "9pt", color: "#555" }}>{source.citation}</div>
              {source.caveat && <div style={{ fontSize: "9pt", color: "#8a5a00" }}>{source.caveat}</div>}
            </div>
          ))}
        </div>
        <ReportRows
          rows={[
            ["CORSC rules version", RULES_VERSION],
            ["Baseline proforma verification", picture.baselineRisk.partiallyVerified ? "Partially verified — see limitation above" : "Verified against source"],
            ["Anthracycline equivalence model", picture.ledger.model.label],
          ]}
        />
      </ReportBlock>

      <footer className="report-footer">
        Decision support based on the HFA-ICOS risk framework and ESC 2022 cardio-oncology guidelines. Every value in this report is either a
        calculated result or a recorded clinician decision, and the two are labelled separately. It does not replace clinical judgement, full guideline
        review, or multidisciplinary cardio-oncology input. For use by qualified clinicians only. CORSC rules version {RULES_VERSION}.
      </footer>
    </div>
  );
}

export const OVERVIEW_ICON = FileText;
