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

Patient records are stored in the current browser's local storage and never leave the device. Sign-in is handled by Supabase; there is no server-side clinical persistence in this build.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Then open [http://localhost:3000](http://localhost:3000).

## Supabase authentication

The app uses Supabase email/password authentication. Copy [example.env](/Users/manuvikash/Documents/CORSC/example.env) to `.env.local` and set the same variables in the deployment environment.

Create accounts in **Supabase Dashboard → Authentication → Users** (or invite users), with a password. Adding a record only to an application database table does not create a sign-in account.

## Validation

```bash
npm run lint
npm run build
```

## Clinical notice

CORSC supports qualified clinicians; it does not replace clinical judgment, institutional protocols, guideline review, or multidisciplinary cardio-oncology input.
