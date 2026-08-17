/* =========================================================================
   GET /api/medications/search?q=

   Server-side search over the formulary. The dictionary is sized for a
   national formulary and designed to grow, so it is not shipped to the browser
   to be filtered there — that would be a large download before the first
   search, on a connection that may be a hospital wifi.

   Reference data, but still behind authentication: an unauthenticated
   formulary endpoint is a free scraping target and buys nothing.
   ========================================================================= */

import { apiRoute, ok } from "@/lib/backend/route";
import { medicationSearchSchema, parseQuery } from "@/lib/backend/validation";
import { searchMedications } from "@/lib/backend/services/medication-service";

export const dynamic = "force-dynamic";

export const GET = apiRoute({ name: "GET /api/medications/search" }, async (context) => {
  const query = parseQuery(medicationSearchSchema, context.search);
  return ok({ medications: await searchMedications(query.q, query.limit) });
});
