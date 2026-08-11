-- =========================================================================
-- CORSC — initial PostgreSQL schema with row-level security.
--
-- The application currently persists patients to browser local storage. That is
-- not a defensible place for identifiable clinical data: it is unencrypted at
-- rest, it is readable by anything running in the page, it does not survive a
-- cleared browser, and it cannot be audited or revoked. This migration prepares
-- the Supabase backend that replaces it.
--
-- DESIGN NOTES
--
-- 1. Patient data is separated from clinical rules. Nothing in this schema
--    stores thresholds, proformas, conversion factors or guideline text — those
--    live in versioned application code (lib/clinical-sources.js and the
--    engines) precisely so that a clinical rule change is a reviewed code
--    change, not a row update. What IS stored is the rules version that
--    produced each computed result, so a historical assessment can always be
--    explained by the code that generated it.
--
-- 2. Every table carries row-level security and every policy is written against
--    auth.uid(). RLS is enabled BEFORE any grant, so there is no window in which
--    the tables are readable without a policy.
--
-- 3. Computed clinical results are stored alongside their inputs and their
--    rules version. Recomputing a two-year-old assessment with today's engine
--    would silently rewrite history.
--
-- 4. Overrides and audit entries are append-only by policy: there is no UPDATE
--    or DELETE policy on them for ordinary users. An override that can be
--    edited is not an audit trail.
--
-- Apply with: supabase db push   (or psql -f against the project database)
-- =========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- clinicians

