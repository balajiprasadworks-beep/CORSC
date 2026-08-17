"use client";

/* =========================================================================
   The API client.

   One place where the browser talks to CORSC's server. Every request carries
   the Supabase access token as a bearer credential, and every response is
   unwrapped into either a value or a typed error.

   WHY THE TOKEN IS FETCHED PER REQUEST rather than captured once: Supabase
   refreshes access tokens in the background, and a client that cached the
   first one would start failing silently an hour into a clinic list. Reading
   it from the session each time costs nothing and cannot go stale.

   WHAT THIS FILE DOES NOT DO. It does not interpret clinical data, it does not
   decide what the user may do, and it does not retry writes. A failed save is
   surfaced to the clinician rather than retried behind their back: a clinical
   record that silently reappears three minutes later is worse than one that
   visibly failed.
   ========================================================================= */

import { supabase, supabaseConfigurationError } from "@/lib/supabase";

export class ApiRequestError extends Error {
  constructor(message, { status, code, details, requestId } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status ?? 0;
    this.code = code ?? "network";
    this.details = details;
    this.requestId = requestId;
  }

  /** True when the record moved under the caller — a concurrent edit. */
  get isConflict() {
    return this.status === 409;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

async function accessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

/**
 * Calls the API and returns the `data` envelope.
 *
 * @param {string} path      e.g. "/api/patients"
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object} [options.body]
 * @param {AbortSignal} [options.signal]
 */
export async function apiFetch(path, options = {}) {
  if (supabaseConfigurationError) {
    throw new ApiRequestError(supabaseConfigurationError, { code: "not_configured" });
  }

  const token = await accessToken();
  if (!token) {
    throw new ApiRequestError("Your session has expired. Sign in again.", {
      status: 401,
      code: "unauthenticated",
    });
  }

  let response;
  try {
    response = await fetch(path, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiRequestError("CORSC could not reach the server.", { code: "network" });
  }

  const requestId = response.headers.get("x-request-id") || undefined;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiRequestError(error?.message || "The request failed.", {
      status: response.status,
      code: error?.code,
      details: error?.details,
      requestId,
    });
  }

  return payload?.data;
}

/** Whether the server is up and can reach its database. Unauthenticated. */
export async function serverHealth() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) return { status: "unreachable", database: "unknown" };
    const payload = await response.json();
    return payload?.data ?? { status: "unreachable", database: "unknown" };
  } catch {
    return { status: "unreachable", database: "unknown" };
  }
}
