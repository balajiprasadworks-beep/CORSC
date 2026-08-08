"use client";

/* =========================================================================
   History.

   Seven grouped cards, all collapsed by default apart from the two that most
   often change management. History is stored on the patient rather than the
   encounter, so it carries forward between visits instead of being retyped.
   ========================================================================= */

import { BookOpen } from "lucide-react";

import {
  Checkbox,
  DateField,
  Disclosure,
  Grid,
  SelectField,
  Stack,
  StatusChip,
  TextArea,
  TextField,
} from "@/components/kit";
import { HISTORY_GROUPS } from "@/lib/clinical-data";

const DEFAULT_OPEN = ["cancer", "cardiovascular"];

function countEntries(entry) {
  const checks = Object.values(entry?.checks || {}).filter(Boolean).length;
  const fields = Object.values(entry?.fields || {}).filter((v) => String(v || "").trim()).length;
  return checks + fields;
}

function HistoryField({ field, value, onChange }) {
  if (field.type === "textarea") {
    return <TextArea label={field.label} placeholder={field.placeholder} rows={2} value={value} onChange={onChange} />;
  }
  if (field.type === "select") {
    return <SelectField label={field.label} options={field.options} value={value} onChange={onChange} />;
  }
  if (field.type === "date") {
    return <DateField label={field.label} value={value} onChange={onChange} />;
  }
  return <TextField label={field.label} placeholder={field.placeholder} value={value} onChange={onChange} />;
}

export function HistorySection({ patient, setPatient }) {
  function update(groupId, kind, key, value) {
    setPatient((current) => {
      const history = current.history || {};
      const group = history[groupId] || { checks: {}, fields: {} };
      return {
        ...current,
        history: {
          ...history,
          [groupId]: { ...group, [kind]: { ...group[kind], [key]: value } },
        },
      };
    });
  }

  return (
    <Stack gap="gap-2.5">
      {HISTORY_GROUPS.map((group) => {
        const entry = patient.history?.[group.id] || { checks: {}, fields: {} };
        const filled = countEntries(entry);
        const positives = Object.entries(entry.checks || {})
          .filter(([, value]) => value)
          .map(([key]) => group.checklist?.find((c) => c.id === key)?.label)
          .filter(Boolean);

        return (
          <Disclosure
            key={group.id}
            title={group.label}
            subtitle={positives.length ? positives.join(" · ") : group.hint}
            defaultOpen={DEFAULT_OPEN.includes(group.id)}
            badge={filled > 0 ? <StatusChip tone="ok">{filled} recorded</StatusChip> : null}
          >
            <Stack>
              {group.checklist && (
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-1">
                  {group.checklist.map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={!!entry.checks?.[item.id]}
                      onChange={() => update(group.id, "checks", item.id, !entry.checks?.[item.id])}
                    />
                  ))}
                </div>
              )}
              {group.fields && (
                <Grid cols={group.fields.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-1"}>
                  {group.fields.map((field) => (
                    <div key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <HistoryField
                        field={field}
                        value={entry.fields?.[field.id] || ""}
                        onChange={(value) => update(group.id, "fields", field.id, value)}
                      />
                    </div>
                  ))}
                </Grid>
              )}
            </Stack>
          </Disclosure>
        );
      })}
    </Stack>
  );
}

export const HISTORY_ICON = BookOpen;
