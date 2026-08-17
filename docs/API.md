# CORSC API

Next.js Route Handlers under `app/api`. Every endpoint authenticates, authorises,
validates, does its work, writes an audit entry and answers in the same shape.

---

## Conventions

**Authentication.** A Supabase access token as a bearer credential:

```
Authorization: Bearer <supabase access token>
```

`GET /api/health` is the only unauthenticated endpoint.

**Responses.** Always one of:

```jsonc
{ "data": { /* result */ } }
{ "error": { "code": "forbidden", "message": "…", "details": [ /* optional */ ] } }
```

Every response carries an `x-request-id` header, which correlates with the
server log.

**Status codes.**

| Code | Meaning |
|---|---|
| 200 | read or update succeeded |
| 201 | created |
| 400 | malformed request — bad JSON, failed validation, malformed identifier |
| 401 | not authenticated |
| 403 | authenticated but not permitted |
| 404 | not found, **or not visible to this caller** |
| 409 | conflict — concurrent edit, archived patient, already-filed encounter |
| 422 | well-formed but clinically impossible |
| 503 | database not configured or unreachable |

A patient the caller cannot see returns **404, not 403**: a 403 would confirm the
record exists.

**Concurrency.** Reads return `updatedAt`. Send it back as `expectedUpdatedAt` on
the next write; a write against a record that has since moved returns 409 with
the server's timestamp rather than overwriting a colleague's entry.

**Validation.** Server-side, with Zod, against the same clinical vocabularies the
engines use — therapy classes, investigation identifiers, symptom labels, visit
types, risk factor identifiers, troponin assays. Out-of-range values are
**rejected, not clamped**: silently storing null would leave the clinician
believing a value they typed had saved.

---

## Session and health

### `GET /api/session`

Who the caller is and what they may do, **as the server sees it**. The client
uses this to decide what to show; it does not use it to decide what is allowed,
because every endpoint re-checks server-side.

```jsonc
{ "data": {
  "clinician": { "id": "…", "email": "…", "displayName": "…", "role": "CLINICIAN", "active": true },
  "permissions": { "write": true, "readAudit": false }
} }
```

### `GET /api/health`

Unauthenticated, and says as little as possible — a health endpoint is a
reconnaissance target as much as a monitoring one.

```jsonc
{ "data": { "status": "ok", "database": "reachable" } }
```

---

## Worklist

### `GET /api/worklist`

The clinical worklist, **computed on the server**. Each row runs the baseline
risk proformas, the CTR-CVT domains, the red-flag grading, the anthracycline
ledger and the completeness assessment, so a patient eight weeks past a due
echocardiogram surfaces without anyone remembering them.

Filtering and searching stay client-side over the same rows, so toggling a filter
is instant. Capped at 500 active patients.

---

