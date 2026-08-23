# Lab 2 AI Assistance Record & Reflection

## 1. AI Tooling Summary

- **Primary AI Pair Programmer**: Antigravity (Google DeepMind Team, powered by Gemini 3.6 Flash)
- **Scope of AI Assistance**:
  - Analytical breakdown of `Lab_02_labsheet.pdf` requirements.
  - Generation of initial engineering contract documents (`specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`).
  - Spec-Driven Development (Spec-DD) and Test-Driven Development (TDD) implementation of Issues #11–#18.
  - Zen Green theme visual design token application and responsive React components.
  - RESTful API creation and Supertest integration test suite construction.

---

## 2. Key Prompts and Workflow Log

### Prompt Sequence 1: Sprint Specification & Engineering Contract (#11)
> *User Request:* Read `Lab_02_labsheet.pdf` carefully. Define the sprint engineering contract and test plan BEFORE coding. Create `docs/lab-02/specification.md`, `tests.md`, `ui-spec.md`, `api-spec.md`.

*AI Actions & Outcome:*
- Analyzed the complete labsheet and generated formal specification documents without modifying application source code.
- Mapped all 14 Acceptance Criteria (`AC-01` to `AC-14`) and 22 Business Rules (`BR-01` to `BR-22`).

### Prompt Sequence 2: Development Requester Context (#12)
> *User Request:* Implement ONLY GitHub Issue #12 (Development Requester model, reference data, seed data, selector component, and tests).

*AI Actions & Outcome:*
- Updated Prisma schema with `DevelopmentRequester`, `Category`, `RelatedSystem`, `Ticket`, `Attachment` models.
- Built idempotent `prisma/seed.ts` script for required reference data.
- Built `DevelopmentRequesterSelector` card view and `RequesterContext` session manager.

### Prompt Sequence 3: Ticket Model & Creation API (#13)
> *User Request:* Implement ONLY GitHub Issue #13 (Ticket model, official ticket number generator `TKT-YYYY-XXXXXX`, POST `/api/tickets` API, and tests).

*AI Actions & Outcome:*
- Built atomic transaction-based ticket creator with official ticket number generator.
- Added input validation rules (summary 5–120 chars, description 10–2000 chars, priority enum check).

### Prompt Sequence 4: Attachment Lifecycle API (#14)
> *User Request:* Implement ONLY GitHub Issue #14 (Attachment model/upload/download/soft-remove API, max 5 MB limit, 5 file max limit, soft-remove reason).

*AI Actions & Outcome:*
- Configured Multer disk storage and file validation (JPG, PNG, WEBP, PDF up to 5 MB).
- Implemented soft-removal API (`PATCH /api/attachments/:id/remove`) with mandatory removal reason.

### Prompt Sequence 5: Responsive Create Ticket UI (#15)
> *User Request:* Implement ONLY GitHub Issue #15 (Responsive Create Ticket form, Zen Green styling, field validation, upload zone, ticket number success state).

*AI Actions & Outcome:*
- Built `CreateTicketForm.tsx` with Zen Green layout, real-time char count, and field validation.

### Prompt Sequence 6: My Tickets List & Query Contract (#16)
> *User Request:* Implement ONLY GitHub Issue #16 (My Tickets table & mobile card view, search, filters, pagination, sorting, and tests).

*AI Actions & Outcome:*
- Built `GET /api/tickets` paginated query endpoint and `MyTicketsView.tsx` component.

### Prompt Sequence 7: Ticket Detail & Attachment Controls (#17)
> *User Request:* Implement ONLY GitHub Issue #17 (Ticket Detail read-only view, attachment table, soft-remove modal, download links).

*AI Actions & Outcome:*
- Built `GET /api/tickets/:id` endpoint and `TicketDetailView.tsx` component.

### Prompt Sequence 8: Quality & Release Audit (#18)
> *User Request:* Implement ONLY GitHub Issue #18 (Complete quality audit, test suite verification, documentation sign-offs).

---

## 3. Reflection on AI Pair Programming

1. **Spec-Driven Development Efficiency**:
   - Preparing full specification contracts prior to writing code eliminated ambiguity and prevented scope creep.
2. **Quality Verification**:
   - Rigorous automated testing (26 server tests + 16 client tests passing 100%) provided strong confidence in zero regressions.
3. **Zen Green Aesthetic Adherence**:
   - Strict CSS variable token usage ensured visual consistency across mobile and desktop views.
