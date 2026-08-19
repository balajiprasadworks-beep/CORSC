import { describe, expect, it } from "vitest";

import {
  ENTRY_METHODS,
  activePhase,
  activePhaseTherapyClasses,
  agentsWithoutTherapyClass,
  corscTherapyClassForAgent,
  courseFromPreset,
  courseLabel,
  courseReview,
  courseSummary,
  createAgent,
  createPhase,
  createTreatmentCourse,
  derivedTherapyClasses,
  isStructured,
  isUnstructured,
  mergeTherapySelection,
  normaliseTreatmentCourse,
  phaseText,
  phaseTransitionReason,
  phaseTransitions,
  priorPhaseTherapyClasses,
  setActivePhase,
  therapyClassSources,
} from "@/lib/treatment-course";
import { regimenById, searchRegimens } from "@/lib/regimen-library";

/* ------------------------------------------------------------------ presets */

describe("courseFromPreset", () => {
  it("loads every phase of a multi-phase regimen in order", () => {
    const course = courseFromPreset("breast_ac_th");

    expect(course.entryMethod).toBe(ENTRY_METHODS.preset.id);
    expect(course.regimenFamily).toBe("AC-TH");
    expect(course.phases.map((phase) => phase.name)).toEqual(["AC", "TH", "Trastuzumab maintenance"]);
  });

  it("keeps every agent of a combination phase", () => {
    const course = courseFromPreset("breast_ac_th");
    const [ac, th] = course.phases;

    // The case the flat model could not express: two agents given together,
    // then a different pair afterwards.
    expect(ac.agents.map((agent) => agent.genericName)).toEqual(["doxorubicin", "cyclophosphamide"]);
    expect(th.agents.map((agent) => agent.genericName)).toEqual(["docetaxel", "trastuzumab"]);
  });

  it("marks the maintenance phase", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(course.phases.at(-1).maintenance).toBe(true);
  });

  it("starts the patient on the first phase", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(activePhase(course).name).toBe("AC");
  });

  it("returns null for an identifier the library does not hold", () => {
    expect(courseFromPreset("not_a_regimen")).toBeNull();
  });
});

/* --------------------------------------------------- therapy class mapping */

describe("therapy class derivation", () => {
  it("maps the library's classes onto the CORSC classes the engines branch on", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(derivedTherapyClasses(course)).toEqual(["anthracycline", "her2"]);
  });

  it("carries an earlier phase's exposure into the derived classes", () => {
    // Anthracycline cardiotoxicity is cumulative and does not end when the
    // anthracycline does. A patient who has moved on to trastuzumab is still
    // an anthracycline-exposed patient.
    const course = courseFromPreset("breast_ac_th");
    course.activePhaseId = course.phases[1].id;

    expect(activePhaseTherapyClasses(course)).toEqual(["her2"]);
    expect(priorPhaseTherapyClasses(course)).toEqual(["anthracycline"]);
    expect(derivedTherapyClasses(course)).toContain("anthracycline");
  });

  it("assigns no CORSC class to agents CORSC has no pathway for", () => {
    // A taxane is a real drug class, but CORSC carries no proforma or
    // surveillance pathway for one. Claiming a class here would assert a
    // pathway that does not exist.
    expect(corscTherapyClassForAgent(createAgent({ genericName: "docetaxel", therapyClass: "taxane" }))).toBeNull();
    expect(corscTherapyClassForAgent(createAgent({ genericName: "carboplatin", therapyClass: "platinum" }))).toBeNull();
  });

  it("resolves a class from the drug library when the agent does not state one", () => {
    const agent = createAgent({ genericName: "doxorubicin" });
    expect(corscTherapyClassForAgent(agent)).toBe("anthracycline");
  });

  it("lets a clinician assert a class the library cannot supply", () => {
    // A drug the library has never heard of — nothing can derive a class for
    // it from the library, only the clinician's own assertion.
    const agent = createAgent({ genericName: "an-agent-not-in-any-library", corscTherapyClass: "bcrabl" });
    expect(corscTherapyClassForAgent(agent)).toBe("bcrabl");
  });

  it("ignores an asserted class that is not a CORSC therapy class", () => {
    const agent = createAgent({ genericName: "an-agent-not-in-any-library", corscTherapyClass: "not-a-class" });
    expect(corscTherapyClassForAgent(agent)).toBeNull();
  });

  it("resolves ponatinib to bcrabl via the library now that BCR-ABL TKIs are represented in it", () => {
    const agent = createAgent({ genericName: "ponatinib" });
    expect(corscTherapyClassForAgent(agent)).toBe("bcrabl");
  });

  it("resolves dabrafenib to rafmek via the library", () => {
    const agent = createAgent({ genericName: "dabrafenib" });
    expect(corscTherapyClassForAgent(agent)).toBe("rafmek");
  });

  it("derives fluoropyrimidine and checkpoint-inhibitor classes", () => {
    const folfox = courseFromPreset("crc_folfox");
    expect(derivedTherapyClasses(folfox)).toContain("fluoropyrimidine");

    const pembro = courseFromPreset("lung_carbopac_pembro");
    expect(derivedTherapyClasses(pembro)).toContain("ici");
  });
});

