/* =========================================================================
   The resolve hook itself. See alias-loader.mjs for why it exists.

   Only the "@/" prefix is intercepted; everything else falls through to
   Node's own resolution untouched.
   ========================================================================= */

import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

  const target = path.join(REPO_ROOT, specifier.slice(2));
  // The application writes extensionless imports. Try the extensions the
  // project actually uses, in the order Next.js would.
  for (const extension of ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"]) {
    const candidate = `${target}${extension}`;
    try {
      return await nextResolve(pathToFileURL(candidate).href, context);
    } catch {
      // Try the next extension.
    }
  }

  return nextResolve(specifier, context);
}
