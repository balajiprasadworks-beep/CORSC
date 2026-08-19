/* =========================================================================
   Oncology regimen library — search and lookup.

   The clinician picking "AC-THP" from a list rather than typing it is not a
   convenience feature. A typed regimen string is unparseable: CORSC cannot
   tell from "AC-T w/ trastuzumab" which agents are given in which order, so
   it cannot tell the surveillance engine that this patient will receive an
   anthracycline first and HER2 blockade afterwards. A selected preset carries
   that structure explicitly.

   WHAT THIS MODULE DOES NOT DO
   ---------------------------------------------------------------------------
   It does not assign risk, schedule surveillance, or state a dose. The library
   is regimen *identity*: names, phases and agents. Doses are absent because the
   research release deliberately omits them — a dose varies by protocol variant,
   body surface area and local practice, and asserting one from a preset would
   be CORSC inventing a prescribing decision.

   Mapping the library's therapy vocabulary onto the CORSC therapy classes the
   engines consume happens in lib/treatment-course.js, not here.
   ========================================================================= */

import {
  LIBRARY_DRUGS,
  LIBRARY_HISTORICAL,
  LIBRARY_REGIMENS,
  LIBRARY_VERIFIED_ON,
  LIBRARY_VERSION,
} from "@/lib/regimen-library.data";

export { LIBRARY_VERSION, LIBRARY_VERIFIED_ON };

/* ----------------------------------------------------------------- lookup */

const BY_ID = new Map(LIBRARY_REGIMENS.map((regimen) => [regimen.id, regimen]));
const HISTORICAL_BY_ID = new Map(LIBRARY_HISTORICAL.map((regimen) => [regimen.id, regimen]));

/** The regimen with this identifier, current or historical, or null. */
export function regimenById(id) {
  if (!id) return null;
  return BY_ID.get(id) || HISTORICAL_BY_ID.get(id) || null;
}

/** True when the identifier names a superseded regimen. */
export function isHistoricalRegimen(id) {
  return Boolean(id) && !BY_ID.has(id) && HISTORICAL_BY_ID.has(id);
}

export function allRegimens() {
  return LIBRARY_REGIMENS;
}

/** Cardiovascular metadata for one agent, by generic name, or null. */
export function drugByName(genericName) {
  if (!genericName) return null;
  return LIBRARY_DRUGS[String(genericName).trim().toLowerCase()] || null;
}

/** Every agent in the library, for the manual builder's picker. */
export function allDrugs() {
  return Object.values(LIBRARY_DRUGS).sort((a, b) => a.genericName.localeCompare(b.genericName));
}

/** The cancer types represented, for filtering the picker. */
export function cancerTypes() {
  return Array.from(new Set(LIBRARY_REGIMENS.map((regimen) => regimen.cancerType))).sort();
}

/* ----------------------------------------------------------------- search */

function normalise(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * The haystack each regimen is matched against.
 *
 * Agent generic names are included deliberately: a clinician who remembers the
 * drugs but not the acronym should still find the regimen, and searching
 * "trastuzumab" is a more reliable recall path than searching "THP".
 */
const HAYSTACKS = new Map(
  LIBRARY_REGIMENS.map((regimen) => [
    regimen.id,
    {
      name: normalise(regimen.name),
      aliases: (regimen.aliases || []).map(normalise),
      cancerType: normalise(regimen.cancerType),
      subtype: normalise(regimen.subtype),
      agents: regimen.agents.map((a) => normalise(a.genericName)),
      settings: (regimen.settings || []).map(normalise),
    },
  ])
);

/**
 * Scores one regimen against a query term. Higher is better; 0 is no match.
 *
 * An exact or prefix hit on the regimen's own name outranks a hit buried in an
 * agent list, so typing "AC" surfaces AC before every regimen that happens to
 * contain doxorubicin.
 */
function scoreTerm(regimen, haystack, term) {
  if (haystack.name === term) return 100;
  if (haystack.aliases.includes(term)) return 90;
  if (haystack.name.startsWith(term)) return 70;
  if (haystack.aliases.some((alias) => alias.startsWith(term))) return 60;
  if (haystack.name.includes(term)) return 40;
  if (haystack.agents.some((agent) => agent.startsWith(term))) return 30;
  if (haystack.cancerType.includes(term)) return 20;
  if (haystack.subtype && haystack.subtype.includes(term)) return 15;
  if (haystack.agents.some((agent) => agent.includes(term))) return 10;
  if (haystack.settings.some((setting) => setting.includes(term))) return 5;
  return 0;
}

/**
 * Searches the regimen library.
 *
 * Every term must match something, so "breast trastuzumab" narrows rather than
 * widens. An empty query returns the library in its natural order rather than
 * nothing, because the picker opens before the clinician has typed.
 *
 * @param {string} query
 * @param {{ cancerType?: string, limit?: number }} [options]
 */
export function searchRegimens(query, options = {}) {
  const { cancerType = null, limit = 40 } = options;

  let candidates = LIBRARY_REGIMENS;
  if (cancerType) candidates = candidates.filter((regimen) => regimen.cancerType === cancerType);

  const terms = normalise(query).split(" ").filter(Boolean);
  if (terms.length === 0) return candidates.slice(0, limit);

  const scored = [];
  for (const regimen of candidates) {
    const haystack = HAYSTACKS.get(regimen.id);
    let total = 0;
    let matchedEvery = true;

    for (const term of terms) {
      const score = scoreTerm(regimen, haystack, term);
      if (score === 0) {
        matchedEvery = false;
        break;
      }
      total += score;
    }

    if (matchedEvery) scored.push({ regimen, score: total });
  }

  scored.sort((a, b) => b.score - a.score || a.regimen.name.localeCompare(b.regimen.name));
  return scored.slice(0, limit).map((entry) => entry.regimen);
}

/* ---------------------------------------------------------------- display */

/**
 * Human-readable one-line form of a regimen's course, e.g.
 * "AC → TH → Trastuzumab maintenance".
 */
export function regimenPhaseSummary(regimen) {
  if (!regimen?.phases?.length) return "";
  return regimen.phases.map((phase) => phase.name).join(" → ");
}

/** The agents in a phase, e.g. "Doxorubicin + Cyclophosphamide". */
export function phaseAgentSummary(phase) {
  if (!phase?.agents?.length) return "";
  return phase.agents
    .map((agent) => agent.genericName.charAt(0).toUpperCase() + agent.genericName.slice(1))
    .join(" + ");
}
