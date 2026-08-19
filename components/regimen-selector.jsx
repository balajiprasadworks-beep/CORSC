"use client";

/* =========================================================================
   Regimen entry — three paths to one structure.

   The clinician chooses how to record the treatment, not which data model to
   populate. A preset and a hand-built course produce the same
   `treatmentCourse`; free text produces none, and says so.

   The free-text field is not a fallback for when the other two fail. Modified
   protocols, trial arms and regimens from another hospital are ordinary
   cardio-oncology, and forcing them through a structured builder would either
   lose detail or invite the clinician to approximate. Typing it out is a
   legitimate answer, and it stays exactly where it was.
   ========================================================================= */

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  Info,
  Layers,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Callout, Field, Panel, SegmentedControl, Stack, StatusChip, TextField } from "@/components/kit";
import { THERAPY_CLASSES, therapyName } from "@/lib/clinical-data";
import {
  cancerTypes,
  LIBRARY_VERIFIED_ON,
  LIBRARY_VERSION,
  allDrugs,
  phaseAgentSummary,
  regimenPhaseSummary,
  searchRegimens,
} from "@/lib/regimen-library";
import {
  ENTRY_METHODS,
  ENTRY_METHOD_LIST,
  activePhase,
  courseFromPreset,
  courseReview,
  createAgent,
  createPhase,
  createTreatmentCourse,
  derivedTherapyClasses,
  mergeTherapySelection,
  orderedPhases,
  phaseText,
  phaseTransitionReason,
  setActivePhase,
} from "@/lib/treatment-course";

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition " +
  "placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/25";

const smallInput =
  "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 transition " +
  "placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

