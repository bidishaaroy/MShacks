You are building a polished MVP web application called "ClinAI Bridge".

Important:
- This is NOT a generic chatbot.
- This is a secure digital-health workflow app with:
  1) patient-side chat workspace
  2) staff-side workspace for doctors and admin staff
  3) an embedded AI assistant that helps both sides within strict guardrails
- Do NOT copy Cortico branding, assets, logos, or exact UI. Use an original, clean, modern, healthcare SaaS aesthetic inspired by simple clinic dashboards.
- Build this as a production-style MVP that runs locally first.

==================================================
PRODUCT CONCEPT
==================================================

ClinAI Bridge is a clinic communication and workflow app.

Main idea:
- Doctors upload patient-specific care instructions, risk thresholds, follow-up guidance, and admin notes.
- Patients can chat with an AI assistant that responds ONLY using:
  - doctor-provided context
  - clinic-approved policy
  - allowed admin workflows
- The AI can help with basic admin tasks and basic doctor-adjacent tasks, but it must NEVER act like an independent clinician.
- The AI must escalate when the question exceeds policy or safety thresholds.

This app has 3 human/system actors:
- Doctor
- Admin Staff
- AI Assistant

Also include a Patient user because the product concept requires a patient-facing side.
The AI is NOT an authenticated human role; it is a system assistant embedded in the doctor/admin/patient experiences.

==================================================
BEST TECH STACK — USE THIS EXACTLY
==================================================

Use:
- Next.js latest with App Router
- TypeScript everywhere
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Zustand or React Context for lightweight client state
- Prisma ORM
- PostgreSQL for relational app data
- Azure Blob Storage for files (photos, voice files, uploaded docs, redacted transcripts)
- Azure Health Data Services De-identification for text de-identification before analytics/storage of learning artifacts
- Gemini API for AI reasoning
- Zod for schema validation
- NextAuth or a simple credentials-based mock auth for MVP
- React Hook Form where useful

Why:
- Keep one language across frontend and backend for speed and maintainability.
- Use Next.js Route Handlers for server APIs.
- Use Prisma + Postgres because Blob Storage is not enough for relational entities like users, assignments, messages, escalation records, and patient-doctor relationships.

==================================================
CORE MVP REQUIREMENTS
==================================================

Build a web app with two main portals:

1) STAFF PORTAL
   - Doctor login
   - Admin staff login
   - Shared dashboard shell with role-specific permissions
   - AI assistant panel available inside the portal

2) PATIENT PORTAL
   - Patient login
   - Chat with AI
   - Upload photo
   - Voice message support
   - View care plan summaries and escalation advice

Do not create a separate AI login page.
Instead:
- AI is visible as an assistant in both portals.
- The AI also has an “activity log” or “assistant actions” view in staff mode.

==================================================
UI / UX REQUIREMENTS
==================================================

Use the uploaded sketch as the base inspiration.

Desired layout:
- A clean, original chat-centric healthcare dashboard
- Left vertical icon rail
- Main center content area with threaded messages
- Bottom message bar with:
  - text input
  - microphone button
  - camera / upload button
- Minimalist, premium founder-style look
- Rounded corners
- Spacious layout
- Soft neutrals, healthcare blues/greens
- Strong typography
- Clean cards and subtle shadows
- Responsive desktop-first design, but should also work on tablet/mobile

Use this structural layout:

APP SHELL
- Left rail:
  - Clinic/Home
  - Doctor workspace
  - Admin workspace
  - AI activity / assistant view
  - Settings
- Main panel:
  - Header with patient/clinic context
  - Conversation thread
  - Right side optional summary panel on desktop
- Footer composer:
  - text box
  - mic button
  - image upload button
  - send button

In patient mode:
- Show conversation between AI and patient
- Allow uploading a symptom photo
- Allow voice input
- Show “Escalate to clinic” button when needed

In doctor mode:
- Show patient profile
- Show diagnosis and care-plan editor
- Show AI-generated patient conversation summary
- Show escalation queue
- Show latest uploaded patient media

In admin mode:
- Show intake queue
- Show scheduling support placeholder
- Show patient onboarding checklist
- Show AI-generated admin suggestions

==================================================
STRICT SAFETY / POLICY REQUIREMENTS
==================================================

Hard-code strict medical and safety guardrails.

