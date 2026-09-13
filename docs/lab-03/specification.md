# TokTickIT Lab 3 Engineering Specification

## 1. Sprint Goal

Deliver operational authentication, role-based authorization, IT Staff ticket workflow management, and Administrator user management while maintaining full compatibility with the existing Requester ticket capabilities built in Lab 2.

## 2. Stakeholder Request

Replace the temporary Development Requester selector with secure email/password authentication and role-based access control (`Requester`, `IT Staff`, `Administrator`). Users with initial passwords must change their password on first login before accessing the application. Requesters must continue managing their tickets using their authenticated identity and have access to Public Comments and a problem resolution indicator. IT Staff require an operational Ticket Queue (with search, filters, sorting, and pagination) and Ticket Detail interface to claim/assign tickets, set IT Priority, execute permitted status transitions, post Public Comments, and record private Internal Notes. Administrators require a minimalist User Management screen to create, view, edit, activate/deactivate user accounts, and set initial passwords. All APIs and screens must enforce server-side authorization and adhere to the Zen Green design system.

## 3. Scope

### 3.1. Included Work

* **Authentication & Password Management**:
  * Email and password login (`POST /api/auth/login`).
  * Current user profile retrieval (`GET /api/auth/me`).
  * Logout session invalidation (`POST /api/auth/logout`).
  * Mandatory initial password change screen (`POST /api/auth/change-password`).
* **Role-Based Authorization & Navigation**:
  * Server-side enforcement of three distinct roles: `Requester`, `IT Staff`, `Administrator`.
  * Dynamic navigation displaying only permitted views per role.
* **Requester Enhancements**:
  * Full migration of Lab 2 ticket/attachment functions to use authenticated user identity.
  * Removal of `DevelopmentRequesterSelector` and client-side selector state.
  * Public Comments feed and composer on Ticket Detail.
  * "Problem Appears Resolved" indication action on Ticket Detail.
* **IT Staff Ticket Queue & Workflow**:
  * IT Staff Ticket Queue interface supporting search (ticket number, summary, description), filters (status, category, priority, owner), sorting, and pagination.
  * Ticket Detail interface providing claim/reassign owner controls, IT Priority dropdown, permitted status transition selector, Public Comments, and distinct Internal Notes.
* **Administrator User Management**:
  * Minimalist user list displaying Name, Email, Role, Status, and Edit action.
  * User search by name or email, optional role filter.
  * Account creation with one permitted role, activation state, and initial password.
  * Account editing (name, email, role, activation state).
  * Setting a new initial password with mandatory first-login password change flag (`mustChangePassword: true`).
  * Backend safety rules: Self-deactivation prevention, last active Admin deactivation/demotion protection, duplicate email rejection, deactivation instead of deletion.
* **Data Model Evolution & Seeding**:
  * Evolution of PostgreSQL schema to support `User`, `PublicComment`, `InternalNote`, 8-status `TicketStatus` enum, and updated `Ticket` / `Attachment` relations.
  * Idempotent seed data for 4 active Requesters, 1 inactive Requester, 3 active IT Staff, 1 inactive IT Staff, and 1 active Administrator.

### 3.2. Explicitly Excluded Work

* Email delivery/sending (invitations, password reset emails, magic links).
* Multi-Factor Authentication (MFA), OAuth, Single Sign-On (SSO), or social login.
* Self-registration and Requester-created accounts.
* "Actions Taken" by IT Staff (deferred to Lab 4).
* Formal SLA calculations, escalation workflows, or notification services.
* Dashboards, analytics, or complex KPI reporting beyond basic queue counts.
* Multi-tenant organizations, departments, or corporate hierarchy management.
* User deletion, bulk user operations, or import/export features.
* Profile photos, account audit logs, or password history.
* Advanced user-list pagination or multi-column sorting on the Administrator screen.

---

## 4. Functional Requirements

