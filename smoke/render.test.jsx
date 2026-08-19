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
import { SinceLastVisitSection } from "@/components/sections/since-last-visit";
import { PatientList } from "@/components/patient-list";
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
  it("renders the action bar with a hold verdict", () => {
    const html = render(<FitnessBanner fitness={picture.fitness} nextFollowUp={picture.nextFollowUp} onJump={noop} />);
    expect(html).toContain("Action bar");
    expect(html).toContain("Hold");
    expect(html).toContain("What happened");
    expect(html).toContain("What it means");
    expect(html).toContain("What to do next");
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

/* =========================================================================
   The surfaces added by the clinical upgrade.

   These are server-render checks, not behaviour tests — the engines are tested
   directly beside their modules. What this catches is a section that throws, or
   one that silently stops showing a clinically load-bearing string such as the
   provenance of a risk category.
   ========================================================================= */

describe("clinical upgrade surfaces", () => {
  it("renders the interval history section", () => {
    const html = render(<SinceLastVisitSection encounter={encounter} setEncounter={noop} picture={picture} />);
    expect(html).toContain("Cardiovascular symptoms");
    expect(html).toContain("Hospital admission");
  });

  it("shows both risk axes, labelled differently", () => {
    const html = render(
      <RiskSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toContain("Baseline cardiovascular risk");
    expect(html).toContain("Current cardiovascular status");
    // The management level is named as such, so it cannot be read as a
    // baseline HFA-ICOS category.
    expect(html).toContain("Management level");
  });

  it("shows the provenance of the baseline category on screen, not behind a tooltip", () => {
    const html = render(
      <RiskSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toContain("HFA-ICOS 2020");
  });

  it("shows the arithmetic that produced the category", () => {
    const html = render(
      <RiskSection patient={patient} setPatient={noop} encounter={encounter} setEncounter={noop} picture={picture} />
    );
    expect(html).toContain("Moderate-risk total");
    expect(html).toContain("Applied rule");
  });

  it("renders the worklist with its filters", () => {
    const html = render(<PatientList patients={[patient]} onSelect={noop} onNew={noop} />);
    expect(html).toContain("Overdue");
    expect(html).toContain("Biomarker abnormal");
    expect(html).toContain("Test patient");
  });

  it("puts the provenance appendix and the rules version in the printed report", () => {
    const html = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(html).toContain("Clinical sources and provenance");
    expect(html).toContain("CORSC rules version");
    expect(html).toContain("Lyon AR");
  });

  it("reports baseline risk and current toxicity as separate blocks", () => {
    const html = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(html).toContain("Baseline cardiovascular risk");
    expect(html).toContain("Current cardiovascular status (CTR-CVT)");
  });

  it("states in the report that medication prompts are not prescriptions", () => {
    const html = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(html).toContain("not prescriptions");
  });

  it("records in the report when nothing has been overridden", () => {
    const html = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(html).toContain("as CORSC calculated it");
  });

  it("names the anthracycline equivalence model in the report", () => {
    const html = render(<PrintReport patient={patient} encounter={encounter} picture={picture} summary={summary} />);
    expect(html).toContain("Equivalence model");
  });
});
