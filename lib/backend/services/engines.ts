/* =========================================================================
   Typed access to the clinical engines.

   The engines are JavaScript. That is deliberate and is not being changed
   here: they carry validated clinical logic and an extensive test suite, and
   converting them to TypeScript as part of a backend migration would mean
   touching every one of them for a reason that has nothing to do with what
   they compute.

   TypeScript can infer most of their signatures from the source, but not all —
   a parameter object destructured with defaults infers only the fields that
   have defaults, so a call that passes a real argument fails to typecheck even
   though it is correct.

   This module is the one place that reconciles that. It declares the shapes
   the backend relies on and re-exports the engines behind them. Every
   assertion is here, in one reviewed file, rather than scattered as inline
   casts through the services — and if an engine's real shape ever diverges
   from a declaration here, there is a single place to correct.

   Nothing in this file computes anything.
   ========================================================================= */

import * as cardiacMeasurements from "@/lib/cardiac-measurements";
import * as ctrcvtEngine from "@/lib/ctrcvt";
import * as fitnessEngine from "@/lib/fitness";
import * as hfaIcosEngine from "@/lib/hfa-icos";
import * as surveillanceEngine from "@/lib/surveillance-engine";
import * as anthracyclineEngine from "@/lib/anthracycline";

/* ------------------------------------------------------------ engine types */

export interface Provenance {
  sourceId?: string;
  shortLabel?: string;
  citation?: string;
  locator?: string | null;
  verification?: string;
  verificationLabel?: string;
  caveat?: string | null;
  note?: string | null;
}

export interface BiomarkerInterpretation {
  recorded: boolean;
  value: number | null;
  aboveURL?: boolean;
  aboveThreshold?: boolean;
  newRise?: boolean;
  label?: string;
  assay?: { id?: string; label?: string };
  url?: number | null;
  [key: string]: unknown;
}

export interface CtrcdGrade {
  grade: string;
  label: string;
  shortLabel: string;
  present: boolean;
  unresolved: boolean;
  criteria: string[];
  evidence: {
    baselineLVEF: number | null;
    currentLVEF: number | null;
    lvefDrop: number | null;
    glsRelativeFall: number | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ClinicalSignals {
  troponin: BiomarkerInterpretation;
  natriuretic: BiomarkerInterpretation;
  ecg: Record<string, unknown>;
  ctrcd: CtrcdGrade;
  therapies: string[];
  elevatedTroponin: boolean;
  elevatedNtprobnp: boolean;
  glsFall: number | null;
  glsDrop: boolean;
  qtProlongation: boolean;
  currentCardiacSymptoms: string[];
  immediateSymptoms: string[];
  lvefDecline: boolean;
  suspectedICIMyocarditis: boolean;
  abnormalEcho: boolean;
  clinicalDeterioration: boolean;
  myocarditisConfirmed: boolean;
}

export interface BaselineRiskResult {
  applicable: boolean;
  category: string | null;
  reason: string;
  points: number;
  factors: Array<{ id: string; present?: boolean; [key: string]: unknown }>;
  provenance: Provenance;
  partiallyVerified?: boolean;
  [key: string]: unknown;
}

export interface CtrCvtResult {
  overall: string;
  overallLabel: string;
  present: boolean;
  treatmentEmergent: boolean;
  summary: string;
  ctrcd: CtrcdGrade;
  domains: Array<Record<string, unknown>>;
  provenance: Provenance;
  [key: string]: unknown;
}

export interface FitnessResult {
  verdict: string;
  label: string;
  headline: string;
  summary: string;
  findings: Array<Record<string, unknown>>;
  actions: string[];
  [key: string]: unknown;
}

export interface SurveillanceTask {
  id: string;
  label: string;
  kind: string;
  priority: string;
  priorityLabel: string;
  what: string;
  why: string;
  when: string;
  trigger: string | null;
  provenance: Provenance;
  requiresAcknowledgement: boolean;
  completed: boolean;
}

export interface FollowUpPlan {
  band: string;
  label: string;
  detail: string;
  tone: string;
  days: number;
  date: string;
  reasons: string[];
  reason: string;
  triggers: Array<{ band: string; reason: string }>;
}

export interface AnthracyclineLedger {
  total: number;
  entries: Array<Record<string, unknown>>;
  assessment: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** The engine-shaped patient. Loosely typed on purpose: it is the engines' own
 *  shape, and pinning every field here would duplicate lib/patient-model.js. */
export type EnginePatient = Record<string, unknown> & {
  id: string;
  therapy: string[];
  visits: EngineVisit[];
  risk?: { category?: string; [key: string]: unknown };
};

export type EngineVisit = Record<string, unknown> & { id: string; symptoms?: string[] };

/* ---------------------------------------------------------------- exports */

export const interpretTroponin = cardiacMeasurements.interpretTroponin as (input: {
  value?: unknown;
  baseline?: unknown;
  assayId?: unknown;
  sex?: unknown;
  localURL?: unknown;
}) => BiomarkerInterpretation;

export const interpretNatriuretic = cardiacMeasurements.interpretNatriuretic as (input: {
  value?: unknown;
  baseline?: unknown;
  peptide?: string;
  age?: unknown;
}) => BiomarkerInterpretation;

export const assessBaselineRisk = hfaIcosEngine.assessBaselineRisk as (
  patient: unknown,
  context?: { baselineTroponinElevated?: boolean; baselineNatrioureticElevated?: boolean }
) => BaselineRiskResult;

export const assessCtrCvt = ctrcvtEngine.assessCtrCvt as (input: {
  patient?: unknown;
  encounter?: unknown;
  troponin?: BiomarkerInterpretation;
  natriuretic?: BiomarkerInterpretation;
  ecg?: Record<string, unknown>;
  currentLVEF?: number | null;
  glsRelativeFall?: number | null;
  symptoms?: string[];
}) => CtrCvtResult;

export const assessFitness = fitnessEngine.assessFitness as (input: {
  patient?: unknown;
  encounter?: unknown;
  signals?: ClinicalSignals;
  vitals?: unknown;
  outstanding?: Array<{ id: string; [key: string]: unknown }>;
  ledger?: unknown;
}) => FitnessResult;

export const getClinicalSignals = surveillanceEngine.getClinicalSignals as (
  patient: unknown,
  visit: unknown
) => ClinicalSignals;

export const getDynamicSurveillanceTasks = surveillanceEngine.getDynamicSurveillanceTasks as (
  patient: unknown,
  visit: unknown
) => SurveillanceTask[];

export const getNextFollowUpPlan = surveillanceEngine.getNextFollowUpPlan as (
  patient: unknown,
  visit: unknown
) => FollowUpPlan;

export const anthracyclineLedger = anthracyclineEngine.anthracyclineLedger as (
  patient: unknown,
  modelId?: string
) => AnthracyclineLedger;
