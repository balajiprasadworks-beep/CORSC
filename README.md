## CORSC

Cardio-Oncology Risk Stratification and Care is a browser-based clinical decision-support dashboard for structured cardio-oncology assessments, risk stratification, surveillance planning, and visit documentation.

Patient records are stored only in the current browser's local storage. This prototype does not include authentication, server-side persistence, or a production clinical data integration.

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
