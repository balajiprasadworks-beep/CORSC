/* =========================================================================
   GET  /api/migration/legacy   what this clinician has already imported
   POST /api/migration/legacy   import records held in browser storage

   Non-destructive, and repeatable. The browser copy is never touched by this
   endpoint: deleting the source before anyone has confirmed the import would
   make a bad import unrecoverable.

   Send `commit: false` to validate and receive the full report without
   anything being written — a dry run a clinician can read before deciding.
   ========================================================================= */

import { requireWrite } from "@/lib/backend/auth";
import { apiRoute, ok } from "@/lib/backend/route";
import { legacyImportSchema } from "@/lib/backend/validation";
import {
  migrateFromBrowserStorage,
  migrationHistory,
} from "@/lib/backend/services/legacy-migration-service";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/migration/legacy" }, async (context) => {
  return ok({ imports: await migrationHistory(context.actor.clinician.id) });
});

export const POST = apiRoute({ name: "POST /api/migration/legacy" }, async (context) => {
  requireWrite(context.actor);
  const body = await context.body(legacyImportSchema);

  return ok(
    await migrateFromBrowserStorage(body.records, {
      actor: context.actor,
      requestId: context.requestId,
      commit: body.commit,
    })
  );
});
