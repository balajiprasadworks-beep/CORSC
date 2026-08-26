/* =========================================================================
   Error mapping.

   The cases here are the ones where a bare 500 sent whoever was debugging to
   the wrong place. A failure the database raised because of how the deployment
   is configured must not be indistinguishable from a failure caused by what
   the clinician typed.
   ========================================================================= */

import { describe, expect, it } from "vitest";

import { ApiError, toApiError } from "@/lib/backend/errors";

describe("toApiError", () => {
  it("passes an ApiError through untouched", () => {
    const original = ApiError.notFound("Patient not found.");
    expect(toApiError(original)).toBe(original);
  });

  /*
   * Registration used to fail here with "Something went wrong. The error has
   * been logged." The cause was row-level security refusing the API's own
   * write, which is a deployment fault and needs to say so — see the
   * 20260826120000_api_role_rls_bypass migration.
   */
  it("names a row-level security refusal instead of reporting a generic failure", () => {
    const error = Object.assign(
      new Error('new row violates row-level security policy for table "clinicians"'),
      { code: "42501" }
    );
    const mapped = toApiError(error);

    expect(mapped.message).not.toMatch(/Something went wrong/i);
    expect(mapped.message).toMatch(/row-level security/i);
    expect(mapped.code).toBe(ApiError.notConfigured("x").code);
  });

  it("recognises a row-level security refusal from the message alone", () => {
    const mapped = toApiError(new Error("new row violates row-level security policy for table \"patients\""));
    expect(mapped.message).toMatch(/row-level security/i);
  });

  it("still reports an unrecognised failure generically", () => {
    const mapped = toApiError(new Error("something entirely unexpected"));
    expect(mapped.message).toMatch(/Something went wrong/i);
  });

  it("maps a unique-constraint violation to a conflict", () => {
    expect(toApiError(Object.assign(new Error("dup"), { code: "P2002" })).message).toMatch(/already exists/i);
  });

  it("maps an unreachable database to a configuration fault", () => {
    expect(toApiError(Object.assign(new Error("down"), { code: "P1001" })).message).toMatch(/unavailable/i);
  });
});
