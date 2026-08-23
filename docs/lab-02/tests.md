# Lab 2 Test Plan and Results: TokTickIT Requester Ticketing MVP

## 1. Test Strategy

This document outlines the Test-Driven Development (TDD) and Spec-Driven Development (Spec-DD) strategy for Sprint 2. All automated tests are planned directly from `specification.md`, `ui-spec.md`, and `api-spec.md` prior to application implementation. 

### 1.1 Test Levels & Coverage Framework
- **Unit Tests**: Test isolated helper functions, generator utilities (e.g., Ticket Number generator), formatters, and data transformation functions.
- **API / Integration Tests**: Test Express.js API endpoints using Vitest & Supertest against an active test PostgreSQL database. Verifies HTTP status codes, request validation, response payloads, database state changes, and ownership isolation.
- **UI Component Tests**: Test React component rendering, user interactions, form validation displays, loading indicators, and component state using React Testing Library & Vitest.
- **UI Style & Responsive Tests**: Assert presence of Zen Green CSS design tokens, badge visual classes, control states, and responsive layout behavior across Desktop, Tablet, and Mobile viewports.
- **End-to-End (E2E) Tests**: Execute multi-step user workflows in headless Chromium via Playwright, capturing screenshot evidence across all key user flows.

---

## 2. Planned Tests Table

