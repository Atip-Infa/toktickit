# TokTickIT Lab 4 Engineering Specification (`specification.md`)

## 1. Sprint Goal

Deliver the complete operational service-desk workflow by introducing IT Staff Actions Taken tracking, backend-enforced Ticket resolution gates and status transition rules, role-appropriate operational dashboards for Requesters and IT Staff/Administrators, optimistic concurrency control for stale update protection, and full visual and accessibility hardening under the Zen Green design system while preserving 100% regression compatibility with Lab 1–3 features.

## 2. Stakeholder Request

"The service desk can now receive Tickets and IT Staff can communicate with Requesters, but we still need a reliable way to plan and track the actual work. Add Actions Taken under each Ticket. Each action should contain Action Date/Time, Action Description, Result, Performed by (auto), Follow-Up Required?, Follow-up Note (required when follow-up is needed), Attachment Notes (what file to look for images etc.)

The primary Ticket Owner remains responsible for coordinating the Ticket as a whole. Requesters may continue to indicate that the problem appears resolved, but IT Staff must review the work and formally update the Ticket.

Add useful dashboards for Requesters and IT Staff, but keep them concise and connected to the detailed screens. Finally, polish and harden the complete application so that all earlier features continue to work consistently under the Zen Green design language."

---

## 3. Scope

### 3.1. Included Work

* **Actions Taken Sub-Resource**:
  * Parent-child data relationship where a single Ticket contains zero, one, or multiple Action Taken records.
  * Fields: `actionDate` (datetime, auto/editable default now), `description` (text, required), `result` (text, required), `performedById` (User ID, auto-populated from authenticated actor), `followUpRequired` (boolean), `followUpNote` (text, conditionally required when `followUpRequired = true`), `attachmentNotes` (string, optional description of referenced attachments).
  * Creation and editing restricted to IT Staff and Administrator roles. Read-only access for ticket Requesters.
