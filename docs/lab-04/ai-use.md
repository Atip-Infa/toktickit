# Lab 4 - AI Use and Reflection

**AI tools used:** ChatGPT and Antigravity IDE Agent (Google DeepMind)

I used ChatGPT to analyze the official Lab 4 specification handout, structure the required engineering contracts, and format GitHub feature issues. I used the Antigravity IDE Agent to inspect the TokTickIT repository, implement backend API routes, Prisma migrations, React components, and automated test suites, and perform application-hardening and accessibility audits.

I personally verified all generated code, database schema migrations, REST API authorization rules, UI responsiveness, and test execution results to ensure 100% compliance with Lab 4 requirements and complete backward compatibility with Labs 1–3.

---

## Representative Prompts & Key Interactions

| # | Prompt I used | How AI helped | What I did and verified |
| --- | --- | --- | --- |
| 1 | We are implementing CPE 334 Lab 4: "TokTickIT Actions Taken, Ticket Workflow, Resolution Gate, and Operational Dashboards". Inspect the existing repository and generate the engineering specifications (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`). | AI helped organize the Lab 4 handout requirements into formal functional specs, business rules, status transition matrices, REST API contracts, UI requirements, and a test traceability matrix. | I reviewed the specifications against the official Lab 4 handout, verified that the status transition matrix and resolution gate rules were precise, and committed the documents under `docs/lab-04/`. |
| 2 | Implement the Lab 4 database schema migration and idempotent seed script. Add the `actions_taken` table in Prisma with foreign keys to Ticket and User (`performedBy`), `actionDate`, `description`, `result`, `followUpRequired`, `followUpNote`, and `attachmentNotes`. Update seed script to seed realistic actions taken across tickets. | AI generated the Prisma schema model, SQL migration, and seed data generator with realistic actions taken and varying ticket statuses. | I ran `npx prisma migrate dev` and `npx prisma db seed`, verified the table structures in PostgreSQL, and ensured existing Lab 1–3 tickets were preserved intact. |
| 3 | Implement the Lab 4 Actions Taken section on the Ticket Detail page and REST APIs (`GET/POST /api/tickets/:id/actions-taken`, `PATCH /api/tickets/:id/actions-taken/:actionId`). Requesters must have read-only access; IT Staff / Admins can create and edit actions. | AI implemented the REST API routes with server-side authorization guards, performedBy auto-assignment, and the React `ActionsTakenSection` component. | I tested the API endpoints with Supertest, verified that Requester creation attempts return 403 Forbidden, checked modal form validations, and verified component rendering. |
| 4 | Implement the Lab 4 Ticket workflow state matrix and resolution gate. Supported statuses: NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CLOSED, REOPENED, CANCELLED. Transitioning to RESOLVED requires >= 1 Action Taken AND resolution summary. Requester resolution indication must remain advisory. Handle stale updates with expectedUpdatedAt (409 Conflict). | AI updated the backend `PATCH /api/staff/tickets/:id` route with resolution gate validation logic, status transition matrix checks, and optimistic locking timestamp comparisons. | I ran backend integration tests covering resolution gate rejections (0 actions taken or missing summary), advisory comment creation on Requester resolve click, and 409 Conflict handling. |
| 5 | Implement the Lab 4 IT Staff Operational Dashboard (`GET /api/staff/dashboard`) and React component `StaffDashboardView`. Calculate authoritative metrics from DB: Unassigned, My Assigned, Status breakdown, IT Priority breakdown, Recently updated tickets. Include drill-down links to pre-filtered queue views. | AI built the backend aggregate queries and the responsive Zen Green `StaffDashboardView` component with operational metric cards and drill-downs. | I verified that metrics matched database counts, tested queue filter navigation, verified 403 Forbidden enforcement on non-staff calls, and ran component tests. |
| 6 | Implement the Lab 4 Requester Dashboard (`GET /api/requester/dashboard`) and React component `RequesterDashboardView`. Summarize owned tickets only (`Total`, `Open`, `Action Required`, `In Progress`, `Resolved`, `Closed`). Enforce ownership on backend. | AI created the Requester Dashboard API and UI component, including the amber callout banner for tickets in WAITING_FOR_REQUESTER status. | I verified that client-supplied requester ID overrides are ignored on backend, tested drill-down navigation to My Tickets, and ran API and component tests. |
| 7 | Perform a full Lab 4 regression and application-hardening pass. Verify all 15 functionality areas, add duplicate submission safeguards, preserve form data on error, update README setup/demo instructions, and verify all tests pass. | AI added `submitting` boolean states and disabled controls on modal forms, audited form input preservation, and updated `README.md` with complete execution guides. | I executed the full test suite (`npm test` in server and client), verified 149 passing tests, checked git status, and reviewed README setup steps. |
| 8 | Review the entire Lab 4 UI for accessibility, responsive behavior, and Zen Green consistency. Add visible focus rings, keyboard operability on metric cards, ARIA dialog roles on modals, aria-current on active nav items, and write accessibility tests. | AI updated `zen-green.css` with focus-visible styles, added keyboard handlers and ARIA attributes to components, and created `UIAccessibilityPolish.test.tsx`. | I ran the client test suite (17 test files, 54 tests passing), verified keyboard navigation with Tab/Enter/Space, and confirmed zero horizontal scroll overflow across viewports. |

---

## Critical-Thinking & Verification

AI tools significantly accelerated code implementation, spec drafting, and test generation. However, human critical-thinking and verification were essential:
- **Specification Alignment**: I cross-referenced AI-generated status transition matrices and resolution gate rules directly against `docs/lab-04/specification.md` to ensure business logic strictness.
- **Security & Authorization**: I verified that authorization checks are performed on the backend Express server using authenticated JWT session tokens rather than trusting client-supplied parameters.
- **Parallel Test Safety**: I refined metric assertions in server integration tests to handle concurrent Vitest database mutations safely.

---

## Reflection

Using AI as a pair-programming partner enabled rapid iteration from requirements to full implementation. By combining AI assistance with explicit specification files, test plan traceability matrices, and peer review verification, the codebase maintained high quality, clean architecture, and 100% test pass rates across all Lab 1–4 features.
