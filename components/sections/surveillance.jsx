"use client";

/* =========================================================================
   Surveillance and HFA-ICOS.

   The former surveillance page and HFA-ICOS page merged into one live plan:
   what is due today, what is overdue, how often this patient should be seen,
   and the fitness-to-proceed decision with its audit trail.
   ========================================================================= */

import { AlertTriangle, CalendarCheck, CheckCircle2, ShieldCheck } from "lucide-react";

import {
  Callout,
  EmptyState,
  Grid,
  MetricTile,
  Panel,
  Stack,
  StatusChip,
  mono,
} from "@/components/kit";
import {
  ABSOLUTE_CI,
  DRUG_DB,
  FOLLOW_UP_DAYS,
  RELATIVE_CI,
  hasTherapy,
  riskStyle,
  therapyName,
} from "@/lib/clinical-data";
import { STATUS_STYLES } from "@/lib/investigation-timeline";
import { isTaskComplete } from "@/lib/surveillance-engine";
import { therapyList } from "@/lib/hfa-icos";
import { uid } from "@/lib/patient-model";

const STATUS_TONE = { completed: "ok", due: "info", overdue: "warning", missing: "danger", pending: "neutral" };

export function SurveillanceSection({ patient, setPatient, encounter, setEncounter, picture }) {
  const { tasks, tasksDone, nextFollowUp, outstanding, currentRisk, engineVisit } = picture;
  const therapies = therapyList(patient.therapy);
  const drugs = therapies.map((id) => ({ id, drug: DRUG_DB[id] })).filter((item) => item.drug);
  const styles = riskStyle(currentRisk);
  const contraindications = patient.contraindications || { absolute: {}, relative: {} };

  function toggleTask(task) {
    setEncounter((current) => ({
      ...current,
      taskCompletion: {
        ...current.taskCompletion,
        [task.id]: !isTaskComplete(task, { ...engineVisit, taskCompletion: current.taskCompletion }),
      },
    }));
  }

  function setContraindication(group, id, value) {
    setPatient((current) => ({
      ...current,
      contraindications: {
        ...current.contraindications,
        [group]: { ...current.contraindications?.[group], [id]: value },
      },
    }));
  }

  function logFitnessDecision() {
    const anyAbsolute = Object.values(contraindications.absolute || {}).some(Boolean);
    const anyRelative = Object.values(contraindications.relative || {}).some(Boolean);
    const decision = anyAbsolute ? "Not fit to proceed" : anyRelative ? "Fit with caution" : "Fit to proceed";
    setPatient((current) => ({
      ...current,
      auditTrail: [
        {
          id: uid("a"),
          title: `Contraindication review — cycle ${encounter.firstReview?.cycle || current.cycle || 0}`,
          date: new Date().toLocaleString(),
          decision,
          text: `Absolute: ${anyAbsolute ? "Yes" : "No"} · Relative: ${anyRelative ? "Yes" : "No"} · HFA-ICOS: ${currentRisk}`,
        },
        ...(current.auditTrail || []),
      ],
    }));
  }

  const urgentTasks = tasks.filter((task) => task.priority === "urgent");
  const overdueItems = outstanding.filter((item) => item.status === "missing" || item.status === "overdue");

  return (
    <Stack gap="gap-4">
      <Grid cols="sm:grid-cols-3">
        <MetricTile label="Tasks complete" value={`${tasksDone}/${tasks.length}`} caption="Generated for this encounter" tone={tasksDone === tasks.length ? "ok" : "info"} />
        <MetricTile label="Review interval" value={FOLLOW_UP_DAYS[currentRisk]} unit="days" caption={`${currentRisk} risk category`} />
        <MetricTile label="Next contact" value={nextFollowUp.date} caption={`${nextFollowUp.label} — ${nextFollowUp.reason}`} tone={nextFollowUp.tone} />
      </Grid>

      {urgentTasks.length > 0 && (
        <Callout tone="danger" title={`${urgentTasks.length} urgent action${urgentTasks.length === 1 ? "" : "s"} triggered by current findings`} icon={AlertTriangle}>
          {urgentTasks.map((task) => task.label).join(" · ")}
        </Callout>
      )}

      <Panel
        title="Surveillance plan for this visit"
        subtitle="Recalculated from therapy, risk, cycle and live findings"
        right={<StatusChip tone={tasksDone === tasks.length ? "ok" : "info"}>{tasksDone}/{tasks.length}</StatusChip>}
      >
        <div className="space-y-1">
          {tasks.map((task) => {
            const done = isTaskComplete(task, engineVisit);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task)}
                aria-pressed={done}
                className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${done ? "bg-teal-700" : "border border-slate-300"}`}>
                  {done && <CheckCircle2 size={13} className="text-white" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className={`text-[13.5px] font-medium ${done ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.label}</span>
                    {task.priority === "urgent" && <StatusChip tone="danger">Urgent</StatusChip>}
                    {task.priority === "surveillance" && <StatusChip tone="info">Surveillance</StatusChip>}
                  </span>
                  {task.detail && <span className={`mt-0.5 block text-[12.5px] leading-relaxed ${done ? "text-slate-400" : "text-slate-500"}`}>{task.detail}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Next due investigations" subtitle="Across the whole treatment journey, most urgent first">
        {outstanding.length === 0 ? (
          <Callout tone="ok" title="Nothing outstanding">Every scheduled investigation up to this point is recorded.</Callout>
        ) : (
          <div className="space-y-1.5">
            {outstanding.slice(0, 8).map((item) => {
              const style = STATUS_STYLES[item.status];
              return (
                <div key={`${item.milestoneId}-${item.id}`} className="flex items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-medium text-slate-800">{item.label}</span>
                      <StatusChip tone={STATUS_TONE[item.status]}>{style.label}</StatusChip>
                      <span className="text-[12px] text-slate-400">{item.milestone}</span>
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-slate-500">{item.reason}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {overdueItems.length > 0 && (
        <Callout tone="danger" title={`${overdueItems.length} missed or overdue investigation${overdueItems.length === 1 ? "" : "s"}`} icon={AlertTriangle}>
          {overdueItems.slice(0, 5).map((item) => `${item.label} (${item.milestone})`).join(" · ")}. Arrange these before the next dose where the
          result would change management.
        </Callout>
      )}

      {drugs.length === 0 && (
        <Panel title="Guideline monitoring">
          <EmptyState>Select a planned anticancer therapy in registration to load its monitoring protocol.</EmptyState>
        </Panel>
      )}

      {drugs.map(({ id, drug }) => (
      <Panel key={id} title={`Guideline monitoring — ${therapyName(id)}`} subtitle="Baseline, on-treatment and post-treatment requirements">
        {drug ? (
          <Grid cols="lg:grid-cols-3">
            {[
              { title: "Baseline", items: drug.baseline },
              { title: "During therapy", items: drug.monitoring },
              { title: "After treatment", items: drug.postTx },
            ].map((block) => (
              <div key={block.title} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">{block.title}</div>
                <ul className="space-y-1.5 pl-4 text-[13px] leading-relaxed text-slate-700">
                  {block.items.map((item) => <li key={item} className="list-disc">{item}</li>)}
                </ul>
              </div>
            ))}
          </Grid>
        ) : (
          <EmptyState>No monitoring protocol is held for this therapy class.</EmptyState>
        )}
      </Panel>
      ))}

      <Panel title="Risk-linked surveillance adjustment" tone="neutral">
        <div className={`rounded-xl border p-3 ${styles.bg} ${styles.border}`}>
          <div className="text-[13.5px] font-semibold text-slate-900">
            {currentRisk} risk — review every {FOLLOW_UP_DAYS[currentRisk]} days
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            The next contact is set for {nextFollowUp.date}, {nextFollowUp.days} days from this review, on the basis of {nextFollowUp.reason}.
            {nextFollowUp.days < FOLLOW_UP_DAYS[currentRisk]
              ? " This is shorter than the routine interval for the risk category because of findings at this visit."
              : ""}
          </p>
        </div>
        {hasTherapy(patient.therapy, "ici") && (
          <div className="mt-2.5">
            <Callout tone="warning" title="Immune checkpoint inhibitor surveillance" icon={AlertTriangle}>
              Check troponin before each of the first three doses. Myocarditis risk is highest in the first six to twelve weeks and can present
              with a normal ejection fraction.
            </Callout>
          </div>
        )}
      </Panel>

      <Panel title="Fitness to proceed" subtitle="Contraindication screen before the next dose">
        <Stack gap="gap-3">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-600">Absolute contraindications</div>
            {ABSOLUTE_CI.map((item) => (
              <ContraindicationRow
                key={item.id}
                label={item.label}
                value={contraindications.absolute?.[item.id]}
                onChange={(value) => setContraindication("absolute", item.id, value)}
                dangerTone="bg-red-600"
              />
            ))}
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-orange-600">Relative contraindications</div>
            {RELATIVE_CI.map((item) => (
              <ContraindicationRow
                key={item.id}
                label={item.label}
                value={contraindications.relative?.[item.id]}
                onChange={(value) => setContraindication("relative", item.id, value)}
                dangerTone="bg-orange-500"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={logFitnessDecision}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-slate-800"
          >
            <ShieldCheck size={15} aria-hidden="true" /> Log fitness decision
          </button>
        </Stack>
      </Panel>

      {(patient.auditTrail || []).length > 0 && (
        <Panel title={`Fitness decision audit trail (${patient.auditTrail.length})`}>
          <div className="space-y-2">
            {patient.auditTrail.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11.5px] text-slate-400" style={mono}>{entry.title}</div>
                <div className="text-[11.5px] text-slate-400" style={mono}>{entry.date}</div>
                <div className={`mt-1 text-[13.5px] font-semibold ${
                  entry.decision === "Not fit to proceed" ? "text-red-700" : entry.decision === "Fit with caution" ? "text-orange-700" : "text-teal-700"
                }`}>
                  {entry.decision}
                </div>
                <div className="text-[12.5px] text-slate-500">{entry.text}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </Stack>
  );
}

function ContraindicationRow({ label, value, onChange, dangerTone }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[13.5px] text-slate-800">{label}</span>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={value === true}
          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${value === true ? `${dangerTone} text-white` : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={value === false}
          className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${value === false ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
        >
          No
        </button>
      </div>
    </div>
  );
}

export const SURVEILLANCE_ICON = CalendarCheck;
