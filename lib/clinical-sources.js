/* =========================================================================
   CORSC clinical provenance registry.

   Every clinically meaningful rule in this application resolves to an entry
   here. Nothing else in the codebase may state a guideline, a year, a table
   number or a threshold attribution: engines reference a source id, and the UI
   and the printed report render the entry.

   The point is auditability. When a clinician asks "where does this number come
   from", the answer must be one lookup away and must be the same answer
   everywhere in the product.

   VERIFICATION LEVELS
   Each source carries a `verification` describing how the CORSC implementation
   was checked against it:

     verified     the rule was checked against the primary publication or an
                  authoritative reproduction of it, factor by factor
     partial      the rule's structure and the published scoring algebra were
                  confirmed, but at least one factor row or weight could not be
                  confirmed against a primary source during implementation
     local        a site-configurable default that is not a guideline rule at
                  all (laboratory reference limits, operational intervals)

   `partial` is not a soft "probably fine". It is rendered in the UI and in the
   report, because a clinician deciding on the basis of a partially verified
   proforma needs to know that before they act on it.

   Nothing in this file may be invented. If a source cannot be confirmed it is
   marked `partial` and the uncertainty is stated in `caveat`, rather than being
   dressed up as a citation.
   ========================================================================= */

export const RULES_VERSION = "2026.08.1";

export const VERIFICATION = {
  verified: {
    id: "verified",
    label: "Verified against source",
    tone: "ok",
    detail: "Checked factor by factor against the cited publication or an authoritative reproduction of it.",
  },
  partial: {
    id: "partial",
    label: "Partially verified",
    tone: "warning",
    detail:
      "The published scoring algebra was confirmed, but at least one factor row or weight could not be confirmed against a primary source. Confirm against the published proforma before clinical use.",
  },
  local: {
    id: "local",
    label: "Local configuration",
    tone: "info",
    detail: "A site-configurable default rather than a guideline rule. Confirm against local policy or the laboratory handbook.",
  },
};

/**
 * The registry.
 *
 * `citation` is the bibliographic reference. `locator` names the table or
 * section the rule comes from where that is known. `caveat` states what is
 * uncertain, and is rendered wherever the source is rendered.
 */
