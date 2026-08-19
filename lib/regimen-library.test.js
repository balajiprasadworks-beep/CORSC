import { describe, expect, it } from "vitest";

import {
  allDrugs,
  allRegimens,
  cancerTypes,
  drugByName,
  regimenById,
  searchRegimens,
} from "@/lib/regimen-library";

describe("regimen library data integrity", () => {
  it("has no duplicate regimen ids", () => {
    const ids = allRegimens().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every regimen a name, cancer type and at least one agent with a generic name", () => {
    for (const regimen of allRegimens()) {
      expect(regimen.name).toBeTruthy();
      expect(regimen.cancerType).toBeTruthy();
      expect(regimen.agents.length).toBeGreaterThan(0);
      for (const agent of regimen.agents) expect(agent.genericName).toBeTruthy();
      for (const phase of regimen.phases || []) {
        for (const agent of phase.agents) expect(agent.genericName).toBeTruthy();
      }
    }
  });

  it("carries the expanded 2.0.0 library's broader coverage", () => {
    expect(allRegimens().length).toBeGreaterThan(400);
    expect(allDrugs().length).toBeGreaterThan(200);
    expect(cancerTypes().length).toBeGreaterThan(50);
  });
});

describe("phase sequencing survives the merge", () => {
  it("keeps AC-TH's three-phase sequence from the hand-curated 0.1.0 library", () => {
    const regimen = regimenById("breast_ac_th");
    expect(regimen.phases.map((p) => p.name)).toEqual(["AC", "TH", "Trastuzumab maintenance"]);
  });

  it("keeps a genuinely different AC-TH agent composition as a separate entry rather than overwriting the curated one", () => {
    const curated = regimenById("breast_ac_th");
    const variant = regimenById("breast_ac_th_v2variant");
    expect(curated.agents.map((a) => a.genericName)).toContain("docetaxel");
    expect(variant.agents.map((a) => a.genericName)).toContain("paclitaxel");
  });

  it("gives a regimen with no known sequencing a single synthesized phase, not a claimed one", () => {
    // Any 2.0.0-only regimen has an empty phases array in the data file — the
    // single-phase fallback is applied downstream by courseFromPreset, not
    // fabricated here.
    const regimen = regimenById("gist_imatinib");
    expect(regimen.phases).toEqual([]);
    expect(regimen.agents.length).toBeGreaterThan(0);
  });
});

describe("newly-reachable therapy classes", () => {
  it("finds a BCR-ABL TKI regimen and drug by search", () => {
    const results = searchRegimens("imatinib");
    expect(results.some((r) => r.id === "gist_imatinib")).toBe(true);
    expect(drugByName("ponatinib")?.therapyClass).toBe("BCR-ABL TKI");
  });

  it("finds a RAF/MEK regimen and drug by search", () => {
    const results = searchRegimens("dabrafenib");
    expect(results.length).toBeGreaterThan(0);
    expect(drugByName("dabrafenib")?.therapyClass).toBe("RAF/MEK pathway inhibitor");
  });
});

describe("existing free-text and fluoropyrimidine curation is preserved", () => {
  it("keeps the hand-curated cardiovascular toxicity text for fluoropyrimidines", () => {
    const fu = drugByName("fluorouracil");
    expect(fu.therapyClass).toBe("fluoropyrimidine");
    expect(fu.cvToxicity.length).toBeGreaterThan(0);
  });
});