-- Mirrors auth.users with the service-facing profile. Kept separate so that
-- clinician display names can be shown on an override without exposing the
-- auth schema.
create table if not exists public.clinicians (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  display_name text,
  role         text not null default 'clinician'
                 check (role in ('clinician', 'admin', 'read_only')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.clinicians is
  'Service-facing clinician profile. Row-level security limits each user to their own row; admins may read all.';

-- ------------------------------------------------------------------ patients

create table if not exists public.patients (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users (id) on delete restrict,
  -- Local hospital identifier. Deliberately not unique across the table: two
  -- services using CORSC may legitimately use overlapping numbering schemes.
  patient_ref     text,
  name            text not null,
  age             integer check (age is null or (age >= 0 and age <= 130)),
  sex             text check (sex is null or sex in ('Male', 'Female', 'Other', 'Not recorded')),
  diagnosis       text,
  stage           text,
  regimen         text,
  -- Therapy class ids, validated in application code against THERAPY_CLASSES.
  therapy         text[] not null default '{}',
  planned_cycles  integer,
  cycle_frequency text,
  current_cycle   integer not null default 0,

  -- Baseline cardiovascular dataset. These are the values every later
  -- comparison is made against, so they are first-class columns rather than
  -- buried in a JSON blob.
  baseline_lvef        numeric(4,1) check (baseline_lvef is null or (baseline_lvef >= 0 and baseline_lvef <= 100)),
  baseline_gls         numeric(4,1),
  baseline_qtc         integer check (baseline_qtc is null or (baseline_qtc >= 200 and baseline_qtc <= 800)),
  baseline_troponin    numeric(10,2),
  baseline_ntprobnp    numeric(10,2),
  baseline_weight_kg   numeric(5,2),
  baseline_height_cm   numeric(5,1),
  troponin_assay_id    text,
  -- A locally entered laboratory limit always overrides the shipped default.
  troponin_local_url   numeric(10,2),
  total_planned_dose   numeric(6,1),

  -- Structured history, risk factor ticks and contraindications. JSONB because
  -- the shape is driven by the clinical-data definitions and evolves with them.
  history            jsonb not null default '{}'::jsonb,
  risk_factor_ticks  jsonb not null default '{}'::jsonb,
  contraindications  jsonb not null default '{}'::jsonb,
  medications        jsonb not null default '[]'::jsonb,
  clinical_status    text not null default 'Stable',

  registered_on   date not null default current_date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  archived_at     timestamptz
);

create index if not exists patients_owner_idx on public.patients (owner_id);
create index if not exists patients_ref_idx on public.patients (owner_id, patient_ref);

comment on column public.patients.therapy is
  'Therapy class identifiers. The baseline risk proforma and surveillance pathway are selected from these.';

-- ---------------------------------------------------------------- encounters

create table if not exists public.encounters (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  owner_id      uuid not null references auth.users (id) on delete restrict,
  visit_type    text not null default 'cycleReview',
  cycle         integer,
  occurred_on   date not null default current_date,
  filed         boolean not null default false,
  filed_at      timestamptz,

  vitals              jsonb not null default '{}'::jsonb,
  symptoms            jsonb not null default '[]'::jsonb,
  symptom_detail      jsonb not null default '{}'::jsonb,
  since_last_visit    jsonb not null default '{}'::jsonb,
  systems             jsonb not null default '{}'::jsonb,
  investigations      jsonb not null default '{}'::jsonb,
  hf_status           text,
  medication_review   text,
  medication_decisions jsonb not null default '{}'::jsonb,
  task_completion     jsonb not null default '{}'::jsonb,
  plan                text,
  notes               text,
  next_review_on      date,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists encounters_patient_idx on public.encounters (patient_id, occurred_on desc);
create index if not exists encounters_review_idx on public.encounters (owner_id, next_review_on) where filed;

-- --------------------------------------------------------- anthracycline doses

create table if not exists public.anthracycline_doses (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  encounter_id  uuid references public.encounters (id) on delete set null,
  agent_id      text not null,
  dose          numeric(8,2) not null check (dose >= 0),
  dose_unit     text not null default 'mg/m2' check (dose_unit in ('mg/m2', 'mg')),
  bsa           numeric(4,2),
  cycle         integer,
  given_on      date,
  -- The equivalence model in force when this dose was recorded. Stored because
  -- the models disagree, so a total is meaningless without knowing which one
  -- produced it.
  model_id      text not null default 'feijen2019',
  created_at    timestamptz not null default now()
);

create index if not exists anthracycline_patient_idx on public.anthracycline_doses (patient_id, cycle);

-- ------------------------------------------------------- computed assessments

-- Snapshots of what the engines produced, with the rules version that produced
-- them. Never recomputed in place.
create table if not exists public.assessments (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.patients (id) on delete cascade,
  encounter_id   uuid references public.encounters (id) on delete cascade,
  kind           text not null check (kind in ('baseline_risk', 'ctr_cvt', 'surveillance', 'red_flags', 'completeness')),
  result         jsonb not null,
  rules_version  text not null,
  computed_at    timestamptz not null default now(),
  computed_by    uuid references auth.users (id)
);

create index if not exists assessments_patient_idx on public.assessments (patient_id, kind, computed_at desc);

comment on column public.assessments.rules_version is
  'The CORSC rules version that produced this result. A historical assessment is explained by the code of its own version, never by today''s.';

-- ----------------------------------------------------------------- overrides

create table if not exists public.overrides (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.patients (id) on delete cascade,
  encounter_id       uuid references public.encounters (id) on delete set null,
  target             text not null,
  subject_id         text,
  algorithmic_value  text,
  clinician_value    text not null,
  reason             text not null check (length(btrim(reason)) > 0),
  clinician_id       uuid not null references auth.users (id),
  created_at         timestamptz not null default now(),
  withdrawn_at       timestamptz,
  withdrawn_by       uuid references auth.users (id),
  withdrawn_reason   text
);

create index if not exists overrides_patient_idx on public.overrides (patient_id, created_at desc);

comment on table public.overrides is
  'Clinician overrides. Additive: the algorithmic value is retained. Append-only by policy — there is no user UPDATE or DELETE policy.';

-- ---------------------------------------------------------------- audit log

create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid references public.patients (id) on delete cascade,
  actor_id      uuid references auth.users (id),
  action        text not null,
  category      text not null,
  field         text,
  previous_value text,
  new_value     text,
  reason        text,
  detail        text,
  occurred_at   timestamptz not null default now()
);

create index if not exists audit_patient_idx on public.audit_log (patient_id, occurred_at desc);
create index if not exists audit_actor_idx on public.audit_log (actor_id, occurred_at desc);

comment on table public.audit_log is
  'Append-only audit trail. Free-text clinical narrative is recorded as changed without its content being copied here.';

-- =========================================================================
-- ROW LEVEL SECURITY
--
-- Enabled before any policy exists, so the tables are closed by default.
-- =========================================================================

alter table public.clinicians          enable row level security;
alter table public.patients            enable row level security;
alter table public.encounters          enable row level security;
alter table public.anthracycline_doses enable row level security;
alter table public.assessments         enable row level security;
alter table public.overrides           enable row level security;
alter table public.audit_log           enable row level security;

alter table public.clinicians          force row level security;
alter table public.patients            force row level security;
alter table public.encounters          force row level security;
alter table public.anthracycline_doses force row level security;
alter table public.assessments         force row level security;
alter table public.overrides           force row level security;
alter table public.audit_log           force row level security;

-- Helper: is the current user an admin? SECURITY DEFINER so the policy can read
-- the clinicians table without recursing through that table's own policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.clinicians c
    where c.id = auth.uid() and c.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------- clinicians

drop policy if exists clinicians_select_own on public.clinicians;
create policy clinicians_select_own on public.clinicians
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists clinicians_insert_own on public.clinicians;
create policy clinicians_insert_own on public.clinicians
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists clinicians_update_own on public.clinicians;
create policy clinicians_update_own on public.clinicians
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.clinicians where id = auth.uid()));