## Patients

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients` | The caller's caseload, cursor-paginated |
| `POST` | `/api/patients` | Register a patient (201) |
| `GET` | `/api/patients/:patientId` | The whole clinical record |
| `PATCH` | `/api/patients/:patientId` | Amend the record |
| `PUT` | `/api/patients/:patientId/record` | Autosave the whole record |
| `POST` | `/api/patients/:patientId/archive` | Archive — **there is no DELETE** |
| `POST` | `/api/patients/:patientId/restore` | Return to the active caseload |

### `GET /api/patients`

| Query | Default | |
|---|---|---|
| `search` | — | name, hospital id or MRN |
| `status` | `ACTIVE` | `ACTIVE` \| `ARCHIVED` \| `ALL` |
| `limit` | 25 | max 100 |
| `cursor` | — | from the previous page's `nextCursor` |

Cursor paginated rather than offset paginated: a caseload being edited while it
is paged through would skip or repeat records under `OFFSET`, and a clinician
who never sees page two of their own list has a safety problem, not a UX one.

### `POST /api/patients`

Takes the whole record — registration submits it in one go. The document is
validated as a whole and decomposed into normalised tables in one transaction.

```jsonc
{
  "name": "…",
  "age": 58, "gender": "Female",
  "diagnosis": "Breast", "stage": "Stage IIB",
  "therapy": ["anthracycline", "her2"],   // always a list
  "baselineLVEF": 62, "baselineGLS": -20.5,
  "troponinAssay": "hs-cTnT",
  "medications": [ /* … */ ],
  "visits": [ /* … */ ],
  "draftEncounter": { /* … */ }
}
```

Returns `{ data: { patient, updatedAt } }` where `patient` is the record as
stored, including the recomputed risk category.

### `POST /api/patients/:patientId/archive`

```jsonc
{ "reason": "Transferred to another service." }
```

A reason is required. Archiving takes the patient out of the active caseload and
leaves every observation, assessment and audit entry intact and readable. Further
clinical writes return 409 until the record is restored.

---

## The record endpoint — a transitional interface

### `PUT /api/patients/:patientId/record`

CORSC's encounter workflow is one continuous page with fourteen sections and no
save button: every keystroke updates one patient object and a debounced autosave
persists it. That is a deliberate clinical design — a clinician interrupted
mid-encounter loses nothing.

This endpoint is what that autosave calls. It takes the whole record and writes
it into the normalised tables in one transaction. **The transport is
document-shaped; the storage is not.** Nothing is stored as a serialised patient
object.

**It is transitional, and marked as such.** As each workflow section moves to the
granular endpoints below, this endpoint's job shrinks, and it is the part of the
API expected to be retired first. It exists so that putting CORSC on a real
database did not require rewriting fourteen clinical sections at the same time —
a far larger change to review and a far worse one to get wrong.

---

## Visits

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients/:patientId/visits` | Every encounter, newest first |
| `POST` | `/api/patients/:patientId/visits` | Open an encounter (201) |
| `GET` | `/api/visits/:visitId` | One encounter with all its content |
| `PATCH` | `/api/visits/:visitId` | Amend a draft |
| `POST` | `/api/visits/:visitId/file` | File it into the record |

A **draft is still a record**: it is stored from the first keystroke, so an
interrupted encounter survives a closed laptop and not only a closed tab.

**Filing is one-way.** It stamps the encounter and stores the generated summary
as it read at that moment — regenerating it later from today's engines would
change what the record says was written. A `PATCH` to a filed encounter returns
409; record an addendum encounter instead.

Filing a cycle review advances the plan's cycle counter, but **never backwards**:
a retrospectively entered earlier encounter must not reset where the patient has
actually got to.

---

## Therapy and cycles

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients/:patientId/therapy` | Plans with classes, agents, cycles and doses |
| `POST` | `/api/patients/:patientId/therapy` | Record a plan (201) |
| `POST` | `/api/patients/:patientId/therapy/cycles` | Record a cycle and its doses (201) |
| `PATCH` | `/api/therapy/cycles/:cycleId` | Amend a cycle |

**`therapyClasses` is always a list.** An anthracycline followed by HER2 blockade
carries a risk profile that is neither alone, and an API that collapsed the list
would silently change which HFA-ICOS proformas run and which surveillance pathway
applies.

### `POST /api/patients/:patientId/therapy/cycles`

```jsonc
{
  "therapyPlanId": "…", "cycleNumber": 3,
  "administeredOn": "2026-03-01", "status": "ADMINISTERED",
  "doses": [
    { "agentId": "doxorubicin", "dose": 60, "doseUnit": "MG_PER_M2",
      "bsa": 1.72, "equivalenceModelId": "feijen2019" }
  ]
}
```

The cycle and its doses are one transaction. Surveillance is then recalculated —
because cumulative exposure and cycle number are both inputs to the surveillance
rules — **after** that transaction commits, so a surveillance failure cannot roll
back the record of a cycle that was actually given.

**No dose is ever discarded.** A dose whose agent has no equivalence factor, or
which was recorded in mg with no body surface area, is stored with
`conversionFailureReason` set. Silently dropping it would understate the
patient's exposure, which is the one number the ledger exists to get right.

A cycle beyond the planned count is **recorded, not refused**, with an audit
entry noting the deviation. A hard rejection would push the clinician to record
nothing at all.

---

## Medications

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/medications/search?q=&limit=` | The formulary |
| `GET` | `/api/patients/:patientId/medications?includeStopped=` | Current list |
| `POST` | `/api/patients/:patientId/medications` | Add (201) |
| `PATCH` | `/api/patient-medications/:medicationId` | Amend |
| `POST` | `/api/patient-medications/:medicationId/stop` | Stop, with a reason |

