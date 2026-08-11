import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FitnessBanner } from "@/components/fitness-banner";
import { AnthracyclineLedger } from "@/components/anthracycline-ledger";
import { RiskSection } from "@/components/sections/risk";
import { InvestigationsSection } from "@/components/sections/investigations";
import { FirstReviewSection } from "@/components/sections/first-review";
import { OverviewSection, PrintReport } from "@/components/sections/overview";
import { SurveillanceSection } from "@/components/sections/surveillance";
import { FollowUpSection } from "@/components/sections/follow-up";
import { RegistrationFields } from "@/components/sections/registration";
import { buildClinicalPicture } from "@/lib/clinical-picture";
import { buildSummary } from "@/lib/ai-summary";
import { createEncounter, createPatient } from "@/lib/patient-model";

const patient = createPatient({
  name: "Test patient",
  age: "67",
  gender: "Female",
  diagnosis: "Breast carcinoma",
  therapy: ["anthracycline", "her2"],
  regimen: "AC-T with trastuzumab",
  baselineLVEF: "62",
  baselineGLS: "-21",
  plannedCycles: "6",
  cycle: 3,
  totalPlannedDose: "360",
  anthracyclineDoses: [{ id: "d1", agent: "doxorubicin", dose: "60", cycle: 1 }],
  history: {
    ...createPatient({}).history,
    riskFactors: { checks: { htn: true, dm: true }, fields: {} },
  },
});

const base = createEncounter("Cycle 3");
const encounter = {
  ...base,
  date: "2026-03-10",
  symptoms: ["Chest pain"],
  hfStatus: "moderate",
  vitals: { ...base.vitals, sbp: "168", dbp: "102", height: "160", weight: "58" },
  inv: {
    ...base.inv,
    lvef: { result: "45", interp: "Reduced", date: "2026-03-10", comment: "" },
    troponin: { result: "60", interp: "", date: "2026-03-10", comment: "" },
    ecg: { result: "Sinus", interp: "", date: "", comment: "", measurements: { rate: "96", rhythm: "Sinus tachycardia", qt: "420" } },
  },
};

const picture = buildClinicalPicture(patient, encounter);
const summary = buildSummary(picture);
const noop = () => {};

function render(node) {
  return renderToStaticMarkup(node);
}

describe("component smoke render", () => {
  it("renders the fitness banner with a hold verdict", () => {
    const html = render(<FitnessBanner fitness={picture.fitness} onJump={noop} />);
    expect(html).toContain("Fitness to proceed");
    expect(html).toContain("Hold");
  });

  it("renders the risk section with the graded verdict", () => {
    const html = render(
      <RiskSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toContain("CTRCD");
    expect(html).toContain("Hypertension");
  });

  it("renders the anthracycline ledger", () => {
    const html = render(<AnthracyclineLedger patient={patient} setPatient={noop} cycle={3} date="2026-03-10" />);
    expect(html).toContain("Cumulative anthracycline");
  });

  it("renders investigations with structured entry", () => {
    const html = render(<InvestigationsSection picture={picture} encounter={encounter} setEncounter={noop} />);
    expect(html).toContain("QTc");
  });

  it("renders the first review with the ledger", () => {
    const html = render(
      <FirstReviewSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} />
    );
    expect(html).toContain("Treatment tolerance");
  });

  it("renders registration with multi-therapy selection", () => {
    const html = render(<RegistrationFields value={patient} onChange={noop} />);
    expect(html).toContain("HER2-targeted therapy");
    expect(html).toContain("therapy classes selected");
  });

  it("renders surveillance with a guideline block per therapy", () => {
    const html = render(
      <SurveillanceSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toContain("Anthracyclines");
    expect(html).toContain("HER2-targeted therapy");
  });

  it("renders the follow-up planner", () => {
    const html = render(
      <FollowUpSection patient={patient} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toBeTruthy();
  });

  it("renders the overview and the printed report", () => {
    const html = render(
      <OverviewSection patient={patient} encounter={encounter} setEncounter={noop} picture={picture} summary={summary} onExportCsv={noop} onPrint={noop} />
    );
    expect(html).toContain("Cardiac dysfunction");

    const report = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(report).toContain("Fitness to proceed");
  });
});
