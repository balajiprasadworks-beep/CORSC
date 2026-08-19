/* =========================================================================
   The treatment course.

   A cancer treatment is a sequence of phases, and each phase can run several
   agents at once. "AC-THP" is not one regimen with one therapy class: it is
   anthracycline and an alkylating agent for four cycles, then a taxane with
   two HER2 antibodies, then HER2 blockade alone to a year. Surveillance
   differs at every step, so a model that stores one regimen string and one
   therapy list cannot express the thing it is being asked to monitor.

   This module holds that structure, and it is shared by all three entry
   paths — the clinician who picks a preset, the clinician who builds a course
   by hand, and the clinician who types free text — so that nothing downstream
   has to care which path was taken.

   ---------------------------------------------------------------------------
   THE RULE THIS MODULE EXISTS TO ENFORCE
   ---------------------------------------------------------------------------
   Structured clinical facts come only from structured entry.

   A preset was chosen from a library that states its agents, so its therapy
   classes are known. A hand-built course was assembled by the clinician, so its
   agents are known. FREE TEXT IS NOT PARSED. CORSC does not read "AC-T" and
   conclude "anthracycline", because the same field legitimately contains
   "modified FOLFOX, oxaliplatin omitted cycle 3", "trial protocol XYZ-2",
   or a regimen from a hospital whose abbreviations CORSC has never seen.
   Guessing right most of the time is not a defensible property for something
   that decides whether a patient gets an echocardiogram.

   A free-text course therefore derives NOTHING. It is marked unstructured, and
   the clinician selects the therapy classes themselves — exactly as they did
   before this module existed.
   ========================================================================= */

import { drugByName, regimenById } from "@/lib/regimen-library";
import { THERAPY_CLASSES, therapyName } from "@/lib/clinical-data";
import { provenance } from "@/lib/clinical-sources";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------------------------------------------------- entry methods */

export const ENTRY_METHODS = {
  preset: {
    id: "preset",
    label: "Choose common regimen",
    hint: "Search the library. The phases and agents come with it.",
    structured: true,
  },
  builder: {
    id: "builder",
    label: "Build regimen",
    hint: "Construct the phases and agents yourself, including combinations.",
    structured: true,
  },
  freeText: {
    id: "freeText",
    label: "Free text",
    hint: "For modified, external or trial regimens. Recorded exactly as written.",
    structured: false,
  },
};

export const ENTRY_METHOD_LIST = [ENTRY_METHODS.preset, ENTRY_METHODS.builder, ENTRY_METHODS.freeText];

/* ------------------------------------------------------- therapy mapping */

/**
 * The library's therapy vocabulary, mapped onto the CORSC therapy classes the
 * engines actually branch on.
 *
 * Only classes with a defensible counterpart appear here. CORSC's therapy
 * classes are not a drug taxonomy — they are the classes for which CORSC
 * carries a risk proforma (lib/hfa-icos.js) or a surveillance pathway
 * (lib/therapy-pathways.js). A taxane is a real drug class and is recorded as
 * one, but mapping it onto a CORSC class would claim a cardiotoxicity pathway
 * that CORSC does not implement and no guideline in the provenance registry
 * supports.
 *
 * Unmapped is therefore the correct outcome for most agents, not a gap. The
 * agents are still stored, still displayed, and still shown to the clinician —
 * see `agentsWithoutTherapyClass`.
 *
 * Two CORSC classes — `bcrabl` and `rafmek` — have no representation in the
 * library at all. They remain available through manual selection.
 */
export const LIBRARY_CLASS_TO_CORSC = {
  anthracycline: "anthracycline",
  "HER2-targeted therapy": "her2",
  "VEGF/VEGFR-directed therapy": "vegf",
  "proteasome inhibitor": "proteasome",
  "immune checkpoint inhibitor": "ici",
  fluoropyrimidine: "fluoropyrimidine",
};

const CORSC_CLASS_IDS = new Set(THERAPY_CLASSES.map((therapy) => therapy.id));

/**
 * The CORSC therapy class for one agent, or null when it has none.
 *
 * Resolution order is the agent's own recorded class, then the library's drug
 * metadata. Both use the same vocabulary, so they agree; the fallback exists
 * for hand-built agents where the clinician picked a drug without stating a
 * class.
 */