| Test ID | Level | Requirement / AC | What It Tests | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-01** | Unit | BR-01 | Ticket number format generator | Returns string matching `TKT-YYYY-XXXXXX` | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **UNIT-02** | Unit | BR-12, BR-13 | File attachment MIME and 5MB size validator | Returns boolean validation outcome | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-01** | API | AC-01, FR-04 | Create valid ticket via POST `/api/tickets` | HTTP 201 Created; returns saved ticket with generated `ticketNumber` and `status = NEW` | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **API-02** | API | AC-04, BR-08 | Submit POST `/api/tickets` with missing Summary / Description | HTTP 400 Bad Request; returns validation error array specifying invalid fields | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **API-03** | API | AC-01, BR-09 | Submit POST `/api/tickets` with invalid `categoryId` | HTTP 400 Bad Request; error message indicates category not found | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| **API-04** | API | AC-10, FR-06 | GET `/api/tickets` for owned tickets | HTTP 200 OK; returns array of tickets where `requesterId == caller` | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **API-05** | API | AC-10, FR-07 | GET `/api/tickets` with search string query `?search=Laptop` | HTTP 200 OK; returns only tickets where `ticketNumber` or `summary` contains "Laptop" | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **API-06** | API | AC-10, FR-08 | GET `/api/tickets` with category & priority filters | HTTP 200 OK; returns tickets filtered additively by `categoryId` and `requestedPriority` | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **API-07** | API | FR-09, BR-19 | GET `/api/tickets` default sorting | HTTP 200 OK; tickets sorted by `createdAt` in descending order | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **API-08** | API | FR-10, BR-20 | GET `/api/tickets` pagination params `?page=2&pageSize=5` | HTTP 200 OK; returns page 2 items with total count and page metadata | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| **API-09** | API | AC-03, BR-06 | GET `/api/tickets/:id` for ticket owned by another Requester | HTTP 403 Forbidden; ticket data payload is withheld | `server/tests/lab-02/ticket-detail.api.test.ts` | Planned |
| **API-10** | API | FR-11 | GET `/api/tickets/:id` for owned ticket | HTTP 200 OK; returns complete read-only ticket details and attachment metadata | `server/tests/lab-02/ticket-detail.api.test.ts` | Planned |
| **API-11** | API | AC-05, BR-12 | POST `/api/tickets/:id/attachments` with unpermitted file (`.exe`) | HTTP 415 Unsupported Media Type; upload rejected | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-12** | API | AC-06, BR-13 | POST `/api/tickets/:id/attachments` with 6 MB file | HTTP 413 Payload Too Large; upload rejected | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-13** | API | AC-07, BR-14 | POST `/api/tickets/:id/attachments` when 5 active attachments exist | HTTP 422 Unprocessable Entity; error quota exceeded | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-14** | API | AC-08, BR-15 | PATCH `/api/attachments/:id/remove` with valid removal reason | HTTP 200 OK; sets `isRemoved = true`, records `removedAt` & `removalReason` | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-15** | API | AC-08, BR-16 | PATCH `/api/attachments/:id/remove` without removal reason | HTTP 400 Bad Request; removal rejected due to missing reason | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-16** | API | AC-09, BR-17 | GET `/api/attachments/:id/download` for soft-removed attachment | HTTP 403 Forbidden; download file stream blocked | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **API-17** | API | FR-14 | GET `/api/attachments/:id/download` for active owned attachment | HTTP 200 OK; streams file binary with correct `Content-Disposition` | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| **UI-01** | UI | FR-01, AC-13 | Dev Requester Selection screen render | Dropdown contains active requesters only; inactive excluded | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| **UI-02** | UI | AC-04, BR-08 | Create Ticket submit with empty fields | Field-level validation messages render below controls; submit API not called | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| **UI-03** | UI | BR-10 | Create Ticket form busy state during submit | Submit button displays loading spinner and disables during API flight | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| **UI-04** | UI | AC-12, BR-11 | Create Ticket API error response recovery | Zen Green error alert displays; form values & attached files preserved | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| **UI-05** | UI | FR-06, AC-10 | My Tickets search input typing | Ticket list updates dynamically to match search input | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| **UI-06** | UI | FR-08 | My Tickets filter selection & Clear Filters action | Filtering updates table; clicking Clear Filters resets controls & list | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| **UI-07** | UI | AC-11, BR-05 | Switch Development Requester identity in header | Current ticket list clears; fetches tickets for newly selected Requester | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| **UI-08** | UI | FR-11 | Ticket Detail read-only layout render | Header fields render read-only; no comment/staff controls rendered | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Planned |
| **UI-09** | UI | AC-08, BR-16 | Soft removal modal confirmation & reason validation | Confirm button disabled until reason entered; submits PATCH on confirm | `client/tests/lab-02/AttachmentSection.test.tsx` | Planned |
| **UI-10** | UI | AC-08, BR-17 | Soft-removed attachment list rendering | Displays "Removed" badge; download button disabled; reason visible | `client/tests/lab-02/AttachmentSection.test.tsx` | Planned |
| **E2E-01** | E2E | AC-01, AC-08, AC-10 | Complete Requester ticket flow | Select requester -> create ticket -> view list -> filter -> view detail -> soft-remove attachment | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |
| **E2E-02** | E2E | AC-03 | Cross-requester ticket URL access rejection | Direct navigation to unowned ticket URL renders access denied message | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Primary Business Rule | Verifying Test ID(s) | Automated Test File Path |
| :--- | :--- | :--- | :--- |
| **AC-01** (Successful Ticket Creation) | BR-01, BR-02 | API-01, UI-03, E2E-01 | `server/tests/lab-02/create-ticket.api.test.ts`, `e2e/lab-02/requester-ticket-flow.spec.ts` |
| **AC-02** (Unselected Requester Redirect) | BR-03 | UI-01, E2E-01 | `client/tests/lab-02/CreateTicket.test.tsx`, `e2e/lab-02/requester-ticket-flow.spec.ts` |
| **AC-03** (Cross-Requester Isolation) | BR-06 | API-09, E2E-02 | `server/tests/lab-02/ticket-detail.api.test.ts`, `e2e/lab-02/requester-ticket-flow.spec.ts` |
| **AC-04** (Mandatory Field Validation) | BR-08 | API-02, UI-02 | `server/tests/lab-02/create-ticket.api.test.ts`, `client/tests/lab-02/CreateTicket.test.tsx` |
| **AC-05** (Unpermitted File Upload Block) | BR-12 | API-11, UNIT-02 | `server/tests/lab-02/attachments.api.test.ts` |
| **AC-06** (Oversized File Upload Block) | BR-13 | API-12, UNIT-02 | `server/tests/lab-02/attachments.api.test.ts` |
| **AC-07** (Max Active Attachments Limit) | BR-14 | API-13 | `server/tests/lab-02/attachments.api.test.ts` |
| **AC-08** (Attachment Soft Removal) | BR-15, BR-16 | API-14, UI-09, UI-10, E2E-01 | `server/tests/lab-02/attachments.api.test.ts`, `client/tests/lab-02/AttachmentSection.test.tsx` |
| **AC-09** (Blocked Download Removed File) | BR-17 | API-16, UI-10 | `server/tests/lab-02/attachments.api.test.ts`, `client/tests/lab-02/AttachmentSection.test.tsx` |
| **AC-10** (My Tickets Search & Filter) | BR-19, BR-21 | API-05, API-06, UI-05, UI-06, E2E-01 | `server/tests/lab-02/my-tickets.api.test.ts`, `client/tests/lab-02/MyTickets.test.tsx` |
| **AC-11** (Requester Switching Context) | BR-05 | UI-07, E2E-01 | `client/tests/lab-02/MyTickets.test.tsx`, `e2e/lab-02/requester-ticket-flow.spec.ts` |
| **AC-12** (Form Data Retention on Failure) | BR-11 | UI-04 | `client/tests/lab-02/CreateTicket.test.tsx` |
| **AC-13** (Inactive Requester Excluded) | BR-04 | UI-01 | `client/tests/lab-02/CreateTicket.test.tsx` |
| **AC-14** (Responsive Layout Adaptation) | Section 8.7 | E2E-01 | `e2e/lab-02/requester-ticket-flow.spec.ts` |
| **AC-15** (Keyboard Accessibility & Focus) | Section 8.3 | UI-02, UI-09 | `client/tests/lab-02/CreateTicket.test.tsx` |