The AI must NEVER:
- prescribe medication
- recommend or facilitate controlled substances
- give drug-seeking help
- advise illegal drug acquisition or dosage
- recommend medication changes without explicit doctor-authored instruction
- provide emergency reassurance for red-flag symptoms
- give definitive diagnosis
- generate dangerous procedural advice
- provide self-harm, weapon, violence, or overdose assistance
- bypass clinic policy

If the user asks for restricted content or risky medical action:
- refuse clearly
- explain the limitation briefly
- escalate to:
  - doctor review
  - admin callback
  - emergency services / urgent care suggestion when applicable

Create a hard-coded allow/deny policy engine:
- allow: scheduling, follow-up reminders, intake clarification, doctor-authored care-plan explanations, non-diagnostic education, clinic FAQs
- conditional allow: symptom triage only within doctor-defined thresholds and clinic rules
- deny: controlled substances, illegal content, self-harm, emergency false reassurance, medication changes outside doctor instructions

Add a visible disclaimer:
- “ClinAI Bridge is a clinic support assistant and does not replace emergency or medical care.”
- “For emergencies call local emergency services immediately.”

==================================================
AI BEHAVIOR REQUIREMENTS
==================================================

Use Gemini API as the model provider.

The AI should answer using a layered context strategy:

Priority 1:
- explicit doctor-authored patient instructions
- patient-specific risk thresholds
- latest assigned care plan

Priority 2:
- clinic-approved policies
- admin SOPs
- scheduling rules
- intake guidance

Priority 3:
- tightly constrained general health wording for non-diagnostic explanation
- only if it does not conflict with doctor or clinic guidance

The AI must output structured JSON internally before rendering a user-facing message.

Create an internal AI response schema like:
{
  "message_for_user": string,
  "intent": "admin_help" | "care_plan_explanation" | "triage" | "upload_review" | "escalation" | "refusal",
  "risk_level": "low" | "medium" | "high" | "critical",
  "used_sources": string[],
  "requires_doctor_review": boolean,
  "requires_admin_followup": boolean,
  "emergency_advice": boolean,
  "refusal_reason": string | null,
  "next_actions": string[]
}

The UI should render only safe, validated fields from this schema.

==================================================
DE-IDENTIFICATION REQUIREMENTS
==================================================

Use Azure Health Data Services De-identification in the following way:

1) Live chat responses:
- raw content may be processed in-session only if necessary for the current authorized workflow
- do not persist raw PHI unnecessarily

2) Learning / analytics / style adaptation:
- before storing any message transcript for analytics, examples, evaluation, doctor-style pattern extraction, or future retrieval datasets:
  - send text through Azure De-identification
  - store tagged/redacted/surrogated output depending on configuration
- never build long-term learning artifacts from raw PHI

3) Uploaded docs / notes:
- if doctor uploads narrative notes that will be reused by AI logic, keep original only where required and authorized
- create a sanitized derivative for analytics or model-evaluation workflows

Make the de-identification integration abstraction-based:
- services/deid.ts
- supports modes:
  - tag
  - redact
  - surrogate
- if Azure credentials are missing locally, use a mock de-identification adapter so the app still runs

==================================================
BLOB STORAGE REQUIREMENTS
==================================================

Use Azure Blob Storage for:
- uploaded images
- uploaded voice clips
- attachment metadata references
- sanitized transcript exports
- redacted audit artifacts

Use path conventions like:
- patient-uploads/{patientId}/images/{filename}
- patient-uploads/{patientId}/audio/{filename}
- redacted-transcripts/{patientId}/{conversationId}.json
- audit/{date}/{eventId}.json

Store file metadata in PostgreSQL:
- blob URL
- content type
- uploader role
- upload timestamp
- patient ID
- conversation ID if relevant

==================================================
ROLE-BASED ACCESS CONTROL
==================================================

Implement roles:
- DOCTOR
- ADMIN
- PATIENT

Permissions:

DOCTOR
- view assigned patients
- create/edit diagnosis summary
- create/edit care plan
- define escalation thresholds
- review AI-patient chats
- override AI guidance
- mark escalation handled

ADMIN
- view intake metadata
- manage non-clinical follow-up tasks
- review AI-generated admin tasks
- cannot edit clinical diagnosis
- cannot see sensitive clinical controls beyond allowed scope

PATIENT
- view own chats
- upload own photos/audio
- read care plan summaries
- cannot access staff tools

