# TokTickIT Lab 3 Test Plan and Traceability Matrix (`tests.md`)

## 1. Overview & Test Strategy

This document defines the comprehensive Test Plan for CPE 334 Lab 3: *TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens*. 

The test strategy covers:
* **Unit Tests**: Utility functions, password validation, role permission checks, and status transition rules.
* **API / Server Integration Tests**: Backend Express endpoint validation, authentication cookies/tokens, authorization guards, data access boundaries, and PostgreSQL database queries (`server/tests/lab-03/`).
* **UI Component Tests**: React components, form validations, role-specific UI visibility, interactive modals, and Zen Green state renderings (`client/tests/lab-03/`).
* **Security & Authorization Tests**: Direct API probing, client-side identity spoofing attempts, Internal Note leakage prevention, and Administrator guard enforcement.
* **Database Migration & Regression Tests**: Verification that existing Lab 2 ticket and attachment data remains valid after migrating `DevelopmentRequester` to `User`.
* **Responsive & Accessibility Tests**: Mobile, tablet, and desktop layout rendering and keyboard accessibility.
* **End-to-End (E2E) Tests**: Complete Playwright browser automation covering authentication, mandatory password changes, IT Staff workflows, and user administration (`e2e/lab-03/`).

*Note: In accordance with Test-Driven Development (TDD) guidelines, all tests in this document are planned specifications. Test status will be updated upon execution.*

---

## 2. Requirement & Acceptance Criteria Traceability Matrix

