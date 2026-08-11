/* Overrides, audit trail, data completeness and visit-type workflow. */

import { describe, expect, it } from "vitest";

import { AUDITABLE_FIELDS, auditEntry, auditOverride, auditSummary, auditTrail, diffPatient } from "@/lib/audit-log";
import { BANDS, assessCompleteness, isProvisional } from "@/lib/completeness";
import { OverrideError, activeOverride, createOverride, overrideHistory, resolveValue, withdrawOverride } from "@/lib/overrides";
import {
  SINCE_LAST_VISIT_ITEMS,
  VISIT_TYPE_LIST,
  interpretSinceLastVisit,
  mergeIntervalSymptoms,
  resolveVisitType,
  sectionApplies,
} from "@/lib/visit-types";

const clinician = { id: "u1", email: "clinician@example.org", name: "Dr Reyes" };

/* =========================================================== overrides */

describe("clinician overrides", () => {
  const valid = { target: "risk", algorithmicValue: "Moderate", clinicianValue: "High", reason: "Frailty not captured by the proforma", clinician };

  it("records both values, never replacing the algorithmic one", () => {
    const override = createOverride(valid);
    expect(override.algorithmicValue).toBe("Moderate");
    expect(override.clinicianValue).toBe("High");
  });

  it("refuses an override with no reason", () => {
    expect(() => createOverride({ ...valid, reason: "  " })).toThrow(OverrideError);
  });

  it("refuses an override with no identified clinician", () => {
    expect(() => createOverride({ ...valid, clinician: {} })).toThrow(OverrideError);
  });

  it("refuses an override with no value", () => {
    expect(() => createOverride({ ...valid, clinicianValue: "" })).toThrow(OverrideError);
  });

  it("refuses an unknown target", () => {
    expect(() => createOverride({ ...valid, target: "something-else" })).toThrow(OverrideError);
  });

  it("shows the algorithmic value when nothing is overridden", () => {
    const resolved = resolveValue({ overrides: [], target: "risk", algorithmicValue: "Low" });
    expect(resolved.value).toBe("Low");
    expect(resolved.overridden).toBe(false);
    expect(resolved.attribution).toBe("Calculated by CORSC");
  });

  it("shows the clinician value when overridden, and still carries the original", () => {
    const resolved = resolveValue({ overrides: [createOverride(valid)], target: "risk", algorithmicValue: "Moderate" });
    expect(resolved.value).toBe("High");
    expect(resolved.algorithmicValue).toBe("Moderate");
    expect(resolved.overridden).toBe(true);
    expect(resolved.attribution).toMatch(/Dr Reyes/);
  });

  it("puts both values and the reason into the provenance", () => {
    const resolved = resolveValue({ overrides: [createOverride(valid)], target: "risk", algorithmicValue: "Moderate" });
    expect(resolved.provenance.note).toMatch(/CORSC calculated Moderate/);
    expect(resolved.provenance.note).toMatch(/Frailty not captured/);
  });

  it("uses the most recent override for a target", () => {
    const first = createOverride({ ...valid, clinicianValue: "High", at: "2026-01-01T00:00:00Z" });
    const second = createOverride({ ...valid, clinicianValue: "Very High", at: "2026-02-01T00:00:00Z" });
    expect(activeOverride([first, second], "risk").clinicianValue).toBe("Very High");
  });

  it("withdraws without deleting, so the history survives", () => {
    const override = createOverride(valid);
    const after = withdrawOverride([override], override.id, { clinician, reason: "Entered against the wrong patient" });
    expect(after).toHaveLength(1);
    expect(after[0].active).toBe(false);
    expect(activeOverride(after, "risk")).toBeNull();
  });

  it("keeps withdrawn overrides in the history, labelled", () => {
    const override = createOverride(valid);
    const history = overrideHistory(withdrawOverride([override], override.id, { clinician, reason: "x" }));
    expect(history[0].summary).toMatch(/withdrawn/);
  });

  it("scopes overrides by subject, so one task's override does not apply to another", () => {
    const echo = createOverride({ target: "surveillance", subjectId: "echo", clinicianValue: "deferred", reason: "Scan booked externally", clinician });
    expect(activeOverride([echo], "surveillance", "echo").clinicianValue).toBe("deferred");
    expect(activeOverride([echo], "surveillance", "troponin")).toBeNull();
  });
});

/* =============================================================== audit */

