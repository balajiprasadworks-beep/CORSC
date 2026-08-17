/* =========================================================================
   Calling the API from a test.

   Route handlers are invoked directly with a Request, which exercises the real
   wrapper: authentication, role checks, Zod validation, error mapping and the
   response envelope all run.

   ONLY THE TOKEN CHECK IS FAKED. `installSupabaseStub` replaces the Supabase
   client so a bearer token maps to a user id without a network call.
   Everything downstream of that — the clinician lookup, the role, the care
   team, requirePatientAccess — is the real code running against the real
   database. Mocking authorisation as well would leave the security tests
   asserting that the mock works.
   ========================================================================= */

import { vi } from "vitest";

type Handler = (request: Request, context?: { params?: Promise<Record<string, string>> }) => Promise<Response>;

/**
 * Installs a Supabase stub that treats the bearer token as the user id.
 *
 * Must be called before the modules under test are imported, so it is used
 * from a `vi.mock` factory at the top of each suite.
 */
export function supabaseStub() {
  return {
    createClient: () => ({
      auth: {
        async getUser(token: string) {
          if (!token || token === "invalid") {
            return { data: { user: null }, error: { message: "invalid token" } };
          }
          return { data: { user: { id: token, email: `${token}@example.invalid`, user_metadata: {} } }, error: null };
        },
      },
    }),
  };
}

export interface CallOptions {
  /** The bearer token, which the stub reads as the caller's user id. */
  as?: string | null;
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface CallResult<T = unknown> {
  status: number;
  data: T | undefined;
  error: { code?: string; message?: string; details?: unknown } | undefined;
}

export async function call<T = unknown>(
  handler: Handler,
  options: CallOptions = {}
): Promise<CallResult<T>> {
  const url = new URL("https://corsc.test/api/test");
  Object.entries(options.query || {}).forEach(([key, value]) => url.searchParams.set(key, value));

  const request = new Request(url, {
    method: options.method || "GET",
    headers: {
      ...(options.as ? { Authorization: `Bearer ${options.as}` } : {}),
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const response = await handler(request, {
    params: Promise.resolve(options.params || {}),
  });

  const payload = await response.json().catch(() => null);

  return {
    status: response.status,
    data: payload?.data,
    error: payload?.error,
  };
}

/** Silences the request log so test output stays readable. */
export function muteRequestLog() {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
}