-- ---------------------------------------------------------------- patients
--
-- Ownership model: a patient belongs to the clinician who registered them.
-- Shared-caseload access is a real requirement for a cardio-oncology service
-- and is deliberately NOT implemented here by loosening these policies — it
-- needs an explicit care-team membership table so that access is granted and
-- revoked deliberately rather than by making every row visible to every
-- authenticated user.

drop policy if exists patients_select on public.patients;
create policy patients_select on public.patients
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists patients_insert on public.patients;
create policy patients_insert on public.patients
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists patients_update on public.patients;
create policy patients_update on public.patients
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- No DELETE policy. Patient records are archived (archived_at), never removed:
-- a deleted clinical record cannot be audited.

-- -------------------------------------------------------------- encounters

drop policy if exists encounters_select on public.encounters;
create policy encounters_select on public.encounters
  for select to authenticated
  using (
    exists (select 1 from public.patients p where p.id = patient_id and (p.owner_id = auth.uid() or public.is_admin()))
  );

drop policy if exists encounters_insert on public.encounters;
create policy encounters_insert on public.encounters
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid())
  );

drop policy if exists encounters_update on public.encounters;
create policy encounters_update on public.encounters
  for update to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid()));

-- ------------------------------------------------------ anthracycline doses

drop policy if exists doses_select on public.anthracycline_doses;
create policy doses_select on public.anthracycline_doses
  for select to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and (p.owner_id = auth.uid() or public.is_admin())));

drop policy if exists doses_write on public.anthracycline_doses;
create policy doses_write on public.anthracycline_doses
  for insert to authenticated
  with check (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid()));

drop policy if exists doses_update on public.anthracycline_doses;
create policy doses_update on public.anthracycline_doses
  for update to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid()));

-- ------------------------------------------------------------- assessments

drop policy if exists assessments_select on public.assessments;
create policy assessments_select on public.assessments
  for select to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and (p.owner_id = auth.uid() or public.is_admin())));

drop policy if exists assessments_insert on public.assessments;
create policy assessments_insert on public.assessments
  for insert to authenticated
  with check (
    computed_by = auth.uid()
    and exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid())
  );

-- No UPDATE or DELETE. A stored assessment is a record of what the software
-- said at a moment in time.

-- --------------------------------------------------------------- overrides

drop policy if exists overrides_select on public.overrides;
create policy overrides_select on public.overrides
  for select to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id and (p.owner_id = auth.uid() or public.is_admin())));

drop policy if exists overrides_insert on public.overrides;
create policy overrides_insert on public.overrides
  for insert to authenticated
  with check (
    clinician_id = auth.uid()
    and exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid())
  );

-- Withdrawal is an insert of a withdrawal record in application terms; the
-- columns exist for the server-side function that performs it. Ordinary users
-- get no UPDATE or DELETE policy, so an override cannot be edited or erased.

-- --------------------------------------------------------------- audit log

drop policy if exists audit_select on public.audit_log;
create policy audit_select on public.audit_log
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.patients p where p.id = patient_id and p.owner_id = auth.uid())
  );

drop policy if exists audit_insert on public.audit_log;
create policy audit_insert on public.audit_log
  for insert to authenticated
  with check (actor_id = auth.uid());

-- No UPDATE or DELETE policy at all. An editable audit log is not an audit log.

-- =========================================================================
-- updated_at maintenance
-- =========================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_touch on public.patients;
create trigger patients_touch before update on public.patients
  for each row execute function public.touch_updated_at();

drop trigger if exists encounters_touch on public.encounters;
create trigger encounters_touch before update on public.encounters
  for each row execute function public.touch_updated_at();

drop trigger if exists clinicians_touch on public.clinicians;
create trigger clinicians_touch before update on public.clinicians
  for each row execute function public.touch_updated_at();