describe("audit trail", () => {
  it("records who, what, when and the before and after", () => {
    const entry = auditEntry({ action: "patientEdited", actor: clinician, field: "baselineLVEF", previous: 60, next: 52 });
    expect(entry.actor.email).toBe("clinician@example.org");
    expect(entry.previous).toBe("60");
    expect(entry.next).toBe("52");
    expect(entry.at).toBeTruthy();
  });

  it("does not copy free-text clinical narrative into the audit trail", () => {
    const entry = auditEntry({ action: "resultEdited", actor: clinician, field: "notes", previous: "Patient reports...", next: "Patient now reports..." });
    expect(entry.previous).not.toMatch(/Patient reports/);
    expect(entry.next).toMatch(/value not copied/);
  });

  it("copies only declared auditable fields", () => {
    expect(AUDITABLE_FIELDS.has("baselineLVEF")).toBe(true);
    expect(AUDITABLE_FIELDS.has("notes")).toBe(false);
  });

  it("diffs a patient and produces one entry per changed field", () => {
    const before = { name: "A", baselineLVEF: 60, age: 60 };
    const after = { name: "A", baselineLVEF: 52, age: 61 };
    const entries = diffPatient(before, after, clinician);
    expect(entries.map((e) => e.field).sort()).toEqual(["age", "baselineLVEF"]);
  });

  it("marks fields that feed the risk calculation", () => {
    const entries = diffPatient({ baselineLVEF: 60 }, { baselineLVEF: 45 }, clinician);
    expect(entries[0].detail).toMatch(/baseline risk calculation/);
  });

  it("does not audit the draft encounter or the trail itself", () => {
    const entries = diffPatient({ draftEncounter: { a: 1 }, auditTrail: [] }, { draftEncounter: { a: 2 }, auditTrail: [{}] }, clinician);
    expect(entries).toHaveLength(0);
  });

  it("uses a therapy-change action when the therapy changes", () => {
    const entries = diffPatient({ therapy: ["anthracycline"] }, { therapy: ["anthracycline", "her2"] }, clinician);
    expect(entries[0].action).toBe("therapyChanged");
    expect(entries[0].next).toBe("anthracycline, her2");
  });

  it("records an override as an audit event carrying its reason", () => {
    const override = createOverride({ target: "risk", algorithmicValue: "Low", clinicianValue: "High", reason: "Known amyloid", clinician });
    const entry = auditOverride({ actor: clinician, override });
    expect(entry.reason).toBe("Known amyloid");
    expect(entry.detail).toMatch(/algorithmic result is retained/);
  });

  it("returns the trail newest first and filters by category", () => {
    const patient = {
      auditTrail: [
        auditEntry({ action: "patientCreated", actor: clinician, at: "2026-01-01T00:00:00Z" }),
        auditEntry({ action: "overrideRecorded", actor: clinician, at: "2026-03-01T00:00:00Z" }),
      ],
    };
    expect(auditTrail(patient)[0].action).toBe("overrideRecorded");
    expect(auditTrail(patient, { category: "override" })).toHaveLength(1);
  });

  it("summarises by category", () => {
    const patient = { auditTrail: [auditEntry({ action: "patientCreated", actor: clinician })] };
    expect(auditSummary(patient).total).toBe(1);
    expect(auditSummary(patient).counts.record).toBe(1);
  });
});

/* ======================================================== completeness */

describe("data completeness", () => {
  const bare = { therapy: ["anthracycline"] };
  const full = {
    patientId: "H123",
    age: 62,
    gender: "Female",
    therapy: ["anthracycline"],
    baselineLVEF: 60,
    baselineGLS: -20,
    baselineTroponin: 5,
    baselineNtProBnp: 40,
    baselineWeight: 70,
    totalPlannedDose: 240,
    troponinAssay: "hs-cTnT",
    medications: [{ name: "Ramipril" }],
    history: {
      cardiovascular: { checks: { hf: false }, fields: { notes: "Nil" } },
      riskFactors: { checks: { htn: true }, fields: {} },
      priorTreatment: { checks: {}, fields: { priorAnthracycline: "0" } },
      lifestyle: { checks: {}, fields: { smoking: "Never" } },
    },
  };

  it("reports insufficient data when critical inputs are missing", () => {
    const result = assessCompleteness(bare);
    expect(result.band).toBe(BANDS.insufficient.id);
    expect(isProvisional(result)).toBe(true);
  });

  it("names the critical gaps", () => {
    expect(assessCompleteness(bare).missingCritical.map((item) => item.id)).toEqual(expect.arrayContaining(["age", "baselineLVEF"]));
  });

  it("marks a complete record as complete", () => {
    const result = assessCompleteness(full);
    expect(result.percent).toBe(100);
    expect(result.band).toBe(BANDS.complete.id);
    expect(result.caveat).toBeNull();
  });

  it("lets a critical gap set the band even when the percentage is high", () => {
    const result = assessCompleteness({ ...full, baselineLVEF: "" });
    expect(result.percent).toBeGreaterThan(80);
    expect(result.band).toBe(BANDS.insufficient.id);
  });

  it("produces a caveat to render beside the risk category", () => {
    expect(assessCompleteness({ ...full, baselineLVEF: "" }).caveat).toMatch(/Provisional/);
  });

  it("requires a baseline troponin on a checkpoint inhibitor, and says why", () => {
    const result = assessCompleteness({ ...full, therapy: ["ici"], baselineTroponin: "" });
    const item = result.missing.find((entry) => entry.id === "baselineTroponinIci");
    expect(item.critical).toBe(true);
    expect(item.why).toMatch(/normal ejection fraction does not exclude/i);
  });

  it("does not demand a baseline QTc from a therapy that does not prolong QT", () => {
    expect(assessCompleteness(full).items.some((item) => item.id === "baselineQtc")).toBe(false);
    expect(assessCompleteness({ ...full, therapy: ["bcrabl"] }).items.some((item) => item.id === "baselineQtc")).toBe(true);
  });

  it("groups the gaps by workflow section so the UI can link to them", () => {
    expect(Object.keys(assessCompleteness(bare).missingBySection)).toEqual(expect.arrayContaining(["registration", "history"]));
  });

  it("weights items, so trivial fields do not mask an important gap", () => {
    const withoutIdentifier = assessCompleteness({ ...full, patientId: "" });
    const withoutLvef = assessCompleteness({ ...full, baselineLVEF: "" });
    expect(withoutIdentifier.percent).toBeGreaterThan(withoutLvef.percent);
  });
});