function titleCase(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* --------------------------------------------------------- preset picker */

function PresetPicker({ course, onSelect }) {
  const [query, setQuery] = useState("");
  const [cancerType, setCancerType] = useState("");

  const types = useMemo(() => cancerTypes(), []);
  const results = useMemo(
    () => searchRegimens(query, { cancerType: cancerType || null, limit: 30 }),
    [query, cancerType]
  );

  const selectedId = course?.regimenId || null;

  return (
    <Stack>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, alias, cancer type or drug — e.g. AC-TH, R-CHOP, trastuzumab"
            aria-label="Search the regimen library"
            className={`${inputBase} pl-9`}
          />
        </div>
        <select
          value={cancerType}
          onChange={(event) => setCancerType(event.target.value)}
          aria-label="Filter by cancer type"
          className={`${inputBase} sm:w-56`}
        >
          <option value="">All cancer types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {results.length === 0 ? (
        <Callout tone="info" title="No regimen matches that search" icon={Info}>
          The library holds common regimens, not every protocol. Build the regimen by hand, or record it as free text —
          both are fully supported.
        </Callout>
      ) : (
        <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1" aria-label="Regimen search results">
          {results.map((regimen) => {
            const active = regimen.id === selectedId;
            return (
              <li key={regimen.id}>
                <button
                  type="button"
                  onClick={() => onSelect(regimen)}
                  aria-pressed={active}
                  className={`flex w-full gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                    active
                      ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600/20"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                      active ? "border-teal-700 bg-teal-700" : "border-slate-300 bg-white"
                    }`}
                  >
                    {active && <Check size={13} className="text-white" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[14px] font-semibold text-slate-900">{regimen.name}</span>
                      <span className="text-[12px] text-slate-500">{regimen.cancerType.replace(/_/g, " ")}</span>
                      {regimen.hasMaintenance && <StatusChip tone="info">maintenance</StatusChip>}
                    </span>
                    {regimen.aliases?.length > 0 && (
                      <span className="mt-0.5 block text-[12px] text-slate-400">
                        also known as {regimen.aliases.join(", ")}
                      </span>
                    )}
                    <span className="mt-1 block text-[12.5px] text-slate-600">
                      {regimenPhaseSummary(regimen) || phaseAgentSummary({ agents: regimen.agents })}
                    </span>
                    {regimen.cardioOncologyClasses?.length > 0 && (
                      <span className="mt-1 block text-[12px] text-teal-700">
                        Cardio-oncology relevant: {regimen.cardioOncologyClasses.join(", ")}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11.5px] leading-relaxed text-slate-400">
        Regimen library {LIBRARY_VERSION}, verified {LIBRARY_VERIFIED_ON}. Presets carry the regimen&rsquo;s identity,
        phases and agents. They deliberately carry no doses — those vary by protocol variant and local practice, and
        every phase stays editable after you select it.
      </p>
    </Stack>
  );
}

/* -------------------------------------------------------------- builder */

function AgentRow({ agent, onChange, onRemove, drugNames }) {
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
      <div className="min-w-[9rem] flex-1">
        <input
          type="text"
          list="corsc-regimen-drugs"
          value={agent.genericName}
          onChange={(event) => {
            const genericName = event.target.value;
            const known = drugNames.get(genericName.trim().toLowerCase());
            onChange({
              genericName,
              // Adopting the library's classes when the name matches is a lookup,
              // not an inference: the clinician chose this drug by name.
              drugClass: known ? known.drugClass : null,
              therapyClass: known ? known.therapyClass : null,
            });
          }}
          placeholder="Drug name"
          aria-label="Drug name"
          className={smallInput}
        />
      </div>
      <div className="min-w-[10rem] flex-1">
        <select
          value={agent.corscTherapyClass || ""}
          onChange={(event) => onChange({ corscTherapyClass: event.target.value || null })}
          aria-label="Cardio-oncology therapy class"
          className={smallInput}
        >
          <option value="">
            {agent.therapyClass ? `From library: ${agent.therapyClass}` : "No cardio-oncology class"}
          </option>
          {THERAPY_CLASSES.map((therapy) => (
            <option key={therapy.id} value={therapy.id}>
              {therapy.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${agent.genericName || "agent"}`}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function PhaseCard({ phase, index, total, onChange, onRemove, drugNames }) {
  const update = (patch) => onChange({ ...phase, ...patch });

  const updateAgent = (agentIndex, patch) =>
    update({
      agents: phase.agents.map((agent, i) => (i === agentIndex ? { ...agent, ...patch } : agent)),
    });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11.5px] font-semibold text-slate-500">
          {index + 1}
        </span>
        <input
          type="text"
          value={phase.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder={`Phase ${index + 1} name — e.g. AC`}
          aria-label={`Phase ${index + 1} name`}
          className={`${smallInput} flex-1 font-semibold`}
        />
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove phase ${index + 1}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-red-600"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mb-2.5 grid gap-2 sm:grid-cols-3">
        <input
          type="number"
          min="0"
          value={phase.plannedCycles ?? ""}
          onChange={(event) =>
            update({ plannedCycles: event.target.value === "" ? null : Number(event.target.value) })
          }
          placeholder="Planned cycles"
          aria-label={`Phase ${index + 1} planned cycles`}
          className={smallInput}
        />
        <input
          type="text"
          value={phase.duration || ""}
          onChange={(event) => update({ duration: event.target.value || null })}
          placeholder="Duration — e.g. to 1 year"
          aria-label={`Phase ${index + 1} duration`}
          className={smallInput}
        />
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12.5px] text-slate-600">
          <input
            type="checkbox"
            checked={Boolean(phase.maintenance)}
            onChange={(event) => update({ maintenance: event.target.checked })}
            className="size-3.5 accent-teal-700"
          />
          Maintenance phase
        </label>
      </div>

      <div className="space-y-1.5">
        {phase.agents.map((agent, agentIndex) => (
          <AgentRow
            key={agentIndex}
            agent={agent}
            drugNames={drugNames}
            onChange={(patch) => updateAgent(agentIndex, patch)}
            onRemove={() => update({ agents: phase.agents.filter((_, i) => i !== agentIndex) })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => update({ agents: [...phase.agents, createAgent()] })}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
      >
        <Plus size={13} aria-hidden="true" /> Add drug to this phase
      </button>
    </div>
  );
}

function RegimenBuilder({ course, onCourseChange }) {
  const drugNames = useMemo(
    () => new Map(allDrugs().map((drug) => [drug.genericName.toLowerCase(), drug])),
    []
  );
  const phases = orderedPhases(course);

  const setPhases = (next) =>
    onCourseChange({
      ...course,
      phases: next.map((phase, index) => ({ ...phase, sequence: index + 1 })),
      activePhaseId: next.some((phase) => phase.id === course.activePhaseId)
        ? course.activePhaseId
        : next[0]?.id || null,
    });

  return (
    <Stack>
      <datalist id="corsc-regimen-drugs">
        {allDrugs().map((drug) => (
          <option key={drug.genericName} value={drug.genericName}>
            {drug.drugClass || ""}
          </option>
        ))}
      </datalist>

      {phases.length === 0 ? (
        <Callout tone="info" title="Build the course one phase at a time" icon={Layers}>
          A phase is a block of treatment given together — &ldquo;AC&rdquo;, then &ldquo;THP&rdquo;, then maintenance.
          Add every drug given within a phase; combination therapy is the normal case, not an exception.
        </Callout>
      ) : (
        <div className="space-y-2">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={index}
              total={phases.length}
              drugNames={drugNames}
              onChange={(next) => setPhases(phases.map((p, i) => (i === index ? next : p)))}
              onRemove={() => setPhases(phases.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setPhases([
            ...phases,
            createPhase({ sequence: phases.length + 1, agents: [createAgent()] }),
          ])
        }
        className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
      >
        <Plus size={14} aria-hidden="true" /> Add phase
      </button>
    </Stack>
  );
}

/* ------------------------------------------------------------- summary */

/**
 * One phase row, with the control to mark it active.
 *
 * Advancing is a confirmation, not a click: the clinician sees the same
 * "current therapy changed from X to Y — what that means" sentence the
 * timeline and the audit trail will carry, before it becomes true of the
 * record. Mirrors the spec's own requirement that a phase transition happen
 * "by cycle number/date and also manual confirmation".
 */
function PhaseRow({ phase, index, isLast, isActive, course, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const current = activePhase(course);
  const reason = current && current.id !== phase.id ? phaseTransitionReason(current, phase) : null;

  return (
    <li className="text-[13px] text-slate-700">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold ring-1 ${
            isActive ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-500 ring-slate-200"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="font-medium text-slate-900">{phase.name || `Phase ${index + 1}`}</span>
            {isActive && <StatusChip tone="ok">current</StatusChip>}
            {phase.maintenance && <span className="text-[11.5px] text-teal-700">maintenance</span>}
          </span>
          {phaseText(phase) && <span className="block text-slate-600">{phaseText(phase)}</span>}
          {phase.activatedOn && (
            <span className="block text-[11.5px] text-slate-400">Active from {phase.activatedOn}</span>
          )}
        </span>
        {!isActive && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
          >
            Mark active
          </button>
        )}
      </div>

      {confirming && (
        <div className="ml-7 mt-2 rounded-lg border border-teal-200 bg-teal-50/60 p-2.5">
          <p className="text-[12.5px] leading-relaxed text-slate-700">{reason}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onConfirm(phase.id);
                setConfirming(false);
              }}
              className="rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-teal-800"
            >
              Confirm — this is now the active phase
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isLast && (
        <div className="ml-2.5 flex h-3 items-center">
          <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
        </div>
      )}
    </li>
  );
}

function CourseSummary({ course, onCourseChange }) {
  const review = courseReview(course);
  const derived = derivedTherapyClasses(course);
  const phases = orderedPhases(course);
  const current = activePhase(course);

  if (review.status === "empty") return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Recorded treatment course
      </div>

      {phases.length > 0 ? (
        <ol className="mb-3 space-y-1.5">
          {phases.map((phase, index) => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              index={index}
              isLast={index === phases.length - 1}
              isActive={current?.id === phase.id}
              course={course}
              onConfirm={(phaseId) => onCourseChange(setActivePhase(course, phaseId))}
            />
          ))}
        </ol>
      ) : (
        <p className="mb-3 whitespace-pre-wrap text-[13px] text-slate-700">{course.freeTextDescription}</p>
      )}

      {derived.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-slate-500">Surveillance follows:</span>
          {derived.map((id) => (
            <StatusChip key={id} tone="ok">
              {therapyName(id)}
            </StatusChip>
          ))}
        </div>
      )}

      {review.requiresReview && (
        <Callout
          tone={review.status === "unstructured" ? "warning" : "info"}
          title={review.headline}
          icon={review.status === "unstructured" ? AlertTriangle : Info}
        >
          {review.detail}
        </Callout>
      )}

      {review.unmappedAgents.length > 0 && (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
          <span className="font-medium text-slate-600">Not covered by a CORSC pathway:</span>{" "}
          {review.unmappedAgents.map((agent) => titleCase(agent.genericName)).join(", ")}. These are recorded on the
          record but do not generate cardiac surveillance.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ container */

/**
 * The regimen entry control.
 *
 * @param {object}   props
 * @param {object}   props.value     the patient draft
 * @param {Function} props.onChange  receives a patch for the draft
 */
export function RegimenSelector({ value, onChange }) {
  const course = value.treatmentCourse;
  const method = course?.entryMethod || ENTRY_METHODS.freeText.id;

  /** Applies a structured course and folds its therapy classes into the record. */
  function applyCourse(nextCourse, patch = {}) {
    onChange({
      treatmentCourse: nextCourse,
      therapy: mergeTherapySelection(value.therapy, nextCourse),
      ...patch,
    });
  }

  function switchMethod(nextMethod) {
    if (!nextMethod || nextMethod === method) return;

    if (nextMethod === ENTRY_METHODS.freeText.id) {
      /* The structured course is dropped, but the text is not: whatever the
         clinician had written stays in the field they are switching to. */
      onChange({
        treatmentCourse: createTreatmentCourse({
          entryMethod: ENTRY_METHODS.freeText.id,
          freeTextDescription: course?.freeTextDescription || value.regimen || "",
        }),
      });
      return;
    }

    if (nextMethod === ENTRY_METHODS.builder.id) {
      /* Preset → builder keeps the phases. Selecting a published regimen and
         then correcting it for this patient is the common case, not a reset. */
      applyCourse(
        createTreatmentCourse({
          ...(course || {}),
          entryMethod: ENTRY_METHODS.builder.id,
          phases: course?.phases?.length ? course.phases : [createPhase({ agents: [createAgent()] })],
        })
      );
      return;
    }

    applyCourse(
      createTreatmentCourse({
        ...(course || {}),
        entryMethod: ENTRY_METHODS.preset.id,
        phases: course?.regimenId ? course.phases : [],
      })
    );
  }

  function selectPreset(regimen) {
    const next = courseFromPreset(regimen, {
      freeTextDescription: course?.freeTextDescription || "",
      libraryVersion: LIBRARY_VERSION,
    });
    if (!next) return;
    // The regimen name populates the existing free-text field so the record,
    // the timeline and the printed report read the same as they always have.
    applyCourse(next, { regimen: regimen.name });
  }

  return (
    <Panel title="Planned treatment" subtitle="Course details drive the surveillance schedule">
      <Stack>
        <Field
          label="How would you like to record the regimen?"
          hint={ENTRY_METHODS[method]?.hint}
        >
          <SegmentedControl
            value={method}
            onChange={switchMethod}
            options={ENTRY_METHOD_LIST.map((entry) => ({ value: entry.id, label: entry.label }))}
          />
        </Field>

        {method === ENTRY_METHODS.preset.id && (
          <PresetPicker course={course} onSelect={selectPreset} />
        )}

        {method === ENTRY_METHODS.builder.id && (
          <RegimenBuilder course={course} onCourseChange={(next) => applyCourse(next)} />
        )}

        {method === ENTRY_METHODS.freeText.id && (
          <Stack>
            <TextField
              label="Chemotherapy regimen"
              value={value.regimen}
              onChange={(text) =>
                onChange({
                  regimen: text,
                  treatmentCourse: createTreatmentCourse({
                    entryMethod: ENTRY_METHODS.freeText.id,
                    // Stored verbatim. Nothing is parsed out of it.
                    freeTextDescription: text,
                  }),
                })
              }
              placeholder="e.g. AC-T with trastuzumab, oxaliplatin omitted cycle 3"
              hint="Recorded exactly as written. Use this for modified, trial or external regimens."
            />
            <Callout tone="warning" title="Free-text regimens are not interpreted" icon={FileText}>
              CORSC will not read drugs, phases or therapy classes out of this text, because a regimen string cannot be
              parsed reliably enough to decide surveillance. Select the planned anticancer therapy classes below by hand
              so risk and surveillance are correct.
            </Callout>
          </Stack>
        )}

        {method !== ENTRY_METHODS.freeText.id && (
          <TextField
            label="Regimen note"
            value={value.regimen}
            onChange={(text) => onChange({ regimen: text })}
            placeholder="Optional — how this patient's course departs from the standard regimen"
            hint="Free text is never removed. This note is stored alongside the structured course."
          />
        )}

        <CourseSummary course={course} onCourseChange={(next) => applyCourse(next)} />
      </Stack>
    </Panel>
  );
}
