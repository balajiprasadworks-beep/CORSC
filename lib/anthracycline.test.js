import { describe, expect, it } from "vitest";

import {
  ALTERNATIVE_MODEL,
  EQUIVALENCE_MODELS,
  PRIMARY_MODEL,
  anthracyclineLedger,
  assessCumulativeDose,
  conversionFactor,
  cumulativeDose,
  doxorubicinEquivalent,
  equivalenceModel,
  normaliseDoses,
  toDosePerBsa,
} from "@/lib/anthracycline";

describe("doxorubicin equivalence", () => {
  it("leaves doxorubicin unchanged", () => {
    expect(doxorubicinEquivalent("doxorubicin", 60)).toBe(60);
  });

  it("converts epirubicin down, using the primary derived model", () => {
    expect(conversionFactor("epirubicin", PRIMARY_MODEL)).toBe(0.8);
    expect(doxorubicinEquivalent("epirubicin", 90)).toBe(72);
  });

  it("converts idarubicin up, since it is given at far lower absolute doses", () => {
    expect(doxorubicinEquivalent("idarubicin", 10)).toBe(105);
  });

  it("returns null for an unknown agent or a missing dose", () => {
    expect(doxorubicinEquivalent("cisplatin", 60)).toBeNull();
    expect(doxorubicinEquivalent("doxorubicin", null)).toBeNull();
    expect(doxorubicinEquivalent("doxorubicin", "pending")).toBeNull();
  });

  it("computes the alternative model on request", () => {
    expect(doxorubicinEquivalent("epirubicin", 90, ALTERNATIVE_MODEL)).toBe(60.3);
  });

  it("names a source for every equivalence model", () => {
    Object.values(EQUIVALENCE_MODELS).forEach((model) => {
      expect(model.sourceId, model.id).toBeTruthy();
      expect(model.description, model.id).toBeTruthy();
    });
  });

  it("falls back to the primary model for an unrecognised model id", () => {
    expect(equivalenceModel("not-a-model").id).toBe(PRIMARY_MODEL);
  });

  it("covers every listed agent in both models", () => {
    Object.values(EQUIVALENCE_MODELS).forEach((model) => {
      ["doxorubicin", "epirubicin", "daunorubicin", "idarubicin", "mitoxantrone"].forEach((agent) => {
        expect(typeof model.factors[agent], `${model.id}/${agent}`).toBe("number");
      });
    });
  });
});

describe("dose units", () => {
  it("passes a mg/m² dose through unchanged", () => {
    expect(toDosePerBsa({ dose: 60, unit: "mg/m2" }, {}).value).toBe(60);
  });

  it("converts an absolute milligram dose using the entry's body surface area", () => {
    expect(toDosePerBsa({ dose: 120, unit: "mg", bsa: 2 }, {}).value).toBe(60);
  });

  it("falls back to the patient's baseline height and weight", () => {
    const patient = { baselineHeight: 170, baselineWeight: 70 };
    // Mosteller BSA for 170 cm / 70 kg is 1.82 m².
    expect(toDosePerBsa({ dose: 182, unit: "mg" }, patient).value).toBe(100);
  });

  it("explains rather than silently dropping a milligram dose with no body surface area", () => {
    const result = toDosePerBsa({ dose: 120, unit: "mg" }, {});
    expect(result.value).toBeNull();
    expect(result.reason).toMatch(/body surface area/i);
  });
});

describe("dose normalisation", () => {
  it("carries the equivalent, the factor and the agent label on each entry", () => {
    const [entry] = normaliseDoses([{ agent: "epirubicin", dose: 90, cycle: 1 }], {});
    expect(entry.equivalent).toBe(72);
    expect(entry.agentLabel).toBe("Epirubicin");
    expect(entry.factor).toBe(0.8);
    expect(entry.scored).toBe(true);
  });

  it("retains entries it cannot score, with the reason", () => {
    // Retained rather than discarded: an unscoreable dose is still a dose the
    // patient received, and dropping it silently under-reports exposure.
    const entries = normaliseDoses([{ agent: "doxorubicin" }, { dose: 60 }, null], {});
    expect(entries).toHaveLength(3);
    expect(entries.every((entry) => entry.scored === false)).toBe(true);
    expect(entries[0].problem).toMatch(/No dose recorded/);
    expect(entries[1].problem).toMatch(/No anthracycline selected/);
  });

  it("handles a missing list", () => {
    expect(normaliseDoses(undefined, {})).toEqual([]);
  });
});

describe("cumulative totals", () => {
  it("sums delivered doses across cycles", () => {
    const result = cumulativeDose({
      anthracyclineDoses: [
        { agent: "doxorubicin", dose: 60, cycle: 1 },
        { agent: "doxorubicin", dose: 60, cycle: 2 },
        { agent: "doxorubicin", dose: 60, cycle: 3 },
      ],
    });
    expect(result.delivered).toBe(180);
    expect(result.total).toBe(180);
  });

  it("adds anthracycline given before registration", () => {
    const result = cumulativeDose({
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 60, cycle: 1 }],
      history: { priorTreatment: { fields: { priorAnthracycline: "180" } } },
    });
    expect(result.prior).toBe(180);
    expect(result.total).toBe(240);
  });

  it("accumulates mixed agents onto one scale", () => {
    const result = cumulativeDose({
      anthracyclineDoses: [
        { agent: "epirubicin", dose: 90, cycle: 1 },
        { agent: "doxorubicin", dose: 60, cycle: 2 },
      ],
    });
    expect(result.total).toBe(132);
  });

  it("returns zero for a patient with no anthracycline exposure", () => {
    expect(cumulativeDose({}).total).toBe(0);
  });

  it("keeps unscoreable entries out of the total but not out of the record", () => {
    const result = cumulativeDose({
      anthracyclineDoses: [
        { agent: "doxorubicin", dose: 60 },
        { agent: "doxorubicin", dose: 100, unit: "mg" },
      ],
    });
    expect(result.total).toBe(60);
    expect(result.unscoredEntries).toHaveLength(1);
  });
});

