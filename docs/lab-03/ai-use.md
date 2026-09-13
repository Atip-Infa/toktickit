# CPE 334 Lab 3 AI Usage Disclosure (`docs/lab-03/ai-use.md`)

## 1. AI Assistance Disclosure Summary

In accordance with course policies for **CPE 334: Software Engineering**, this document discloses the extent and nature of AI assistance used during the planning, specification, design, implementation, testing, and evidence preparation for **Lab 3: Users, Roles, IT Staff Ticketing, and Admin Screens**.

* **AI Assistant / Agent**: Antigravity (Google DeepMind Agentic Pair-Programming Assistant)
* **Primary Responsibilities**: Specification drafting, architecture design, Prisma schema evolution & seed generation, REST API endpoint implementation, server-side JWT authentication & authorization middleware, React component development (IT Queue, Staff Ticket Detail, Admin User Management), unit/integration test suite creation, Playwright E2E test automation, responsive screenshot capture, and Lab 2 regression verification.

---

## 2. AI Tools Used

1. **Antigravity AI Agent**: Core agentic coding tool utilized for code generation, static analysis, multi-file refactoring, automated testing execution, and documentation synthesis.
2. **Vitest Test Runner**: Used via AI tool calls for server unit/integration tests (`npm --prefix server test`) and client component unit tests (`npm --prefix client test`).
3. **Playwright Test Automation Framework**: Executed headlessly to verify end-to-end user workflows and capture multi-viewport responsive UI evidence (`npx playwright test`).
4. **Prisma CLI (`npx prisma`)**: Used by the AI agent for database migrations (`db push`) and database seeding (`prisma db seed`).
5. **Git CLI**: Executed via system tool calls for branch management, commits, staging, and remote repository integration.

---

## 3. Workflow Breakdown