| Requirement ID | Acceptance Criterion | Test ID | Test Type | Target Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `FR-01`, `BR-01` | `AC-01` (Valid login returns user identity & role) | `API-AUTH-01` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-01`, `BR-01` | `AC-01` (Invalid credentials rejected) | `API-AUTH-02` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-03`, `BR-01` | `AC-03` (Inactive user login rejected) | `API-AUTH-03` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-02`, `BR-02` | `AC-02` (Mandatory password change blocks app) | `API-AUTH-04` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-05` | `AC-01` (Logout invalidates session) | `API-AUTH-05` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-04` | `AC-01` (Retrieve current user context `/me`) | `API-AUTH-06` | API | `server/tests/lab-03/auth.api.test.ts` | Planned |
| `FR-06`, `BR-06` | `AC-04` (Requester accesses owned tickets only) | `API-AUTHZ-01` | Security | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| `FR-06`, `BR-06` | `AC-04` (Requester client identity spoofing ignored) | `API-AUTHZ-02` | Security | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| `FR-14`, `BR-14` | `AC-05` (Requester access to Internal Notes denied 403) | `API-AUTHZ-03` | Security | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| `FR-15` | `AC-12` (Non-Admin access to User Admin APIs denied) | `API-AUTHZ-04` | Security | `server/tests/lab-03/authorization.api.test.ts` | Planned |
| `FR-09` | `AC-06` (IT Staff Queue query: search, filter, paginate) | `API-QUEUE-01` | API | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| `FR-09` | `AC-06` (IT Staff Queue sorting) | `API-QUEUE-02` | API | `server/tests/lab-03/staff-queue.api.test.ts` | Planned |
| `FR-10` | `AC-07` (IT Staff claim or reassign ownership) | `API-DETAIL-01` | API | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| `FR-11`, `BR-09` | `AC-08` (IT Staff update IT Priority) | `API-DETAIL-02` | API | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| `FR-12`, `BR-12` | `AC-09` (Permitted ticket status transitions) | `API-DETAIL-03` | API | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| `FR-12`, `BR-12` | `AC-09` (Invalid ticket status transitions rejected) | `API-DETAIL-04` | API | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Planned |
| `FR-07`, `FR-13` | `AC-10` (Post & retrieve Public Comments) | `API-NOTE-01` | API | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| `FR-14`, `BR-14` | `AC-11` (IT Staff post & retrieve Internal Notes) | `API-NOTE-02` | API | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| `FR-13`, `FR-14` | `AC-10`, `AC-11` (Reject empty/whitespace comments & notes) | `API-NOTE-03` | API | `server/tests/lab-03/comments-notes.api.test.ts` | Planned |
| `FR-15` | `AC-12` (Admin list users with search and role filter) | `API-ADMIN-01` | API | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `FR-16`, `BR-15` | `AC-13` (Admin create user & reject duplicate email 409) | `API-ADMIN-02` | API | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `FR-17` | `AC-12` (Admin edit user basic info & status) | `API-ADMIN-03` | API | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `BR-17` | `AC-14` (Admin self-deactivation guard rejected 400) | `API-ADMIN-04` | Security | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `BR-18` | `AC-14` (Last active Admin deactivation guard rejected 400) | `API-ADMIN-05` | Security | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `FR-18` | `AC-15` (Admin set initial password triggers password change) | `API-ADMIN-06` | API | `server/tests/lab-03/users-admin.api.test.ts` | Planned |
| `FR-01`, `FR-03` | `AC-01`, `AC-03` (Login UI form submission & errors) | `UI-AUTH-01` | UI | `client/tests/lab-03/Login.test.tsx` | Planned |
| `FR-02`, `BR-02` | `AC-02` (Mandatory Change Password UI validation) | `UI-AUTH-02` | UI | `client/tests/lab-03/ChangePassword.test.tsx` | Planned |
| `FR-09` | `AC-06` (IT Staff Queue UI search, filters & pagination) | `UI-QUEUE-01` | UI | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Planned |
| `FR-10`-`FR-14` | `AC-07`-`AC-11` (IT Staff Detail UI controls, comments & notes) | `UI-DETAIL-01` | UI | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Planned |
| `FR-15`-`FR-18` | `AC-12`-`AC-15` (Admin User Management UI modals & validation) | `UI-ADMIN-01` | UI | `client/tests/lab-03/UserManagement.test.tsx` | Planned |
| `FR-01`-`FR-05` | `AC-01`-`AC-03` (End-to-End Authentication flow) | `E2E-01` | E2E | `e2e/lab-03/authentication.spec.ts` | Planned |
| `FR-09`-`FR-14` | `AC-06`-`AC-11` (End-to-End IT Staff Queue & Detail flow) | `E2E-02` | E2E | `e2e/lab-03/staff-ticket-flow.spec.ts` | Planned |
| `FR-15`-`FR-18` | `AC-12`-`AC-15` (End-to-End User Administration flow) | `E2E-03` | E2E | `e2e/lab-03/user-administration.spec.ts` | Planned |

---

## 3. Server API & Integration Test Plan (`server/tests/lab-03/`)

### 3.1. Authentication APIs (`server/tests/lab-03/auth.api.test.ts`)
* **`API-AUTH-01` Valid Login**: Submit valid active user email and password. Expect HTTP 200, session token/cookie set, user object returned (`id`, `name`, `email`, `role`, `mustChangePassword: false`).
* **`API-AUTH-02` Invalid Credentials**: Submit invalid password or non-existent email. Expect HTTP 401 Unauthorized with generic safe error message.
* **`API-AUTH-03` Inactive Account Login**: Submit credentials for account with `isActive: false`. Expect HTTP 401 Unauthorized without exposing specific account status.
* **`API-AUTH-04` Mandatory Password Change Flag**: Login with user flagged `mustChangePassword: true`. Expect user profile in response to reflect `mustChangePassword: true`.
* **`API-AUTH-05` Logout Session Invalidation**: Invoke `POST /api/auth/logout`. Expect session token cleared. Subsequent requests to protected routes return HTTP 401 Unauthorized.
* **`API-AUTH-06` Current Authenticated User (`/me`)**: Invoke `GET /api/auth/me` with valid session cookie. Expect HTTP 200 with current user identity.

### 3.2. Authorization & Security (`server/tests/lab-03/authorization.api.test.ts`)
* **`API-AUTHZ-01` Requester Ownership Boundary**: Requester A attempts to read or modify Requester B's ticket (`GET /api/tickets/:id`). Expect HTTP 403 Forbidden or 404 Not Found.
* **`API-AUTHZ-02` Client Identity Spoofing Protection**: Requester A submits a ticket payload containing `requesterId: <B's ID>` or header `x-requester-id`. Verify backend strictly assigns `requesterId` from authenticated session, ignoring client parameters.
* **`API-AUTHZ-03` Internal Note Protection**: Requester attempts to request `GET /api/tickets/:id/internal-notes` or `POST /api/tickets/:id/internal-notes`. Expect HTTP 403 Forbidden with no note contents or existence revealed.
* **`API-AUTHZ-04` Non-Admin User Management Protection**: Requester or IT Staff user attempts to request `GET /api/admin/users` or `POST /api/admin/users`. Expect HTTP 403 Forbidden.

