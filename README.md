## CORSC

**Cardiac Oncology Risk Surveillance and Care** is a browser-based clinical decision-support system for cardio-oncology outpatient work: risk stratification, surveillance planning, and structured encounter documentation.

The whole encounter is a single continuous workflow rather than a set of separate pages:

1. Patient registration
2. First OPD review
3. History
4. Vitals
5. Symptoms
6. Systemic examination
7. Investigations
8. Medication review
9. Risk assessment
10. Surveillance and HFA-ICOS
11. Follow-up planner
12. Overview, clinical summary and print

Sections collapse as they are completed, irrelevant fields stay hidden, and every edit is autosaved. A clinical assistant panel runs alongside the workflow summarising risks, abnormal findings, documentation gaps and next actions. Printing is available only from the Overview section and produces a full OPD-style report.

## Fitness to proceed

Every encounter opens with the question the visit exists to answer: can this patient have their treatment today? The verdict — **proceed**, **proceed with caution** or **hold** — is computed live from the recorded data, and shows the findings that produced it alongside the actions that would change it. It is a starting point for the discussion with oncology, not an instruction: the decision to give, delay or stop cancer therapy rests with the treating oncologist and cardio-oncologist together.

## Clinical engines

| Module | Responsibility |
| --- | --- |
| `lib/ctrcd.js` | Grades cancer therapy–related cardiac dysfunction on the ESC 2022 severity and symptom axes. The single definition used everywhere. |
| `lib/cardiac-measurements.js` | Interprets troponin against an assay reference limit and sex cut-off, natriuretic peptides against age-stratified thresholds, and QTc by Fridericia correction. |
| `lib/hfa-icos.js` | Therapy-specific baseline risk proformas. Factors are satisfied by an explicit tick or by data already recorded in the history. |
| `lib/anthracycline.js` | Cumulative delivered exposure in doxorubicin equivalents, against the 250 / 300 / 400 / 550 mg/m² thresholds. |
| `lib/surveillance-engine.js` | Surveillance tasks from the therapies planned, the risk category, the phase of treatment, and anything abnormal today. |
| `lib/acuity.js` | Follow-up urgency as a clinical band — assess now through routine — with the date derived from it. |
| `lib/fitness.js` | The fitness-to-proceed verdict. |
| `lib/encounter-phase.js` | Where the patient is in the journey. One resolver, shared. |

### Thresholds for clinical review

Numeric thresholds are exported from one place per module so they can be reviewed and adjusted without touching logic. Confirm each against your own guideline reading and laboratory handbook before clinical use:

- `SCORING` in `lib/hfa-icos.js` — risk categorisation. The categorisation algebra is a simplification of the published HFA-ICOS weightings and should be checked against the source proformas.
- `TROPONIN_ASSAYS` in `lib/cardiac-measurements.js` — manufacturers' published 99th-percentile limits. Assay cut-offs are laboratory-specific; a local limit entered at registration overrides the default.
- `DOSE_THRESHOLDS` and the agent equivalence factors in `lib/anthracycline.js` — published cardiotoxicity equivalence ratios vary between sources, particularly for mitoxantrone.
- `ACUITY` and `ROUTINE_INTERVAL` in `lib/acuity.js` — follow-up bands and routine intervals.

Patient records are stored in the current browser's local storage and never leave the device. Sign-in is handled by Supabase; there is no server-side clinical persistence in this build.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Then open [http://localhost:3000](http://localhost:3000).

## Supabase authentication

The app uses Supabase email/password authentication. Copy [example.env](./example.env) to `.env.local` and set the same variables in the deployment environment.

Create accounts in **Supabase Dashboard → Authentication → Users** (or invite users), with a password. Adding a record only to an application database table does not create a sign-in account.

## Validation

```bash
npm run lint
npm run build
npm test
```

The test suite covers the clinical engines with fixtures written from the guideline criteria, so the logic can be checked without reading the implementation. `npm run test:watch` runs it continuously.

## Clinical notice

CORSC supports qualified clinicians; it does not replace clinical judgment, institutional protocols, guideline review, or multidisciplinary cardio-oncology input.