export const CLINICAL_SOURCES = {
  "hfa-icos-2020": {
    id: "hfa-icos-2020",
    shortLabel: "HFA-ICOS 2020",
    title: "HFA-ICOS baseline cardiovascular risk assessment proformas",
    citation:
      "Lyon AR, Dent S, Stanway S, et al. Baseline cardiovascular risk assessment in cancer patients scheduled to receive cardiotoxic cancer therapies: a position statement and new risk assessment tools from the Cardio-Oncology Study Group of the Heart Failure Association of the European Society of Cardiology in collaboration with the International Cardio-Oncology Society. Eur J Heart Fail. 2020;22(11):1945-1960.",
    year: 2020,
    version: "2020 position statement",
    locator: "Baseline CV risk stratification proformas (therapy-specific tables)",
    verification: VERIFICATION.verified.id,
    scope: "Baseline (pre-treatment) cardiovascular risk stratification only. Not a measure of treatment-emergent toxicity.",
  },

  "esc-cardio-oncology-2022": {
    id: "esc-cardio-oncology-2022",
    shortLabel: "ESC 2022",
    title: "2022 ESC Guidelines on cardio-oncology",
    citation:
      "Lyon AR, López-Fernández T, Couch LS, et al. 2022 ESC Guidelines on cardio-oncology developed in collaboration with the European Hematology Association (EHA), the European Society for Therapeutic Radiology and Oncology (ESTRO) and the International Cardio-Oncology Society (IC-OS). Eur Heart J. 2022;43(41):4229-4361.",
    year: 2022,
    version: "2022",
    locator: "CTRCD definitions, surveillance pathways and therapy-specific management sections",
    verification: VERIFICATION.verified.id,
    scope:
      "Definitions and grading of cancer therapy–related cardiovascular toxicity, surveillance protocols during and after cardiotoxic therapy, and management pathways.",
  },

  "ic-os-2021-definitions": {
    id: "ic-os-2021-definitions",
    shortLabel: "IC-OS 2021",
    title: "International Cardio-Oncology Society consensus definitions of CTR-CVT",
    citation:
      "Herrmann J, Lenihan D, Armenian S, et al. Defining cardiovascular toxicities of cancer therapies: an International Cardio-Oncology Society (IC-OS) consensus statement. Eur Heart J. 2022;43(4):280-299.",
    year: 2022,
    version: "2021 consensus (published 2022)",
    locator: "CTR-CVT definitions and severity grading",
    verification: VERIFICATION.verified.id,
    scope: "Consensus definitions and severity grading for the cardiovascular toxicities of cancer therapy.",
  },

  "esc-hf-2021": {
    id: "esc-hf-2021",
    shortLabel: "ESC HF 2021",
    title: "2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure",
    citation:
      "McDonagh TA, Metra M, Adamo M, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726.",
    year: 2021,
    version: "2021",
    locator: "Natriuretic peptide rule-out thresholds; guideline-directed medical therapy for HFrEF",
    verification: VERIFICATION.verified.id,
    scope: "Heart-failure diagnosis thresholds and the four pillars of guideline-directed medical therapy.",
  },

  "esc-hypertension-2024": {
    id: "esc-hypertension-2024",
    shortLabel: "ESC HTN 2024",
    title: "2024 ESC Guidelines for the management of elevated blood pressure and hypertension",
    citation:
      "McEvoy JW, McCarthy CP, Bruno RM, et al. 2024 ESC Guidelines for the management of elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018.",
    year: 2024,
    version: "2024",
    locator: "Blood pressure categories and treatment thresholds",
    verification: VERIFICATION.verified.id,
    scope: "Blood-pressure classification and treatment thresholds used for the hypertension pathway.",
  },

  "asco-2017-cardiac": {
    id: "asco-2017-cardiac",
    shortLabel: "ASCO 2017",
    title: "ASCO clinical practice guideline: prevention and monitoring of cardiac dysfunction in cancer survivors",
    citation:
      "Armenian SH, Lacchetti C, Barac A, et al. Prevention and Monitoring of Cardiac Dysfunction in Survivors of Adult Cancers: American Society of Clinical Oncology Clinical Practice Guideline. J Clin Oncol. 2017;35(8):893-911.",
    year: 2017,
    version: "2017",
    locator: "Risk factors for cardiac dysfunction, including high-dose anthracycline definitions",
    verification: VERIFICATION.verified.id,
    scope: "Survivorship surveillance and the definition of high-dose anthracycline exposure.",
  },

  "igharo-2021-equivalence": {
    id: "igharo-2021-equivalence",
    shortLabel: "Doxorubicin-equivalence (paediatric survivorship model)",
    title: "Anthracycline doxorubicin-equivalent conversion factors",
    citation:
      "Feijen EAM, Leisenring WM, Stratton KL, et al. Derivation of Anthracycline and Anthraquinone Equivalence Ratios to Doxorubicin for Late-Onset Cardiotoxicity. JAMA Oncol. 2019;5(6):864-871.",
    year: 2019,
    version: "2019 late-cardiotoxicity equivalence ratios",
    locator: "Derived equivalence ratios to doxorubicin",
    verification: VERIFICATION.verified.id,
    scope:
      "Conversion of non-doxorubicin anthracyclines and anthraquinones onto a doxorubicin-equivalent scale for cumulative-exposure tracking.",
    caveat:
      "These ratios were derived for late-onset cardiotoxicity in childhood cancer survivors. They are the most rigorously derived published set, but applying them to adults extrapolates beyond the derivation cohort, and they differ materially from older adult-oncology conventions — most of all for mitoxantrone.",
  },

  "conventional-equivalence": {
    id: "conventional-equivalence",
    shortLabel: "Conventional adult-oncology equivalence",
    title: "Conventional adult-oncology doxorubicin-equivalence convention",
    citation:
      "Conventional adult-oncology practice convention, as summarised in the Children's Oncology Group Long-Term Follow-Up Guidelines for Survivors of Childhood, Adolescent and Young Adult Cancers (Version 5.0, 2018) and widely used cardio-oncology reviews.",
    year: 2018,
    version: "Conventional convention",
    locator: "Anthracycline dose equivalence",
    verification: VERIFICATION.partial.id,
    scope: "An alternative equivalence scale offered for comparison against the primary model.",
    caveat:
      "This is a practice convention rather than a single derived dataset, and published ratios vary between sources. It is offered only as a comparator; CORSC's primary model is the derived 2019 equivalence set.",
  },

  "manufacturer-troponin": {
    id: "manufacturer-troponin",
    shortLabel: "Assay 99th percentile",
    title: "Manufacturer-published 99th-percentile upper reference limits for high-sensitivity cardiac troponin",
    citation:
      "Manufacturer package inserts and the IFCC Committee on Clinical Applications of Cardiac Bio-Markers high-sensitivity cardiac troponin assay analytical characteristics table.",
    year: null,
    version: "Assay-specific",
    locator: "99th percentile upper reference limit, overall and sex-specific",
    verification: VERIFICATION.local.id,
    scope: "Default upper reference limits when a local laboratory limit has not been entered.",
    caveat:
      "Reference limits are laboratory-specific and depend on the analyser and the reference population. The value shipped here is a default only. Enter the local laboratory limit; CORSC records the limit actually used for every result.",
  },

  "corsc-operational": {
    id: "corsc-operational",
    shortLabel: "CORSC operational rule",
    title: "CORSC operational (non-guideline) rule",
    citation: "CORSC implementation decision. Not a guideline recommendation.",
    year: null,
    version: RULES_VERSION,
    locator: null,
    verification: VERIFICATION.local.id,
    scope:
      "Scheduling, prompting and completeness rules that organise the clinic workflow. These are service-configuration decisions, not clinical recommendations, and carry no guideline authority.",
    caveat: "Adjust to local service policy. Nothing labelled with this source should be presented to a patient as a guideline recommendation.",
  },
};

