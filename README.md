# ClinAI Bridge

ClinAI Bridge is a polished MVP clinic workflow application built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and adapter-based integrations for Gemini, Azure Blob Storage, and Azure Health Data Services de-identification.

## What’s included

- Patient portal with guardrailed AI chat, photo upload, voice-note upload, care-plan summary, and escalation affordances
- Staff portal for doctors and admin staff with role-based routing
- Doctor care-plan editor, escalation review, and patient context workspace
- Admin intake queue, callback task board, and AI-generated operational suggestions
- Assistant activity view with attributable AI actions and audit-style review
- Structured AI response pipeline with Zod validation and a server-side policy engine
- Prisma schema plus a local JSON-backed fallback so the MVP still runs without Postgres

## Demo accounts

- `doctor@demo.com` / `password123`
- `admin@demo.com` / `password123`
- `patient@demo.com` / `password123`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Optional: run PostgreSQL + Prisma.

- Set `DATABASE_URL`
- Run `npx prisma generate`
- Run `npx prisma db push`
- Run `npm run seed`

If `DATABASE_URL` is not configured, the app falls back to `data/demo-store.local.json` and still works locally.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Environment modes

- Gemini:
  - Real mode when `GEMINI_API_KEY` is set
  - Mock mode otherwise
- Azure Blob Storage:
  - Real mode when `AZURE_STORAGE_CONNECTION_STRING` is set
  - Mock local URL mode otherwise
- Azure De-identification:
  - Real mode when Azure DeID credentials are set
  - Mock redaction mode otherwise
- Data layer:
  - Prisma/PostgreSQL when `DATABASE_URL` is set
  - JSON demo-store persistence otherwise

## Key architecture

- `app/`
  - App Router pages and route handlers
- `components/`
  - Chat UI, app shell, forms, and shadcn-style primitives
- `lib/ai`
  - Layered prompt construction
- `lib/policy`
  - Hard-coded medical/admin guardrails and escalation logic
- `lib/data`
  - Repository abstraction for Prisma or local demo JSON
- `services/gemini`
  - Gemini adapter and deterministic mock provider
- `services/blob`
  - Azure Blob adapter and mock storage
- `services/deid`
  - Azure DeID abstraction and mock redaction
- `prisma/`
  - Schema and seed script

## Safety model

- The assistant is not an authenticated role
- It cannot diagnose, prescribe, change medications, recommend controlled substances, or reassure emergencies
- Every response is generated as structured JSON, validated with Zod, then passed through the policy engine before UI rendering
- Escalations are created for restricted requests, medication changes outside doctor-authored instructions, and emergency red flags
- Learning-style artifacts are de-identified before long-term storage paths are used

## Notes

- Voice upload uses a mock transcript path for MVP behavior
- Image handling produces non-diagnostic summaries only
- The project is optimized for a strong local demo path first, with clean adapter seams for real services later