AI ASSISTANT
- no direct role login
- acts through policy-limited service layer
- every action must be attributable in logs

==================================================
DATA MODEL — IMPLEMENT PRISMA
==================================================

Create a robust Prisma schema with at least these models:

User
- id
- name
- email
- passwordHash
- role

PatientProfile
- id
- userId
- assignedDoctorId
- assignedAdminId
- dob
- clinicId
- summary

DoctorProfile
- id
- userId
- specialization
- clinicId

AdminProfile
- id
- userId
- clinicId

Clinic
- id
- name

CarePlan
- id
- patientId
- doctorId
- diagnosisSummary
- treatmentPlan
- riskFactors
- escalationThresholdsJson
- personalizedNotes
- lastUpdatedAt

Conversation
- id
- patientId
- status
- createdAt
- updatedAt

Message
- id
- conversationId
- senderType ("PATIENT" | "DOCTOR" | "ADMIN" | "AI")
- senderId nullable
- content
- contentType ("TEXT" | "IMAGE" | "AUDIO" | "SYSTEM")
- riskLevel nullable
- redactedContent nullable
- createdAt

Upload
- id
- patientId
- conversationId nullable
- type ("IMAGE" | "AUDIO" | "DOCUMENT")
- blobUrl
- mimeType
- uploadedByRole
- createdAt

Escalation
- id
- patientId
- conversationId
- riskLevel
- reason
- requiresDoctorReview
- requiresAdminFollowup
- emergencyAdvice
- status
- createdAt
- resolvedAt nullable

AuditEvent
- id
- actorType
- actorId nullable
- action
- metadataJson
- createdAt

ClinicPolicy
- id
- clinicId
- title
- body
- category

==================================================
KEY PRODUCT FLOWS
==================================================

Implement these end-to-end:

FLOW 1 — Doctor seeds patient context
- doctor logs in
- opens assigned patient
- writes diagnosis summary, treatment plan, personalized notes, risk thresholds
- saves care plan

FLOW 2 — Patient chats with AI
- patient logs in
- opens chat
- asks question
- backend loads care plan + clinic policy
- Gemini returns structured output
- policy engine validates
- response is shown
- if risky, create escalation record

FLOW 3 — Patient uploads symptom photo
- patient uploads image
- save original to blob
- attach metadata
- Gemini can extract a non-diagnostic structured description only
- AI must not diagnose from image
- AI can say it will summarize for doctor review or compare against doctor-defined warning rules
- if risk threshold exceeded, create escalation

FLOW 4 — Patient voice message
- patient records audio
- upload audio
- transcribe using browser/local placeholder or a mock transcription service
- send transcript into same AI pipeline
- store audio in blob
- store transcript metadata
- same policy checks apply

FLOW 5 — Admin support
- admin sees queue of unresolved admin tasks
- AI can suggest intake clarifications and callback tasks
- admin can mark items completed

FLOW 6 — Doctor review
- doctor sees escalations
- doctor sees AI summary of chat
- doctor can add updated instruction
- future patient AI responses use latest doctor instruction

==================================================
PROMPTING / POLICY ARCHITECTURE
==================================================

Build a layered prompt system on the server:

1) System prompt
- defines assistant role
- strict refusal logic
- never diagnose
- never prescribe
- never recommend controlled/illegal drugs
- never change medications unless explicitly stated in doctor care plan
- escalate on red flags

2) Clinic policy context
- clinic SOPs
- admin rules
- emergency policy

3) Doctor patient context
- diagnosis summary
- treatment plan
- personalized notes
- risk thresholds
- allowed medication instructions if doctor explicitly provided them

4) Current conversation
- last N messages
- uploaded media summaries

5) Output schema requirement
- must return JSON matching Zod schema

==================================================
MEDIA REQUIREMENTS
==================================================

TEXT CHAT
- normal threaded chat

VOICE
- mic button in composer
- MVP can record audio in browser
- upload to server
- create transcript path
- show audio message bubble + transcript

IMAGE
- camera/upload button
- preview thumbnail in chat
- upload to blob
- store metadata
- allow AI to produce a safe structured summary, never diagnosis

==================================================
DESIGN REQUIREMENTS
==================================================

Use:
- shadcn/ui cards, buttons, inputs, textarea, badge, sheet, dialog, avatar
- polished loading states
- empty states
- toast notifications
- desktop sidebar navigation
- elegant message bubbles
- subtle role color coding:
  - AI
  - Doctor
  - Patient
  - Admin