/* ------------------------------------------------------- the no-parse rule */

describe("free text is never interpreted", () => {
  const freeText = createTreatmentCourse({
    entryMethod: ENTRY_METHODS.freeText.id,
    freeTextDescription: "AC-T with trastuzumab, doxorubicin 60 mg/m2",
  });

  it("derives no therapy classes from regimen text", () => {
    // The text names an anthracycline and a HER2 antibody in plain sight.
    // CORSC still derives nothing, because a regimen string cannot be parsed
    // reliably enough to decide surveillance.
    expect(derivedTherapyClasses(freeText)).toEqual([]);
    expect(activePhaseTherapyClasses(freeText)).toEqual([]);
    expect(priorPhaseTherapyClasses(freeText)).toEqual([]);
  });

  it("reports itself as unstructured and requiring review", () => {
    expect(isStructured(freeText)).toBe(false);
    expect(isUnstructured(freeText)).toBe(true);

    const review = courseReview(freeText);
    expect(review.status).toBe("unstructured");
    expect(review.requiresReview).toBe(true);
  });

  it("preserves the text exactly, including spacing and punctuation", () => {
    const messy = createTreatmentCourse({
      entryMethod: ENTRY_METHODS.freeText.id,
      freeTextDescription: "  FOLFIRINOX (modified) — oxaliplatin omitted C3  ",
    });
    expect(messy.freeTextDescription).toBe("  FOLFIRINOX (modified) — oxaliplatin omitted C3  ");
    expect(courseSummary(messy)).toBe("  FOLFIRINOX (modified) — oxaliplatin omitted C3  ");
  });

  it("adds nothing to the therapy selection", () => {
    expect(mergeTherapySelection(["anthracycline"], freeText)).toEqual(["anthracycline"]);
  });
});

/* ---------------------------------------------------------- review surface */

describe("courseReview", () => {
  it("names the agents that generate no surveillance", () => {
    const course = courseFromPreset("breast_ac_th");
    const unmapped = agentsWithoutTherapyClass(course).map((agent) => agent.genericName);

    expect(unmapped).toContain("cyclophosphamide");
    expect(unmapped).toContain("docetaxel");
    expect(unmapped).not.toContain("doxorubicin");
  });

  it("flags a structured course with no cardio-oncology class at all", () => {
    const course = courseFromPreset("pan_gem_nabpac");
    expect(derivedTherapyClasses(course)).toEqual([]);

    const review = courseReview(course);
    expect(review.status).toBe("noCardiotoxicClass");
    expect(review.requiresReview).toBe(true);
  });

  it("does not ask for review when every agent maps", () => {
    const course = createTreatmentCourse({
      entryMethod: ENTRY_METHODS.builder.id,
      phases: [createPhase({ name: "AC", agents: [createAgent({ genericName: "doxorubicin" })] })],
    });

    const review = courseReview(course);
    expect(review.status).toBe("structured");
    expect(review.requiresReview).toBe(false);
  });

  it("reports an empty course as empty rather than as a problem", () => {
    expect(courseReview(createTreatmentCourse()).status).toBe("empty");
    expect(courseReview(null).status).toBe("empty");
  });
});

/* ------------------------------------------------------- therapy selection */

describe("mergeTherapySelection", () => {
  it("adds the classes a preset accounts for", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(mergeTherapySelection([], course)).toEqual(["anthracycline", "her2"]);
  });

  it("never removes a class the clinician selected by hand", () => {
    // bcrabl appears in no library regimen. Attaching a preset must not
    // silently retract a class recorded from the patient's own history.
    const course = courseFromPreset("breast_ac_th");
    expect(mergeTherapySelection(["bcrabl"], course)).toEqual(["bcrabl", "anthracycline", "her2"]);
  });

  it("does not duplicate a class already selected", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(mergeTherapySelection(["her2"], course)).toEqual(["her2", "anthracycline"]);
  });

  it("distinguishes regimen-derived classes from hand-picked ones", () => {
    const course = courseFromPreset("breast_ac_th");
    const sources = therapyClassSources(course, ["anthracycline", "her2", "bcrabl"]);

    expect(sources).toEqual({ anthracycline: "regimen", her2: "regimen", bcrabl: "manual" });
  });
});

