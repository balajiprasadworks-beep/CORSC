/* =========================================================================
   GET /api/health

   Unauthenticated on purpose, and says as little as possible: whether the
   process is up and whether it can reach its database. No versions, no
   configuration, no counts — a health endpoint is a reconnaissance target as
   much as a monitoring one.
   ========================================================================= */

import { apiRoute, ok } from "@/lib/backend/route";
import { databaseConfigured, prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/health", authenticated: false }, async () => {
  if (!databaseConfigured()) {
    return ok({ status: "degraded", database: "not_configured" });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", database: "reachable" });
  } catch {
    return ok({ status: "degraded", database: "unreachable" });
  }
});
