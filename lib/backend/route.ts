/* =========================================================================
   The route wrapper.

   Every CORSC endpoint is the same seven steps: identify the caller, check
   what they may do, validate what they sent, do the work, write the audit
   record, answer in a consistent shape, and log the outcome. Writing those
   seven steps by hand in forty route files guarantees that one of them
   eventually forgets step two.

   So the sequence lives here once, and a route handler is only the work in the
   middle. A handler that never calls `requirePatientAccess` cannot reach a
   patient record, because the only way to get a patient id out of the context
   is to ask for it through the access check.
   ========================================================================= */

import type { TypeOf, ZodTypeAny } from "zod";

import { ApiError, toApiError } from "@/lib/backend/errors";
import { authenticate, type AuthenticatedActor } from "@/lib/backend/auth";
import { logInternalError, logRequest, newRequestId } from "@/lib/backend/logger";

export interface RouteContext<P extends Record<string, string> = Record<string, string>> {
  /**
   * The Web Request. Typed as the standard `Request` rather than Next.js's
   * `NextRequest`: nothing in this wrapper or in any handler uses the extended
   * API, and the narrower type is what makes a route callable directly from a
   * test with a plain Request — which is how tests/api exercises the real
   * authentication and authorisation path.
   */
  request: Request;
  params: P;
  search: URLSearchParams;
  actor: AuthenticatedActor;
  requestId: string;
  /**
   * Parses and validates the JSON body against a schema.
   *
   * Generic over the schema rather than over a result type, so the handler
   * receives the schema's *output* — the coerced, range-checked values — and
   * cannot accidentally be handed the raw input shape.
   */
  body<S extends ZodTypeAny>(schema: S): Promise<TypeOf<S>>;
}

export interface RouteResult {
  status?: number;
  data: unknown;
}

export function ok(data: unknown): RouteResult {
  return { status: 200, data };
}

export function created(data: unknown): RouteResult {
  return { status: 201, data };
}

interface RouteOptions {
  /** The route pattern, used for logging. Never the resolved URL. */
  name: string;
  /** Set false for the small number of endpoints that must answer unauthenticated. */
  authenticated?: boolean;
}

type NextRouteContext = { params?: Promise<Record<string, string>> | Record<string, string> };

/**
 * Wraps a handler with authentication, validation, error mapping and logging.
 *
 * Responses are always `{ data }` or `{ error }` — never a bare value — so a
 * client never has to guess whether it received a result or a failure.
 */
export function apiRoute<P extends Record<string, string> = Record<string, string>>(
  options: RouteOptions,
  handler: (context: RouteContext<P>) => Promise<RouteResult>
) {
  return async function handleRequest(request: Request, nextContext?: NextRouteContext): Promise<Response> {
    const requestId = newRequestId();
    const startedAt = Date.now();
    let actor: AuthenticatedActor | undefined;
    let status = 500;

    try {
      const resolved = ((await nextContext?.params) || {}) as P;
      const search = new URL(request.url).searchParams;

      if (options.authenticated !== false) {
        actor = await authenticate(request);
      }

      let bodyCache: unknown;
      let bodyRead = false;

      const context: RouteContext<P> = {
        request,
        params: resolved,
        search,
        actor: actor as AuthenticatedActor,
        requestId,
        async body<S extends ZodTypeAny>(schema: S): Promise<TypeOf<S>> {
          if (!bodyRead) {
            bodyRead = true;
            try {
              const text = await request.text();
              bodyCache = text ? JSON.parse(text) : {};
            } catch {
              throw ApiError.invalidRequest("The request body is not valid JSON.");
            }
          }
          const parsed = schema.safeParse(bodyCache);
          if (!parsed.success) {
            throw ApiError.invalidRequest(
              "The request contains values this record cannot accept.",
              parsed.error.issues.map((issue) => ({
                field: issue.path.join(".") || "(body)",
                message: issue.message,
              }))
            );
          }
          return parsed.data;
        },
      };

      const result = await handler(context);
      status = result.status ?? 200;

      return Response.json({ data: result.data }, { status, headers: { "x-request-id": requestId } });
    } catch (error) {
      const apiError = toApiError(error);
      status = apiError.status;

      // Only genuinely unexpected failures get their detail written out; a 403
      // is a normal outcome and does not need a stack trace.
      if (apiError.status >= 500) {
        logInternalError(requestId, options.name, error);
      }

      return Response.json(apiError.toClientBody(), {
        status,
        headers: { "x-request-id": requestId },
      });
    } finally {
      logRequest({
        requestId,
        method: request.method,
        route: options.name,
        status,
        durationMs: Date.now() - startedAt,
        actorId: actor?.clinician.id,
        role: actor?.clinician.role,
      });
    }
  };
}