### 3.3. IT Staff Queue APIs (`server/tests/lab-03/staff-queue.api.test.ts`)
* **`API-QUEUE-01` Search, Filter & Pagination**: Request `GET /api/staff/tickets` with search terms, status filters, and page parameters as IT Staff. Verify correct subset returned with total counts and pagination metadata.
* **`API-QUEUE-02` Queue Sorting**: Request `GET /api/staff/tickets` with `sortBy=createdAt` and `sortOrder=asc`. Verify order of returned array matches expected timestamp order.

### 3.4. IT Staff Ticket Detail & Workflow APIs (`server/tests/lab-03/staff-ticket-detail.api.test.ts`)
* **`API-DETAIL-01` Claim & Reassign Ticket**: IT Staff invokes `PATCH /api/staff/tickets/:id` with `ownerId`. Verify `ownerId` updates in DB.
* **`API-DETAIL-02` IT Priority Modification**: IT Staff invokes `PATCH /api/staff/tickets/:id` with `itPriority: "HIGH"`. Verify `itPriority` updates while `requestedPriority` remains untouched.
* **`API-DETAIL-03` Valid Status Transitions**: IT Staff transitions status from `NEW` -> `OPEN` -> `IN_PROGRESS` -> `RESOLVED`. Verify state changes succeed.
* **`API-DETAIL-04` Invalid Status Transitions**: IT Staff attempts invalid status jump (e.g. `NEW` -> `RESOLVED` directly without resolution summary, or modifying `CANCELLED`). Expect HTTP 400 Bad Request.

### 3.5. Comments & Notes APIs (`server/tests/lab-03/comments-notes.api.test.ts`)
* **`API-NOTE-01` Public Comments Flow**: Requester posts Public Comment on owned ticket. IT Staff posts Public Comment on same ticket. Both fetch public comments list. Verify both entries visible with author roles.
* **`API-NOTE-02` Internal Notes Flow**: IT Staff posts Internal Note. Another IT Staff fetches internal notes list. Verify internal note returned with author identity.
* **`API-NOTE-03` Empty / Whitespace Content Rejection**: Post empty string `""` or `"   "` to comments or notes endpoint. Expect HTTP 400 Bad Request.

### 3.6. Administrator User Management APIs (`server/tests/lab-03/users-admin.api.test.ts`)
* **`API-ADMIN-01` List & Search Users**: Admin requests `GET /api/admin/users?search=alex&role=IT_STAFF`. Expect filtered user array.
* **`API-ADMIN-02` Create User & Duplicate Email Rejection**: Admin posts new user payload. Verify HTTP 201. Attempt creating user with duplicate email (case-insensitive). Expect HTTP 409 Conflict.
* **`API-ADMIN-03` Edit User Info & Active State**: Admin patches user account details and sets `isActive: false`. Verify update in DB.
* **`API-ADMIN-04` Self-Deactivation Guard**: Admin attempts to patch their own account with `isActive: false`. Expect HTTP 400 Bad Request ("Cannot deactivate your own account").
* **`API-ADMIN-05` Last Active Admin Guard**: Admin attempts to deactivate or demote the single remaining active Administrator. Expect HTTP 400 Bad Request ("Cannot deactivate the last active Administrator").
* **`API-ADMIN-06` Set Initial Password**: Admin posts new initial password for user. Verify user record has `mustChangePassword: true`.

---

## 4. Client UI Component Test Plan (`client/tests/lab-03/`)

### 4.1. Login Screen (`client/tests/lab-03/Login.test.tsx`)
* **`UI-AUTH-01` Login Form Submission & Error Messages**: Render `LoginView`. Simulate typing valid email and password, click "Sign In". Verify auth submit callback triggered. Simulate invalid submit; verify inline red alert displayed.

### 4.2. Change Password Screen (`client/tests/lab-03/ChangePassword.test.tsx`)
* **`UI-AUTH-02` Mandatory Password Change Validation**: Render `ChangePasswordView`. Verify password strength validation checklist updates as user types. Simulate submission with non-matching passwords; verify error message displayed.

