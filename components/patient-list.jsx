"use client";

/* =========================================================================
   Patient list — the entry point into the workflow.
   ========================================================================= */

import { useState } from "react";
import { Heart, Plus, Search } from "lucide-react";

import { EmptyState, StatusChip, mono, serif } from "@/components/kit";
import { APP_FULL_NAME, APP_NAME, riskStyle } from "@/lib/clinical-data";

export function PatientList({ patients, onSelect, onNew }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const filtered = patients.filter((patient) =>
    !term ||
    (patient.name || "").toLowerCase().includes(term) ||
    (patient.patientId || "").toLowerCase().includes(term) ||
    (patient.diagnosis || "").toLowerCase().includes(term)
  );

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#123055] px-4 pb-8 pt-8 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500">
              <Heart size={18} className="text-white" fill="white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight" style={serif}>{APP_NAME}</div>
              <div className="text-[12px] text-white/70">{APP_FULL_NAME}</div>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-white/75">
            HFA-ICOS risk stratification, surveillance planning and outpatient documentation in one continuous workflow.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16">
        <div className="-mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, Patient ID or diagnosis"
              aria-label="Search patients"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
          <button
            type="button"
            onClick={onNew}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={17} aria-hidden="true" /> Register new patient
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {filtered.length === 0 && (
            <EmptyState>
              {patients.length === 0
                ? "No patients registered yet. Register the first patient to begin risk stratification."
                : "No patients match this search."}
            </EmptyState>
          )}

          {filtered.map((patient) => {
            const styles = riskStyle(patient.risk?.category);
            return (
              <button
                key={patient.id}
                type="button"
                onClick={() => onSelect(patient.id)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:shadow-[0_2px_10px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-slate-900">{patient.name || "Unnamed patient"}</div>
                    <div className="mt-0.5 truncate text-[13px] text-slate-500">
                      {[patient.diagnosis, patient.stage].filter(Boolean).join(" · ") || "Diagnosis not recorded"}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.bg} ${styles.text}`}>
                    {patient.risk?.category || "Unstratified"}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400" style={mono}>
                  <span>ID {patient.patientId || "—"}</span>
                  <span>Cycle {patient.cycle ?? 0}{patient.plannedCycles ? `/${patient.plannedCycles}` : ""}</span>
                  <span>{(patient.visits || []).length} encounter{(patient.visits || []).length === 1 ? "" : "s"}</span>
                  <StatusChip tone={patient.clinicalStatus === "Stable" || patient.clinicalStatus === "Improving" ? "ok" : patient.clinicalStatus === "Worsening" ? "warning" : "danger"}>
                    {patient.clinicalStatus}
                  </StatusChip>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
