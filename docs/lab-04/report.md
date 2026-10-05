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
All 10 Lab 4 feature PRs were developed on dedicated `feature/lab4-*` branches, reviewed and approved by `@zerotwobook`, merged sequentially into `lab4-staging`, and finally released into `main` via PR #70:

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
- **Actions Taken Data Model**: Supports 1-to-many Action Taken records per Ticket. Required fields: `actionDate`, `description`, `result`, `performedById` (auto-populated), `followUpRequired`, `followUpNote` (conditionally required), and `attachmentNotes`.
- **Strict Resolution Gate**: Prevents ticket status transition to `RESOLVED` or `CLOSED` unless:
  1. Ticket contains at least one ($\ge 1$) recorded Action Taken entry.
  2. A non-empty `resolutionSummary` is provided.
- **Advisory Requester Resolution**: Requester "Problem Appears Resolved" button posts a Public Comment without altering the official ticket status directly.
- **Authoritative Operational Dashboards**: Computed on backend using Prisma database aggregations to avoid stale client-side metric mismatches.
- **Optimistic Concurrency Control**: Validates `updatedAt` timestamps on workflow updates to return HTTP `409 Conflict` on concurrent modifications.

### 3. Prior Specification Evidence
PR #61 (`feature/lab4-specification`) was reviewed, approved by `@zerotwobook`, and merged into `lab4-staging` on **Sun Oct 4 10:57:52 2026** prior to any feature implementation PRs.

---

## Answer Part 3: Test DD and Traceability

### 1. Test Traceability Matrix
- **Document Link:** [tests.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/tests.md)
- All 16 Lab 4 Acceptance Criteria (AC-01 through AC-16) are mapped directly to unit, API integration, and Playwright E2E tests.

### 2. Test Execution Output from Main Branch
- **Server REST API Integration Tests:** **17 Test Files Passed, 99 Tests Passed (100% success rate)**
  - `tests/lab-04/actions-taken.api.test.ts` (18 tests passed)
  - `tests/lab-04/ticket-workflow.api.test.ts` (9 tests passed)
  - `tests/lab-03/staff-queue.api.test.ts` (13 tests passed)
  - `tests/lab-03/staff-detail.api.test.ts` (9 tests passed)
  - `tests/lab-03/users-admin.api.test.ts` (7 tests passed)
  - `tests/lab-02/*.test.ts` & `tests/lab-01/*.test.ts` (43 regression tests passed)
- **Client Component Unit Tests:** **116 Tests Passed (100%)**
- **Playwright Browser Screenshot Suites:** **7 Test Scenarios Passed (100%)**

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

Demonstrates operational metric counters (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`, `Unassigned`), assigned tickets list, quick search links, and drill-down queue navigation.

![IT Staff Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/01-it-staff-dashboard.png)

---

## Answer Part 6: Working Actions Taken UI

Demonstrates the Actions Taken timeline under Ticket Detail, create action modal, auto-assigned `performedBy` field, conditional `followUpNote` validation, edit action controls, and read-only protection for Requesters.

![Actions Taken Ticket Detail](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/02-actions-taken-detail.png)

---

## Answer Part 7: Working Ticket Workflow

Demonstrates strict status transition matrix enforcement (`NEW` -> `IN_PROGRESS` -> `WAITING_FOR_REQUESTER` -> `RESOLVED`), Resolution Gate checking ($\ge 1$ Action Taken required), and optimistic concurrency conflict handling (`409 Conflict`).

---

## Answer Part 8: Working Requester Dashboard and Final Regression UI

Demonstrates Requester-owned summary metrics (`My Open Tickets`, `In Progress`, `Resolved`, `Closed`), recent owned tickets, advisory "Problem Appears Resolved" indication, and Admin User Management.

### 1. Requester Dashboard UI
![Requester Dashboard Desktop](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/03-requester-dashboard.png)

### 2. Administrator User Management UI
![Administrator User Management](file:///c:/Users/Atip/Downloads/toktickit/artifacts/lab-04/screenshots/04-admin-user-management.png)

---

## Answer Part 9: Zen Green UI, Responsive, Accessibility, and Final Polish

### 1. UI Specification
- **Document Link:** [ui-spec.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-04/ui-spec.md)

### 2. Responsive & Accessibility Hardening Checklist
- **Visual Design:** Zen Green palette (`#059669` emerald primary, `#065f46` deep green headers, `#f0fdf4` soft background).
- **Accessibility:** 3px high-visibility emerald focus rings, WCAG 2.1 AA color contrast, ARIA dialog roles, keyboard trap prevention.
- **Responsive Layouts:** Zero horizontal scroll overflow across Desktop (1440px), Tablet (800px), and Mobile (375px).

### 3. Responsive Screenshot Comparison
- **IT Staff Dashboard Tablet View:** `artifacts/lab-04/screenshots/it-staff-dashboard/tablet-it-staff-dashboard.png`
- **IT Staff Dashboard Mobile View:** `artifacts/lab-04/screenshots/it-staff-dashboard/mobile-it-staff-dashboard.png`
- **Requester Dashboard Tablet View:** `artifacts/lab-04/screenshots/requester-dashboard/tablet-requester-dashboard.png`
- **Requester Dashboard Mobile View:** `artifacts/lab-04/screenshots/requester-dashboard/mobile-requester-dashboard.png`
