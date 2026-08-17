/* =========================================================================
   The database client.

   One PrismaClient per process. Next.js reloads modules on every edit in
   development, so the instance is parked on globalThis; without that, a long
   editing session opens a new connection pool every save and eventually
   exhausts the database's connection limit.

   This module is server-only. Importing it from a client component pulls the
   database driver — and the connection string — towards the browser bundle,
   so the guard below fails loudly rather than letting that happen quietly.
   ========================================================================= */

import { PrismaClient } from "@prisma/client";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/db/prisma is server-only. A client component must call the API rather than the database."
  );
}

declare global {
  var corscPrisma: PrismaClient | undefined;
}

function createClient() {
  return new PrismaClient({
    // Query text is logged in development only. A query log in production
    // would put patient values into the application log.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalThis.corscPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.corscPrisma = prisma;
}

/** True when a database connection string has been configured. */
export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
