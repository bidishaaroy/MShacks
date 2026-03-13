# ClinAI Bridge Architecture Notes

## Request flow

1. The user authenticates through a credentials-based demo login.
2. Route handlers load the current session from an HMAC-signed cookie.
3. The repository resolves to Prisma/PostgreSQL when `DATABASE_URL` exists, otherwise to the JSON-backed demo store.
4. For chat:
   - Doctor care-plan context, clinic policy, recent messages, and optional style notes are assembled into the prompt.
   - Gemini or the mock provider returns structured JSON.
   - Zod validates the draft.
   - The hard-coded policy engine enforces safety boundaries.
   - De-identification produces a sanitized derivative for persistence.
   - Messages, escalations, uploads, and audit events are stored through the repository.

## Safety layers

- Prompt-level constraints
- Structured schema validation
- Post-model policy engine
- Role-aware routing
- Audit and escalation records

## Storage strategy

- Relational domain models are defined in Prisma for PostgreSQL
- Blob paths are abstracted behind the blob service
- De-identified artifacts are separated from raw in-session content
- Local development can run fully with JSON persistence and mock cloud adapters

## Style memory

- Only sanitized doctor phrasing notes are used
- Style notes never override care plans, clinic policy, or policy-engine decisions
