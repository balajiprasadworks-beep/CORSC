"use client";

/* =========================================================================
   Patient data access, from the browser's side.

   One boundary between the application and wherever patient data lives. The
   workflow components call this; none of them knows whether a record came from
   PostgreSQL or from local storage, and none of them contains a fetch call or
   a localStorage key.

   TWO DRIVERS, AND WHY BOTH STILL EXIST

     api    the real one. Records live in PostgreSQL behind the CORSC API,
            with row-level security, audit history and no expiry.

     local  browser local storage. Retained for the migration period only, and
            NOT presented as an acceptable production store: it is unencrypted
            at rest, readable by anything running in the page, lost when the
            browser is cleared, and impossible to audit or revoke. It carries a
            `warnings` list the application surfaces, and lib/client/legacy-store
            reads it so those records can be imported and left in place.

   The driver is chosen by asking the server whether it can reach its database,
   not by guessing from configuration. A CORSC instance whose database is down
   falls back to local storage with the warnings visible, rather than losing the
   clinician's work mid-encounter.

   Nothing here interprets clinical data. Repositories move records; the engines
   decide what they mean.
   ========================================================================= */

import { apiFetch, serverHealth } from "@/lib/client/api-client";
import { migratePatient } from "@/lib/patient-model";

export const DRIVERS = {
  api: {
    id: "api",
    label: "CORSC server with PostgreSQL",
    durable: true,
    warnings: [],
  },
  local: {
    id: "local",
    label: "Browser local storage (migration fallback)",
    durable: false,
    warnings: [
      "Patient data is held unencrypted in this browser only.",
      "It is lost if browser data is cleared, and it is not backed up.",
      "It cannot be shared with colleagues, audited centrally, or revoked.",
      "Do not use this driver for identifiable patient data outside evaluation.",
    ],
  },
};

/* --------------------------------------------------------- local storage */

function localKey(userId, patientId) {
  return `corsc:patient:${userId}:${patientId}`;
}

function localPrefix(userId) {
  return `corsc:patient:${userId}:`;
}

const localDriver = {
  id: "local",

  async list(userId) {
    if (typeof window === "undefined") return [];
    const prefix = localPrefix(userId);
    try {
      return Object.keys(window.localStorage).flatMap((key) => {
        if (!key.startsWith(prefix)) return [];
        try {
          const raw = window.localStorage.getItem(key);
          const parsed = raw ? migratePatient(JSON.parse(raw)) : null;
          return parsed ? [parsed] : [];
        } catch {
          // A single corrupt record must not take the whole caseload down.
          return [];
        }
      });
    } catch {
      return [];
    }
  },

  async get(userId, patientId) {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(localKey(userId, patientId));
    return raw ? migratePatient(JSON.parse(raw)) : null;
  },

  async create(userId, patient) {
    return localDriver.save(userId, patient);
  },

  async save(userId, patient) {
    if (typeof window === "undefined") return { patient, updatedAt: null };
    window.localStorage.setItem(localKey(userId, patient.id), JSON.stringify(patient));
    return { patient, updatedAt: null };
  },

  async archive() {
    // Archiving needs a durable, auditable store. Offering it here would let a
    // clinician believe a record had been taken out of service when nothing
    // outside this browser knows about it.
    throw new Error(
      "Archiving needs the CORSC server. Records held only in this browser cannot be archived."
    );
  },
};

/* -------------------------------------------------------------------- api */

/**
 * Strips the fields the server owns before sending a record back.
 *
 * `risk` is the clearest case: it is recomputed by the engine on every read, so
 * sending the client's copy back would let a stale category travel to the
 * server and look like a fact.
 */
function toRequestBody(patient, updatedAt) {
  const { risk, ...rest } = patient;
  void risk;
  return { ...rest, expectedUpdatedAt: updatedAt ?? undefined };
}

const apiDriver = {
  id: "api",

  async list() {
    const data = await apiFetch("/api/patients");
    return data.patients;
  },

  async get(_userId, patientId) {
    const data = await apiFetch(`/api/patients/${patientId}`);
    return data;
  },

  async create(_userId, patient) {
    const data = await apiFetch("/api/patients", {
      method: "POST",
      body: toRequestBody(patient, null),
    });
    return data;
  },

  async save(_userId, patient, { updatedAt } = {}) {
    const data = await apiFetch(`/api/patients/${patient.id}/record`, {
      method: "PUT",
      body: toRequestBody(patient, updatedAt),
    });
    return data;
  },

  async archive(_userId, patientId, reason) {
    return apiFetch(`/api/patients/${patientId}/archive`, {
      method: "POST",
      body: { reason },
    });
  },
};

/* ----------------------------------------------------------------- facade */

let cachedDriver = null;

/**
 * Which driver is in force.
 *
 * Asks the server rather than inferring from configuration, and caches the
 * answer for the session. `refresh` re-asks — used after the migration screen,
 * so a clinician who has just fixed their configuration does not have to
 * reload.
 */
export async function resolveDriver({ refresh = false } = {}) {
  if (cachedDriver && !refresh) return cachedDriver;
  const health = await serverHealth();
  cachedDriver = health.status === "ok" ? DRIVERS.api : DRIVERS.local;
  return cachedDriver;
}

export function patientRepository(driver) {
  const active = driver ?? cachedDriver ?? DRIVERS.local;
  const implementation = active.id === "api" ? apiDriver : localDriver;

  return {
    driver: active,
    list: (userId) => implementation.list(userId),
    get: (userId, patientId) => implementation.get(userId, patientId),
    create: (userId, patient) => implementation.create(userId, patient),
    save: (userId, patient, options) => implementation.save(userId, patient, options),
    archive: (userId, patientId, reason) => implementation.archive(userId, patientId, reason),
  };
}