Search runs **in the database**. The formulary is sized for a national formulary
and designed to grow; shipping it to the browser to filter there would mean a
large download before the first search, on a connection that may be hospital
wifi. Ranked so an exact prefix match on a name outranks a fuzzy match buried in
an ingredient list.

Frequency is the four prescription slots the service writes —
`morning`, `afternoon`, `evening`, `night`; `1-0-0-1` is one in the morning and
one at night — because duplication and QT-stacking checks need something to
compute against. A free-text `"2.5 mg BD"` cannot be checked for anything.

**Stopping is not deleting.** The row stays with a stop date and a reason, so an
earlier encounter still reads back with the list the patient was actually on.

*Nothing in this API decides whether a medicine is indicated.* That is
`lib/medication-engine.js`, which phrases its output as a prompt to review and
states the finding that triggered it. The absence of a drug from the formulary is
not evidence that a clinician failed to prescribe it.

---

## Investigations and cardiac measurements

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients/:patientId/investigations?investigationId=` | Longitudinal results |
| `POST` | `/api/patients/:patientId/investigations` | Record a result (201) |
| `GET` | `/api/patients/:patientId/cardiac-measurements` | The cardiac dataset as a series per measure |
| `POST` | `/api/patients/:patientId/cardiac-measurements` | Record a cardiac measurement (201) |

Cardiac measurements are a **view over the same table**, not a second store: one
fact, one row. Posting a non-cardiac investigation here returns 422 with the list
of cardiac identifiers.

Troponin carries its assay:

```jsonc
{ "investigationId": "troponin", "numericValue": 28,
  "assayId": "hs-cTnT", "referenceUpperLimit": 14, "laboratory": "…" }
```

Values from different high-sensitivity assays are not comparable to each other or
to a universal threshold, so the assay and the limit actually applied travel with
the value.

---

## Clinical assessment

### Two axes, kept apart

| | Baseline risk | Current toxicity |
|---|---|---|
| Question | risk *before* therapy | what has happened *since* |
| Assess | `POST /api/patients/:id/risk/assess` | `POST /api/patients/:id/ctr-cvt/assess` |
| History | `GET /api/patients/:id/risk` | `GET /api/patients/:id/ctr-cvt` |

**Neither writes to the other.** A troponin rise after cycle 4 does not change
what the baseline assessment said. That separation is enforced by storing them as
different assessment kinds, and asserted by
`tests/integration/clinical-regression.test.ts`.

Each stored assessment carries `engine`, `engineVersion`, `rulesVersion`, the
full engine `result` and the `inputs` it was given — enough to explain the result
later, not just the headline category. **History is never recomputed:** an
assessment made under engine 1.0.0 stays attributable to 1.0.0.

### Fitness to proceed

| Method | Path |
|---|---|
| `POST` | `/api/patients/:patientId/fitness/assess` |
| `GET` | `/api/patients/:patientId/fitness` |

Returns `proceed`, `caution` or `hold` with the findings that produced it.

**This is a decision-support prompt for the treating team, not an instruction.**
CORSC does not stop chemotherapy. The treating clinician decides. The stored
audit line says so.

---

## Surveillance and follow-up

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients/:patientId/surveillance?includeSuperseded=` | Recommendations and follow-up plans |
| `POST` | `/api/patients/:patientId/surveillance/recalculate` | Re-run the engine |
| `POST` | `/api/surveillance/:recommendationId/complete` | Mark one done |
| `GET` | `/api/patients/:patientId/follow-up` | Follow-up plans |

Every recommendation carries **what is due, when, why, and on whose authority** —
`reason`, `sourceId`, `sourceLocator`, `verification`, plus the risk category and
toxicity grade in force when it was generated. `"Echo due"` with no reason is not
a record this API will produce, and the database refuses to store one.

