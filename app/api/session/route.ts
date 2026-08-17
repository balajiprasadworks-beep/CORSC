/* =========================================================================
   GET /api/session

   Who the caller is and what they may do, as the server sees it.

   The client uses this to decide what to show. It does NOT use it to decide
   what is allowed: every endpoint re-checks the role server-side, because a
   client that hid a button is not an access control.
   ========================================================================= */

import { canReadAudit, canWrite } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/session" }, async (context) => {
  const { clinician } = context.actor;
  return ok({
    clinician: {
      id: clinician.id,
      email: clinician.email,
      displayName: clinician.displayName,
      role: clinician.role,
      active: clinician.active,
    },
    permissions: {
      write: canWrite(context.actor),
      readAudit: canReadAudit(context.actor),
    },
  });
});
