/* =========================================================================
   Path alias resolution for the database scripts.

   The application resolves "@/lib/..." through the TypeScript paths mapping,
   which Next.js and Vitest both honour. Plain `node` does not, so the seed and
   the formulary import — which deliberately share the application's clinical
   definitions rather than restating them — cannot resolve those imports
   without help.

   This registers a resolve hook that maps the alias onto the repository root.
   It exists so that a script can import THE definition of a therapy class
   rather than a copy of it: a seed that hard-coded its own list would drift
   from the engines and would eventually seed data the application rejects.
   ========================================================================= */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./alias-resolver.mjs", pathToFileURL(import.meta.filename));
