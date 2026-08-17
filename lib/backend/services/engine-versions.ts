/* =========================================================================
   Engine versions.

   Every stored assessment records which engine produced it and which version
   of that engine was running. Without that, a record read back in two years
   says "High risk" with no way to know what "High" meant at the time — and a
   clinician auditing a decision would be shown today's reasoning for
   yesterday's decision.

   THESE VERSIONS ARE MAINTAINED BY HAND, DELIBERATELY.

   They cannot be derived from the file contents: a comment change would bump
   the version and imply a clinical change that did not happen, and a
   whitespace-insensitive hash would miss a changed threshold inside a
   reformatted block. So the version is a statement by the person changing the
   engine about whether the change alters clinical output.

   THE RULE. If a change to an engine can produce a different result for any
   input — a threshold, a factor weight, a composition rule, a grading boundary
   — bump the MINOR version at least. Refactors, comments and renames that
   provably cannot change output leave the version alone.

   CORSC_RULES_VERSION covers the shared provenance registry
   (lib/clinical-sources.js) and is bumped there.

   Historical assessments are never recomputed when a version changes. That is
   the whole point of storing it.
   ========================================================================= */

import { RULES_VERSION } from "@/lib/clinical-sources";

export const CORSC_RULES_VERSION: string = RULES_VERSION;

export const ENGINES = {
  /** lib/hfa-icos.js — baseline cardiovascular risk proformas. */
  hfaIcos: { id: "hfa-icos", version: "2.0.0" },
  /** lib/ctrcvt.js — current cardiovascular toxicity across domains. */
  ctrCvt: { id: "ctr-cvt", version: "1.0.0" },
  /** lib/ctrcd.js — cancer-therapy-related cardiac dysfunction grading. */
  ctrcd: { id: "ctrcd", version: "1.0.0" },
  /** lib/fitness.js — fitness to proceed with the next cycle. */
  fitness: { id: "fitness-to-proceed", version: "1.0.0" },
  /** lib/surveillance-engine.js with lib/surveillance-rules.js. */
  surveillance: { id: "surveillance", version: "2.0.0" },
  /** lib/red-flags.js — graded red-flag detection. */
  redFlags: { id: "red-flags", version: "1.0.0" },
  /** lib/completeness.js — dataset completeness banding. */
  completeness: { id: "completeness", version: "1.0.0" },
  /** lib/anthracycline.js — dose ledger and equivalence models. */
  anthracycline: { id: "anthracycline-ledger", version: "1.0.0" },
} as const;

export type EngineKey = keyof typeof ENGINES;
