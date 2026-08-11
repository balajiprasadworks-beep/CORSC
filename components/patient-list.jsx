"use client";

/* =========================================================================
   The clinical worklist — the entry point into the workflow.

   This used to be a search box over a list of cards showing a name, a diagnosis
   and a risk chip. That answers "who is on my caseload"; it does not answer the
   question a cardio-oncology service actually starts the day with, which is who
   needs attention now and who has quietly fallen off the end of the list.

   Rows are computed from each patient's own record rather than from anything
   the clinician has opened, so a patient eight weeks past a due echocardiogram
   surfaces without anyone having to remember them. Sorting is by clinical
   urgency, not alphabetically: a list sorted by name is a list where the
   sickest patient's position is decided by their surname.
   ========================================================================= */

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Heart, Plus, Search } from "lucide-react";

import { EmptyState, StatusChip, flagStyle, mono, serif } from "@/components/kit";
import { APP_FULL_NAME, APP_NAME, riskStyle } from "@/lib/clinical-data";
import { FILTER_LIST, buildWorklist } from "@/lib/worklist";

function RowMetric({ label, value, tone }) {
  return (
    <span className="flex flex-col">
      <span className="text-[9.5px] uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-[12.5px] font-semibold ${tone || "text-slate-700"}`}>{value}</span>
    </span>
  );
}

export function PatientList({ patients, onSelect, onNew }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState([]);

  const worklist = useMemo(() => buildWorklist(patients, { filters, search: query }), [patients, filters, query]);

  function toggleFilter(id) {
    setFilters((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const urgentCount = worklist.counts.urgent || 0;
  const overdueCount = worklist.counts.overdue || 0;

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#123055] px-4 pb-8 pt-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500">
              <Heart size={18} className="text-white" fill="white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight" style={serif}>{APP_NAME}</div>
              <div className="text-[12px] text-white/70">{APP_FULL_NAME}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-white/80">
            <span>{worklist.total} patient{worklist.total === 1 ? "" : "s"} on the caseload</span>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-red-200">
                <AlertTriangle size={14} aria-hidden="true" /> {urgentCount} needing urgent review
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-amber-200">
                <Clock size={14} aria-hidden="true" /> {overdueCount} overdue
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="-mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, Patient ID, diagnosis or therapy"
                aria-label="Search patients"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
            </div>
            <button
              type="button"
              onClick={onNew}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={17} aria-hidden="true" /> Register patient
            </button>
          </div>

          {/* Filters combine with OR: selecting Overdue and Urgent shows both
              groups, which is what a clinician means, rather than the small
              intersection of patients who are somehow both. */}
          <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
            {FILTER_LIST.map((filter) => {
              const active = filters.includes(filter.id);
              const count = worklist.counts[filter.id] || 0;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFilter(filter.id)}
                  aria-pressed={active}
                  title={filter.description}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : count > 0
                        ? "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {filter.label}
                  {count > 0 && <span className="ml-1.5 opacity-70">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {worklist.rows.length === 0 && (
            <EmptyState>
              {worklist.total === 0
                ? "No patients registered yet. Register the first patient to begin risk stratification."
                : filters.length
                  ? "No patients match the selected filters."
                  : "No patients match this search."}
            </EmptyState>
          )}

          {worklist.rows.map((row) => {
            const styles = riskStyle(row.baselineRisk || "Low");
            const alert = flagStyle(row.alertLevel);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row.id)}
                className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:shadow-[0_2px_10px_rgba(15,23,42,0.07)] ${
                  row.alertLevel === "red" || row.alertLevel === "orange" ? alert.border : "border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-slate-900">{row.name}</span>
                      {row.alertLevel !== "green" && (
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${alert.bg} ${alert.text}`}>
                          {row.alertLevel}
                        </span>
                      )}
                      {row.completenessBand === "insufficient" && <StatusChip tone="warning">Provisional</StatusChip>}
                    </div>
                    <div className="mt-0.5 truncate text-[13px] text-slate-500">
                      {[row.diagnosis, row.therapy].filter(Boolean).join(" · ") || "Diagnosis not recorded"}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.bg} ${styles.text}`}>
                    {row.baselineRisk || "No proforma"}
                    {row.baselineRiskOverridden && " ·  override"}
                  </span>
                </div>

                {row.topAlert && (
                  <div className={`mt-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] leading-relaxed ${alert.bg} ${alert.text}`}>
                    {row.topAlert.title}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5" style={mono}>
                  <RowMetric label="ID" value={row.patientId || "—"} />
                  <RowMetric label="Cycle" value={row.cycle || "—"} />
                  <RowMetric
                    label="Toxicity"
                    value={row.ctrCvtLabel}
                    tone={row.ctrCvtSeverity === "none" ? "text-slate-500" : "text-red-700"}
                  />
                  <RowMetric
                    label="Next review"
                    value={row.isOverdue ? `${row.overdueDays}d overdue` : row.dueToday ? "Today" : row.nextReview || "Not set"}
                    tone={row.isOverdue ? "text-red-700" : row.dueToday ? "text-amber-700" : "text-slate-700"}
                  />
                  <RowMetric
                    label="Outstanding"
                    value={row.outstandingCount ? `${row.outstandingCount} item${row.outstandingCount === 1 ? "" : "s"}` : "None"}
                    tone={row.outstandingCount ? "text-amber-700" : "text-slate-500"}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
