<<<<<<< HEAD
# Lab 2 - AI Use and Reflection

**AI tools use:** ChatGPT and Antigravity IDE Agent

I use ChatGPT to analyze the Lab 2 requirements, understand the require GitHub workflow and refine or create implementation prompts for the four GitHub Issues. I use the resulting prompts with the Antigravity IDE Agent to inspect the starter scaffold and implement the required code.
I also check the generated changes, running tests, checking Git status and branches and verifying the implementation against the Lab 2 requirements before committing and creating Pull Request too.

## Representative prompts

The prompts below are short paraphrases of the kinds of questions I asked during the lab.

| # | Prompt I used | How AI helped | What I did and verified |
| --- | --- | --- | --- |
| 1 | Define the Lab 2 engineering contract and test plan before application implementation.This issue covers: - Lab 2 scope and requirements - Business rules and functional requirements - Acceptance criteria - API contract - UI specification - Data requirements - Validation and ownership rules - Attachment rules - Loading, empty, error, and responsive behavior - Automated test plan - Definition of Done. No application feature implementation is included in this issue. | AI helped organize the Lab 2 requirements into a clear engineering contract, acceptance criteria, API/UI specifications, and test plan before implementation started. | I reviewed the generated documents against the Lab 2 labsheet, checked that the scope and excluded features were correct, and verified that the documents were committed under docs/lab-02. |
| 2 | Establish the Development Requester context and required reference/seed data for Lab 2. This issue covers: - Development Requester selection/context - Required reference data - Required database changes for requester-related data - Seed data needed by the Lab 2 requester workflow This provides the foundation for creating and viewing tickets. | AI helped identify the requester-related data, database changes, reference data, and seed requirements needed for the later Ticket features. | I inspected the generated implementation, checked the database changes and seed data, ran the relevant tests, and verified the changes before committing and creating the PR. |
| 3 | Implement the Ticket data model and the API required to create a Ticket. This issue covers: - Ticket database model - Required fields and constraints - Ticket creation API - Request validation - Required business rules - Development Requester ownership - Error and failure handling - Automated API tests | AI helped translate the Lab 2 requirements into the Ticket model, API behavior, validation rules, and automated tests. | I reviewed the implementation and tested the API behavior. I checked validation, ownership, default values, duplicate/idempotency behavior, database errors, tests, and builds before creating the PR. |
| 4 | Implement the Ticket attachment lifecycle API. This issue covers: - Attachment upload - JPG/JPEG, PNG, WEBP, and PDF validation - Maximum 5 MB per file - Maximum 5 active attachments per Ticket - Attachment download - Soft removal - Ownership protection - Validation and failure handling - Automated attachment API tests | AI helped structure the attachment lifecycle and identify the required validation, ownership, file-size, file-type, and soft-removal rules. | I reviewed the implementation, checked the attachment limits and validation, tested upload/download/removal behavior, checked ownership protection and failure cases, and ran the relevant tests before committing. |
| 5 | Build the responsive Create Ticket requester experience. This issue covers: - Development Requester selection - Create Ticket form - Client-side validation - Attachment controls - Loading states - Success and failure states - Responsive layout - Accessibility - Zen Green UI/theme conventions | AI helped translate the specification into the Create Ticket UI structure, validation behavior, responsive layout, and reusable UI conventions. | I inspected the UI and tested the form, validation, loading/error states, attachment controls, and responsive behavior. I also ran the frontend tests and production build before creating the PR. |
| 6 | Implement the My Tickets requester experience. This issue covers: - Displaying the requester's Tickets - Search - Filtering - Sorting - Pagination - Loading state - Empty state - No-results state - Error/failure state - Ownership protection- Responsive behavior | AI helped organize the My Tickets requirements into search, filtering, sorting, pagination, ownership, and UI-state behavior. | I tested the Ticket list with different search, filter, sort, and pagination cases. I also checked loading, empty, no-results, error, ownership, responsive behavior, and automated tests. |
| 7 | Build the Requester Ticket Detail experience. This issue covers: - Ticket detail display - Requester ownership - Ticket information - Attachment listing - Attachment download  - Attachment soft removal - Loading state - Empty state - Error/failure state - Responsive and accessible UI | AI helped structure the Ticket Detail page and connect the required Ticket and attachment behaviors to the requester workflow. | I reviewed the Ticket Detail implementation and verified Ticket information, ownership, attachments, download/removal behavior, loading and error states, responsive behavior, and tests. |
| 8 | Complete the Lab 2 quality evidence, documentation, and release integration. This issue covers: - Run the required automated tests - Verify acceptance criteria - Verify the final implementation against the Lab 2 specification - Complete required documentation - Collect required submission evidence - Review Git/GitHub workflow requirements - Prepare the Lab 2 release/integration. This is the final verification and submission issue. | AI helped organize the final verification checklist, documentation requirements, acceptance-criteria review, and Git/GitHub workflow. | I ran the required tests and builds, reviewed the acceptance criteria, checked Git branches and commits, verified the documentation and evidence, and confirmed the final implementation matched the Lab 2 requirements before release/integration. |

## Critical-thinking
I used AI as a support tool, but I still made the final decisions. I compared AI suggestions with the Lab 2 requirements, checked the code and tests, and verified the database, API, and UI myself. I also used Git and Pull Request reviews to make sure each issue was completed correctly. This taught me that AI-generated work still needs human checking and testing.


## Reflection
During Lab 2, AI helped me break the requirements into smaller GitHub Issues and prepare specifications, test plans, API contracts, and UI requirements. It also helped me understand the Git and GitHub workflow. However, I learned that I should not rely on AI blindly, so I checked the labsheet, reviewed the implementation, ran tests, and used my own judgment. Overall, AI made my work faster while I remained responsible for the final implementation and verification.
=======
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
>>>>>>> 5eb7e2a1c31c6f8e92cbf2d7896ebc28048250be