### 4.1. Authentication & Session Management
* **FR-01**: The system MUST authenticate users via email address and password credentials.
* **FR-02**: The system MUST enforce a mandatory first-login password change for any user flagged with `mustChangePassword = true`.
* **FR-03**: The system MUST reject authentication attempts for inactive accounts (`isActive = false`) with a safe failure message.
* **FR-04**: The system MUST allow authenticated users to retrieve their current user context (`id`, `name`, `email`, `role`, `mustChangePassword`).
* **FR-05**: The system MUST allow authenticated users to invalidate their active session via logout.

### 4.2. Requester Ticket Management
* **FR-06**: The system MUST enforce that Requesters access and manage ONLY tickets and attachments where `requesterId` matches their authenticated user ID.
* **FR-07**: Requesters MUST be able to post Public Comments on their owned tickets.
* **FR-08**: Requesters MUST be able to trigger a "Problem Appears Resolved" action on an active ticket, requesting resolution without directly mutating the ticket status to `RESOLVED` or `CLOSED`.

### 4.3. IT Staff Ticket Operations
* **FR-09**: IT Staff MUST be able to search, filter, sort, and paginate through all tickets in the IT Staff Ticket Queue.
* **FR-10**: IT Staff MUST be able to claim unassigned tickets or reassign ticket ownership to another active IT Staff or Administrator account.
* **FR-11**: IT Staff MUST be able to set or update the `IT Priority` of any ticket.
* **FR-12**: IT Staff MUST be able to transition ticket status strictly according to the permitted status transition matrix.
* **FR-13**: IT Staff MUST be able to post and view Public Comments on any ticket.
* **FR-14**: IT Staff MUST be able to post and view private Internal Notes on any ticket.

### 4.4. Administrator User Management
* **FR-15**: Administrators MUST be able to view a list of users, searchable by name or email, and optionally filterable by role.
* **FR-16**: Administrators MUST be able to create new user accounts with name, email, one permitted role, activation state, and an initial password.
* **FR-17**: Administrators MUST be able to update an existing user's name, email, role, and activation state.
* **FR-18**: Administrators MUST be able to set a new initial password for a user, automatically setting `mustChangePassword = true`.

---

## 5. Business Rules

### 5.1. Authentication & Security Rules
* **BR-01**: Only an active user account (`isActive = true`) with valid email and password credentials may authenticate.
* **BR-02**: A user marked with `mustChangePassword = true` cannot access normal application screens or REST APIs (except `GET /api/auth/me`, `POST /api/auth/change-password`, and `POST /api/auth/logout`) until a new valid password is saved.
* **BR-03**: Passwords must be hashed using `bcrypt` with a minimum cost factor of 10. Plaintext passwords must never be stored, logged, or returned in API responses.
* **BR-04**: Password policy requires at least 8 characters, containing at least one uppercase letter, one lowercase letter, one number, and one special character.

### 5.2. Role-Based Authorization & Ownership Rules
* **BR-05**: User accounts MUST be assigned exactly one role: `REQUESTER`, `IT_STAFF`, or `ADMINISTRATOR`.
* **BR-06**: The authenticated user ID, not any client-supplied body or header parameter, determines ownership of Requester operations.
* **BR-07**: Requesters may access ONLY their owned tickets and attachments. Direct requests to view, modify, or comment on another Requester's ticket MUST return an authorization error (`403 Forbidden` or `404 Not Found`).

### 5.3. Authorization Matrix

