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
    // them.
    include: ["lib/**/*.test.js", "smoke/**/*.test.jsx"],
  },
});
