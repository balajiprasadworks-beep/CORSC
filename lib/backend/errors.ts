/* =========================================================================
   API errors.

   One error type with an explicit HTTP status and a machine-readable code, so
   that every route fails the same way and the response body never depends on
   which library threw.

   Two rules shape this module.

   FIRST, nothing internal reaches the client. Prisma error text names tables,
   columns and constraint values; a stack trace names file paths. Neither tells
   a clinician anything useful and both help an attacker, so `toClientBody`
   emits only the message this module chose.

   SECOND, a clinically invalid request is not the same as a malformed one.
   A body that fails schema validation is 400. A body that parses but asks for
   something that cannot be true of a patient — a cycle recorded against a
   therapy plan that does not belong to them — is 422, so the caller can tell
   "I sent the wrong shape" from "I sent the wrong facts".
   ========================================================================= */

export type ApiErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "clinically_invalid"
  | "conflict"
  | "not_configured"
  | "internal";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  invalid_request: 400,
  clinically_invalid: 422,
  conflict: 409,
  not_configured: 503,
  internal: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  /** Field-level detail, safe to show. Never contains database internals. */
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static unauthenticated(message = "Sign in to continue.") {
    return new ApiError("unauthenticated", message);
  }

  static forbidden(message = "You do not have access to this record.") {
    return new ApiError("forbidden", message);
  }

  static notFound(message = "Not found.") {
    return new ApiError("not_found", message);
  }

  static invalidRequest(message: string, details?: unknown) {
    return new ApiError("invalid_request", message, details);
  }

  /** The request was well-formed but describes something clinically impossible. */
  static clinicallyInvalid(message: string, details?: unknown) {
    return new ApiError("clinically_invalid", message, details);
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError("conflict", message, details);
  }

  static notConfigured(message: string) {
    return new ApiError("not_configured", message);
  }

  toClientBody() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details === undefined ? {} : { details: this.details }),
      },
    };
  }
}

/**
 * Maps anything thrown inside a handler onto an ApiError.
 *
 * Unrecognised failures become a generic 500 whose message says nothing about
 * the cause. The cause is logged server-side instead.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const code = (error as { code?: unknown })?.code;

  if (typeof code === "string") {
    // Prisma's known request errors. Translated by code rather than by
    // message, because the messages quote column values.
    if (code === "P2002") {
      return ApiError.conflict("That record already exists.");
    }
    if (code === "P2025") {
      return ApiError.notFound("Not found.");
    }
    if (code === "P2003") {
      return ApiError.invalidRequest("A referenced record does not exist.");
    }
    if (code === "P2010" || code === "P1001" || code === "P1002") {
      return ApiError.notConfigured("The database is unavailable.");
    }
  }

  // Constraint violations raised by the CHECK constraints and the append-only
  // triggers surface as raw database errors. They mean the request described
  // something the schema refuses to hold.
  const message = error instanceof Error ? error.message : "";
  if (message.includes("append-only")) {
    return ApiError.forbidden("This record cannot be modified. Record a correcting entry instead.");
  }
  if (message.includes("violates check constraint")) {
    return ApiError.clinicallyInvalid("A value in this request is outside the range the record allows.");
  }
  /*
   * SQLSTATE 42501 — the database refused the statement under row-level
   * security. This is never something the clinician typed: it means the API's
   * database role is being judged by policies written for the browser's
   * PostgREST path, so no write it attempts can succeed. Reported as a
   * configuration fault, and named, because as a bare 500 it is indistinguishable
   * from a bug in the request and sends whoever is debugging it to the wrong place.
   */
  if (code === "42501" || message.includes("row-level security policy")) {
    return ApiError.notConfigured(
      "The database refused this write under row-level security. The CORSC API's database role " +
        "cannot write to the patient tables, so no record can be saved until that is corrected."
    );
  }

  return new ApiError("internal", "Something went wrong. The error has been logged.");
}