describe("equivalence model transparency", () => {
  it("reports which model produced the total", () => {
    const ledger = anthracyclineLedger({ anthracyclineDoses: [{ agent: "doxorubicin", dose: 60 }] });
    expect(ledger.model.id).toBe(PRIMARY_MODEL);
    expect(ledger.model.provenance.citation).toMatch(/Feijen/);
  });

  it("says nothing about divergence when the models agree", () => {
    const ledger = anthracyclineLedger({ anthracyclineDoses: [{ agent: "doxorubicin", dose: 240 }] });
    expect(ledger.modelsDiverge).toBe(false);
    expect(ledger.divergenceNote).toBeNull();
  });

  it("surfaces the disagreement on mitoxantrone, where the models differ most", () => {
    const ledger = anthracyclineLedger({ anthracyclineDoses: [{ agent: "mitoxantrone", dose: 40 }] });
    expect(ledger.total).toBe(420);
    expect(ledger.alternative.total).toBe(160);
    expect(ledger.modelsDiverge).toBe(true);
    expect(ledger.divergenceNote).toMatch(/differ for this patient/);
  });

  it("warns explicitly when the two models fall either side of a threshold", () => {
    const ledger = anthracyclineLedger({ anthracyclineDoses: [{ agent: "mitoxantrone", dose: 40 }] });
    expect(ledger.crossesDifferentThreshold).toBe(true);
    expect(ledger.divergenceNote).toMatch(/either side of a management threshold/);
  });

  it("reports the unscored entries so exposure is never silently under-counted", () => {
    const ledger = anthracyclineLedger({
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 60 }, { agent: "doxorubicin", dose: 100, unit: "mg" }],
    });
    expect(ledger.unscoredNote).toMatch(/not included in the total/);
  });
});

describe("threshold assessment", () => {
  it("reports no threshold crossed at low exposure", () => {
    const result = assessCumulativeDose(120);
    expect(result.reached).toBeNull();
    expect(result.tone).toBe("ok");
  });

  it("flags the surveillance threshold at 250", () => {
    expect(assessCumulativeDose(250).reached.id).toBe("surveillance");
  });

  it("flags the dexrazoxane threshold at 300", () => {
    const result = assessCumulativeDose(310);
    expect(result.reached.id).toBe("dexrazoxane");
    expect(result.guidance).toMatch(/dexrazoxane/i);
  });

  it("escalates tone past 400", () => {
    expect(assessCumulativeDose(420).tone).toBe("danger");
  });

  it("flags the conventional ceiling", () => {
    expect(assessCumulativeDose(560).reached.id).toBe("ceiling");
  });

  it("warns while approaching a threshold, before it is crossed", () => {
    const result = assessCumulativeDose(220);
    expect(result.reached).toBeNull();
    expect(result.approaching).toBe(true);
    expect(result.tone).toBe("warning");
  });

  it("warns when the planned remaining dose would cross the next threshold", () => {
    const result = assessCumulativeDose(180, 120);
    expect(result.projected).toBe(300);
    expect(result.approaching).toBe(true);
    expect(result.guidance).toMatch(/projected/i);
  });

  it("identifies the next threshold ahead", () => {
    expect(assessCumulativeDose(120).next.at).toBe(250);
  });
});

describe("ledger", () => {
  it("carries a running total on each dose", () => {
    const ledger = anthracyclineLedger({
      anthracyclineDoses: [
        { agent: "doxorubicin", dose: 60, cycle: 1 },
        { agent: "doxorubicin", dose: 60, cycle: 2 },
      ],
    });
    expect(ledger.entries.map((e) => e.runningTotal)).toEqual([60, 120]);
  });

  it("starts the running total from prior exposure", () => {
    const ledger = anthracyclineLedger({
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 60, cycle: 1 }],
      history: { priorTreatment: { fields: { priorAnthracycline: "100" } } },
    });
    expect(ledger.entries[0].runningTotal).toBe(160);
  });

  it("computes what remains of the planned course", () => {
    const ledger = anthracyclineLedger({
      totalPlannedDose: "360",
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 120, cycle: 1 }],
    });
    expect(ledger.remaining).toBe(240);
  });

  it("never reports negative remaining dose when the plan is exceeded", () => {
    const ledger = anthracyclineLedger({
      totalPlannedDose: "100",
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 180, cycle: 1 }],
    });
    expect(ledger.remaining).toBe(0);
  });

  it("assesses delivered exposure rather than the plan", () => {
    // The plan says 400, but only 120 has been given: no threshold is crossed yet.
    const ledger = anthracyclineLedger({
      totalPlannedDose: "400",
      anthracyclineDoses: [{ agent: "doxorubicin", dose: 120, cycle: 1 }],
    });
    expect(ledger.assessment.total).toBe(120);
    expect(ledger.assessment.reached).toBeNull();
  });
});