---

## 4. Responsive and Visual Checklist

The following visual and responsive assertions must be checked across Desktop (`1200px`), Tablet (`768px`), and Mobile (`375px`) viewports prior to release:

- [ ] **Color Palette Tokens**: Application header matches Primary Green (`#006B3C`); active links/tabs use Secondary Green (`#0B7A46`); page background quiet light neutral (`#F5F7F6`).
- [ ] **Read-Only vs Editable Fields**: Read-only header fields render with soft gray-green background (`#F0F4F2`); editable form inputs render with clean white background and clear border.
- [ ] **Validation Error Placement**: Field-level validation error messages appear directly below invalid controls in Dark Red (`#991B1B`) with matching red input borders.
- [ ] **Button State Hierarchy**: Primary action buttons use Primary Green with hover states; disabled buttons are visually muted; busy submit button displays animated spinner.
- [ ] **Status & Priority Badges**: Priority and Status badges use standardized Zen Green token colors and maintain non-color readable text labels.
- [ ] **Viewport Stacking & Overflow**: No horizontal page scrolling, text clipping, label wrapping artifacts, or button overlaps occur at 375px mobile width.
- [ ] **Touch Target Sizing**: All interactive buttons, dropdowns, and file upload triggers maintain minimum 44px height for mobile touch friendliness.
- [ ] **Screenshot Evidence**: Automated Playwright screenshot artifacts generated under:
  - `artifacts/lab-02/screenshots/create-ticket/`
  - `artifacts/lab-02/screenshots/my-tickets/`
  - `artifacts/lab-02/screenshots/ticket-detail/`

---

## 5. Test Commands

```bash
# Run server backend API tests
npm --prefix server test -- server/tests/lab-02

# Run client frontend UI component tests
npm --prefix client test -- client/tests/lab-02

# Run End-to-End Playwright test suite
npx playwright test e2e/lab-02

# Execute all Lab 2 automated tests in sequence
npm run test:lab-02
```

---

## 6. Final Results Summary (Target Metrics)

- **Total Planned Automated Tests**: 28 tests across Unit, API, UI, and E2E levels.
- **Target Pass Rate**: 100% (0 failing, 0 skipped, 0 flaky tests).
- **Target Line Coverage**: >= 90% logic coverage on Lab 2 backend controllers, services, and frontend components.

---

## 7. Known Limitations or Deferred Tests
- **Authentication & Security Testing**: Session token validation, password hashing, and role permissions are deferred to Lab 3.
- **IT Staff Queues & Workflow**: Claiming tickets, updating IT Priority, and resolving tickets are deferred to Lab 4.
- **Public Comments & Internal Notes**: Ticket collaboration messaging tests are deferred to Lab 4.