* **Ticket Status Transition & Resolution Enforcement**:
  * Strict enforcement of the 8-status ticket lifecycle (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
  * Backend Resolution Gate: Transitioning a ticket status to `RESOLVED` or `CLOSED` requires both a non-empty `resolutionSummary` AND at least one recorded `ActionTaken` entry under that ticket.
  * Requester "Problem Appears Resolved" indication remains advisory (posts a Public Comment) and does not directly alter ticket status.
* **Role-Appropriate Operational Dashboards**:
  * **Requester Dashboard**: Key performance summary displaying owned ticket status counts (`My Open Tickets`, `In Progress`, `Resolved`, `Closed`), 5 most recently updated owned tickets with status badges, and quick action shortcuts (`Create Ticket`, `View My Tickets`).
  * **IT Staff Dashboard**: Operational summary displaying queue metric cards (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`), 5 most recently updated assigned tickets, quick stats (`Unassigned Tickets`), and quick action shortcuts (`Create Ticket`, `Search Tickets`, `My Queue`).
  * **Administrator Dashboard**: Reuses the IT Staff operational dashboard layout and includes system user-account counters (`Total Users`, `Active Users`).
  * Authoritative backend metrics calculation with drill-down link parameters connecting each metric card directly to pre-filtered queue views.
* **Concurrency & Conflict Safeguards**:
  * Optimistic locking and stale update prevention via `updatedAt` timestamp validation on ticket workflow updates (`PATCH /api/staff/tickets/:id`).
* **Database Evolution & Idempotent Seeding**:
  * New `actions_taken` database table in Prisma schema with foreign key relations and indexes.
  * Idempotent seed data providing realistic tickets across all statuses, varying numbers of Actions Taken (0, 1, and >1), and non-zero/zero dashboard scenarios.
* **Zen Green UI Extensions, Accessibility & Hardening**:
  * Role-aware top navigation incorporating "Dashboard" tabs.
  * Responsive views for Desktop (>= 1024px), Tablet (768px–1023px), and Mobile (< 768px).
  * High-contrast focus rings, WCAG 2.1 AA compliance, keyboard navigation, and zero horizontal overflow.

### 3.2. Explicitly Excluded Work

* Automatic SLA timer clocks, escalation engines, on-call scheduling, or breach alerts.
* External notifications via Email, SMS, LINE, or Push services.
* Inventory, spare parts management, purchasing, or service cost accounting.
* Time-sheet billing, payroll, or labor-cost calculations.
* Multi-level approval workflows or electronic signature capture.
* Advanced BI custom report builders or external data warehouse exports.
* Multi-tenant organization isolation or cloud deployment orchestration.
* New unapproved features outside Sprint 4 scope.

---

## 4. Functional Requirements

### 4.1. Actions Taken Management
* **FR-01**: IT Staff and Administrators MUST be able to view, record, and edit Actions Taken on any accessible ticket.
* **FR-02**: The system MUST automatically assign the `performedById` field to the authenticated IT Staff or Administrator user creating the Action Taken.
* **FR-03**: The system MUST enforce that `description` and `result` fields are non-empty for every Action Taken record.
* **FR-04**: The system MUST require a non-empty `followUpNote` whenever `followUpRequired` is set to `true`. If `followUpRequired` is `false`, `followUpNote` MUST be cleared or set to null.
* **FR-05**: Requesters MUST be able to view Actions Taken records for tickets they own, but MUST NOT be permitted to create, edit, or delete Action Taken entries.

### 4.2. Ticket Resolution & Workflow Rules
* **FR-06**: The system MUST enforce permitted ticket status transitions according to the status transition matrix on the backend.
* **FR-07**: The system MUST reject any status transition to `RESOLVED` or `CLOSED` if the ticket does not have a non-empty `resolutionSummary`.
* **FR-08**: The system MUST reject any status transition to `RESOLVED` or `CLOSED` if the ticket has zero (`0`) associated `ActionTaken` records, returning HTTP 400 with `RESOLUTION_GATE_FAILED`.
* **FR-09**: The system MUST maintain Requester "Problem Appears Resolved" actions as advisory communications (creating a Public Comment) without directly mutating the ticket status to `RESOLVED` or `CLOSED`.

### 4.3. Dashboards & Metric Summaries
* **FR-10**: The system MUST provide a `GET /api/requester/dashboard` endpoint returning metric counts (`openTickets`, `inProgress`, `resolved`, `closed`) and the 5 most recently updated tickets owned exclusively by the authenticated Requester.
* **FR-11**: The system MUST provide a `GET /api/staff/dashboard` endpoint returning operational metrics (`newTickets`, `openTickets`, `inProgress`, `waitingForRequester`, `myAssigned`), quick stats (`unassignedTickets`), and recent assigned tickets for authenticated IT Staff and Administrators.
* **FR-12**: For Administrators, the system MUST include system user metrics (`totalUsers`, `activeUsers`) in the dashboard summary payload.
* **FR-13**: All dashboard metrics MUST be computed server-side directly from database records and return `0` with empty arrays `[]` when no matching records exist.
* **FR-14**: Each dashboard metric card in the UI MUST provide an interactive drill-down action navigating to the corresponding pre-filtered ticket queue.

### 4.4. Concurrency & Regression Hardening
* **FR-15**: The system MUST detect concurrent/stale updates on ticket workflow modifications using `expectedUpdatedAt` timestamps, returning HTTP 409 Conflict when stale.
* **FR-16**: The system MUST preserve all existing Lab 1–3 functionality including authentication, mandatory password changes, Requester ticket creation, attachments, Public Comments, Internal Notes, and Administrator user management.

---

## 5. Business Rules

### 5.1. Actions Taken Rules
* **BR-01**: Every `ActionTaken` record MUST belong to exactly one `Ticket`.
* **BR-02**: While a `Ticket` has one primary Owner (`ownerId`), any active `IT_STAFF` or `ADMINISTRATOR` user may perform and log an `ActionTaken` under that ticket.
* **BR-03**: Requesters have read-only visibility into `ActionTaken` records on tickets where `requesterId` matches their authenticated user ID. Requesters CANNOT create, update, or delete Actions Taken.
* **BR-04**: `ActionTaken` Validation Rules:
  * `description`: Required, trimmed length 1–2,000 characters.
  * `result`: Required, trimmed length 1–1,000 characters.
  * `performedById`: Auto-assigned to authenticated user ID. Cannot be spoofed via request body.
  * `followUpRequired`: Boolean (default `false`).
  * `followUpNote`: Required non-empty string (max 1,000 chars) when `followUpRequired = true`. Must be `null` or empty when `followUpRequired = false`.
  * `attachmentNotes`: Optional string (max 500 chars) describing referenced image or document attachments.
* **BR-05**: Inactive user accounts (`isActive = false`) CANNOT perform or be recorded as performing Actions Taken.

### 5.2. Ticket Status & Resolution Gate Rules
* **BR-06**: Permitted statuses in Lab 4 remain: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`.
* **BR-07**: Resolution Gate: A ticket CANNOT transition to `RESOLVED` or `CLOSED` unless:
  1. `resolutionSummary` is non-null and contains non-whitespace text.
  2. At least one `ActionTaken` record is attached to the ticket (`COUNT(ActionTaken) >= 1`).
  Attempting resolution without meeting both conditions MUST return HTTP 400 Bad Request with error code `RESOLUTION_GATE_FAILED`.
* **BR-08**: Requester indication that the problem appears resolved is purely advisory. It creates a Public Comment requesting review and does NOT mutate ticket status.

### 5.3. Status Transition Matrix

| Current Status | Allowed Target Statuses | Authorized Roles | Prerequisites / Rules |
| :--- | :--- | :--- | :--- |
| `NEW` | `OPEN`, `IN_PROGRESS`, `CANCELLED` | IT Staff, Admin | Claiming sets ownerId |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Admin | |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | `RESOLVED` requires resolutionSummary + >=1 Action Taken |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | `RESOLVED` requires resolutionSummary + >=1 Action Taken |
| `RESOLVED` | `CLOSED`, `REOPENED` | IT Staff, Admin | `CLOSED` requires resolutionSummary + >=1 Action Taken |
| `CLOSED` | `REOPENED` | IT Staff, Admin | Closed tickets can be reopened |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED` | IT Staff, Admin | `RESOLVED` requires resolutionSummary + >=1 Action Taken |
| `CANCELLED` | *None (Terminal)* | None | Terminal state; no transitions permitted |

### 5.4. Dashboard Calculation Rules
* **BR-09**: **Requester Dashboard Metrics**:
  * `openTickets`: `COUNT(Ticket)` WHERE `requesterId = currentUser.id` AND `status IN ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'REOPENED')`.
  * `inProgress`: `COUNT(Ticket)` WHERE `requesterId = currentUser.id` AND `status = 'IN_PROGRESS'`.
  * `resolved`: `COUNT(Ticket)` WHERE `requesterId = currentUser.id` AND `status = 'RESOLVED'`.
  * `closed`: `COUNT(Ticket)` WHERE `requesterId = currentUser.id` AND `status = 'CLOSED'`.
  * `recentTickets`: Up to 5 tickets WHERE `requesterId = currentUser.id`, ORDER BY `updatedAt DESC`.
* **BR-10**: **IT Staff Dashboard Metrics**:
  * `newTickets`: `COUNT(Ticket)` WHERE `status = 'NEW'`.
  * `openTickets`: `COUNT(Ticket)` WHERE `status = 'OPEN'`.
  * `inProgress`: `COUNT(Ticket)` WHERE `status = 'IN_PROGRESS'`.
  * `waitingForRequester`: `COUNT(Ticket)` WHERE `status = 'WAITING_FOR_REQUESTER'`.
  * `myAssigned`: `COUNT(Ticket)` WHERE `ownerId = currentUser.id` AND `status NOT IN ('CLOSED', 'CANCELLED')`.
  * `unassignedTickets`: `COUNT(Ticket)` WHERE `ownerId IS NULL` AND `status NOT IN ('CLOSED', 'CANCELLED')`.
  * `recentTickets`: Up to 5 tickets WHERE `ownerId = currentUser.id`, ORDER BY `updatedAt DESC`.
* **BR-11**: **Administrator Dashboard Metrics**:
  * Includes all IT Staff Dashboard metrics plus:
    * `totalUsers`: `COUNT(User)`.
    * `activeUsers`: `COUNT(User)` WHERE `isActive = true`.

### 5.5. Authorization Matrix (Labs 1–4)

| Endpoint / Resource | Method | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: | :---: |
| `POST /api/auth/login` | POST | Public | Public | Public |
| `POST /api/auth/logout` | POST | Authenticated | Authenticated | Authenticated |
| `GET /api/auth/me` | GET | Authenticated | Authenticated | Authenticated |
| `POST /api/auth/change-password` | POST | Authenticated | Authenticated | Authenticated |
| `GET /api/requester/dashboard` | GET | **Permitted (Own)** | Denied (403) | Denied (403) |
| `GET /api/staff/dashboard` | GET | Denied (403) | **Permitted** | **Permitted** |
| `GET /api/tickets` | GET | Permitted (Own) | Denied (403) | Denied (403) |
| `POST /api/tickets` | POST | Permitted | Denied (403) | Denied (403) |
| `GET /api/tickets/:id` | GET | Permitted (Own) | Permitted | Permitted |
| `GET /api/tickets/:id/actions-taken` | GET | **Permitted (Own)** | **Permitted** | **Permitted** |
| `POST /api/tickets/:id/actions-taken` | POST | **Denied (403)** | **Permitted** | **Permitted** |
| `PATCH /api/tickets/:id/actions-taken/:actionId` | PATCH | **Denied (403)** | **Permitted** | **Permitted** |
| `GET /api/staff/tickets` | GET | Denied (403) | Permitted | Permitted |
| `PATCH /api/staff/tickets/:id` | PATCH | Denied (403) | Permitted | Permitted |
| `GET /api/tickets/:id/public-comments` | GET | Permitted (Own) | Permitted | Permitted |
| `POST /api/tickets/:id/public-comments` | POST | Permitted (Own) | Permitted | Permitted |
| `GET /api/tickets/:id/internal-notes` | GET | Denied (403) | Permitted | Permitted |
| `POST /api/tickets/:id/internal-notes` | POST | Denied (403) | Permitted | Permitted |
| `GET /api/admin/users` | GET | Denied (403) | Denied (403) | Permitted |
| `POST /api/admin/users` | POST | Denied (403) | Denied (403) | Permitted |
| `PATCH /api/admin/users/:id` | PATCH | Denied (403) | Denied (403) | Permitted |
| `POST /api/admin/users/:id/reset-password` | POST | Denied (403) | Denied (403) | Permitted |

### 5.6. Concurrency Safeguards
* **BR-12**: Requests to `PATCH /api/staff/tickets/:id` MUST supply an optional or required `expectedUpdatedAt` string timestamp. If `expectedUpdatedAt` is provided and does not match the ticket's current `updatedAt` in the database, the server MUST return HTTP 409 Conflict with code `STALE_UPDATE_CONFLICT`.

---

## 6. Data Changes & Migration

### 6.1. Schema Changes (`server/prisma/schema.prisma`)

```prisma
model ActionTaken {
  id               Int      @id @default(autoincrement())
  ticketId         Int
  actionDate       DateTime @default(now())
  description      String   @db.Text
  result           String   @db.Text
  performedById    Int
  followUpRequired Boolean  @default(false)
  followUpNote     String?  @db.Text
  attachmentNotes  String?  @db.VarChar(500)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  ticket           Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedBy      User     @relation("ActionTakenPerformedBy", fields: [performedById], references: [id])

  @@index([ticketId, actionDate])
  @@index([performedById])
  @@map("actions_taken")
}
```

Updated relationships in existing models:
* `User`: Add `actionsTaken ActionTaken[] @relation("ActionTakenPerformedBy")`.
* `Ticket`: Add `actionsTaken ActionTaken[]`.

### 6.2. Migration & Backfill Strategy
* Create migration file `prisma/migrations/<timestamp>_add_actions_taken/migration.sql`.
* Existing legacy tickets created in Lab 1–3 will remain valid with `0` associated `ActionTaken` rows.
* Legacy tickets in active statuses (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `REOPENED`) can continue normal operations, but will be subject to the Resolution Gate when transitioned to `RESOLVED` or `CLOSED`.

### 6.3. Seed Data Strategy (`server/prisma/seed.ts`)
* Idempotent seed script safe for repeated execution.
* Seed seed tickets with 0, 1, and >1 Actions Taken entries.
* Includes actions performed by different IT Staff members on tickets owned by others.
* Ensures non-zero and zero metric scenarios for both Requester and IT Staff dashboards.

---

## 7. API Contract Summary

Refer to `docs/lab-04/api-spec.md` for full request/response schemas.

* `GET /api/requester/dashboard` - Returns Requester metric counts and recent tickets.
* `GET /api/staff/dashboard` - Returns IT Staff operational counts, recent assigned tickets, and quick stats.
* `GET /api/tickets/:id/actions-taken` - Returns chronological list of Actions Taken for a ticket.
* `POST /api/tickets/:id/actions-taken` - Creates new Action Taken entry (IT Staff / Admin only).
* `PATCH /api/tickets/:id/actions-taken/:actionId` - Updates existing Action Taken entry (IT Staff / Admin only).
* `PATCH /api/staff/tickets/:id` - Updated with Resolution Gate and `expectedUpdatedAt` concurrency check.

---

## 8. UI Specification Summary

Refer to `docs/lab-04/ui-spec.md` for complete screen wireframes and responsive layouts.

* **Top Navigation (`AppHeader.tsx`)**: Updated to include "Dashboard" tab for all roles, navigating to `/requester-dashboard` or `/staff-dashboard`.
* **Requester Dashboard View**: Metric cards for open/in-progress/resolved/closed tickets with direct drill-down links to `MyTicketsView`.
* **IT Staff Dashboard View**: Metric cards for New/Open/In Progress/Waiting/My Assigned with drill-down filters to `StaffTicketQueueView`.
* **Actions Taken Component**: Embedded in Ticket Detail view; list/table of logged actions with create/edit modal for IT Staff and read-only view for Requesters.
* **Resolution Gate Alert**: Warning notification on ticket detail when attempting to resolve a ticket with 0 Actions Taken or missing summary.

---

## 9. Acceptance Criteria

* **AC-01**: Given an authenticated IT Staff user, when valid Action Taken data (`description`, `result`, `followUpRequired: false`) is submitted, then the record is saved with `performedById` set to the authenticated user ID and returns 201 Created.
* **AC-02**: Given an IT Staff user, when `followUpRequired` is `true` but `followUpNote` is empty, then creation fails with HTTP 400 Bad Request.
* **AC-03**: Given an authenticated Requester, when viewing owned ticket details, then Actions Taken entries are displayed in read-only mode with no create or edit buttons.
* **AC-04**: Given an authenticated Requester, when requesting `POST /api/tickets/:id/actions-taken`, then the server rejects the request with HTTP 403 Forbidden.
* **AC-05**: Given an IT Staff user, when attempting to transition a ticket to `RESOLVED` without any `ActionTaken` records, then the server rejects the request with HTTP 400 Bad Request (`RESOLUTION_GATE_FAILED`).
* **AC-06**: Given an IT Staff user, when attempting to transition a ticket to `RESOLVED` without a `resolutionSummary`, then the server rejects the request with HTTP 400 Bad Request (`RESOLUTION_GATE_FAILED`).
* **AC-07**: Given an IT Staff user, when at least one `ActionTaken` exists and `resolutionSummary` is provided, then the status updates to `RESOLVED` successfully.
* **AC-08**: Given an authenticated Requester, when accessing `GET /api/requester/dashboard`, then only metrics and recent tickets belonging to that Requester are returned.
* **AC-09**: Given an authenticated IT Staff user, when accessing `GET /api/staff/dashboard`, then queue metric counts (`newTickets`, `openTickets`, etc.) matching authoritative database counts are returned.
* **AC-10**: Given an IT Staff user on the dashboard, when clicking the "New" metric card, then the app navigates to the Ticket Queue with status pre-filtered to `NEW`.
* **AC-11**: Given two IT Staff members attempting to update the same ticket status concurrently, when the second request supplies a stale `expectedUpdatedAt`, then the server returns HTTP 409 Conflict (`STALE_UPDATE_CONFLICT`).
* **AC-12**: Given all existing Lab 1–3 endpoints and screens, when Lab 4 features are deployed, all authentication, password reset, queue filtering, comments, notes, attachments, and user administration continue to operate without regression.

---

## 10. Product Definition of Done

- [ ] Prisma schema updated with `ActionTaken` model and relations.
- [ ] Database migration file generated and applied cleanly.
- [ ] Seed script updated with realistic tickets, varying Actions Taken counts, and zero/non-zero metric data.
- [ ] REST API endpoints implemented and verified (`actions-taken`, `requester/dashboard`, `staff/dashboard`, resolution gate in `staff/tickets`).
- [ ] Requester and IT Staff Dashboard components built and styled with Zen Green theme.
- [ ] Actions Taken UI component built with create/edit modes for staff and read-only view for requesters.
- [ ] Resolution Gate UI guidance integrated into ticket detail view.
- [ ] All automated unit, API, UI component, and Playwright E2E tests passing with 100% success.
- [ ] Zero visual clipping, element overlap, or horizontal scrollbars across desktop, tablet, and mobile breakpoints.
- [ ] WCAG 2.1 AA accessibility standards verified (contrast, keyboard focus, ARIA labels).

---

## 11. Assumptions and Architectural Decisions

1. **Actions Taken Performer vs. Ticket Owner**: `performedById` records the specific staff member who performed the physical work. This may differ from `ownerId` (the primary coordinating staff member).
2. **Resolution Gate Enforcement**: Resolution rules are enforced server-side inside `PATCH /api/staff/tickets/:id`. Client UI validation is provided for immediate user feedback, but backend remains the authoritative gatekeeper.
3. **Dashboard Storage**: Dashboard metrics are calculated dynamically using Prisma `count()` aggregates to eliminate data sync issues and ensure real-time accuracy.