| Resource / Endpoint | Requester | IT Staff | Administrator |
| :--- | :---: | :---: | :---: |
| `POST /api/auth/login` | Public | Public | Public |
| `POST /api/auth/logout` | Authenticated | Authenticated | Authenticated |
| `GET /api/auth/me` | Authenticated | Authenticated | Authenticated |
| `POST /api/auth/change-password` | Authenticated | Authenticated | Authenticated |
| `GET /api/tickets` (My Tickets) | Own Only | Denied | Denied |
| `POST /api/tickets` (Create) | Permitted | Denied | Denied |
| `GET /api/tickets/:id` | Own Only | Permitted | Permitted |
| `POST /api/tickets/:id/attachments` | Own Only | Denied | Denied |
| `DELETE /api/tickets/:id/attachments/:attId` | Own Only | Denied | Denied |
| `GET /api/staff/tickets` (Queue) | Denied | Permitted | Permitted |
| `PATCH /api/staff/tickets/:id` (Workflow) | Denied | Permitted | Permitted |
| `GET /api/tickets/:id/public-comments` | Own Only | Permitted | Permitted |
| `POST /api/tickets/:id/public-comments` | Own Only | Permitted | Permitted |
| `GET /api/tickets/:id/internal-notes` | **Denied (403)** | Permitted | Permitted |
| `POST /api/tickets/:id/internal-notes` | **Denied (403)** | Permitted | Permitted |
| `GET /api/admin/users` | Denied | Denied | Permitted |
| `POST /api/admin/users` | Denied | Denied | Permitted |
| `PATCH /api/admin/users/:id` | Denied | Denied | Permitted |
| `POST /api/admin/users/:id/reset-password` | Denied | Denied | Permitted |

### 5.4. Ticket Ownership & IT Priority Rules
* **BR-08**: A ticket may have zero or one primary Ticket Owner (`ownerId`), who must be an active `IT_STAFF` or `ADMINISTRATOR` user. New tickets are initially unassigned (`ownerId = null`).
* **BR-09**: `Requested Priority` is set at ticket creation by the Requester and cannot be modified later. `IT Priority` is initialized to equal `Requested Priority` upon ticket creation, and may subsequently be modified ONLY by IT Staff or Administrator users.

### 5.5. Ticket Status Transition Matrix
* **BR-10**: Valid ticket statuses in Lab 3 are: `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`.
* **BR-11**: Requesters CANNOT directly change a ticket status to `RESOLVED` or `CLOSED`. A Requester may use the "Problem Appears Resolved" action when a ticket is in `IN_PROGRESS` or `WAITING_FOR_REQUESTER`, which adds a Public Comment and optionally requests IT Staff review.
* **BR-12**: Status transitions must adhere to the permitted workflow matrix:

| Current Status | Allowed Target Statuses | Permitted Roles | Notes |
| :--- | :--- | :--- | :--- |
| `NEW` | `OPEN`, `IN_PROGRESS`, `CANCELLED` | IT Staff, Admin | Claiming ticket moves to `OPEN` or `IN_PROGRESS` |
| `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED` | IT Staff, Admin | |
| `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | |
| `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff, Admin | Requester comment triggers review |
| `RESOLVED` | `CLOSED`, `REOPENED` | IT Staff, Admin | Formal resolution summary required |
| `CLOSED` | `REOPENED` | IT Staff, Admin | Only IT Staff/Admin can reopen closed tickets |
| `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED` | IT Staff, Admin | |
| `CANCELLED` | *None (Terminal)* | None | Terminal state |

### 5.6. Public Comments & Internal Notes Rules
* **BR-13**: Public Comments are shared communications visible to Requesters (for owned tickets), IT Staff, and Administrators. Empty or whitespace-only content MUST be rejected. Max length: 2,000 characters.
* **BR-14**: Internal Notes are private operational notes visible ONLY to IT Staff and Administrators. Requests by Requesters to create or view Internal Notes MUST be rejected with `403 Forbidden` without exposing note existence or content. Empty or whitespace-only content MUST be rejected. Max length: 2,000 characters. Both comments and notes are append-only (no edit or delete).

### 5.7. Administrator Safety Rules
* **BR-15**: Account creation and editing must assign exactly one permitted role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
* **BR-16**: Duplicate email addresses across accounts MUST be rejected with HTTP 409 Conflict. Email lookup MUST be case-insensitive.
* **BR-17**: An Administrator MUST NOT be allowed to deactivate their own account (Self-Deactivation Guard). Attempting to do so MUST return HTTP 400 Bad Request.
* **BR-18**: An Administrator MUST NOT be allowed to deactivate or demote the last active Administrator account in the system (Last Admin Protection Guard). Attempting to do so MUST return HTTP 400 Bad Request.
* **BR-19**: User deletion is disabled. Account suspension/revocation MUST be handled exclusively via setting `isActive = false`.

