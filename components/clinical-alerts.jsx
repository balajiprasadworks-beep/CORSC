"use client";

/* =========================================================================
   Clinical Alerts.

   lib/clinical-data.js#computeAlerts already produces action-oriented
   findings — troponin rises, possible ICI myocarditis, CTRCD grading,
   heart-failure symptom clusters, VEGF-related hypertensive crisis, BCR-ABL
   vascular events — each with what was found and what to do about it. It was
   computed into the clinical picture but never actually shown anywhere: it
   only rode along silently on the saved encounter. This surfaces it.
   ========================================================================= */

import { AlertTriangle, Siren } from "lucide-react";

import { Stack } from "@/components/kit";

const LEVEL_STYLES = {
  danger: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: Siren },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: AlertTriangle },
};

export function ClinicalAlerts({ alerts }) {
  const list = alerts || [];
  if (list.length === 0) return null;

  const sorted = [...list].sort((a, b) => (a.level === "danger" ? -1 : 1) - (b.level === "danger" ? -1 : 1));

  return (
    <section aria-label="Clinical alerts">
      <Stack gap="gap-2">
        {sorted.map((alert) => {
          const styles = LEVEL_STYLES[alert.level] || LEVEL_STYLES.warning;
          const Icon = styles.icon;
          return (
            <div key={alert.id} className={`rounded-2xl border p-3.5 ${styles.bg} ${styles.border}`}>
              <div className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${styles.text}`}>
                <Icon size={15} aria-hidden="true" />
                {alert.title}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{alert.desc}</p>
            </div>
          );
        })}
      </Stack>
    </section>
  );
}
