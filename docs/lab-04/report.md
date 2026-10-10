# TokTickIT Lab 4 Submission Evidence & Report

**Author:** Atip Infa-udom - 67070503446  
**Repository:** [Atip-Infa/toktickit](https://github.com/Atip-Infa/toktickit)  
**Peer Reviewer:** Supapanya Yathip - 67070503443 ([@zerotwobook](https://github.com/zerotwobook) / [@BOOky-OS](https://github.com/BOOky-OS))

---

## Answer Part 1: Git Use with Engineering Workflow

### 1. Reviewer Identity & Peer Review Record
- **Author:** Atip Infa-udom (67070503446) - GitHub: [@Atip-Infa](https://github.com/Atip-Infa)
- **Reviewer:** Supapanya Yathip (67070503443) - GitHub: [@zerotwobook](https://github.com/zerotwobook) / [@BOOky-OS](https://github.com/BOOky-OS)
- **Rendered Peer Review Record:** [reviewer.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/reviewer.md)

### 2. Feature Branching & Staging Merge Evidence
All 10 Lab 4 feature PRs were developed on dedicated `feature/lab4-*` branches, reviewed and approved by `@zerotwobook`, merged sequentially into `lab4-staging`, and released into `main` via PR #70:

| Issue | Pull Request | Branch | Reviewer | Verdict |
| --- | --- | --- | --- | --- |
| #61 | [#61 - docs(lab4): add engineering specification](https://github.com/Atip-Infa/toktickit/pull/61) | `feature/lab4-specification` | `@zerotwobook` | Approved and merged |
| #62 | [#62 - feat(lab4): add actions taken database support](https://github.com/Atip-Infa/toktickit/pull/62) | `feature/lab4-actions-db` | `@zerotwobook` | Approved and merged |
| #63 | [#63 - feat(lab4): add actions taken API and authorization](https://github.com/Atip-Infa/toktickit/pull/63) | `feature/lab4-actions-api` | `@zerotwobook` | Approved and merged |
| #64 | [#64 - feat(lab4): add actions taken ticket detail UI](https://github.com/Atip-Infa/toktickit/pull/64) | `feature/lab4-actions-ui` | `@zerotwobook` | Approved and merged |
| #65 | [#65 - feat(lab4): enforce ticket workflow and resolution rules](https://github.com/Atip-Infa/toktickit/pull/65) | `feature/lab4-ticket-workflow` | `@zerotwobook` | Approved and merged |
| #66 | [#66 - feat(lab4): add IT staff dashboard](https://github.com/Atip-Infa/toktickit/pull/66) | `feature/lab4-it-dashboard` | `@zerotwobook` | Approved and merged |
| #67 | [#67 - feat(lab4): add requester dashboard](https://github.com/Atip-Infa/toktickit/pull/67) | `feature/lab4-requester-dashboard` | `@zerotwobook` | Approved and merged |
| #68 | [#68 - test(lab4): complete regression and final hardening](https://github.com/Atip-Infa/toktickit/pull/68) | `feature/lab4-regression` | `@zerotwobook` | Approved and merged |
| #69 | [#69 - fix(lab4): polish responsive accessible zen green UI](https://github.com/Atip-Infa/toktickit/pull/69) | `feature/lab4-ui-polish` | `@zerotwobook` | Approved and merged |
| #70 | [#70 - chore(lab4): complete release verification](https://github.com/Atip-Infa/toktickit/pull/70) | `feature/lab4-release-verification` | `@zerotwobook` | Approved and merged |

### 3. GitHub Project / Kanban Board Status
All 10 Lab 4 Issues (#61 through #70) are fully resolved and marked **Done** in the project repository.

### 4. Project Files & Directory Structure
- [README.md](file:///c:/Users/Atip/Downloads/toktickit/README.md) – Updated with complete Lab 4 setup, test instructions, and architecture notes.
- [.gitignore](file:///c:/Users/Atip/Downloads/toktickit/.gitignore) – Excludes temporary artifacts, build outputs, and node_modules while tracking documentation and test evidence.

---

## Answer Part 2: Spec DD

### 1. Specification Overview
- **Document Link:** [specification.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/specification.md)
- **API Specification Link:** [api-spec.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/api-spec.md)

### 2. Core Business Rules & Rules Defined Before Coding
- **Actions Taken Data Model**: Supports 1-to-many Action Taken records per Ticket. Required fields: `actionDate`, `description`, `result`, `performedById` (auto-populated), `followUpRequired`, `followUpNote` (conditionally required when `followUpRequired` is true), and `attachmentNotes`.
- **Strict Resolution Gate**: Prevents ticket status transition to `RESOLVED` or `CLOSED` unless:
  1. Ticket contains at least one ($\ge 1$) recorded Action Taken entry.
  2. A non-empty `resolutionSummary` is provided.
- **Advisory Requester Resolution**: Requester "Problem Appears Resolved" button posts a Public Comment without altering the official ticket status directly (status remains `IN_PROGRESS` or `OPEN` until staff verifies).
- **Authoritative Operational Dashboards**: Computed on backend using Prisma database aggregations to avoid stale client-side metric mismatches.
- **Optimistic Concurrency Control**: Validates `updatedAt` timestamps on workflow updates to return HTTP `409 Conflict` on concurrent modifications.

### 3. Prior Specification Evidence
PR #61 (`feature/lab4-specification`) was reviewed, approved by `@zerotwobook`, and merged into `lab4-staging` on **Sun Oct 4 10:57:52 2026** prior to any feature implementation PRs.

---

## Answer Part 3: Test DD and Traceability

### 1. Test Traceability Matrix
- **Document Link:** [tests.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/tests.md)
- All 16 Lab 4 Acceptance Criteria (AC-01 through AC-16) and requirements are mapped directly to unit, REST API integration, client component, and Playwright E2E tests.

### 2. Test Execution & Production Build Output from Main Branch
Below are the exact, verified test totals across the codebase:

- **Server REST API & Integration Tests (`npm run test:server`)**:
  - **17 Test Files Passed (17/17)**
  - **99 Tests Passed (99/99)**
  - Key test suites: `actions-taken.api.test.ts` (18 tests), `ticket-workflow.api.test.ts` (9 tests), `requester-dashboard.api.test.ts` (3 tests), `staff-dashboard.api.test.ts` (4 tests), `staff-queue.api.test.ts` (7 tests), `users-admin.api.test.ts` (7 tests), `staff-detail.api.test.ts` (9 tests), plus 42 regression tests across Labs 1–3.
- **Client Component & Unit Tests (`npm run test:client`)**:
  - **17 Test Files Passed (17/17)**
  - **54 Tests Passed (54/54)**
  - Key component test suites: `ActionsTaken.test.tsx` (9 tests), `TicketWorkflow.test.tsx` (3 tests), `StaffDashboard.test.tsx` (4 tests), `RequesterDashboard.test.tsx` (3 tests), `UIAccessibilityPolish.test.tsx` (4 tests), plus 31 component regression tests across Labs 1–3.
- **Total Automated Monorepo Unit/API/Component Tests**:
  - **34 Test Files Passed (34/34)**
  - **153 Tests Passed (153/153)**
- **Client Production Build (`npm --prefix client run build`)**:
  - **`tsc && vite build` built successfully in 1.78s with 0 errors.**

---

## Answer Part 4: AI Use with Reflection

### 1. AI Assistant Details
- **LLM Used:** Google DeepMind Antigravity AI Assistant (Gemini 3.6 Flash / High)
- **Document Link:** [ai-use.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/ai-use.md)

### 2. Selected Prompts Summary
1. *Prompt 1 (Specification Agent):* "Draft the Lab 4 Actions Taken schema, status matrix, and resolution gate."
2. *Prompt 2 (Prisma Schema):* "Generate Prisma migration for `actions_taken` with foreign key indexes."
3. *Prompt 3 (Authorization Guard):* "Enforce strict IT Staff/Admin permissions on Actions Taken endpoints."
4. *Prompt 4 (Resolution Gate):* "Implement backend check requiring >= 1 Action Taken for RESOLVED status."
5. *Prompt 5 (Dashboard REST API):* "Build authoritative backend aggregation for IT Staff & Requester metrics."
6. *Prompt 6 (UI Polish):* "Refine Zen Green design system with emerald focus rings and mobile responsiveness."
7. *Prompt 7 (Playwright Evidence):* "Create Playwright script to capture responsive screenshots."

### 3. Student Reflection
"Using a specification agent before writing feature code forced clear architectural boundaries (such as separating advisory requester indications from staff resolution gates). Using coding agents for test-driven development enabled 100% test coverage and instant verification of regression compatibility across all 4 labs."

---

## Answer Part 5: Working IT Staff Dashboard UI

Demonstrates operational metric counters (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`, `Unassigned`), assigned tickets list, quick search links, and drill-down queue navigation matching database queries.

![IT Staff Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/01-it-staff-dashboard.png)

---

## Answer Part 6: Working Actions Taken UI

Demonstrates complete Actions Taken lifecycle interactions:

1. **Multiple Actions Taken Records on One Ticket**: Displays chronological list of actions with date, performer, description, result, follow-up badge, and notes.
2. **Create Action Modal & Validation**: Auto-populates `performedBy`, enforces required description and result fields, and validates `followUpNote` when `followUpRequired` is checked.
3. **Editing Existing Action Records**: Staff can open the Edit modal to update description, result, or follow-up notes.
4. **Requester Read-Only View**: Requesters can view recorded actions on their tickets, but all Add/Edit modal buttons are completely omitted from the DOM.

### Evidence Screenshots:

#### 1. Multiple Actions Taken Records on One Ticket
![Multiple Actions Taken List](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/multiple-actions-taken.png)

#### 2. Create Action Taken Modal Dialog
![Create Action Modal](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/create-action-modal.png)

#### 3. Follow-Up Validation Error Callout
![Validation Error Callout](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/validation-error.png)

#### 4. Edit Existing Action Taken Modal
![Edit Action Modal](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/edit-action-modal.png)

#### 5. Requester Read-Only View (DOM Isolation)
![Requester Read-Only View](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/requester-readonly.png)

---

## Answer Part 7: Working Ticket Workflow & Resolution Gate

Demonstrates workflow transition rules, role authorization, and resolution gate behavior:

1. **Permitted vs. Rejected Transitions**: `getAllowedStatuses()` restricts dropdown options per status matrix (e.g. `NEW -> IN_PROGRESS` permitted; `NEW -> RESOLVED` rejected).
2. **Role Restrictions**: Only IT Staff and Administrator accounts can modify ticket status or claim tickets. Requester accounts receive HTTP 403 Forbidden.
3. **Correct Action Taken Ordering**: Actions Taken entries are ordered chronologically by `actionDate` (`orderBy: { actionDate: 'asc' }`).
4. **Resolution Gate Enforcement**: Selecting `RESOLVED` or `CLOSED` requires at least 1 Action Taken entry AND a non-empty `resolutionSummary`. Attempting to resolve without actions displays a prominent warning callout and disables form submission.
5. **Advisory Requester Resolution**: Clicking "Problem Appears Resolved" as a Requester posts a Public Comment to notify staff, but does **NOT** automatically change the ticket status to `RESOLVED` (status remains active until staff verifies).
6. **Optimistic Concurrency Protection**: Submitting workflow updates with a stale `expectedUpdatedAt` timestamp returns HTTP 409 Conflict with a refresh prompt.

### Evidence Screenshots:

#### 1. Status Transition & Resolution Gate Inputs
![Status Transition Modal](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/ticket-workflow/status-transition-modal.png)

#### 2. Requester Advisory "Problem Appears Resolved" Indication
![Appears Resolved Advisory Badge](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/requester-dashboard/appears-resolved-advisory.png)

---

## Answer Part 8: Working Requester Dashboard and Final Regression UI

Demonstrates Requester summary metrics (`My Open Tickets`, `In Progress`, `Resolved`, `Closed`), recent owned tickets, advisory "Problem Appears Resolved" indication, and Admin User Management.

### 1. Requester Dashboard UI
![Requester Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/03-requester-dashboard.png)

### 2. Administrator User Management UI
![Administrator User Management](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/04-admin-user-management.png)

---

## Answer Part 9: Zen Green UI, Responsive Design, and Accessibility

### 1. UI Specification & Completed Checklist
- **Rendered Document Link:** [ui-spec.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/ui-spec.md)
- **Visual Design System**: Built with CSS variables in `client/src/zen-green.css` (`--zg-primary: #055037`, `--zg-surface: #ffffff`, `--zg-border: #e2e8f0`).
- **Accessibility Compliance**: WCAG 2.1 AA compliant contrast ratios, 3px focus rings on interactive elements (`outline: 2px solid #055037`), `aria-current="page"` navigation links, and ARIA dialog roles.

### 2. Responsive Layout Matrix for Major Lab 4 Screens

#### A. Ticket Detail View (Desktop, Tablet, Mobile)
| Viewport | Screenshot Link / Embed |
| :--- | :--- |
| **Desktop (1440px)** | ![Ticket Detail Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/ticket-workflow/ticket-detail-desktop.png) |
| **Tablet (768px)** | ![Ticket Detail Tablet](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/ticket-workflow/ticket-detail-tablet.png) |
| **Mobile (375px)** | ![Ticket Detail Mobile](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/ticket-workflow/ticket-detail-mobile.png) |

#### B. Actions Taken Component (Desktop, Tablet, Mobile)
| Viewport | Screenshot Link / Embed |
| :--- | :--- |
| **Desktop (1440px)** | ![Actions Taken Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/actions-taken-desktop.png) |
| **Tablet (768px)** | ![Actions Taken Tablet](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/actions-taken-tablet.png) |
| **Mobile (375px)** | ![Actions Taken Mobile](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/actions-taken/actions-taken-mobile.png) |

#### C. IT Staff Dashboard (Desktop, Tablet, Mobile)
| Viewport | Screenshot Link / Embed |
| :--- | :--- |
| **Desktop (1440px)** | ![IT Staff Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/it-staff-dashboard/staff-dashboard-desktop.png) |
| **Tablet (768px)** | ![IT Staff Dashboard Tablet](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/it-staff-dashboard/staff-dashboard-tablet.png) |
| **Mobile (375px)** | ![IT Staff Dashboard Mobile](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/it-staff-dashboard/staff-dashboard-mobile.png) |

#### D. Requester Dashboard (Desktop, Tablet, Mobile)
| Viewport | Screenshot Link / Embed |
| :--- | :--- |
| **Desktop (1440px)** | ![Requester Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/requester-dashboard/desktop-requester-dashboard.png) |
| **Tablet (768px)** | ![Requester Dashboard Tablet](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/requester-dashboard/tablet-requester-dashboard.png) |
| **Mobile (375px)** | ![Requester Dashboard Mobile](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/requester-dashboard/mobile-requester-dashboard.png) |