---

## 6. Data Changes & Migration

### 6.1. Schema Changes (`server/prisma/schema.prisma`)

```prisma
enum Role {
  REQUESTER
  IT_STAFF
  ADMINISTRATOR
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  NEW
  OPEN
  IN_PROGRESS
  WAITING_FOR_REQUESTER
  RESOLVED
  CLOSED
  REOPENED
  CANCELLED
}

model User {
  id                 Int              @id @default(autoincrement())
  name               String           @db.VarChar(100)
  email              String           @unique @db.VarChar(150)
  passwordHash       String           @db.VarChar(255)
  role               Role             @default(REQUESTER)
  mustChangePassword Boolean          @default(true)
  isActive           Boolean          @default(true)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
  submittedTickets   Ticket[]         @relation("RequesterTickets")
  ownedTickets       Ticket[]         @relation("OwnedTickets")
  attachments        Attachment[]
  publicComments     PublicComment[]
  internalNotes      InternalNote[]

  @@map("users")
}

model Ticket {
  id                Int             @id @default(autoincrement())
  ticketNumber      String          @unique @db.VarChar(30)
  requesterId       Int
  categoryId        Int
  relatedSystemId   Int
  ownerId           Int?
  requestedPriority Priority        @default(MEDIUM)
  itPriority        Priority        @default(MEDIUM)
  status            TicketStatus    @default(NEW)
  summary           String          @db.VarChar(120)
  description       String          @db.Text
  resolutionSummary String?         @db.Text
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  requester         User            @relation("RequesterTickets", fields: [requesterId], references: [id])
  owner             User?           @relation("OwnedTickets", fields: [ownerId], references: [id])
  category          Category        @relation(fields: [categoryId], references: [id])
  relatedSystem     RelatedSystem   @relation(fields: [relatedSystemId], references: [id])
  attachments       Attachment[]
  publicComments    PublicComment[]
  internalNotes     InternalNote[]

  @@index([requesterId, createdAt])
  @@index([ownerId, status])
  @@index([status, categoryId, itPriority])
  @@map("tickets")
}

model PublicComment {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String   @db.Text
  createdAt DateTime @default(now())
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@index([ticketId, createdAt])
  @@map("public_comments")
}

model InternalNote {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String   @db.Text
  createdAt DateTime @default(now())
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@index([ticketId, createdAt])
  @@map("internal_notes")
}

model Attachment {
  id           Int       @id @default(autoincrement())
  ticketId     Int
  filename     String    @db.VarChar(255)
  storagePath  String    @db.VarChar(500)
  fileSize     Int
  mimeType     String    @db.VarChar(100)
  uploadedById Int
  isRemoved    Boolean   @default(false)
  removedAt    DateTime?
  createdAt    DateTime  @default(now())
  ticket       Ticket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  uploadedBy   User      @relation(fields: [uploadedById], references: [id])

  @@index([ticketId, isRemoved])
  @@map("attachments")
}
```

### 6.2. Migration Strategy
1. Evolve existing `DevelopmentRequester` records into `User` records with `role = REQUESTER`, `mustChangePassword = false` (or `true` with documented initial passwords), and hashed passwords (`Password123!`).
2. Map Lab 2 tickets to point `requesterId` to the migrated `User` records. Map `Attachment.uploadedByRequesterId` to `Attachment.uploadedById`.
3. Safe enum migration for `TicketStatus`: existing tickets with status `PENDING` will be migrated to `WAITING_FOR_REQUESTER`.

