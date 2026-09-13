# CPE 334 Lab 3 Technical Reviewer Document (`docs/lab-03/reviewer.md`)

## 1. Executive Summary & Lab Scope

This document provides a comprehensive technical overview of the implementation for **CPE 334 Lab 3: "TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens"**.

Lab 3 evolves TokTickIT from a single-tier requester simulator into a multi-role, secure enterprise IT ticketing platform supporting three distinct roles:
1. **Requester**: Authenticated users who submit, track, comment on, and mark their own IT support tickets as resolved.
2. **IT Staff**: IT support personnel who manage operational ticket queues, claim and reassign tickets, adjust IT Priorities, progress ticket statuses, and write internal staff notes.
3. **Administrator**: Platform administrators who manage user accounts, assign roles, toggle active status, and reset passwords while exercising full administrative control over the ticket queue.

All implementation details strictly adhere to the official Lab 3 PDF handout.

---

## 2. Technology Stack & Key Libraries

* **Backend Framework**: Node.js, Express (TypeScript), Prisma ORM
* **Database Engine**: PostgreSQL
* **Authentication**: `bcryptjs` (password hashing), `jsonwebtoken` (JWT authentication), `cookie-parser`
* **Frontend Framework**: React 18 (TypeScript), Vite, Vanilla CSS (`zen-green.css`)
* **Test Suites**: Vitest (Server API integration tests & Client component unit tests), Supertest, React Testing Library, Playwright (E2E)

---

## 3. Server-Side Security & Authorization Architecture

### 3.1 Password Security & Storage
* Passwords are strictly hashed using `bcrypt` (cost factor 10) prior to database persistence.
* Plaintext passwords and password hashes are **never** returned in API JSON responses or exposed to client apps.

### 3.2 Server-Side Session Handling
* Session tokens (JWT) are passed in `Authorization: Bearer <token>` headers or `toktickit_session` cookies.
* Tokens contain user ID, email, role, and active status.
* Server verifies JWT signature and validates active user status (`isActive = true`) on every protected request.

### 3.3 Strict Server-Side Authorization Matrix
All authorization rules are enforced strictly at the API layer. Client-supplied `requesterId` or `x-requester-id` headers are ignored when an authenticated session is present.

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

## 4. Database Schema Changes

The PostgreSQL schema was evolved using Prisma while preserving 100% of Lab 2 ticket and attachment data:

1. **`User` Model**:
   * Added `email` (`@unique`), `passwordHash`, `role` (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), `isActive`, `mustChangePassword`, and `department`.
2. **`Ticket` Model Extensions**:
   * Added relations `requester` (User), `owner` (optional User), `itPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and extended `status` enum (`NEW`, `ASSIGNED`, `IN_PROGRESS`, `PENDING_CLIENT`, `RESOLVED`, `CLOSED`, `CANCELLED`).
3. **`PublicComment` & `InternalNote` Models**:
   * Added `PublicComment` (accessible to ticket owner & staff) and `InternalNote` (accessible to IT Staff and Admin only).

---

## 5. Verification Evidence & Test Results

* **Server API & Integration Tests**: `npm run test:server`
  * 12 Test Files Passed (100% Success)
  * 56 Tests Passed
* **Client Component Unit Tests**: `npm run test:client`
  * 11 Test Files Passed (100% Success)
  * 26 Tests Passed
* **Playwright E2E Tests**: `npm run test:e2e`
  * Automated E2E test suite verifying login, queue, staff ticket detail, and admin user management.

---

## 6. How to Run the Application & Tests

```bash
# 1. Start PostgreSQL & database migrations
npx prisma db push --accept-data-loss
npm run prisma:seed

# 2. Run backend and frontend test suites
npm run test:server
npm run test:client

# 3. Launch Development Servers
# Backend API: http://localhost:3000
npm --prefix server run dev

# Frontend Client: http://localhost:5173
npm --prefix client run dev
```