/* ------------------------------------------------------------- transitions */

describe("setActivePhase", () => {
  it("moves the active phase and stamps today's date on first activation", () => {
    const course = courseFromPreset("breast_ac_th");
    const th = course.phases[1];

    const moved = setActivePhase(course, th.id, { on: "2026-05-01" });

    expect(moved.activePhaseId).toBe(th.id);
    expect(moved.phases[1].activatedOn).toBe("2026-05-01");
    // AC's own activation is untouched by moving on from it.
    expect(moved.phases[0].activatedOn).toBeNull();
  });

  it("does not overwrite an existing activation date on re-selection", () => {
    const course = courseFromPreset("breast_ac_th");
    const th = course.phases[1];

    const first = setActivePhase(course, th.id, { on: "2026-05-01" });
    const again = setActivePhase(first, th.id, { on: "2026-06-15" });

    expect(again.phases[1].activatedOn).toBe("2026-05-01");
  });

  it("leaves the course unchanged for a phase id it does not contain", () => {
    const course = courseFromPreset("breast_ac_th");
    expect(setActivePhase(course, "not-a-real-phase")).toBe(course);
  });

  it("does not mutate the original course", () => {
    const course = courseFromPreset("breast_ac_th");
    const original = JSON.parse(JSON.stringify(course));
    setActivePhase(course, course.phases[1].id, { on: "2026-05-01" });
    expect(course).toEqual(original);
  });
});

describe("phaseTransitions", () => {
  it("produces no transition for the course's first activated phase", () => {
    // Starting treatment is not a transition from a prior phase.
    let course = courseFromPreset("breast_ac_th");
    course = setActivePhase(course, course.phases[0].id, { on: "2026-01-01" });
    expect(phaseTransitions(course)).toEqual([]);
  });

  it("records the AC-to-TH transition the specification uses as its example", () => {
    let course = courseFromPreset("breast_ac_th");
    course = setActivePhase(course, course.phases[0].id, { on: "2026-01-01" });
    course = setActivePhase(course, course.phases[1].id, { on: "2026-03-15" });

    const transitions = phaseTransitions(course);
    expect(transitions).toHaveLength(1);
    expect(transitions[0].from.name).toBe("AC");
    expect(transitions[0].to.name).toBe("TH");
    expect(transitions[0].on).toBe("2026-03-15");
    expect(transitions[0].reason).toContain("no longer receiving Anthracyclines");
    expect(transitions[0].reason).toContain("now on HER2-targeted therapy");
  });

  it("orders transitions by when they actually happened, not by phase sequence", () => {
    let course = courseFromPreset("breast_ac_th");
    course = setActivePhase(course, course.phases[0].id, { on: "2026-01-01" });
    course = setActivePhase(course, course.phases[1].id, { on: "2026-03-15" });
    course = setActivePhase(course, course.phases[2].id, { on: "2026-09-01" });

    const transitions = phaseTransitions(course);
    expect(transitions.map((t) => t.to.name)).toEqual(["TH", "Trastuzumab maintenance"]);
  });

  it("says explicitly when the therapy classes are unchanged across a transition", () => {
    const reason = phaseTransitionReason(
      createPhase({ name: "TH", agents: [createAgent({ genericName: "trastuzumab" })] }),
      createPhase({ name: "Trastuzumab maintenance", agents: [createAgent({ genericName: "trastuzumab" })] })
    );
    expect(reason).toContain("continue");
    expect(reason).toContain("unchanged");
  });
});

/* ------------------------------------------------------------- the builder */