Create a premium startup-grade landing/login experience too:
- hero text
- “Clinic support, not a replacement for care”
- simple demo account buttons

==================================================
AUTH / DEMO MODE
==================================================

For MVP:
- implement simple seeded demo users
- credentials-based auth is acceptable
- provide these demo accounts:

doctor@demo.com / password123
admin@demo.com / password123
patient@demo.com / password123

Seed:
- one clinic
- one doctor
- one admin
- one patient
- one care plan
- one sample conversation
- one sample escalation
- one clinic policy set

==================================================
LOCAL DEV AND MOCKING
==================================================

This app must run locally even if real cloud credentials are missing.

Create adapters:
- ai provider adapter
- deid adapter
- blob adapter

Modes:
- real mode if env vars exist
- mock mode otherwise

In mock mode:
- Gemini returns deterministic fake but realistic JSON
- DeID returns pseudo-redacted text
- Blob returns fake local URLs

==================================================
ENV VARS
==================================================

Support these env vars:

DATABASE_URL=
NEXTAUTH_SECRET=
GEMINI_API_KEY=
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=
AZURE_DEID_ENDPOINT=
AZURE_DEID_TENANT_ID=
AZURE_DEID_CLIENT_ID=
AZURE_DEID_CLIENT_SECRET=
NEXT_PUBLIC_APP_NAME=ClinAI Bridge

Also add a clear .env.example

==================================================
FILE / FOLDER STRUCTURE
==================================================

Use a clean structure like:

/app
  /(marketing)
  /(auth)
  /(dashboard)
    /doctor
    /admin
    /patient
    /api
/components
  /chat
  /layout
  /ui
/lib
  /ai
  /auth
  /db
  /policy
  /rbac
  /validators
/services
  /gemini
  /deid
  /blob
/prisma
/scripts
/public

==================================================
POLICY ENGINE — MUST IMPLEMENT
==================================================

Create a hard-coded server-side policy engine.

Input:
- user role
- current care plan
- clinic policy
- AI JSON draft

Output:
- approved response
- downgraded response
- refusal
- escalation creation

Implement functions like:
- detectRestrictedDrugRequest()
- detectMedicationChangeRequest()
- detectEmergencyRedFlags()
- detectIllegalOrUnsafeContent()
- enforceDoctorBoundaries()
- shouldEscalate()

This policy engine must run AFTER the model draft but BEFORE rendering to user.

==================================================
DOCTOR STYLE MEMORY — SAFE VERSION
==================================================

Do NOT fine-tune on raw patient data.

Instead implement a safe lightweight pattern layer:
- capture de-identified examples of how doctor phrases explanations
- store those as sanitized style notes
- use them as optional tone/context snippets
- never let “style memory” override safety or clinical boundaries
- never claim that the AI is the doctor

==================================================
NON-GOALS
==================================================

Do NOT:
- integrate a real EMR
- implement payment
- implement real e-prescribing
- claim diagnosis certainty
- build production telemedicine video
- copy any third-party proprietary product exactly

==================================================
DELIVERABLES
==================================================

Generate the full codebase.

Include:
1) complete Next.js app
2) Prisma schema + seed script
3) route handlers
4) reusable services for Gemini, Azure Blob, Azure DeID
5) mock providers for local dev
6) polished UI
7) README with setup instructions
8) architecture notes
9) sample .env.example
10) comments only where truly useful

==================================================
CODING STANDARDS
==================================================

- TypeScript strict mode
- clean reusable components
- no giant files if avoidable
- no placeholder lorem ipsum in important screens
- use sensible defaults
- prioritize working MVP quality over overengineering
- make it look impressive in a demo
- ensure the app compiles
- avoid TODOs unless absolutely necessary
- if a cloud integration is not fully runnable locally, provide a clean mock path

==================================================
BUILD ORDER
==================================================

Do this in order:
1) scaffold app and dependencies
2) Prisma schema and seed data
3) auth and role-based routing
4) shared layout and navigation
5) patient chat UI
6) doctor/admin dashboards
7) Gemini structured response pipeline
8) policy engine
9) Azure Blob upload integration
10) Azure DeID integration
11) mock adapters and local fallback
12) polish and README

Now start building the project.
