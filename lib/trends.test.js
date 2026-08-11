import { describe, expect, it } from "vitest";

import { COMPARABILITY, buildAllSeries, buildSeries, seriesDefinition, significantChanges, uncomparableSeries } from "@/lib/trends";

const lvef = seriesDefinition("lvef");
const gls = seriesDefinition("gls");

function visits(values, key = "lvef") {
  return values.map((value, index) => ({
    id: `v${index}`,
    date: `2026-0${index + 1}-01`,
    inv: { [key]: { result: String(value) } },
  }));
}

describe("baseline handling", () => {
  it("refuses to compute a change without a baseline", () => {
    const series = buildSeries(lvef, { baselineLVEF: "", visits: visits([58]) }, null);
    expect(series.comparability).toBe(COMPARABILITY.noBaseline.id);
    expect(series.absoluteChange).toBeNull();
    expect(series.relativeChange).toBeNull();
  });

  it("says so in words rather than showing a bare number", () => {
    const series = buildSeries(lvef, { baselineLVEF: "", visits: visits([58]) }, null);
    expect(series.statement).toMatch(/no baseline is recorded, so no change can be calculated/);
  });

  it("uses the registration baseline, not the earliest on-treatment measurement", () => {
    // Registered at 64%, first measured on treatment at 55%. The fall is 9
    // points, not zero: treating the cycle-1 value as the baseline would hide it.
    const series = buildSeries(lvef, { baselineLVEF: 64, visits: visits([55, 55]) }, null);
    expect(series.baseline).toBe(64);
    expect(series.absoluteChange).toBe(-9);
  });

  it("records where the baseline came from", () => {
    expect(buildSeries(lvef, { baselineLVEF: 60, visits: visits([58]) }, null).baselineSource).toBe("registration");
  });
});

describe("LVEF uses absolute change", () => {
  it("reports the fall in percentage points", () => {
    const series = buildSeries(lvef, { baselineLVEF: 62, visits: visits([48]) }, null);
    expect(series.absoluteChange).toBe(-14);
    expect(series.relativeChange).toBeNull();
  });

  it("marks a 10-point fall as meeting the guideline threshold", () => {
    expect(buildSeries(lvef, { baselineLVEF: 60, visits: visits([50]) }, null).meaningfulChange).toBe(true);
  });

  it("does not mark a 9-point fall as meeting it", () => {
    expect(buildSeries(lvef, { baselineLVEF: 60, visits: visits([51]) }, null).meaningfulChange).toBe(false);
  });

  it("distinguishes an abnormal baseline from a decline", () => {
    // Started at 45% and still 45%: abnormal, but not deteriorating.
    const series = buildSeries(lvef, { baselineLVEF: 45, visits: visits([45]) }, null);
    expect(series.abnormalBaseline).toBe(true);
    expect(series.absoluteChange).toBe(0);
    expect(series.meaningfulChange).toBe(false);
    expect(series.statement).toMatch(/baseline itself was already below 50%/);
  });
});

describe("GLS uses relative change and absolute magnitudes", () => {
  it("computes a relative fall from negative strain values", () => {
    // -21% to -14% is a 33.3% relative fall.
    const series = buildSeries(gls, { baselineGLS: -21, visits: visits([-14], "gls") }, null);
    expect(series.relativeChange).toBe(33.3);
  });

  it("marks a relative fall above 15% as meaningful", () => {
    expect(buildSeries(gls, { baselineGLS: -20, visits: visits([-16], "gls") }, null).meaningfulChange).toBe(true);
  });

  it("does not mark a 15% fall as meaningful — the threshold is greater than 15", () => {
    expect(buildSeries(gls, { baselineGLS: -20, visits: visits([-17], "gls") }, null).meaningfulChange).toBe(false);
  });

  it("describes an improvement as an improvement, not a fall", () => {
    const series = buildSeries(gls, { baselineGLS: -18, visits: visits([-21], "gls") }, null);
    expect(series.statement).toMatch(/improvement/);
  });

  it("explains the sign convention alongside the number", () => {
    expect(buildSeries(gls, { baselineGLS: -20, visits: visits([-16], "gls") }, null).changeNote).toMatch(/conventionally negative/);
  });
});

describe("comparability", () => {
  it("flags a change of modality", () => {
    const patient = {
      baselineLVEF: 60,
      visits: [
        { id: "a", date: "2026-01-01", inv: { lvef: { result: "60", modality: "TTE" } } },
        { id: "b", date: "2026-02-01", inv: { lvef: { result: "52", modality: "CMR" } } },
      ],
    };
    const series = buildSeries(lvef, patient, null);
    expect(series.comparability).toBe(COMPARABILITY.modalityChanged.id);
    expect(series.statement).toMatch(/more than one modality/);
  });

  it("reports not measured when there is nothing at all", () => {
    expect(buildSeries(lvef, { baselineLVEF: 60, visits: [] }, null).comparability).toBe(COMPARABILITY.none.id);
  });

  it("collects the series that cannot be interpreted", () => {
    const series = buildAllSeries({ baselineLVEF: "", visits: visits([50]) }, null);
    expect(uncomparableSeries(series).map((s) => s.id)).toContain("lvef");
  });

  it("collects the series that crossed a threshold", () => {
    const series = buildAllSeries({ baselineLVEF: 62, baselineGLS: -20, visits: visits([48]) }, null);
    expect(significantChanges(series).map((s) => s.id)).toContain("lvef");
  });
});

describe("series construction", () => {
  it("builds every declared series", () => {
    expect(buildAllSeries({ visits: [] }, null).map((series) => series.id)).toEqual([
      "lvef",
      "gls",
      "troponin",
      "ntprobnp",
      "sbp",
    ]);
  });

  it("carries the encounter cycle onto each point", () => {
    const patient = { baselineLVEF: 60, visits: [{ id: "a", date: "2026-01-01", firstReview: { cycle: "3" }, inv: { lvef: { result: "55" } } }] };
    expect(buildSeries(lvef, patient, null).points[0].cycle).toBe(3);
  });

  it("reads blood pressure from vitals rather than investigations", () => {
    const patient = { visits: [{ id: "a", date: "2026-01-01", vitals: { sbp: "148" } }] };
    const series = buildSeries(seriesDefinition("sbp"), patient, null);
    expect(series.current).toBe(148);
  });

  it("attaches a source to every series", () => {
    buildAllSeries({ visits: [] }, null).forEach((series) => {
      expect(series.provenance.citation, series.id).toBeTruthy();
    });
  });
});
