"use client";

/* =========================================================================
   CORSC — Cardiac Oncology Risk Surveillance and Care

   Application shell: authentication, patient storage with continuous autosave,
   and routing between the patient list, registration, and the encounter
   workflow. All clinical rendering lives in the workflow sections.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

import { AuthGate } from "@/components/auth-gate";
import { PatientList } from "@/components/patient-list";
import { PatientWorkflow } from "@/components/patient-workflow";
import { RegisterPatient } from "@/components/register-patient";
import { Button } from "@/components/ui/button";
import { createEncounter, migratePatient } from "@/lib/patient-model";

const AUTOSAVE_DELAY = 600;

function storageKey(userId, patientId) {
  return `corsc:patient:${userId}:${patientId}`;
}

/** Reads and migrates every record this user has stored in the browser. */
function loadPatients(userId) {
  if (typeof window === "undefined") return [];
  const prefix = `corsc:patient:${userId}:`;
  try {
    return Object.keys(window.localStorage).flatMap((key) => {
      if (!key.startsWith(prefix)) return [];
      try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? migratePatient(JSON.parse(raw)) : null;
        return parsed ? [parsed] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

function CORSCWorkspace({ user, onSignOut }) {
  const [patients, setPatients] = useState(() => loadPatients(user.id));
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [saveState, setSaveState] = useState("saved");
  const pending = useRef(new Map());
  const timer = useRef(null);

  /* Debounced autosave — every edit lands in local storage without a save button. */
  const schedulePersist = useCallback(
    (patient) => {
      pending.current.set(patient.id, patient);
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          pending.current.forEach((record, id) => {
            window.localStorage.setItem(storageKey(user.id, id), JSON.stringify(record));
          });
          pending.current.clear();
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      }, AUTOSAVE_DELAY);
    },
    [user.id]
  );

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const updatePatient = useCallback(
    (updater) => {
      setPatients((current) => {
        const index = current.findIndex((patient) => patient.id === selectedId);
        if (index < 0) return current;
        const next = typeof updater === "function" ? updater(current[index]) : { ...current[index], ...updater };
        schedulePersist(next);
        return current.map((patient, i) => (i === index ? next : patient));
      });
    },
    [selectedId, schedulePersist]
  );

  function createPatientRecord(patient) {
    setPatients((current) => [patient, ...current]);
    schedulePersist(patient);
    setSelectedId(patient.id);
    setView("workflow");
  }

  function openPatient(id) {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === id && !patient.draftEncounter
          ? { ...patient, draftEncounter: createEncounter(patient.visits?.length ? `Cycle ${(Number(patient.cycle) || 0) + 1}` : "Baseline") }
          : patient
      )
    );
    setSelectedId(id);
    setView("workflow");
  }

  const selected = patients.find((patient) => patient.id === selectedId);

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

      {view === "list" ? (
        <PatientList patients={patients} onSelect={openPatient} onNew={() => setView("register")} />
      ) : view === "register" ? (
        <RegisterPatient onCancel={() => setView("list")} onCreate={createPatientRecord} />
      ) : selected ? (
        <PatientWorkflow
          patient={selected}
          setPatient={updatePatient}
          saveState={saveState}
          onBack={() => setView("list")}
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