describe("hand-built courses", () => {
  it("uses the same structure and derivation as a preset", () => {
    const course = createTreatmentCourse({
      entryMethod: ENTRY_METHODS.builder.id,
      phases: [
        createPhase({
          name: "AC",
          sequence: 1,
          plannedCycles: 4,
          agents: [createAgent({ genericName: "doxorubicin" }), createAgent({ genericName: "cyclophosphamide" })],
        }),
        createPhase({
          name: "THP",
          sequence: 2,
          plannedCycles: 12,
          agents: [
            createAgent({ genericName: "paclitaxel" }),
            createAgent({ genericName: "trastuzumab" }),
            createAgent({ genericName: "pertuzumab" }),
          ],
        }),
      ],
    });

    expect(isStructured(course)).toBe(true);
    expect(derivedTherapyClasses(course)).toEqual(["anthracycline", "her2"]);
    expect(courseSummary(course)).toBe(
      "Doxorubicin + Cyclophosphamide × 4 → Paclitaxel + Trastuzumab + Pertuzumab × 12"
    );
  });

  it("orders phases by sequence rather than by insertion", () => {
    const course = createTreatmentCourse({
      entryMethod: ENTRY_METHODS.builder.id,
      phases: [
        createPhase({ id: "b", name: "Second", sequence: 2 }),
        createPhase({ id: "a", name: "First", sequence: 1 }),
      ],
    });
    expect(courseLabel(course)).toBe("First → Second");
  });

  it("describes a phase measured in time rather than cycles", () => {
    const phase = createPhase({
      name: "Maintenance",
      agents: [createAgent({ genericName: "trastuzumab" })],
      duration: "to complete 1 year",
    });
    expect(phaseText(phase)).toBe("Trastuzumab — to complete 1 year");
  });
});

/* ------------------------------------------------------------- migration */

describe("normaliseTreatmentCourse", () => {
  it("turns a legacy regimen string into a free-text course, unparsed", () => {
    const course = normaliseTreatmentCourse(null, "AC-T followed by trastuzumab");

    expect(course.entryMethod).toBe(ENTRY_METHODS.freeText.id);
    expect(course.freeTextDescription).toBe("AC-T followed by trastuzumab");
    expect(course.phases).toEqual([]);
    // The decisive assertion: migrating an old record invents no clinical fact.
    expect(derivedTherapyClasses(course)).toEqual([]);
  });

  it("keeps a stored structured course intact", () => {
    const stored = courseFromPreset("breast_ac_th");
    const course = normaliseTreatmentCourse(JSON.parse(JSON.stringify(stored)), "AC-TH");

    expect(course.entryMethod).toBe(ENTRY_METHODS.preset.id);
    expect(course.phases).toHaveLength(3);
    expect(derivedTherapyClasses(course)).toEqual(["anthracycline", "her2"]);
  });

  it("falls back to the legacy text when a stored course carries none", () => {
    const course = normaliseTreatmentCourse({ entryMethod: "freeText", phases: [] }, "R-CHOP");
    expect(course.freeTextDescription).toBe("R-CHOP");
  });

  it("rejects an unrecognised entry method rather than trusting it", () => {
    const course = normaliseTreatmentCourse({ entryMethod: "sql-injection", phases: [] }, "");
    expect(course.entryMethod).toBe(ENTRY_METHODS.freeText.id);
  });
});

/* --------------------------------------------------------------- library */

describe("regimen library", () => {
  it("finds a regimen by its canonical name", () => {
    expect(searchRegimens("AC-TH").map((r) => r.id)).toContain("breast_ac_th");
  });

  it("finds a regimen by an agent the clinician remembers", () => {
    expect(searchRegimens("trastuzumab").length).toBeGreaterThan(0);
  });

  it("narrows rather than widens as terms are added", () => {
    const broad = searchRegimens("carboplatin");
    const narrow = searchRegimens("carboplatin pembrolizumab");
    expect(narrow.length).toBeLessThan(broad.length);
    expect(narrow.length).toBeGreaterThan(0);
  });

  it("ranks a name match above an agent match", () => {
    // "AC" appears as a name and inside many regimens' agent lists.
    expect(searchRegimens("AC")[0].name).toBe("AC");
  });

  it("returns the library rather than nothing for an empty query", () => {
    expect(searchRegimens("").length).toBeGreaterThan(0);
  });

  it("filters by cancer type", () => {
    const results = searchRegimens("", { cancerType: "breast" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((regimen) => regimen.cancerType === "breast")).toBe(true);
  });

  it("carries the evidence metadata every preset was built from", () => {
    const regimen = regimenById("breast_ac_th");
    expect(regimen.sources.length).toBeGreaterThan(0);
    expect(regimen.verification.verified).toBe(true);
    expect(regimen.lastVerified).toBeTruthy();
  });

  it("states no doses, because the library deliberately encodes none", () => {
    // A preset that asserted a dose would be inventing a prescribing decision
    // that varies by protocol variant and body surface area.
    for (const regimen of [regimenById("breast_ac_th"), regimenById("dlbcl_rchop")]) {
      for (const phase of regimen.phases) {
        for (const agent of phase.agents) {
          expect(agent).not.toHaveProperty("dose");
        }
      }
    }
  });
});
