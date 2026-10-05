# TokTickIT Lab 4 Test Plan and Traceability Matrix (`tests.md`)

## 1. Overview & Test Strategy

This document defines the comprehensive Test Plan for CPE 334 Lab 4: *TokTickIT Actions Taken, Dashboards, and Final Regression*.

The test strategy covers:
* **Unit Tests**: Utility functions, validation rules for Actions Taken, resolution gate logic, status matrix checks, and dashboard metrics calculations.
* **API / Server Integration Tests**: Backend Express endpoint validation, authorization guards, Actions Taken CRUD, Requester and IT Staff dashboard query calculations, resolution gate enforcement, and concurrency conflict handling (`server/tests/lab-04/`).
* **UI Component Tests**: React components for IT Staff Dashboard, Requester Dashboard, Actions Taken component, and status transition UI feedback (`client/tests/lab-04/` or `client/src/components/...`).
* **Security & Authorization Tests**: Verification that Requesters cannot create or edit Actions Taken, access staff dashboard APIs, or bypass the resolution gate.
* **Database & Migration Tests**: Verification of `ActionTaken` model schema, migration scripts, idempotent seed execution, and zero/non-zero metric count queries.
* **Responsive & Accessibility Tests**: Mobile, tablet, and desktop layout rendering, screen reader labels, keyboard focus rings, and zero horizontal scroll overflow.
* **End-to-End (E2E) Tests**: Complete Playwright browser automation covering Actions Taken recording, ticket resolution workflows, dashboard drill-down navigation, and full Labs 1–3 regression (`e2e/lab-04/`).

---

## 2. Requirement & Acceptance Criteria Traceability Matrix

| Requirement ID | Acceptance Criterion | Test ID | Test Type | Target Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FR-01`, `BR-04` | `AC-01` (Create Action Taken with valid data) | `API-ACT-01` | API | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| `FR-03`, `FR-04` | `AC-02` (Reject missing follow-up note when required) | `API-ACT-02` | API | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| `FR-05`, `BR-03` | `AC-03` (Requester read-only Actions Taken access) | `API-ACT-03` | API | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| `FR-05`, `BR-03` | `AC-04` (Requester create Action Taken denied 403) | `API-ACT-04` | Security | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| `FR-01` | `AC-01` (Edit existing Action Taken by IT Staff) | `API-ACT-05` | API | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| `FR-08`, `BR-07` | `AC-05` (Resolution gate: reject resolve without Action Taken) | `API-WFLOW-01` | API | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| `FR-07`, `BR-07` | `AC-06` (Resolution gate: reject resolve without summary) | `API-WFLOW-02` | API | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| `FR-07`, `FR-08` | `AC-07` (Resolution gate: succeed with summary + Action Taken) | `API-WFLOW-03` | API | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| `FR-06`, `BR-06` | `AC-07` (Permitted status transitions matrix) | `API-WFLOW-04` | API | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| `FR-15`, `BR-12` | `AC-11` (Stale update concurrency conflict 409) | `API-WFLOW-05` | Concurrency | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| `FR-10`, `BR-09` | `AC-08` (Requester dashboard metrics & recent tickets) | `API-DASH-01` | API | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| `FR-10`, `BR-09` | `AC-08` (Requester dashboard ownership protection) | `API-DASH-02` | Security | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| `FR-11`, `BR-10` | `AC-09` (IT Staff dashboard operational counts) | `API-DASH-03` | API | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| `FR-12`, `BR-11` | `AC-09` (Admin dashboard user stats inclusion) | `API-DASH-04` | API | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| `FR-11` | `AC-09` (Requester access to Staff dashboard denied 403) | `API-DASH-05` | Security | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| `FR-11`, `FR-14` | `AC-10` (IT Staff Dashboard UI rendering & drill-down) | `UI-DASH-01` | UI | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| `FR-10`, `FR-14` | `AC-08` (Requester Dashboard UI rendering & drill-down) | `UI-DASH-02` | UI | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| `FR-01`-`FR-05` | `AC-01`-`AC-04` (Actions Taken UI component modes & validation) | `UI-ACT-01` | UI | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| `FR-07`, `FR-08` | `AC-05`-`AC-07` (Resolution Gate UI alert callout) | `UI-WFLOW-01` | UI | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| `FR-01`-`FR-05` | `AC-01`-`AC-04` (End-to-End Actions Taken creation & view flow) | `E2E-ACT-01` | E2E | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| `FR-06`-`FR-08` | `AC-05`-`AC-07` (End-to-End Ticket Resolution Gate workflow) | `E2E-WFLOW-01` | E2E | `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| `FR-10`-`FR-14` | `AC-08`-`AC-10` (End-to-End Dashboards & drill-down flow) | `E2E-DASH-01` | E2E | `e2e/lab-04/dashboards.spec.ts` | Passed |
| `FR-16` | `AC-12` (Complete Labs 1–3 Regression Suite) | `E2E-REG-01` | Regression | `e2e/lab-04/regression-full.spec.ts` | Passed |

