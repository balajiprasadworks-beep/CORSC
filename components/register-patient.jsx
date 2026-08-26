"use client";

/* =========================================================================
   Registration screen.

   Uses the same field set as the in-workflow registration section, so the two
   never drift apart.
   ========================================================================= */

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { RegistrationFields, applyRegistrationChange } from "@/components/sections/registration";
import { serif } from "@/components/kit";
import { createEncounter, createPatient, todayISO } from "@/lib/patient-model";

export function RegisterPatient({ onCancel, onCreate }) {
  const [draft, setDraft] = useState(() => applyRegistrationChange(createPatient({}), {}));
  const [submitting, setSubmitting] = useState(false);
  const canRegister = Boolean(draft.name && draft.diagnosis && draft.therapy);

  async function submit() {
    if (!canRegister || submitting) return;
    setSubmitting(true);
    try {
      await onCreate({
        ...draft,
        registeredDate: todayISO(),
        draftEncounter: createEncounter("Baseline", { date: todayISO() }),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="bg-gradient-to-br from-[#0B1F3A] to-[#123055] px-4 pb-7 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              aria-label="Back to patient list"
              className="flex size-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <div className="flex size-7 items-center justify-center rounded-lg">
              <img
                src="/corsc-icon.png"
                alt="CORSC"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-[24px] font-bold leading-tight" style={serif}>
                Register new patient
              </h1>
              <p className="mt-1 text-[13px] text-white/70">
                Identity, diagnosis, planned course and baseline HFA-ICOS stratification.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <RegistrationFields
          value={draft}
          onChange={(patch) => setDraft((current) => applyRegistrationChange(current, patch))}
        />

        <div className="sticky bottom-0 mt-4 border-t border-slate-200 bg-[#F6F7F5] py-3">
          <button
            type="button"
            disabled={!canRegister || submitting}
            onClick={submit}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold transition ${
              canRegister && !submitting
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {submitting ? "Registering…" : (
              <>Register and open workflow <ArrowRight size={17} aria-hidden="true" /></>
            )}
          </button>
          <p className="mt-2 text-center text-[12px] text-slate-400">
            {submitting ? "Saving the new record…" : canRegister ? "Ready to register." : "Name, diagnosis and planned therapy are required."}
          </p>
        </div>
      </div>
    </div>
  );
}
