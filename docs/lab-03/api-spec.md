# TokTickIT Lab 3 REST API Specification (`api-spec.md`)

## 1. Authentication & Security Decisions

* **Session Token Strategy**: Authenticated sessions are established via JSON Web Tokens (JWT) stored in HTTP-Only cookies (`toktickit_session`) or returned as Bearer tokens in Authorization headers (`Authorization: Bearer <token>`).
* **Password Security**: Passwords are hashed using `bcrypt` (minimum cost factor 10). Plaintext passwords are never returned in responses or logged.
* **Standard Error Format**:
  All APIs return consistent error JSON payloads:
  ```json
  {
    "error": "Human readable error message",
    "code": "ERROR_CODE_STRING",
    "details": []
  }
  ```
* **HTTP Status Code Mapping**:
  * `200 OK`: Request succeeded.
  * `201 Created`: Resource successfully created.
  * `400 Bad Request`: Validation failure or invalid input parameters.
  * `401 Unauthorized`: Unauthenticated access or invalid credentials.
  * `403 Forbidden`: Authenticated user lacks required role or resource ownership.
  * `404 Not Found`: Resource does not exist (or safe masking for unauthorized resources).
  * `409 Conflict`: Resource state conflict (e.g. duplicate email address).
  * `500 Internal Server Error`: Unexpected server error.

---

## 2. Authentication APIs

### 2.1. Login
* **Method & Path**: `POST /api/auth/login`
* **Authentication**: None (Public)
* **Authorization**: Public
* **Request Body**:
  ```json
  {
    "email": "jennifer@toktickit.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer@toktickit.com",
      "role": "REQUESTER",
      "mustChangePassword": false,
      "isActive": true
    }
  }
  ```
* **Errors**:
  * `400 Bad Request`: Missing email or password fields.
  * `401 Unauthorized`: Invalid credentials or inactive account (`isActive = false`).

### 2.2. Logout
* **Method & Path**: `POST /api/auth/logout`
* **Authentication**: Required
* **Authorization**: All Authenticated Roles
* **Request Body**: Empty
* **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### 2.3. Get Current Authenticated User
* **Method & Path**: `GET /api/auth/me`
* **Authentication**: Required
* **Authorization**: All Authenticated Roles
* **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer@toktickit.com",
      "role": "REQUESTER",
      "mustChangePassword": false,
      "isActive": true
    }
  }
  ```
* **Errors**: `401 Unauthorized`.

### 2.4. Mandatory / Profile Password Change
* **Method & Path**: `POST /api/auth/change-password`
* **Authentication**: Required
* **Authorization**: All Authenticated Roles (Allowed even when `mustChangePassword = true`)
* **Request Body**:
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewStrongPassword1!",
    "confirmPassword": "NewStrongPassword1!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully",
    "user": {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer@toktickit.com",
      "role": "REQUESTER",
      "mustChangePassword": false
    }
  }
  ```
* **Errors**:
  * `400 Bad Request`: Password mismatch, incorrect current password, or fails complexity rules (min 8 chars, mixed case, number, special character).
  * `401 Unauthorized`: Unauthenticated.

---

## 3. Requester Ticket & Attachment APIs

### 3.1. List Requester Tickets
* **Method & Path**: `GET /api/tickets`
* **Authentication**: Required
* **Authorization**: `REQUESTER` (Only returns tickets owned by authenticated user)
* **Response (200 OK)**:
  ```json
  {
    "tickets": [
      {
        "id": 10,
        "ticketNumber": "TXT-2025-001234",
        "summary": "Laptop battery drains quickly",
        "category": { "id": 1, "name": "Hardware" },
        "relatedSystem": { "id": 2, "name": "Corporate Laptop" },
        "requestedPriority": "MEDIUM",
        "itPriority": "MEDIUM",
        "status": "IN_PROGRESS",
        "createdAt": "2025-05-12T09:14:00Z"
      }
    ]
  }
  ```