---

## 3. Server API & Integration Test Specification (`server/tests/lab-04/`)

### 3.1. Actions Taken API Tests (`server/tests/lab-04/actions-taken.api.test.ts`)
* **`API-ACT-01` Valid Action Creation**: Post valid description, result, and `followUpRequired: false` as IT Staff. Verify HTTP 201 Created and `performedBy` automatically populated with actor ID.
* **`API-ACT-02` Validation Failures**: Post missing description, missing result, or `followUpRequired: true` without `followUpNote`. Expect HTTP 400 Bad Request with error code `MISSING_FOLLOWUP_NOTE`.
* **`API-ACT-03` Requester Read-Only Access**: Authenticate as ticket Requester. Execute `GET /api/tickets/:id/actions-taken`. Expect HTTP 200 OK with list of Actions Taken for owned ticket.
* **`API-ACT-04` Requester Creation Blocked**: Authenticate as Requester. Execute `POST /api/tickets/:id/actions-taken`. Expect HTTP 403 Forbidden.
* **`API-ACT-05` Action Updating**: Execute `PATCH /api/tickets/:id/actions-taken/:actionId` as IT Staff. Verify updated fields in database.

### 3.2. Ticket Workflow & Resolution Gate Tests (`server/tests/lab-04/ticket-workflow.api.test.ts`)
* **`API-WFLOW-01` Resolution Gate: Zero Actions Taken**: IT Staff attempts `PATCH /api/staff/tickets/:id` with `status: "RESOLVED"` on ticket with 0 `ActionTaken` rows. Expect HTTP 400 Bad Request with error code `RESOLUTION_GATE_FAILED`.
* **`API-WFLOW-02` Resolution Gate: Missing Resolution Summary**: IT Staff attempts to set `status: "RESOLVED"` with 1 `ActionTaken` but empty `resolutionSummary`. Expect HTTP 400 Bad Request (`RESOLUTION_GATE_FAILED`).
* **`API-WFLOW-03` Resolution Gate: Successful Resolution**: IT Staff provides `resolutionSummary` and ticket has >=1 `ActionTaken`. Verify status updates to `RESOLVED` with HTTP 200.
* **`API-WFLOW-04` Permitted Transition Matrix**: Validate allowed vs disallowed status jumps (e.g. `NEW` -> `OPEN` allowed; `CANCELLED` -> `OPEN` disallowed).
* **`API-WFLOW-05` Stale Update Concurrency Conflict**: Submit `PATCH /api/staff/tickets/:id` with outdated `expectedUpdatedAt`. Expect HTTP 409 Conflict with code `STALE_UPDATE_CONFLICT`.

### 3.3. Requester Dashboard API Tests (`server/tests/lab-04/requester-dashboard.api.test.ts`)
* **`API-DASH-01` Requester Dashboard Metrics**: Authenticate as Requester. Call `GET /api/requester/dashboard`. Verify returned metric counts (`openTickets`, `inProgress`, `resolved`, `closed`) match database records for that user.
* **`API-DASH-02` Ownership Boundary Guard**: Verify Requester A receives counts and recent tickets belonging ONLY to Requester A.

### 3.4. Staff Dashboard API Tests (`server/tests/lab-04/staff-dashboard.api.test.ts`)
* **`API-DASH-03` IT Staff Operational Metrics**: Call `GET /api/staff/dashboard` as IT Staff. Verify `newTickets`, `openTickets`, `inProgress`, `waitingForRequester`, `myAssigned`, and `unassignedTickets` counts.
* **`API-DASH-04` Admin System User Metrics**: Call `GET /api/staff/dashboard` as Administrator. Verify `totalUsers` and `activeUsers` included in response.
* **`API-DASH-05` Requester Blocked**: Call `GET /api/staff/dashboard` as Requester. Expect HTTP 403 Forbidden.

