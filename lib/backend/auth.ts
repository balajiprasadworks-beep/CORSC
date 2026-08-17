/* =========================================================================
   Authentication and authorisation.

   AUTHENTICATION stays with Supabase Auth, which the application already uses.
   The browser holds the session; every API call carries the access token as a
   bearer credential, and this module verifies it with Supabase before the
   request touches a patient record.

   AUTHORISATION lives here, not in Supabase and not in the browser. The role
   is read from the `clinicians` table by user id. A role supplied in a request
   body or a header is ignored entirely — `{ "role": "ADMIN" }` from a client
   is data, not a claim.

   The two are separated deliberately. Supabase can tell us *who* the caller
   is. Only the database can tell us what they are allowed to do with a
   particular patient, because that depends on who registered the patient and
   who has since been added to their care team.

   PRIVILEGE. The Supabase client built here uses the publishable key — the
   same key already in the browser bundle — because verifying a token needs no
   more than that. The service-role key is never read by this module, never
   read by any module under lib/backend, and must never be present in a
   NEXT_PUBLIC_ variable.
   ========================================================================= */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Clinician, ClinicianRole } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/backend/errors";

export interface AuthenticatedActor {
  userId: string;
  email: string;
  clinician: Clinician;
}

/** Roles that may create or change clinical records. */
const WRITE_ROLES: ReadonlySet<ClinicianRole> = new Set<ClinicianRole>([
  "ADMIN",
  "CARDIO_ONCOLOGIST",
  "ONCOLOGIST",
  "CLINICIAN",
]);

/** Roles that may read the governance audit trail. */
const AUDIT_ROLES: ReadonlySet<ClinicianRole> = new Set<ClinicianRole>([
  "ADMIN",
  "CARDIO_ONCOLOGIST",
]);

/**
 * The role a first-time user is provisioned with.
 *
 * Deliberately the least-privileged role that can still do clinical work: a
 * new account can look after its own patients and nothing else. ADMIN,
 * RESEARCHER and READ_ONLY are all granted deliberately by an administrator,
 * never by signing in.
 */
const DEFAULT_ROLE: ClinicianRole = "CLINICIAN";

let cachedClient: SupabaseClient | null = null;

function supabaseServerClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw ApiError.notConfigured("Authentication is not configured on this server.");
  }

  cachedClient = createClient(url, key, {
    // No session persistence on the server. Each request carries its own
    // token; a server that remembered a session would serve one user's data
    // to the next request.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return cachedClient;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim() || null;
}

/**
 * Verifies the caller and returns their clinician profile.
 *
 * A verified Supabase user with no clinician row is provisioned one on first
 * use, so that signing in is enough to start work, and the provisioning itself
 * is a recorded event rather than an implicit side effect.
 */
export async function authenticate(request: Request): Promise<AuthenticatedActor> {
  const token = bearerToken(request);
  if (!token) throw ApiError.unauthenticated("No credentials were supplied.");

  const { data, error } = await supabaseServerClient().auth.getUser(token);
  if (error || !data?.user) throw ApiError.unauthenticated("Your session is not valid. Sign in again.");

  const user = data.user;
  const email = user.email || "";

  const existing = await prisma.clinician.findUnique({ where: { id: user.id } });
  if (existing) {
    if (!existing.active) {
      throw ApiError.forbidden("This account has been deactivated.");
    }
    return { userId: user.id, email: existing.email, clinician: existing };
  }

  const clinician = await prisma.clinician.create({
    data: {
      id: user.id,
      email,
      displayName: (user.user_metadata?.full_name as string | undefined) || null,
      role: DEFAULT_ROLE,
    },
  });

  await prisma.auditEvent.create({
    data: {
      actorId: clinician.id,
      action: "clinicianProvisioned",
      category: "account",
      entity: "Clinician",
      entityId: clinician.id,
      detail: `Profile created on first sign-in with the ${DEFAULT_ROLE} role.`,
    },
  });

  return { userId: user.id, email, clinician };
}

/* ------------------------------------------------------------ role checks */

export function canWrite(actor: AuthenticatedActor): boolean {
  return WRITE_ROLES.has(actor.clinician.role);
}

export function requireWrite(actor: AuthenticatedActor): void {
  if (!canWrite(actor)) {
    throw ApiError.forbidden(
      `The ${actor.clinician.role} role is read-only and cannot change clinical records.`
    );
  }
}

export function requireRole(actor: AuthenticatedActor, allowed: readonly ClinicianRole[]): void {
  if (!allowed.includes(actor.clinician.role)) {
    throw ApiError.forbidden("Your role does not have access to this.");
  }
}

export function canReadAudit(actor: AuthenticatedActor): boolean {
  return AUDIT_ROLES.has(actor.clinician.role);
}

/* --------------------------------------------------------- patient access */

export type PatientAccess = "read" | "write";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Confirms the caller may act on this patient, and returns the patient's
 * identity columns.
 *
 * Access is by registration or by explicit care-team membership. An admin may
 * read any patient. Membership is a row that someone granted, not a
 * consequence of being signed in.
 *
 * A patient the caller cannot see reports 404 rather than 403, so that the
 * API does not confirm the existence of records outside the caller's caseload.
 */
export async function requirePatientAccess(
  actor: AuthenticatedActor,
  patientId: string,
  access: PatientAccess = "read"
): Promise<{ id: string; createdById: string; status: string; archivedAt: Date | null }> {
  if (access === "write") requireWrite(actor);

  // Checked before the query, not after. A malformed identifier reaching the
  // database surfaces as a driver error, which turns a caller's typo into a
  // 500 and puts a column name into the server log for no reason.
  if (!UUID.test(patientId)) {
    throw ApiError.invalidRequest("Not a valid patient identifier.");
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      createdById: true,
      status: true,
      archivedAt: true,
      careTeam: {
        where: { clinicianId: actor.clinician.id, revokedAt: null },
        select: { id: true },
      },
    },
  });

  if (!patient) throw ApiError.notFound("Patient not found.");

  const permitted =
    patient.createdById === actor.clinician.id ||
    patient.careTeam.length > 0 ||
    actor.clinician.role === "ADMIN";

  if (!permitted) throw ApiError.notFound("Patient not found.");

  if (access === "write" && patient.status === "ARCHIVED") {
    throw ApiError.conflict(
      "This patient is archived. Restore the record before making clinical changes to it."
    );
  }

  return {
    id: patient.id,
    createdById: patient.createdById,
    status: patient.status,
    archivedAt: patient.archivedAt,
  };
}

/** The set of patient ids this caller may see, for list endpoints. */
export function patientScopeFilter(actor: AuthenticatedActor) {
  if (actor.clinician.role === "ADMIN") return {};
  return {
    OR: [
      { createdById: actor.clinician.id },
      { careTeam: { some: { clinicianId: actor.clinician.id, revokedAt: null } } },
    ],
  };
}