### 4.3. IT Staff Queue Screen (`client/tests/lab-03/StaffTicketQueue.test.tsx`)
* **`UI-QUEUE-01` IT Staff Queue UI Controls**: Render `StaffTicketQueueView` with mock queue data. Test search input typing, status dropdown filter selections, column header sort clicks, and pagination button clicks.

### 4.4. IT Staff Ticket Detail Screen (`client/tests/lab-03/StaffTicketDetail.test.tsx`)
* **`UI-DETAIL-01` IT Staff Operational Controls & Notes**: Render `StaffTicketDetailView`. Verify owner assignment dropdown, IT Priority dropdown, and permitted status transition options. Verify Public Comments and Internal Notes sections render distinctly with proper visual styles.

### 4.5. User Management Screen (`client/tests/lab-03/UserManagement.test.tsx`)
* **`UI-ADMIN-01` Admin User Management Table & Modals**: Render `UserManagementView`. Test "+ Create User" button opens Create User Modal. Test "Edit User" button opens Edit User Modal populated with user data. Test "Reset Password" button opens Set Initial Password Modal.

---

## 5. End-to-End (E2E) Test Plan (`e2e/lab-03/`)

### 5.1. Authentication & Initial Password Flow (`e2e/lab-03/authentication.spec.ts`)
* **`E2E-01` Complete Login, First-Password Change & Logout**:
  1. Navigate to `/`. Unauthenticated user redirected to Login screen.
  2. Log in with user having initial password (`mustChangePassword: true`).
  3. Verify application locks navigation and presents Mandatory Password Change screen.
  4. Submit valid new password. Verify notification toast and transition into main application.
  5. Click Logout button in top nav bar. Verify redirection back to Login screen and direct URL access blocked.

### 5.2. IT Staff Queue & Ticket Workflow (`e2e/lab-03/staff-ticket-flow.spec.ts`)
* **`E2E-02` IT Staff End-to-End Workflow**:
  1. Log in as IT Staff (`michael@toktickit.com`).
  2. Navigate to Ticket Queue. Filter queue by status `NEW`.
  3. Open an unassigned ticket. Click "Claim Ticket". Verify owner updates to `Michael Brown`.
  4. Change IT Priority to `HIGH`. Transition status to `IN_PROGRESS`.
  5. Post an Internal Note (`"Ordered replacement hardware."`). Verify note appears in amber Internal Notes section.
  6. Post a Public Comment (`"We are working on your issue."`).
  7. Log out. Log in as ticket Requester (`jennifer@toktickit.com`).
  8. Open ticket. Verify Public Comment is visible, Internal Note is completely absent, and "Problem Appears Resolved" button is accessible.

### 5.3. Administrator User Management (`e2e/lab-03/user-administration.spec.ts`)
* **`E2E-03` Administrator User Management Workflow**:
  1. Log in as Administrator (`admin@toktickit.com`).
  2. Navigate to "User Management".
  3. Click "+ Create User". Create new IT Staff user `Alex Thompson` (`alex@toktickit.com`) with initial password.
  4. Search user list by name `Alex`. Verify newly created user appears in table with `IT_STAFF` badge and `Active` status.
  5. Edit `Alex Thompson` account to set `isActive: false`. Verify status badge changes to `Inactive`.
  6. Attempt to deactivate own `admin` account. Verify error modal/toast prevents self-deactivation.

---

## 6. Regression, Migration & Responsive Verification Plan

### 6.1. Lab 2 Requester Functionality Regression
* Verify Requester ticket creation form (`CreateTicketForm.tsx`), attachment file upload, and ticket list (`MyTicketsView.tsx`) continue operating seamlessly under authenticated user sessions without relying on `x-requester-id` headers.

### 6.2. Database Migration Validation
* Execute migration script converting `DevelopmentRequester` into `User` records. Run test suite checking existing ticket ownership links, attachment links, and status conversions (`PENDING` -> `WAITING_FOR_REQUESTER`).

### 6.3. Responsive Viewport Verification
* Execute Playwright responsive screenshot capture across:
  * **Desktop**: 1280 x 800
  * **Tablet**: 768 x 1024
  * **Mobile**: 375 x 812
* Verify zero horizontal overflow, visible target tap sizes, and card transformations for IT Staff Queue and User Management tables.