### 3.2. Create Ticket
* **Method & Path**: `POST /api/tickets`
* **Authentication**: Required
* **Authorization**: `REQUESTER`
* **Request Body**:
  ```json
  {
    "categoryId": 1,
    "relatedSystemId": 2,
    "requestedPriority": "MEDIUM",
    "summary": "Laptop battery drains quickly",
    "description": "Battery drains in less than an hour."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "ticket": {
      "id": 10,
      "ticketNumber": "TXT-2025-001234",
      "requesterId": 1,
      "categoryId": 1,
      "relatedSystemId": 2,
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "status": "NEW",
      "summary": "Laptop battery drains quickly",
      "description": "Battery drains in less than an hour.",
      "createdAt": "2025-05-12T09:14:00Z"
    }
  }
  ```

### 3.3. Get Ticket Detail (Requester)
* **Method & Path**: `GET /api/tickets/:id`
* **Authentication**: Required
* **Authorization**: `REQUESTER` (Must own ticket) or `IT_STAFF` / `ADMINISTRATOR`
* **Response (200 OK)**:
  ```json
  {
    "ticket": {
      "id": 10,
      "ticketNumber": "TXT-2025-001234",
      "summary": "Laptop battery drains quickly",
      "description": "Battery drains in less than an hour.",
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "status": "IN_PROGRESS",
      "requester": { "id": 1, "name": "Jennifer Anderson", "email": "jennifer@toktickit.com" },
      "owner": { "id": 5, "name": "Michael Brown" },
      "category": { "id": 1, "name": "Hardware" },
      "relatedSystem": { "id": 2, "name": "Corporate Laptop" },
      "attachments": []
    }
  }
  ```
* **Errors**: `403 Forbidden` / `404 Not Found` if Requester does not own ticket.

---

## 4. IT Staff Ticket Queue & Workflow APIs

### 4.1. Get IT Staff Ticket Queue
* **Method & Path**: `GET /api/staff/tickets`
* **Authentication**: Required
* **Authorization**: `IT_STAFF`, `ADMINISTRATOR`
* **Query Parameters**:
  * `search`: String (optional search on ticket number, summary, description)
  * `status`: String / Enum (optional ticket status filter)
  * `categoryId`: Integer (optional)
  * `requestedPriority`: Enum (optional)
  * `itPriority`: Enum (optional)
  * `ownerId`: Integer / "unassigned" (optional owner filter)
  * `sortBy`: "createdAt" | "ticketNumber" | "status" | "itPriority" (default: "createdAt")
  * `sortOrder`: "asc" | "desc" (default: "desc")
  * `page`: Integer (default: 1)
  * `pageSize`: Integer (default: 10)
* **Response (200 OK)**:
  ```json
  {
    "tickets": [...],
    "pagination": {
      "total": 67,
      "page": 1,
      "pageSize": 10,
      "totalPages": 7
    }
  }
  ```

### 4.2. Update Ticket Operational Workflow (Claim/Assign, IT Priority, Status)
* **Method & Path**: `PATCH /api/staff/tickets/:id`
* **Authentication**: Required
* **Authorization**: `IT_STAFF`, `ADMINISTRATOR`
* **Request Body** (Partial updates supported):
  ```json
  {
    "ownerId": 5,
    "itPriority": "HIGH",
    "status": "IN_PROGRESS",
    "resolutionSummary": "Replaced laptop battery with new model."
  }
  ```
* **Response (200 OK)**: Updated Ticket object.
* **Errors**:
  * `400 Bad Request`: Invalid status transition according to status transition matrix, or missing resolution summary when moving to `RESOLVED`.
  * `403 Forbidden`: Non-IT Staff user.

---

## 5. Public Comments & Internal Notes APIs

### 5.1. Get Public Comments
* **Method & Path**: `GET /api/tickets/:id/public-comments`
* **Authentication**: Required
* **Authorization**: Requester (owned ticket), IT Staff, Administrator
* **Response (200 OK)**:
  ```json
  {
    "comments": [
      {
        "id": 1,
        "content": "Thank you for the update.",
        "createdAt": "2025-05-13T11:45:00Z",
        "author": { "id": 1, "name": "Jennifer Anderson", "role": "REQUESTER" }
      }
    ]
  }
  ```