`verification` distinguishes a guideline recommendation from a **CORSC
operational scheduling rule**. Routine clinic intervals are the latter, and are
labelled as such rather than attributed to a guideline that does not specify
them.

Recalculating **supersedes** previous outstanding recommendations rather than
deleting them; completed ones are left alone, because they are the record that
the investigation was done.

---

## Overrides

| Method | Path |
|---|---|
| `GET` | `/api/patients/:patientId/overrides` |
| `POST` | `/api/patients/:patientId/overrides` |
| `POST` | `/api/overrides/:overrideId/withdraw` |

Overrides are **additive**: `algorithmicValue` is kept beside `clinicianValue`,
so the record shows a judgement was made rather than that the software said
something different. There is no update path and no delete path — an override is
withdrawn, which is itself recorded with its own reason.

A reason of at least ten characters is required at three levels: the schema, the
service, and a database CHECK constraint. An override nobody can explain later is
indistinguishable from a mistake.

---

## Report, timeline and audit

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/patients/:patientId/report?visitId=` | Report data, in one read |
| `GET` | `/api/patients/:patientId/timeline?visitId=` | Longitudinal events |
| `GET` | `/api/patients/:patientId/audit` | Governance trail — **role restricted** |

The report is assembled in one pass so every section is drawn from the same read;
a document whose diagnosis block and surveillance block came from queries a
second apart could show two states of the same patient. Rendering stays with the
existing print report rather than being rebuilt server-side.

The timeline is **generated from the structured record**, not stored as an array,
so it cannot disagree with the record it is drawn from.

Generating a report is an export of clinical data and is audited even though it
changes nothing.

The audit trail is restricted to `ADMIN` and `CARDIO_ONCOLOGIST`. A clinician who
can look after a patient does not automatically get the governance trail — it
answers a different question.

---

## Migration from browser storage

| Method | Path |
|---|---|
| `GET` | `/api/migration/legacy` |
| `POST` | `/api/migration/legacy` |

```jsonc
{ "records": [ /* raw localStorage records */ ], "commit": false }
```

`commit: false` validates and returns the full report **without writing
anything** — a dry run a clinician can read before deciding.

```jsonc
{ "data": {
  "committed": true,
  "found": 12, "imported": 9, "skippedDuplicate": 2, "needsReview": 1, "failed": 0,
  "records": [
    { "legacyId": "p_kx91a", "name": "…", "outcome": "NEEDS_REVIEW",
      "patientId": "…", "visits": 4,
      "reason": "Imported. Some fields could not be confidently mapped…",
      "unmappedFields": ["therapy (1 unrecognised value)"] }
  ]
} }
```

- Every record is accounted for. There is no path where one disappears.
- Re-running does not duplicate: the browser identifier is kept on the patient
  row and in a `legacy_imports` ledger.
- A field that cannot be confidently mapped is **named**, not guessed at.
- **The browser copy is never touched.** Clearing it is a separate action in the
  UI, offered only for records the server confirmed it took.
- The ledger holds no patient data — only identifiers, outcomes and reasons.

---

## Security notes for anyone adding an endpoint

1. **Wrap it in `apiRoute`.** That is what supplies authentication, validation,
   error mapping, the response envelope and the log line.
2. **Call `requirePatientAccess()` before touching a patient record.** The API
   connects with a role that bypasses row-level security, so this call *is* the
   access control on this path. `tests/api/security.test.ts` is what holds that
   obligation — extend it.
3. **Validate with Zod, against the clinical vocabularies.** Never trust the
   browser, and never restate a vocabulary the engines already define.
4. **Write an audit entry for every clinical write**, through
   `lib/backend/services/audit-service`, which handles redaction.
5. **Do not compute clinical results.** Call the engine through
   `lib/backend/services/clinical-service`. A second implementation of a clinical
   rule will eventually disagree with the first, and the two are
   indistinguishable from the outside.
6. **Never widen an error.** Prisma internals, SQL and stack traces stay
   server-side.