/* ========================================================= visit types */

describe("visit types", () => {
  it("hides the interval history at a baseline visit, where there is no interval", () => {
    expect(sectionApplies({ visitType: "baseline" }, "since-last-visit")).toBe(false);
    expect(sectionApplies({ visitType: "cycleReview" }, "since-last-visit")).toBe(true);
  });

  it("hides the cycle review at a survivorship visit", () => {
    expect(sectionApplies({ visitType: "twelveMonth" }, "first-review")).toBe(false);
  });

  it("maps free-text types saved by earlier builds", () => {
    expect(resolveVisitType({ type: "Baseline" }).id).toBe("baseline");
    expect(resolveVisitType({ type: "Cycle 4" }).id).toBe("cycleReview");
    expect(resolveVisitType({ type: "12 months post-treatment" }).id).toBe("twelveMonth");
    expect(resolveVisitType({ type: "End of treatment" }).id).toBe("endOfTreatment");
  });

  it("does not mistake twelve months for two months", () => {
    expect(resolveVisitType({ type: "12 months post-treatment" }).id).not.toBe("cycleReview");
  });

  it("defaults to a cycle review rather than guessing something rarer", () => {
    expect(resolveVisitType({}).id).toBe("cycleReview");
  });

  it("gives every visit type a stated purpose", () => {
    expect(sectionApplies({ visitType: "unscheduled" }, "symptoms")).toBe(true);
    VISIT_TYPE_LIST.forEach((type) => {
      expect(type.purpose, type.id).toBeTruthy();
      expect(type.sections.length, type.id).toBeGreaterThan(0);
    });
  });
});

/* ==================================================== since last visit */

describe("since last visit", () => {
  const encounter = (answers) => ({ sinceLastVisit: answers, symptoms: [] });

  it("says the history has not been taken rather than that nothing happened", () => {
    expect(interpretSinceLastVisit({}).summary).toMatch(/not yet taken/);
  });

  it("distinguishes a negative history from an untaken one", () => {
    expect(interpretSinceLastVisit(encounter({ chestPain: { present: false } })).summary).toMatch(/Nothing reported/);
  });

  it("feeds interval symptoms into the encounter's symptom list", () => {
    const result = mergeIntervalSymptoms(encounter({ orthopnoea: { present: true } }));
    expect(result).toContain("Orthopnoea");
  });

  it("does not duplicate a symptom already recorded today", () => {
    const merged = mergeIntervalSymptoms({ sinceLastVisit: { chestPain: { present: true } }, symptoms: ["Chest pain"] });
    expect(merged.filter((s) => s === "Chest pain")).toHaveLength(1);
  });

  it("flags an admission as requiring review regardless of today's measurements", () => {
    const result = interpretSinceLastVisit(encounter({ hospitalisation: { present: true } }));
    expect(result.requiresReview).toBe(true);
    expect(result.events).toContain("hospitalisation");
  });

  it("does not escalate on a dose delay alone", () => {
    expect(interpretSinceLastVisit(encounter({ doseInterruption: { present: true } })).requiresReview).toBe(false);
  });

  it("separates treatment changes from external results", () => {
    const result = interpretSinceLastVisit(encounter({ therapyChange: { present: true }, newImaging: { present: true } }));
    expect(result.treatmentChanges).toEqual(["changed"]);
    expect(result.externalResults).toEqual(["imaging"]);
  });

  it("keeps the free-text detail attached to each positive answer", () => {
    const result = interpretSinceLastVisit(encounter({ hospitalisation: { present: true, detail: "Three nights, treated as pneumonia" } }));
    expect(result.detail.hospitalisation).toMatch(/pneumonia/);
  });

  it("gives every item a signal the engines can act on", () => {
    SINCE_LAST_VISIT_ITEMS.forEach((item) => {
      expect(item.signal, item.id).toMatch(/^(symptom|event|treatment|result):/);
    });
  });
});
