"use client";

/* =========================================================================
   Where the records are being kept, and how to move them.

   Two jobs, both about being honest with the clinician in front of the screen.

   FIRST, it says where patient data is going. When CORSC is running against
   its database this is a single quiet line. When it has fallen back to browser
   storage it is a warning, stated in full, because a clinician entering
   identifiable data into a store that is unencrypted, unaudited and lost when
   the browser is cleared needs to know that before they type it — not in a
   release note.

   SECOND, it offers the migration. Records still in the browser are listed,
   can be exported as a file first, and can be checked without being written
   (a dry run) before anything is committed. The browser copy is never removed
   by the import itself; clearing it is a separate, explicit step offered only
   for records the server confirmed it had taken.
   ========================================================================= */

import { useCallback, useState, useSyncExternalStore } from "react";
import { AlertTriangle, CheckCircle2, Database, Download, HardDrive, Upload } from "lucide-react";

import { apiFetch } from "@/lib/client/api-client";
import {
  clearImportedRecords,
  countLegacyRecords,
  exportLegacyBackup,
  legacyServerSnapshot,
  readLegacyRecords,
  subscribeLegacyStore,
} from "@/lib/client/legacy-store";

function Row({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function Button({ onClick, disabled, tone = "neutral", icon: Icon, children }) {
  const tones = {
    neutral: "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
    primary: "border-transparent bg-slate-900 text-white hover:bg-slate-800",
    danger: "border-red-300 bg-white text-red-700 hover:border-red-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition disabled:opacity-50 ${tones[tone]}`}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </button>
  );
}

function MigrationReport({ report, onClear, cleared }) {
  const importable = report.records.filter(
    (record) => record.outcome === "IMPORTED" || record.outcome === "NEEDS_REVIEW"
  );

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[13px] font-semibold text-slate-900">
        {report.committed ? "Import complete" : "Dry run — nothing was written"}
      </div>

      {/* Every record is accounted for. A migration that reported only its
          successes would be hiding the records that need attention. */}
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12.5px] sm:grid-cols-5">
        {[
          ["Found", report.found],
          ["Imported", report.imported],
          ["Already imported", report.skippedDuplicate],
          ["Need review", report.needsReview],
          ["Failed", report.failed],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] uppercase tracking-widest text-slate-400">{label}</dt>
            <dd className="font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      {report.records.some((record) => record.reason) && (
        <ul className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-slate-600">
          {report.records
            .filter((record) => record.reason)
            .map((record) => (
              <li key={record.legacyId} className="flex gap-2">
                <span className="font-medium text-slate-800">{record.name || record.legacyId}</span>
                <span>
                  {record.reason}
                  {record.unmappedFields?.length ? ` (${record.unmappedFields.join("; ")})` : ""}
                </span>
              </li>
            ))}
        </ul>
      )}

      {report.committed && importable.length > 0 && !cleared && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[12.5px] leading-relaxed text-slate-600">
            The browser copies are still here. Check the imported records look right, then remove the browser
            copies of the {importable.length} record{importable.length === 1 ? "" : "s"} the server confirmed
            it has. Records that failed or need review are left alone.
          </p>
          <div className="mt-2">
            <Button tone="danger" onClick={() => onClear(importable.map((record) => record.legacyId))}>
              Remove the browser copies
            </Button>
          </div>
        </div>
      )}

      {cleared !== null && cleared !== undefined && (
        <p className="mt-2 text-[12.5px] text-emerald-700">
          {cleared} browser cop{cleared === 1 ? "y" : "ies"} removed.
        </p>
      )}
    </div>
  );
}

export function StorageBanner({ driver, userId, onMigrated }) {
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cleared, setCleared] = useState(null);

  /* Local storage is an external store, so it is read through
     useSyncExternalStore rather than copied into state on mount. The count
     changes when the migration removes browser copies — and when another tab
     does — and a snapshot taken once would be wrong in both cases. */
  const legacyCount = useSyncExternalStore(
    subscribeLegacyStore,
    () => countLegacyRecords(userId),
    legacyServerSnapshot
  );

  const run = useCallback(
    async (commit) => {
      setBusy(true);
      setError("");
      try {
        const records = readLegacyRecords(userId).filter((record) => !record.__unreadable);
        const result = await apiFetch("/api/migration/legacy", {
          method: "POST",
          body: { records, commit },
        });
        setReport(result);
        if (commit && result.imported + result.needsReview > 0) onMigrated?.();
      } catch (failure) {
        setError(failure.message || "The import could not be completed.");
      } finally {
        setBusy(false);
      }
    },
    [userId, onMigrated]
  );

  function handleClear(legacyIds) {
    setCleared(clearImportedRecords(userId, legacyIds));
  }

  /* ------------------------------------------------- browser storage only */

  if (driver?.id !== "api") {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5">
        <div className="flex items-start gap-2.5">
          <HardDrive className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <div className="text-[13.5px] font-semibold text-amber-900">
              Records are being kept in this browser only
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/80">
              CORSC could not reach its database, so it is falling back to browser storage to avoid losing
              your work. This is not a safe place for identifiable patient data:
            </p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-[12.5px] leading-relaxed text-amber-900/80">
              {(driver?.warnings || []).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900/80">
              Once the server is reachable again, this panel will offer to move these records into the
              database.
            </p>
            {legacyCount > 0 && (
              <div className="mt-2">
                <Button icon={Download} onClick={() => exportLegacyBackup(userId)}>
                  Export a backup of the {legacyCount} record{legacyCount === 1 ? "" : "s"} in this browser
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------- database, nothing to migrate */

  if (legacyCount === 0 && !report) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12.5px] text-slate-600">
        <Database className="size-3.5 text-teal-700" aria-hidden="true" />
        Records are stored on the CORSC server, with access control and audit history.
      </div>
    );
  }

  /* ------------------------------------------------------ database + legacy */

  return (
    <div className="rounded-2xl border border-teal-300 bg-teal-50/60 p-3.5">
      <div className="flex items-start gap-2.5">
        <Upload className="mt-0.5 size-4 shrink-0 text-teal-800" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-teal-950">
            {legacyCount} patient record{legacyCount === 1 ? "" : "s"} still held in this browser
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-teal-950/80">
            These were saved before CORSC had a database. Check what would happen first — nothing is written
            by a dry run — then import them. The browser copies are left in place either way.
          </p>

          <Row>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button icon={Download} onClick={() => exportLegacyBackup(userId)} disabled={busy}>
                Export a backup first
              </Button>
              <Button icon={CheckCircle2} onClick={() => run(false)} disabled={busy}>
                {busy ? "Checking…" : "Check what would happen"}
              </Button>
              <Button tone="primary" icon={Upload} onClick={() => run(true)} disabled={busy}>
                {busy ? "Importing…" : "Import into the database"}
              </Button>
            </div>
          </Row>

          {error && (
            <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-red-700">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          {report && <MigrationReport report={report} onClear={handleClear} cleared={cleared} />}
        </div>
      </div>
    </div>
  );
}