export function clinicalSource(id) {
  return CLINICAL_SOURCES[id] || null;
}

/** Renders a source as one line, for captions and the printed report. */
export function citeShort(id) {
  const source = clinicalSource(id);
  if (!source) return "Source not recorded";
  return source.version ? `${source.shortLabel} (${source.version})` : source.shortLabel;
}

/**
 * Provenance object attached to a clinical result.
 *
 * Engines build one of these rather than embedding guideline text inline, so
 * the report and the UI render identical attributions.
 */
export function provenance(sourceId, { locator, note, verification } = {}) {
  const source = clinicalSource(sourceId);
  if (!source) {
    return {
      sourceId,
      shortLabel: "Source not recorded",
      citation: "No source registered for this rule.",
      verification: VERIFICATION.local.id,
      verificationLabel: VERIFICATION.local.label,
      rulesVersion: RULES_VERSION,
    };
  }
  const level = verification || source.verification;
  return {
    sourceId,
    shortLabel: source.shortLabel,
    title: source.title,
    citation: source.citation,
    year: source.year,
    version: source.version,
    locator: locator || source.locator,
    note: note || null,
    caveat: source.caveat || null,
    verification: level,
    verificationLabel: VERIFICATION[level]?.label || level,
    verificationDetail: VERIFICATION[level]?.detail || null,
    verificationTone: VERIFICATION[level]?.tone || "info",
    rulesVersion: RULES_VERSION,
  };
}

/** Every source referenced by a set of provenance objects, de-duplicated. */
export function collectSources(items) {
  const seen = new Map();
  (items || []).forEach((item) => {
    const id = item?.provenance?.sourceId || item?.sourceId;
    if (!id || seen.has(id)) return;
    const source = clinicalSource(id);
    if (source) seen.set(id, source);
  });
  return Array.from(seen.values());
}

export const ALL_SOURCES = Object.values(CLINICAL_SOURCES);
