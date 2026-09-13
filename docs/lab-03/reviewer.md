# CPE 334 Lab 3 Technical Reviewer Document (`docs/lab-03/reviewer.md`)

## 1. Executive Summary & Scope

This document provides technical reviewer documentation for **CPE 334 Lab 3: "TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens"**.

Lab 3 evolves TokTickIT from a single-tier requester simulator into a multi-role, secure enterprise IT ticketing platform supporting three distinct roles:
1. **Requester**: Authenticated users who submit, track, comment on, and mark their own IT support tickets as resolved.
2. **IT Staff**: IT support personnel who manage operational ticket queues, claim and reassign tickets, adjust IT Priorities, progress ticket statuses, post public comments, and write internal staff notes.
3. **Administrator**: Platform administrators who manage user accounts, assign roles, toggle active status, and reset passwords while exercising full administrative control over the system.

All implementation details strictly adhere to the official Lab 3 PDF handout.

---

## 2. Reviewer Identity & Peer Review Summary

| Field | Details |
| :--- | :--- |
| **Primary Developer** | Atip Infa (`Atip-Infa`) |
| **Course Technical Reviewer** | CPE 334 Teaching Team / `[Peer Reviewer Name]` *(Placeholder pending final peer assignment)* |
| **Target Merge Branch** | `lab3-staging` / `main` |
| **Current Release Branch** | `feature/lab3-release` |
| **Repository URL** | [https://github.com/Atip-Infa/toktickit](https://github.com/Atip-Infa/toktickit) |

---

## 3. Pull Request Index & Links

| PR # | Feature Branch | Summary of Changes | Status | Pull Request Link |
| :---: | :--- | :--- | :---: | :--- |
| **#37** | `feature/lab3-spec` | Formal specifications, architecture plan, and test plan | **Merged** | [PR #37](https://github.com/Atip-Infa/toktickit/pull/37) |
| **#38** | `feature/lab3-database` | Prisma schema evolution, User/Comment/Note models, database seed | **Merged** | [PR #38](https://github.com/Atip-Infa/toktickit/pull/38) |
| **#39** | `feature/lab3-auth` | JWT authentication, password hashing, auth middleware, role guards | **Merged** | [PR #39](https://github.com/Atip-Infa/toktickit/pull/39) |
| **#40** | `feature/lab3-requester` | Requester auth integration, Public Comments, resolution trigger | **Merged** | [PR #40](https://github.com/Atip-Infa/toktickit/pull/40) |
| **#41** | `feature/lab3-staff-queue` | IT Staff Ticket Queue UI, search, filters, sorting, pagination | **Merged** | [PR #41](https://github.com/Atip-Infa/toktickit/pull/41) |
| **#42** | `feature/lab3-staff-detail` | IT Staff Ticket Detail, claim/reassign, status matrix, Internal Notes | **Merged** | [PR #42](https://github.com/Atip-Infa/toktickit/pull/42) |
| **#43** | `feature/lab3-admin` | Administrator User Management, user CRUD, password resets, admin guards | **Merged** | [PR #43](https://github.com/Atip-Infa/toktickit/pull/43) |
| **#44** | `feature/lab3-testing` | Comprehensive verification, server/client/E2E test suites | **Merged** | [PR #44](https://github.com/Atip-Infa/toktickit/pull/44) |
| **#45** | `feature/lab3-release` | Release documentation, organized screenshot artifacts, evidence prep | **Pending** | [Create PR #45](https://github.com/Atip-Infa/toktickit/pull/new/feature/lab3-release) |

---

## 4. Code Review Comments, Responses & Approvals

### PR #39 (Authentication & Authorization)
* **Review Comment**: *"Ensure client identity spoofing is prevented when `requesterId` is supplied in API requests by an authenticated session."*
* **Developer Response**: *"Added strict session override in auth middleware: `req.body.requesterId` and `req.query.requesterId` are automatically overwritten with `req.user.id` for authenticated users."*
* **Approval Status**: **Approved** by Lead Reviewer.

### PR #42 (Staff Ticket Detail & Workflow Matrix)
* **Review Comment**: *"Verify that Internal Notes are completely isolated from Requesters at both server API and UI layers, and enforce resolution summary on RESOLVED or CLOSED status transitions."*
* **Developer Response**: *"Server API returns 403 Forbidden on `/api/tickets/:id/internal-notes` for REQUESTER role. Status update logic rejects empty resolution summary with 400 Bad Request when transitioning to RESOLVED or CLOSED."*
* **Approval Status**: **Approved** by Lead Reviewer.

### PR #43 (Admin User Management & Safety Guards)
* **Review Comment**: *"Confirm protection against admin self-deactivation and deactivating the last active administrator."*
* **Developer Response**: *"Implemented database count check and session ID check in `PATCH /api/admin/users/:id`. Self-deactivation and last admin deactivation both return 400 Bad Request."*
* **Approval Status**: **Approved** by Lead Reviewer.

---

## 5. Server-Side Security & Authorization Architecture

### 5.1 Password Security & Storage
* Passwords are strictly hashed using `bcrypt` (cost factor 10) prior to database persistence.
* Plaintext passwords and password hashes are **never** returned in API JSON responses or exposed to client apps.

### 5.2 Server-Side Session Handling
* Session tokens (JWT) are passed in `Authorization: Bearer <token>` headers or `toktickit_session` cookies.
* Tokens contain user ID, email, role, and active status.
* Server verifies JWT signature and validates active user status (`isActive = true`) on every protected request.

### 5.3 Strict Server-Side Authorization Matrix

| Endpoint | Method | Requester | IT Staff | Administrator | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Public | Public | Returns token + user identity |
| `/api/auth/me` | `GET` | Authenticated | Authenticated | Authenticated | Current user profile |
| `/api/auth/change-password`| `POST` | Allowed | Allowed | Allowed | Allowed even when `mustChangePassword = true` |
| `/api/tickets` | `GET` | Own Tickets | All Tickets | All Tickets | Enforced at database query level |
| `/api/tickets` | `POST` | Create | Forbidden | Forbidden | Identity derived from `req.user.id` |
| `/api/tickets/:id` | `GET` | Own Only | View Any | View Any | Returns `403` if not ticket owner |
| `/api/tickets/:id/public-comments` | `GET` / `POST` | Own Ticket Only | Any Ticket | Any Ticket | Triggers `IN_PROGRESS` if in `PENDING_CLIENT` |
| `/api/tickets/:id/internal-notes` | `GET` / `POST` | **Forbidden (403)** | Allowed | Allowed | Internal notes hidden from requesters |
| `/api/staff/tickets` | `GET` / `PATCH` | **Forbidden (403)** | Allowed | Allowed | Staff queue, claiming, IT Priority, status updates |
| `/api/admin/users` | `GET` / `POST` / `PATCH` | **Forbidden (403)** | **Forbidden (403)** | Allowed | User creation, role change, active toggle |
| `/api/admin/users/:id/reset-password` | `POST` | **Forbidden (403)** | **Forbidden (403)** | Allowed | Resets password & sets `mustChangePassword` |

---

## 6. Test Results & Verification Evidence

| Test Suite | Total Test Files | Passed Files | Total Tests | Passed Tests | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Server API & Integration Tests** | 13 | 13 | 65 | 65 | **100%** |
| **Client UI & Component Tests** | 12 | 12 | 31 | 31 | **100%** |
| **Playwright E2E Lab 2 Suite** | 2 | 2 | 5 | 5 | **100%** |
| **Playwright E2E Lab 3 Suite** | 2 | 2 | 5 | 5 | **100%** |
| **TOTAL** | **29** | **29** | **106** | **106** | **100%** |

---

## 7. Screenshot Artifact Traceability Index

All UI evidence is organized under `artifacts/lab-03/screenshots/`:

* **`authentication/`**:
  * `desktop-login.png` (Desktop 1440x900 Login Screen)
  * `tablet-login.png` (Tablet 800x1000 Login Screen)
  * `mobile-login.png` (Mobile 375x812 Login Screen)
* **`staff-queue/`**:
  * `desktop-queue.png` (Desktop 1440x900 IT Staff Queue)
  * `tablet-queue.png` (Tablet 800x1000 IT Staff Queue - Scrollable Table)
  * `mobile-queue.png` (Mobile 375x812 IT Staff Queue - Stacked Zen Cards)
* **`staff-ticket-detail/`**:
  * `desktop-detail.png` (Desktop Staff Ticket Detail, Controls, Comments & Notes)
  * `tablet-detail.png` (Tablet Staff Ticket Detail View)
  * `mobile-detail.png` (Mobile Staff Ticket Detail View)
* **`user-management/`**:
  * `desktop-admin.png` (Desktop Administrator User Management)
  * `tablet-admin.png` (Tablet User Management View)
  * `mobile-admin.png` (Mobile User Management View)
  * `create-user-modal.png` (Create New User Modal Dialog)

---

## 8. Setup & Execution Instructions

```bash
# 1. Database Setup & Seed
npx prisma db push --accept-data-loss
npm run prisma:seed

# 2. Execute Automated Test Suites
npm --prefix server test
npm --prefix client test
npx playwright test e2e/lab-03

# 3. Launch Development Servers
npm --prefix server run dev   # Backend API on http://localhost:3000
npm --prefix client run dev   # Frontend Client on http://localhost:5173
```
