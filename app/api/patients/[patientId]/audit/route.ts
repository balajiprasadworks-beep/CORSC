/* =========================================================================
   GET /api/patients/:patientId/audit

   The governance trail. Restricted by role: the audit log answers questions
   about who changed what, which is a different question from the clinical one,
   and not every role that can look after a patient needs to see it.
   ========================================================================= */

import { canReadAudit, requirePatientAccess } from "@/lib/backend/auth";
import { ApiError } from "@/lib/backend/errors";
import { apiRoute, ok } from "@/lib/backend/route";
import { auditQuerySchema, parseQuery } from "@/lib/backend/validation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Params = { patientId: string };

export const GET = apiRoute<Params>(
  { name: "GET /api/patients/[patientId]/audit" },
  async (context) => {
    await requirePatientAccess(context.actor, context.params.patientId, "read");

    if (!canReadAudit(context.actor)) {
      throw ApiError.forbidden("Your role does not have access to the audit trail.");
    }

    const query = parseQuery(auditQuerySchema, context.search);

    const events = await prisma.auditEvent.findMany({
      where: {
        patientId: context.params.patientId,
        ...(query.category ? { category: query.category } : {}),
        ...(query.since ? { occurredAt: { gte: new Date(query.since) } } : {}),
      },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: { actor: { select: { id: true, displayName: true, email: true, role: true } } },
    });

    const hasMore = events.length > query.limit;
    return ok({
      events: hasMore ? events.slice(0, query.limit) : events,
      nextCursor: hasMore ? events[query.limit - 1].id : null,
    });
  }
);