### 6.3. Idempotent Seed Data Requirements (`server/prisma/seed.ts`)
* **Requesters**: At least 4 active requesters (`jennifer@toktickit.com`, `david@toktickit.com`, `emily@toktickit.com`, `amanda@toktickit.com`) and 1 inactive requester (`kevin@toktickit.com`).
* **IT Staff**: At least 3 active IT Staff (`michael@toktickit.com`, `sarah@toktickit.com`, `lisa@toktickit.com`) and 1 inactive IT Staff (`robert@toktickit.com`).
* **Administrator**: At least 1 active Administrator (`admin@toktickit.com`).
* **Tickets**: Realistic distribution of tickets across requesters, statuses (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`), priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and owner assignments (assigned/unassigned).
* **Comments & Notes**: Example public comments and internal notes on seeded tickets.

---

## 7. Acceptance Criteria

* **AC-01**: Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access, returns the user identity and role, and redirects to their permitted default view.
* **AC-02**: Given a user with `mustChangePassword = true`, when login succeeds, then normal application screens remain locked until a new valid password is submitted and saved.
* **AC-03**: Given an inactive user (`isActive = false`), when login is attempted, then authentication fails with a safe error message without exposing detailed account state.
* **AC-04**: Given an authenticated Requester, when accessing tickets or attachments, then only owned resources are accessible; requests with modified IDs or parameters return authorization errors without leaking data.
* **AC-05**: Given an authenticated Requester, when attempting to access Internal Notes API endpoints or UI components, then access is denied with HTTP 403 Forbidden without exposing note content or existence.
* **AC-06**: Given an IT Staff user, when accessing the Ticket Queue, then tickets can be searched by text, filtered by status/category/priority/owner, sorted by columns, and paginated cleanly.
* **AC-07**: Given an IT Staff user on Ticket Detail, when claiming an unassigned ticket or reassigning ownership, then the owner field updates correctly and records the change.
* **AC-08**: Given an IT Staff user on Ticket Detail, when changing IT Priority, then `itPriority` is updated independently without altering `requestedPriority`.
* **AC-09**: Given an IT Staff user, when executing a ticket status transition, then valid transitions succeed and invalid transitions are rejected by backend validation.
* **AC-10**: Given a Requester on Ticket Detail, when clicking "Problem Appears Resolved", then a Public Comment is posted and IT Staff are notified for formal status review.
* **AC-11**: Given an IT Staff user, when posting an Internal Note, then it is displayed in the distinct Internal Notes section visible only to IT Staff and Administrators.
* **AC-12**: Given an Administrator on User Management, when searching by name or email or filtering by role, then the user list updates dynamically.
* **AC-13**: Given an Administrator creating a user with an existing email, when saved, then the backend rejects the request with HTTP 409 Conflict.
* **AC-14**: Given an Administrator, when attempting to deactivate their own account or the last active Administrator account, then the operation is rejected with HTTP 400 Bad Request.
* **AC-15**: Given an Administrator setting a new initial password for a user, when that user logs in next, then they are forced to complete the password change flow before entering the application.

---

## 8. Definition of Done

1. All functional requirements (`FR-01` to `FR-18`) and business rules (`BR-01` to `BR-19`) implemented.
2. Complete documentation delivered in `docs/lab-03/`: `specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`.
3. Complete automated unit, API, UI, authorization, regression, and Playwright E2E test suites passing in `server/tests/lab-03/`, `client/tests/lab-03/`, and `e2e/lab-03/`.
4. High-resolution desktop, tablet, and mobile screenshot evidence generated in `artifacts/lab-03/screenshots/`.
5. Feature branches merged into `lab3-staging` and then `main` with clean commit history.

---

## 9. Assumptions & Implementation Decisions

* **Session Token Strategy**: JSON Web Tokens (JWT) stored in HTTP-Only secure cookies or Bearer headers.
* **Password Hashing**: `bcryptjs` algorithm with 10 salt rounds.
* **Safe Error Behavior**: Authorization checks return generic 403 Forbidden or safe 404 Not Found to prevent resource enumeration attacks.
* **Development Requester Selector Removal**: Completely removed from frontend header and context; replaced with `AuthContext` and authenticated session profile.
