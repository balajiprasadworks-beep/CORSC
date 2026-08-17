"use client";

/* =========================================================================
   Reading the browser store, for migration.

   The only module that knows the shape of CORSC's local-storage keys. It reads
   and never writes: the migration copies records into PostgreSQL and leaves
   the browser copy exactly as it found it.

   That is deliberate. Deleting the source before anyone has confirmed the
   import would make a bad import unrecoverable, and a clinician needs to be
   able to look at both copies while they check. Clearing the browser store is
   a separate, explicit action offered only after an import has been confirmed
   — see clearImportedRecords, which refuses to remove anything it has not been
   told was successfully imported.
   ========================================================================= */

const PREFIX = "corsc:patient:";

function keyFor(userId, patientId) {
  return `${PREFIX}${userId}:${patientId}`;
}

/**
 * Every record this user has in browser storage, raw.
 *
 * Deliberately not migrated or normalised here: the server applies
 * migratePatient during the import and reports what it could not map, and
 * transforming the record twice would hide a problem the report should show.
 */
export function readLegacyRecords(userId) {
  if (typeof window === "undefined") return [];
  const prefix = `${PREFIX}${userId}:`;

  try {
    return Object.keys(window.localStorage).flatMap((key) => {
      if (!key.startsWith(prefix)) return [];
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? [parsed] : [];
      } catch {
        // A record that will not parse is still worth reporting, so the
        // clinician knows something is there that could not be read rather
        // than it vanishing from the count.
        return [{ id: key.slice(prefix.length), __unreadable: true }];
      }
    });
  } catch {
    return [];
  }
}

export function countLegacyRecords(userId) {
  return readLegacyRecords(userId).length;
}

/* --------------------------------------------------- subscription support

   Local storage is an external store, so components read it through
   useSyncExternalStore rather than copying it into React state inside an
   effect. That matters here beyond tidiness: the count changes when the
   migration removes browser copies, and when another tab does, and a snapshot
   captured once on mount would go stale in both cases.
   ---------------------------------------------------------------------- */

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeLegacyStore(listener) {
  listeners.add(listener);
  // Fires for changes made by other tabs. Same-tab changes call notifyLegacyChange.
  if (typeof window !== "undefined") window.addEventListener("storage", notify);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined" && listeners.size === 0) {
      window.removeEventListener("storage", notify);
    }
  };
}

/** Called after this tab changes the store, since `storage` does not fire locally. */
export function notifyLegacyChange() {
  notify();
}

/** Server snapshot: there is no browser store on the server. */
export function legacyServerSnapshot() {
  return 0;
}

/**
 * Exports the browser store as a JSON file the clinician can keep.
 *
 * Offered before any import runs. A migration that cannot be undone needs a
 * copy of the source that does not depend on the browser it came from.
 */
export function exportLegacyBackup(userId) {
  const records = readLegacyRecords(userId);
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `corsc-browser-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return records.length;
}

/**
 * Removes browser copies of records that were confirmed imported.
 *
 * Takes the identifiers of records the SERVER reported as imported, and
 * removes only those. It will not clear the store wholesale, and it will not
 * remove a record the server said needed review or failed — those are exactly
 * the ones whose source copy is still needed.
 */
export function clearImportedRecords(userId, importedLegacyIds) {
  if (typeof window === "undefined") return 0;
  const allowed = new Set(importedLegacyIds || []);
  let removed = 0;

  allowed.forEach((legacyId) => {
    const key = keyFor(userId, legacyId);
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
      removed += 1;
    }
  });

  if (removed) notifyLegacyChange();
  return removed;
}