export function corscTherapyClassForAgent(agent) {
  if (!agent) return null;

  // An explicitly set CORSC class wins: the builder lets a clinician state one
  // for an agent the library does not know, and their judgement is the record.
  if (agent.corscTherapyClass && CORSC_CLASS_IDS.has(agent.corscTherapyClass)) {
    return agent.corscTherapyClass;
  }

  const fromAgent = LIBRARY_CLASS_TO_CORSC[agent.therapyClass];
  if (fromAgent) return fromAgent;

  const drug = drugByName(agent.genericName);
  if (drug) {
    const fromDrug = LIBRARY_CLASS_TO_CORSC[drug.therapyClass];
    if (fromDrug) return fromDrug;
  }

  return null;
}

/* ------------------------------------------------------------- factories */

let sequence = 0;
function localId(prefix) {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}`;
}

export function createAgent(input = {}) {
  return {
    genericName: input.genericName || "",
    drugClass: input.drugClass || null,
    /** The library's vocabulary, kept verbatim so the mapping stays auditable. */
    therapyClass: input.therapyClass || null,
    /** Set only when a clinician asserts a CORSC class the library cannot supply. */
    corscTherapyClass: input.corscTherapyClass || null,
    role: input.role || null,
  };
}

export function createPhase(input = {}) {
  return {
    id: input.id || localId("ph"),
    name: input.name || "",
    sequence: input.sequence ?? 1,
    agents: (input.agents || []).map(createAgent),
    plannedCycles: input.plannedCycles ?? null,
    duration: input.duration || null,
    schedule: input.schedule || null,
    maintenance: Boolean(input.maintenance),
    transitionCondition: input.transitionCondition || null,
    /** The date this phase first became active. Null until it does. */
    activatedOn: input.activatedOn || null,
  };
}

/**
 * An empty course.
 *
 * `freeTextDescription` is present on every course, not only free-text ones,
 * because the existing free-text regimen field is never taken away — a preset
 * still allows a note about how this patient's course departs from it.
 */
export function createTreatmentCourse(input = {}) {
  return {
    entryMethod: input.entryMethod || ENTRY_METHODS.freeText.id,
    regimenId: input.regimenId || null,
    regimenFamily: input.regimenFamily || null,
    protocolVariant: input.protocolVariant || null,
    freeTextDescription: input.freeTextDescription || "",
    phases: (input.phases || []).map(createPhase),
    activePhaseId: input.activePhaseId || null,
    libraryVersion: input.libraryVersion || null,
  };
}

/* -------------------------------------------------------- preset loading */

/**
 * Builds a course from a library regimen.
 *
 * The preset is a starting point, not a contract: every phase and agent stays
 * editable afterwards, because a real patient's course departs from the
 * published regimen more often than not.
 */
export function courseFromPreset(regimenOrId, options = {}) {
  const regimen = typeof regimenOrId === "string" ? regimenById(regimenOrId) : regimenOrId;
  if (!regimen) return null;

  const phases = (regimen.phases || []).map((phase) =>
    createPhase({
      id: `${regimen.id}_${phase.id}`,
      name: phase.name,
      sequence: phase.sequence,
      agents: phase.agents,
      plannedCycles: phase.plannedCycles ?? null,
      duration: phase.duration || null,
      schedule: phase.schedule || null,
      maintenance: phase.maintenance,
      transitionCondition: phase.transitionCondition || null,
    })
  );

  /* A regimen with no phase breakdown still gets one phase, so that every
     structured course has the same shape and nothing downstream needs a
     special case for "regimen without phases". */
  if (phases.length === 0 && regimen.agents?.length) {
    phases.push(createPhase({ name: regimen.name, sequence: 1, agents: regimen.agents }));
  }

  return createTreatmentCourse({
    entryMethod: ENTRY_METHODS.preset.id,
    regimenId: regimen.id,
    regimenFamily: regimen.name,
    protocolVariant: options.protocolVariant || null,
    freeTextDescription: options.freeTextDescription || "",
    phases,
    activePhaseId: phases[0]?.id || null,
    libraryVersion: options.libraryVersion || null,
  });
}

/* -------------------------------------------------------------- accessors */

export function isStructured(course) {
  if (!course) return false;
  return ENTRY_METHODS[course.entryMethod]?.structured === true && (course.phases || []).length > 0;
}

/** True when the course carries text CORSC has deliberately not interpreted. */
export function isUnstructured(course) {
  if (!course) return false;
  return !isStructured(course) && Boolean(String(course.freeTextDescription || "").trim());
}

export function orderedPhases(course) {
  return [...(course?.phases || [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

/**
 * The phase the patient is on now.
 *
 * Falls back to the first phase rather than to none: a course that has been
 * built but never explicitly advanced is at its beginning, and returning null
 * would make the header read "no active therapy" for a patient on cycle 1.
 */
export function activePhase(course) {
  const phases = orderedPhases(course);
  if (phases.length === 0) return null;
  if (course?.activePhaseId) {
    const match = phases.find((phase) => phase.id === course.activePhaseId);
    if (match) return match;
  }
  return phases[0];
}

export function phasePosition(course) {
  const phases = orderedPhases(course);
  const current = activePhase(course);
  if (!current) return { index: 0, total: 0 };
  return { index: phases.findIndex((phase) => phase.id === current.id) + 1, total: phases.length };
}

/**
 * Moves the course onto a different phase.
 *
 * The moment this happens is recorded, not just the fact of it: the target
 * phase's `activatedOn` is stamped with today (or the given date) the first
 * time it becomes active, so the record shows when the patient's monitoring
 * schedule actually changed rather than only what it is now. Re-selecting a
 * phase that already has an activation date leaves that date alone — the
 * first time a phase started is the fact worth keeping, and moving forward
 * and back between phases must not keep rewriting it.
 *
 * Returns the course unchanged if the phase id does not belong to it.
 */
export function setActivePhase(course, phaseId, { on } = {}) {
  const phases = orderedPhases(course);
  if (!phases.some((phase) => phase.id === phaseId)) return course;

  return {
    ...course,
    activePhaseId: phaseId,
    phases: course.phases.map((phase) =>
      phase.id === phaseId && !phase.activatedOn ? { ...phase, activatedOn: on || todayISO() } : phase
    ),
  };
}

/* ------------------------------------------------- therapy class derivation */

function classesFromPhases(phases) {
  const classes = [];
  for (const phase of phases) {
    for (const agent of phase.agents || []) {
      const corscClass = corscTherapyClassForAgent(agent);
      if (corscClass && !classes.includes(corscClass)) classes.push(corscClass);
    }
  }
  return classes;
}

/**
 * Every CORSC therapy class this course exposes the patient to, across all
 * phases.
 *
 * All phases, not just the active one, and deliberately so. Anthracycline
 * cardiotoxicity does not end when the anthracycline phase does — the exposure
 * is cumulative and permanent, and a patient who has finished AC and moved to
 * trastuzumab is at higher risk than one who received trastuzumab alone. An
 * engine shown only the active phase would forget the anthracycline exactly
 * when it matters most.
 *
 * Returns an empty list for a free-text course. That is the no-inference rule.
 */
export function derivedTherapyClasses(course) {
  if (!isStructured(course)) return [];
  return classesFromPhases(orderedPhases(course));
}

/** The classes of the active phase alone, for "what is being given today". */
export function activePhaseTherapyClasses(course) {
  if (!isStructured(course)) return [];
  const current = activePhase(course);
  return current ? classesFromPhases([current]) : [];
}

/** Classes the patient has already been exposed to in completed phases. */
export function priorPhaseTherapyClasses(course) {
  if (!isStructured(course)) return [];
  const phases = orderedPhases(course);
  const current = activePhase(course);
  const currentIndex = current ? phases.findIndex((phase) => phase.id === current.id) : 0;
  return classesFromPhases(phases.slice(0, Math.max(currentIndex, 0)));
}

/* ------------------------------------------------------------- transitions */

/**
 * The plain-language reason a phase transition matters, in the terms the
 * specification itself uses: which cardio-oncology classes were being given
 * before, which are being given now, and what changed between them.
 *
 * Built from the classes rather than the phase names, because "AC to TH" means
 * nothing to a reader who has not memorised the regimen, while "no longer
 * receiving an anthracycline; now on HER2-targeted therapy" is the sentence
 * that explains why the surveillance plan is different starting today.
 */
export function phaseTransitionReason(fromPhase, toPhase) {
  const before = new Set(classesFromPhases([fromPhase]));
  const after = new Set(classesFromPhases([toPhase]));
  const stopped = [...before].filter((id) => !after.has(id));
  const started = [...after].filter((id) => !before.has(id));

  const parts = [];
  if (stopped.length) parts.push(`no longer receiving ${stopped.map(therapyName).join(" or ")}`);
  if (started.length) parts.push(`now on ${started.map(therapyName).join(" and ")}`);

  if (parts.length === 0) {
    return `Moved from ${fromPhase.name} to ${toPhase.name}. The same cardio-oncology therapy classes continue, so the surveillance schedule is unchanged.`;
  }
  return `Current active therapy changed from ${fromPhase.name} to ${toPhase.name} — ${parts.join(", ")}.`;
}

/**
 * Every phase transition this course has actually gone through, in order.
 *
 * Derived from `activatedOn` rather than stored as its own list: a phase
 * becoming active IS the transition, so there is one fact to keep in sync
 * rather than two. The course's first activated phase produces no transition
 * — starting treatment is not a change from a prior phase, it is the
 * beginning, and the existing timeline already has its own "treatment start"
 * event for that.
 */
export function phaseTransitions(course) {
  const activated = orderedPhases(course)
    .filter((phase) => phase.activatedOn)
    .sort((a, b) => (a.activatedOn < b.activatedOn ? -1 : a.activatedOn > b.activatedOn ? 1 : 0));

  const transitions = [];
  for (let i = 1; i < activated.length; i += 1) {
    const from = activated[i - 1];
    const to = activated[i];
    transitions.push({ from, to, on: to.activatedOn, reason: phaseTransitionReason(from, to) });
  }
  return transitions;
}

/* --------------------------------------------------------- review surfacing */

const PROVENANCE = provenance("corsc-operational", {
  locator: "Structured treatment course",
  note: "A CORSC data structure. Therapy classes are derived from recorded agents only; free-text regimens are never parsed.",
});

/**
 * Agents the course records that CORSC has no surveillance pathway for.
 *
 * This is not an error list. Most cancer agents have no cardio-oncology
 * pathway, and saying so plainly is more useful than silence: it tells the
 * clinician that CORSC's monitoring plan covers the anthracycline in this
 * regimen and not the platinum, so they know what the plan does and does not
 * account for.
 *
 * Where the library records cardiovascular toxicity for an unmapped agent, it
 * is carried through as information — explicitly NOT converted into a therapy
 * class, which would silently change which proforma runs.
 */
export function agentsWithoutTherapyClass(course) {
  if (!isStructured(course)) return [];

  const seen = new Set();
  const out = [];

  for (const phase of orderedPhases(course)) {
    for (const agent of phase.agents || []) {
      if (corscTherapyClassForAgent(agent)) continue;
      if (seen.has(agent.genericName)) continue;
      seen.add(agent.genericName);

      const drug = drugByName(agent.genericName);
      out.push({
        genericName: agent.genericName,
        drugClass: agent.drugClass || drug?.drugClass || null,
        therapyClass: agent.therapyClass || drug?.therapyClass || null,
        phaseName: phase.name,
        /** Recorded by the library, shown as context, never acted on. */
        cardiovascularToxicity: drug?.cvToxicity || [],
      });
    }
  }

  return out;
}

/**
 * What a clinician needs to be told about this course before trusting the
 * monitoring plan derived from it.
 *
 * A free-text course produces the loudest notice, because it is the one case
 * where CORSC genuinely knows nothing and the surveillance plan rests entirely
 * on the therapy classes the clinician ticked by hand.
 */
export function courseReview(course) {
  if (!course || (!isStructured(course) && !isUnstructured(course))) {
    return {
      status: "empty",
      structured: false,
      requiresReview: false,
      headline: "No treatment recorded",
      detail: "Record the planned treatment so risk and surveillance can be derived.",
      unmappedAgents: [],
      provenance: PROVENANCE,
    };
  }

  if (!isStructured(course)) {
    return {
      status: "unstructured",
      structured: false,
      requiresReview: true,
      headline: "Free-text regimen — not interpreted by CORSC",
      detail:
        "The regimen is stored exactly as written. CORSC has not derived drugs, phases or therapy classes from it, so the therapy classes below must be selected by hand for risk and surveillance to be correct.",
      unmappedAgents: [],
      provenance: PROVENANCE,
    };
  }

  const unmapped = agentsWithoutTherapyClass(course);
  const derived = derivedTherapyClasses(course);

  if (derived.length === 0) {
    return {
      status: "noCardiotoxicClass",
      structured: true,
      requiresReview: true,
      headline: "No cardio-oncology therapy class in this regimen",
      detail:
        "The agents recorded here have no CORSC surveillance pathway. Confirm the therapy classes by hand if this patient is under cardio-oncology follow-up for a reason this regimen does not explain.",
      unmappedAgents: unmapped,
      provenance: PROVENANCE,
    };
  }

  return {
    status: "structured",
    structured: true,
    requiresReview: false,
    headline: `${derived.length} cardio-oncology therapy class${derived.length === 1 ? "" : "es"} derived from the recorded agents`,
    detail: unmapped.length
      ? `${unmapped.length} further agent${unmapped.length === 1 ? " has" : "s have"} no CORSC surveillance pathway and ${unmapped.length === 1 ? "is" : "are"} not reflected in the monitoring plan.`
      : "Every agent in this course maps to a CORSC surveillance pathway.",
    unmappedAgents: unmapped,
    provenance: PROVENANCE,
  };
}

/* ------------------------------------------------- therapy selection merge */

/**
 * The therapy classes to store after a structured course changes.
 *
 * A union, never a replacement. A clinician who ticked `bcrabl` — which no
 * library regimen carries — must not lose it because they later attached a
 * preset, and a class recorded from the patient's history is a clinical fact
 * that a regimen change does not retract. Derived classes are added; nothing
 * is taken away.
 *
 * Removing a class stays a deliberate act in the therapy list itself, where
 * the clinician can see what they are removing.
 */
export function mergeTherapySelection(currentTherapy, course) {
  const current = Array.isArray(currentTherapy) ? currentTherapy.filter(Boolean) : [];
  const derived = derivedTherapyClasses(course);
  const merged = [...current];
  for (const therapyClass of derived) {
    if (!merged.includes(therapyClass)) merged.push(therapyClass);
  }
  return merged;
}

/**
 * Which of the selected therapy classes this course accounts for.
 *
 * Lets the UI show a class as derived-from-regimen rather than hand-ticked,
 * so the clinician can tell what the record would still hold if they changed
 * the regimen.
 */
export function therapyClassSources(course, currentTherapy) {
  const derived = new Set(derivedTherapyClasses(course));
  const current = Array.isArray(currentTherapy) ? currentTherapy.filter(Boolean) : [];
  return Object.fromEntries(current.map((id) => [id, derived.has(id) ? "regimen" : "manual"]));
}

/* ---------------------------------------------------------------- display */

function titleCase(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Doxorubicin + Cyclophosphamide", the agents of one phase. */
export function phaseAgentText(phase) {
  return (phase?.agents || []).map((agent) => titleCase(agent.genericName)).join(" + ");
}

/** "Doxorubicin + Cyclophosphamide × 4", one phase with its cycle count. */
export function phaseText(phase) {
  const agents = phaseAgentText(phase);
  if (!agents) return phase?.name || "";
  if (phase.plannedCycles) return `${agents} × ${phase.plannedCycles}`;
  if (phase.duration) return `${agents} — ${phase.duration}`;
  return agents;
}

/**
 * The whole course on one line.
 *
 * A free-text course returns its text verbatim. Reformatting it — even
 * trimming punctuation — would mean the record no longer shows what the
 * clinician actually wrote.
 */
export function courseSummary(course) {
  if (!course) return "";
  if (!isStructured(course)) return course.freeTextDescription || "";

  const phases = orderedPhases(course);
  if (phases.length === 0) return course.regimenFamily || "";
  return phases.map(phaseText).join(" → ");
}

/** The name to show in a header: the regimen family, or the free text. */
export function courseLabel(course) {
  if (!course) return "";
  if (course.regimenFamily) return course.regimenFamily;
  if (!isStructured(course)) return course.freeTextDescription || "";
  return orderedPhases(course).map((phase) => phase.name).filter(Boolean).join(" → ");
}

/* ------------------------------------------------------------- migration */

/**
 * Brings a stored course up to the current shape, and builds one for records
 * saved before treatment courses existed.
 *
 * A record with only a regimen string becomes a free-text course carrying that
 * exact string. It is NOT parsed into phases — the same rule applies to a
 * record written two years ago as to one written today, and a migration that
 * guessed would rewrite history with invented facts.
 */
export function normaliseTreatmentCourse(raw, fallbackRegimenText = "") {
  if (raw && typeof raw === "object" && (raw.entryMethod || raw.phases)) {
    const course = createTreatmentCourse({
      ...raw,
      phases: Array.isArray(raw.phases) ? raw.phases : [],
    });
    if (!ENTRY_METHODS[course.entryMethod]) course.entryMethod = ENTRY_METHODS.freeText.id;
    // Keep the free-text field populated from the legacy string when the stored
    // course never had one, so nothing the clinician typed is dropped.
    if (!course.freeTextDescription && fallbackRegimenText) {
      course.freeTextDescription = fallbackRegimenText;
    }
    return course;
  }

  return createTreatmentCourse({
    entryMethod: ENTRY_METHODS.freeText.id,
    freeTextDescription: fallbackRegimenText || "",
  });
}