### 3.1 Specification & Architecture Work
* **AI Role**: Analyzed the official Lab 3 PDF handout and existing repository code to draft comprehensive specifications (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`).
* **Key Deliverables**: Formulated the 8-status ticket status transition matrix, server authorization matrix, password complexity rules, user management constraints, and responsive viewport specifications.

### 3.2 Coding & Implementation Work
* **Backend (Node.js/Express/Prisma)**: Built JWT authentication (`/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/change-password`), role authorization middleware, IT Staff Queue APIs (`GET /api/staff/tickets`, `PATCH /api/staff/tickets/:id`), Public Comments & Internal Notes APIs, and Admin User Management endpoints (`/api/admin/users`).
* **Frontend (React/TypeScript/CSS)**: Developed `LoginView`, `ChangePasswordView`, `StaffTicketQueueView`, `StaffTicketDetailView`, `PublicCommentsSection`, `InternalNotesSection`, and `UserManagementView` styled strictly with the Zen Green CSS theme (`zen-green.css`).

### 3.3 Testing & Debugging Work
* **Test Suite Generation**: Created 13 server integration test suites (65 tests), 12 client unit component test suites (31 tests), and Playwright E2E test suites (10 tests total across Lab 2 & Lab 3).
* **Automated Debugging**: Resolved edge cases in status transition validation, resolution summary enforcement, and server-side safety guards preventing self-deactivation and last-active admin deactivation.

### 3.4 Human Verification & Oversight
* **Code Review & Validation**: Verified that all API authorization checks operate strictly server-side, ignoring client-supplied `requesterId` overrides when authenticated sessions are active.
* **UI & Accessibility Inspection**: Inspected high-resolution screenshots across Desktop (1440px), Tablet (800px), and Mobile (375px) viewports to verify zero layout clipping, zero horizontal overflow, and accessible touch target sizes.
* **Regression Audit**: Confirmed 100% test pass rate on all legacy Lab 1 and Lab 2 functionality.

---

## 4. Key Prompts Log (8 Structured Prompts)

### Prompt 1: Specification & Architecture Phase
> *"Analyze the official Lab 3 PDF handout and existing repository code. Formulate formal specifications for system architecture, authentication, server-side authorization matrix, UI views, and test traceability."*
* **AI Output**: Created `docs/lab-03/specification.md`, `ui-spec.md`, `api-spec.md`, and `tests.md`.

### Prompt 2: Database Migration & Seeding Phase
> *"Implement the database migration and seed data for Lab 3 users, public comments, internal notes, and updated ticket relationships."*
* **AI Output**: Extended `server/prisma/schema.prisma` with `User`, `PublicComment`, `InternalNote` models and generated `server/prisma/seed.ts` seeding 9 standard users across all three roles.

### Prompt 3: Authentication & Server Authorization Phase
> *"Implement Lab 3 Authentication APIs & Server Authorization Middleware (JWT login, bcrypt password hashing, mandatory first-login password change, and strict server-side role & ownership authorization)."*
* **AI Output**: Built `server/src/utils/auth.ts`, `server/src/middleware/auth.ts`, authentication routes, and role guard middleware in `server/src/app.ts`.

### Prompt 4: IT Staff Ticket Queue Implementation Phase
> *"Implement the IT Staff Ticket Queue with search, filters, sorting, pagination, status badges, IT priority badges, and responsive views."*
* **AI Output**: Created `StaffTicketQueueView.tsx`, client API methods, CSS responsiveness rules, and staff queue Vitest integration test suite.

### Prompt 5: IT Staff Ticket Detail & Workflow Phase
> *"Implement the IT Staff Ticket Detail view with Public Comments, Internal Notes, attachments, claim/reassign, priority updates, and exact status transition matrix."*
* **AI Output**: Implemented `StaffTicketDetailView.tsx`, `PublicCommentsSection.tsx`, `InternalNotesSection.tsx`, status transition matrix validation, and resolution summary requirements.

### Prompt 6: Administrator User Management Phase
> *"Implement Administrator User Management with search/filter, user creation, role modification, active toggle, password reset, duplicate email guards, self-deactivation protection, and last active Admin protection."*
* **AI Output**: Built `UserManagementView.tsx`, user creation modal, backend validation middleware, and admin API test suite (`users-admin.api.test.ts`).

### Prompt 7: Verification & Quality Audit Phase
> *"Stop adding major features and perform a complete Lab 3 verification. Run the entire test suite across server, client, and Playwright E2E tests."*
* **AI Output**: Executed full test runner suite (106 tests total), verifying 100% pass rate across server API, client components, and Playwright E2E scenarios.

### Prompt 8: Documentation & Evidence Preparation Phase
> *"Now complete the Lab 3 documentation and evidence preparation. Create/update reviewer.md, ai-use.md, organize screenshots, inspect Git workflow, and identify missing evidence."*
* **AI Output**: Updated `docs/lab-03/ai-use.md`, `docs/lab-03/reviewer.md`, captured organized multi-viewport screenshot artifacts, and compiled Git evidence analysis.

---

## 5. Developer Reflection

Pair programming with an agentic AI assistant provided substantial speed and rigour during the Lab 3 implementation. Key learnings and insights from this process include:

1. **Zero-Trust Server-Side Authorization**: AI assistance highlighted the critical necessity of enforcing authorization boundaries strictly on the server. Rather than relying on client UI hides/disables, every REST API endpoint enforces role checks (`req.user.role`) and resource ownership (`ticket.requesterId === req.user.id`). Client-supplied identity headers are ignored when a valid session token is attached.
2. **Automated TDD & Test Traceability**: Generating unit, integration, and E2E tests in tandem with feature code ensured that complex business rules—such as the 8-state ticket status transition matrix, resolution summary enforcement, mandatory password resets, and admin safety guards—were validated continuously.
3. **Design System Consistency**: Utilizing centralized CSS custom properties in `zen-green.css` ensured that new screens (IT Queue, Staff Detail, User Management) maintained visual cohesion with Lab 2 views while scaling smoothly across Desktop, Tablet, and Mobile viewports.