---

## 4. Client UI Component Test Specification (`client/tests/lab-04/`)

### 4.1. Staff Dashboard Screen (`StaffDashboard.test.tsx`)
* **`UI-DASH-01` Operational Cards & Drill-down**: Render `StaffDashboard`. Verify 5 metric cards render correct numeric counts. Simulate click on `New` metric card; verify navigation to `/staff-queue?status=NEW`.

### 4.2. Requester Dashboard Screen (`RequesterDashboard.tsx`)
* **`UI-DASH-02` Requester Summary & Quick Actions**: Render `RequesterDashboard`. Verify 4 metric cards render. Simulate click on `+ Create Ticket`; verify navigation to ticket creation route.

### 4.3. Actions Taken Section (`ActionsTaken.test.tsx`)
* **`UI-ACT-01` Form Validation & Role Visibility**: Render Actions Taken component. Test toggling `followUpRequired` checkbox opens required `followUpNote` field. Render component as Requester; verify "+ Add Action Taken" button is completely hidden.

### 4.4. Ticket Resolution Feedback (`TicketWorkflow.test.tsx`)
* **`UI-WFLOW-01` Resolution Gate Callout**: Render Ticket Detail status dropdown with 0 Actions Taken. Select `RESOLVED`. Verify Zen Green warning banner `"Resolution Gate: At least one Action Taken must be recorded..."` is rendered and save button is disabled.

---

## 5. End-to-End (E2E) Test Specification (`e2e/lab-04/`)

### 5.1. Actions Taken Recording Flow (`e2e/lab-04/actions-taken-flow.spec.ts`)
* **`E2E-ACT-01` Complete Actions Taken Lifecycle**:
  1. Log in as IT Staff (`michael@toktickit.com`).
  2. Open an assigned ticket. Click "+ Add Action Taken".
  3. Enter Action Description (`"Inspected hardware"`), Result (`"Bad RAM module"`), check Follow-Up Required, and enter Follow-Up Note. Submit form.
  4. Verify Action Taken card appears in list with correct date, performer, description, result, and amber follow-up badge.
  5. Log out. Log in as ticket Requester.
  6. Open same ticket. Verify Actions Taken entry is visible in read-only format with no edit/create controls.

### 5.2. Ticket Resolution Workflow (`e2e/lab-04/ticket-resolution.spec.ts`)
* **`E2E-WFLOW-01` Resolution Gate Enforcement & Closure**:
  1. Log in as IT Staff. Open a new ticket with 0 Actions Taken.
  2. Attempt to select status `RESOLVED`. Observe Resolution Gate warning alert blocking submission.
  3. Add an Action Taken record.
  4. Provide a valid `resolutionSummary`. Click "Save Workflow".
  5. Verify ticket status successfully transitions to `RESOLVED` and summary status badge refreshes in header.

### 5.3. Role Dashboards & Drill-down (`e2e/lab-04/dashboards.spec.ts`)
* **`E2E-DASH-01` Staff & Requester Dashboard Drill-down**:
  1. Log in as Requester. Verify Requester Dashboard displays open ticket counts. Click "In Progress" card; verify redirect to filtered ticket list.
  2. Log in as IT Staff. Verify Staff Dashboard displays operational queue counts. Click "My Assigned" card; verify redirect to queue pre-filtered for current user.

---

## 6. Required Repository Increment Structure

```
docs/lab-04/
├── specification.md
├── tests.md
├── ui-spec.md
├── api-spec.md
├── reviewer.md
└── ai-use.md

server/tests/lab-04/
├── actions-taken.api.test.ts
├── ticket-workflow.api.test.ts
├── requester-dashboard.api.test.ts
└── staff-dashboard.api.test.ts

client/.../lab-04 tests/
├── StaffDashboard.test.tsx
├── RequesterDashboard.test.tsx
├── ActionsTaken.test.tsx
└── TicketWorkflow.test.tsx

e2e/lab-04/
├── actions-taken-flow.spec.ts
├── ticket-resolution.spec.ts
└── dashboards.spec.ts
```
