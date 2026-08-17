/* =========================================================================
   Audit.

   Records that something clinically meaningful changed, who changed it and
   when. Two constraints, carried over from lib/audit-log.js so that the server
   trail and the record's own trail redact identically.

   FIRST, the audit log must not become a second copy of the clinical record.
   Only fields declared auditable have their values written; everything else is
   recorded as changed, with the value withheld. A trail that quoted every note
   would duplicate the narrative into a table with different retention and
   different access control.

   SECOND, it is append-only. There is no update path in this module, none in
   the row-level security policies, and a database trigger rejects UPDATE and
   DELETE on the table outright — so the guarantee holds even against this
   application's own privileged connection. A correction is a new row.
   ========================================================================= */

import type { Prisma, PrismaClient } from "@prisma/client";

import { AUDITABLE_FIELDS } from "@/lib/audit-log";

const REDACTED = "[changed — value not copied to the audit trail]";

export type AuditWriter = PrismaClient | Prisma.TransactionClient;

export interface AuditInput {
  patientId?: string | null;
  actorId: string;
  action: string;
  category: "record" | "encounter" | "clinical" | "override" | "export" | "account" | "migration";
  entity?: string;
  entityId?: string;
  field?: string;
  previous?: unknown;
  next?: unknown;
  reason?: string | null;
  detail?: string | null;
  requestId?: string;
}

/** Values reach the trail only for fields declared auditable. */
function safeValue(field: string | undefined, value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!field || !AUDITABLE_FIELDS.has(field)) return REDACTED;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return REDACTED;
  return String(value);
}

export async function recordAudit(db: AuditWriter, input: AuditInput) {
  return db.auditEvent.create({
    data: {
      patientId: input.patientId ?? null,
      actorId: input.actorId,
      action: input.action,
      category: input.category,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
      field: input.field ?? null,
      previousValue: safeValue(input.field, input.previous),
      newValue: safeValue(input.field, input.next),
      reason: input.reason ?? null,
      detail: input.detail ?? null,
      requestId: input.requestId ?? null,
    },
  });
}

export async function recordAuditBatch(db: AuditWriter, inputs: AuditInput[]) {
  if (inputs.length === 0) return;
  await db.auditEvent.createMany({
    data: inputs.map((input) => ({
      patientId: input.patientId ?? null,
      actorId: input.actorId,
      action: input.action,
      category: input.category,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
      field: input.field ?? null,
      previousValue: safeValue(input.field, input.previous),
      newValue: safeValue(input.field, input.next),
      reason: input.reason ?? null,
      detail: input.detail ?? null,
      requestId: input.requestId ?? null,
    })),
  });
}

/**
 * One audit entry per changed field.
 *
 * Fields whose values differ only by formatting produce no entry, so that a
 * re-save of an unchanged form does not fill the trail with noise.
 */
export function diffFields(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  base: Omit<AuditInput, "field" | "previous" | "next">
): AuditInput[] {
  const entries: AuditInput[] = [];
  Object.keys(next).forEach((field) => {
    const before = previous[field];
    const after = next[field];
    if (before === after) return;
    if (JSON.stringify(before ?? null) === JSON.stringify(after ?? null)) return;
    entries.push({ ...base, field, previous: before, next: after });
  });
  return entries;
}
