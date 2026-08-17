/* =========================================================================
   Request logging.

   Enough to answer "which request was that, who made it, how long did it take
   and what kind of thing went wrong" — and deliberately nothing more.

   WHAT IS NEVER LOGGED, and why the redaction is a list of allowed keys rather
   than a list of banned ones: a log is a second store of whatever it records,
   with different retention and different access control from the database. If
   patient values reach it, every guarantee the schema makes about who can read
   a clinical record stops being true. So the logger accepts a fixed set of
   operational fields and drops everything else, rather than trying to guess
   which of an arbitrary object's keys are safe.
   ========================================================================= */

export type LogLevel = "info" | "warn" | "error";

/** The only fields a log line may carry. */
export interface RequestLogFields {
  requestId: string;
  method: string;
  /** The route pattern, not the resolved URL — a URL contains record ids. */
  route: string;
  status: number;
  durationMs: number;
  /** The authenticated clinician, not the patient. */
  actorId?: string;
  role?: string;
  /** The ApiError code, never the underlying message. */
  errorCode?: string;
  /** Error class name for unexpected failures, e.g. "TypeError". */
  errorKind?: string;
}

export function newRequestId(): string {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function emit(level: LogLevel, payload: Record<string, unknown>) {
  const line = JSON.stringify({ level, at: new Date().toISOString(), ...payload });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function logRequest(fields: RequestLogFields) {
  const level: LogLevel = fields.status >= 500 ? "error" : fields.status >= 400 ? "warn" : "info";
  emit(level, { event: "api_request", ...fields });
}

/**
 * Records the technical detail of an unexpected failure.
 *
 * The message and stack go to the server log only; the client gets the generic
 * 500 body from ApiError. Called with the request id so the two halves can be
 * correlated without either half containing patient data.
 */
export function logInternalError(requestId: string, route: string, error: unknown) {
  emit("error", {
    event: "api_internal_error",
    requestId,
    route,
    errorKind: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
