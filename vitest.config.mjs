import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Engine tests live beside the modules; the smoke test server-renders the
    // sections, because `next build` type-checks the components but never runs
    // them. Backend tests live under tests/ and are split by what they need:
    // tests/unit run anywhere, tests/database, tests/api and tests/integration
    // need a PostgreSQL and skip without one (see tests/helpers/database.ts).
    include: [
      "lib/**/*.test.js",
      "smoke/**/*.test.jsx",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
    ],
    // The database-backed suites share one PostgreSQL, so they cannot run in
    // parallel against each other without fighting over the same tables.
    fileParallelism: false,
  },
});
