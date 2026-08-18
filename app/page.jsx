"use client";

/* =========================================================================
   CORSC — Cardiac Oncology Risk Surveillance and Care

   Application shell: authentication, patient loading, continuous autosave, and
   routing between the worklist, registration and the encounter workflow.

   PERSISTENCE MOVED, THE WORKFLOW DID NOT. This shell used to write patient
   records straight into browser local storage. It now goes through
   lib/client/patient-repository, which talks to the CORSC API and PostgreSQL —
   and falls back to browser storage, loudly, if the server cannot be reached
   mid-clinic. No component below this one knows which of those happened.

   The autosave contract is unchanged and deliberately so: no save button,
   every edit persisted after a short debounce, so a clinician interrupted
   mid-encounter loses nothing. What is new is that a save can now fail in ways
   local storage could not — the network, or a colleague having edited the same
   record — and both are surfaced rather than swallowed.

   All clinical rendering lives in the workflow sections.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";

import { AuthGate } from "@/components/auth-gate";
import { PatientList } from "@/components/patient-list";
import { PatientWorkflow } from "@/components/patient-workflow";
import { RegisterPatient } from "@/components/register-patient";
import { StorageBanner } from "@/components/storage-banner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client/api-client";
import { DRIVERS, patientRepository, resolveDriver } from "@/lib/client/patient-repository";
import { createEncounter } from "@/lib/patient-model";
import { worklistRow } from "@/lib/worklist";

const AUTOSAVE_DELAY = 600;

function CORSCWorkspace({ user, onSignOut }) {
  const [driver, setDriver] = useState(null);
  const [rows, setRows] = useState(null);
  const [localPatients, setLocalPatients] = useState(null);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [saveState, setSaveState] = useState("saved");
  const [saveError, setSaveError] = useState("");
  const [loadError, setLoadError] = useState("");

  /* The concurrency token from the last successful read or write. Sent with
     the next save so a colleague's edit produces a conflict rather than being
     silently overwritten. */
  const updatedAt = useRef(null);
  const pending = useRef(null);
  const timer = useRef(null);

  const loadCaseload = useCallback(
    async (activeDriver) => {
      setLoadError("");
      try {
        if (activeDriver.id === "api") {
          // The worklist runs the clinical engines against the database rather
          // than downloading every record to score them here.
          const data = await apiFetch("/api/worklist");
          setRows(data.rows);
          setLocalPatients(null);
        } else {
          const records = await patientRepository(activeDriver).list(user.id);
          setLocalPatients(records);
          setRows(records.map((patient) => worklistRow(patient)));
        }
      } catch (error) {
        setLoadError(error.message || "The caseload could not be loaded.");
        setRows([]);
      }
    },
    [user.id]
  );

  useEffect(() => {
    let active = true;
    resolveDriver().then((resolved) => {
      if (!active) return;
      setDriver(resolved);
      loadCaseload(resolved);
    });
    return () => {
      active = false;
    };
  }, [loadCaseload]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  /* ------------------------------------------------------------- autosave */

  const flush = useCallback(async () => {
    const record = pending.current;
    if (!record || !driver) return;
    pending.current = null;

    try {
      const result = await patientRepository(driver).save(user.id, record, {
        updatedAt: updatedAt.current,
      });
      updatedAt.current = result.updatedAt ?? null;
      // The server returns the record it stored, including the recomputed risk
      // category. Adopting it keeps the screen showing what was actually saved
      // rather than what was typed.
      if (result.patient) setSelected(result.patient);
      setSaveState("saved");
      setSaveError("");
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error.isConflict
          ? "This patient was changed by someone else while you were working. Reload the record before saving again, so their entry is not overwritten."
          : error.message || "The record could not be saved."
      );
    }
  }, [driver, user.id]);

  const schedulePersist = useCallback(
    (patient) => {
      pending.current = patient;
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_DELAY);
    },
    [flush]
  );

  const updatePatient = useCallback(
    (updater) => {
      setSelected((current) => {
        if (!current) return current;
        const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  /* ---------------------------------------------------------- navigation */

  async function createPatientRecord(patient) {
    if (!driver) return;
    setSaveState("saving");
    try {
      const result = await patientRepository(driver).create(user.id, patient);
      updatedAt.current = result.updatedAt ?? null;
      const createdPatient = result?.patient ?? result ?? patient;
      const withDraft = createdPatient?.draftEncounter
        ? createdPatient
        : {
            ...createdPatient,
            draftEncounter: patient.draftEncounter || createEncounter("Baseline", { date: todayISO() }),
          };
      setSelected(withDraft);
      setSaveState("saved");
      setView("workflow");
      loadCaseload(driver);
    } catch (error) {
      setSaveState("error");
      setSaveError(error.message || "The patient could not be registered.");
      throw error;
    }
  }

  async function openPatient(id) {
    if (!driver) return;
    setLoadError("");
    try {
      const result = await patientRepository(driver).get(user.id, id);
      const patient = result?.patient ?? result;
      if (!patient) {
        setLoadError("That patient could not be loaded.");
        return;
      }
      updatedAt.current = result?.updatedAt ?? null;

      // A patient is opened into a draft encounter. Opening one that already
      // has an unfiled draft continues it rather than starting a second.
      const withDraft = patient.draftEncounter
        ? patient
        : {
            ...patient,
            draftEncounter: createEncounter(
              patient.visits?.length ? `Cycle ${(Number(patient.cycle) || 0) + 1}` : "Baseline"
            ),
          };

      setSelected(withDraft);
      setView("workflow");
    } catch (error) {
      setLoadError(error.message || "That patient could not be loaded.");
    }
  }

  function backToList() {
    setView("list");
    setSelected(null);
    updatedAt.current = null;
    if (driver) loadCaseload(driver);
  }

  const banner = (
    <StorageBanner
      driver={driver ?? DRIVERS.local}
      userId={user.id}
      onMigrated={() => driver && loadCaseload(driver)}
    />
  );

  if (!driver || rows === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7F5] text-sm text-slate-500">
        Loading your caseload…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      {view !== "workflow" && (
        <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 pt-3">
          <span className="truncate text-xs text-slate-500">{user.email || "Signed in"}</span>
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onSignOut}>
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      )}

      {saveError && view === "workflow" && (
        <div className="no-print sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 bg-red-600 px-4 py-2 text-[13px] font-medium text-white">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={() => openPatient(selected?.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 font-semibold hover:bg-white/25"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" /> Reload the record
          </button>
        </div>
      )}

      {view === "list" ? (
        <>
          {loadError && (
            <div className="mx-auto max-w-5xl px-4 pt-3 text-[13px] text-red-700">{loadError}</div>
          )}
          <PatientList
            rows={rows}
            patients={localPatients ?? undefined}
            onSelect={openPatient}
            onNew={() => setView("register")}
            banner={banner}
          />
        </>
      ) : view === "register" ? (
        <RegisterPatient onCancel={() => setView("list")} onCreate={createPatientRecord} />
      ) : selected ? (
        <PatientWorkflow
          patient={selected}
          setPatient={updatePatient}
          saveState={saveState}
          onBack={backToList}
        />
      ) : (
        <div className="p-16 text-center text-sm text-slate-400">Patient not found.</div>
      )}
    </div>
  );
}

export default function CORSCApp() {
  return (
    <AuthGate>
      {({ user, signOut }) => <CORSCWorkspace key={user.id} user={user} onSignOut={signOut} />}
    </AuthGate>
  );
}
