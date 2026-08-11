import { describe, expect, it } from "vitest";

import {
  anthracyclineLedger,
  assessCumulativeDose,
  cumulativeDose,
  doxorubicinEquivalent,
  normaliseDoses,
} from "@/lib/anthracycline";

describe("doxorubicin equivalence", () => {
  it("leaves doxorubicin unchanged", () => {
    expect(doxorubicinEquivalent("doxorubicin", 60)).toBe(60);
  });

  it("converts epirubicin down", () => {
    expect(doxorubicinEquivalent("epirubicin", 90)).toBe(60.3);
  });

  it("converts idarubicin up, since it is more cardiotoxic per milligram", () => {
    expect(doxorubicinEquivalent("idarubicin", 10)).toBe(30);
  });

  it("gives liposomal doxorubicin a reduced factor", () => {
    expect(doxorubicinEquivalent("liposomal-doxorubicin", 50)).toBe(25);
  });

  it("returns null for an unknown agent or a missing dose", () => {
    expect(doxorubicinEquivalent("cisplatin", 60)).toBeNull();
    expect(doxorubicinEquivalent("doxorubicin", null)).toBeNull();
    expect(doxorubicinEquivalent("doxorubicin", "pending")).toBeNull();
  });
});

describe("dose normalisation", () => {
  it("carries the equivalent and the agent label on each entry", () => {
    const [entry] = normaliseDoses([{ agent: "epirubicin", dose: 90, cycle: 1 }]);
    expect(entry.equivalent).toBe(60.3);
    expect(entry.agentLabel).toBe("Epirubicin");
    expect(entry.factor).toBe(0.67);
  });

  it("discards entries that cannot be scored", () => {
    expect(normaliseDoses([{ agent: "doxorubicin" }, { dose: 60 }, null])).toHaveLength(0);
  });

  it("handles a missing list", () => {
    expect(normaliseDoses(undefined)).toEqual([]);
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
    expect(result.total).toBe(120.3);
  });

  it("returns zero for a patient with no anthracycline exposure", () => {
    expect(cumulativeDose({}).total).toBe(0);
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