### 5.2. Post Public Comment
* **Method & Path**: `POST /api/tickets/:id/public-comments`
* **Authentication**: Required
* **Authorization**: Requester (owned ticket), IT Staff, Administrator
* **Request Body**:
  ```json
  {
    "content": "I have tested the system and the issue appears resolved."
  }
  ```
* **Response (201 Created)**: Created Public Comment object.
* **Errors**: `400 Bad Request` if content is empty or whitespace-only.

### 5.3. Get Internal Notes (Role Restricted)
* **Method & Path**: `GET /api/tickets/:id/internal-notes`
* **Authentication**: Required
* **Authorization**: `IT_STAFF`, `ADMINISTRATOR` ONLY
* **Response (200 OK)**:
  ```json
  {
    "notes": [
      {
        "id": 1,
        "content": "Diagnosed battery fault. Replacement part ordered.",
        "createdAt": "2025-05-13T10:30:00Z",
        "author": { "id": 5, "name": "Michael Brown", "role": "IT_STAFF" }
      }
    ]
  }
  ```
* **Errors**: `403 Forbidden` if requested by a Requester.

### 5.4. Post Internal Note (Role Restricted)
* **Method & Path**: `POST /api/tickets/:id/internal-notes`
* **Authentication**: Required
* **Authorization**: `IT_STAFF`, `ADMINISTRATOR` ONLY
* **Request Body**:
  ```json
  {
    "content": "Replacement battery installed successfully."
  }
  ```
* **Response (201 Created)**: Created Internal Note object.
* **Errors**: `403 Forbidden` if requested by a Requester.

---

## 6. Administrator User Management APIs

### 6.1. List Users
* **Method & Path**: `GET /api/admin/users`
* **Authentication**: Required
* **Authorization**: `ADMINISTRATOR`
* **Query Parameters**:
  * `search`: String (optional search on name or email)
  * `role`: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR" (optional)
* **Response (200 OK)**:
  ```json
  {
    "users": [
      {
        "id": 1,
        "name": "Jennifer Anderson",
        "email": "jennifer@toktickit.com",
        "role": "REQUESTER",
        "isActive": true,
        "createdAt": "2025-01-10T08:00:00Z"
      }
    ]
  }
  ```

### 6.2. Create User
* **Method & Path**: `POST /api/admin/users`
* **Authentication**: Required
* **Authorization**: `ADMINISTRATOR`
* **Request Body**:
  ```json
  {
    "name": "Alex Thompson",
    "email": "alex.thompson@toktickit.com",
    "role": "IT_STAFF",
    "isActive": true,
    "initialPassword": "InitialPassword123!"
  }
  ```
* **Response (201 Created)**: Created User object (with `mustChangePassword = true`).
* **Errors**:
  * `400 Bad Request`: Missing fields or invalid role value.
  * `409 Conflict`: Email already exists.

### 6.3. Edit User Basic Info & Activation State
* **Method & Path**: `PATCH /api/admin/users/:id`
* **Authentication**: Required
* **Authorization**: `ADMINISTRATOR`
* **Request Body**:
  ```json
  {
    "name": "Alex Thompson Updated",
    "email": "alex.t@toktickit.com",
    "role": "IT_STAFF",
    "isActive": false
  }
  ```
* **Response (200 OK)**: Updated User object.
* **Errors**:
  * `400 Bad Request`: Attempting to deactivate own account or deactivating the last active Administrator account.
  * `409 Conflict`: New email address conflicts with existing account.

### 6.4. Set New Initial Password
* **Method & Path**: `POST /api/admin/users/:id/reset-password`
* **Authentication**: Required
* **Authorization**: `ADMINISTRATOR`
* **Request Body**:
  ```json
  {
    "initialPassword": "NewInitialPassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "message": "Initial password set successfully. User must change password on next login."
  }
  ```
* **Errors**: `400 Bad Request` if password fails complexity requirements.
