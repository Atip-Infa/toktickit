# TokTickIT Lab 4 REST API Specification (`api-spec.md`)

## 1. Authentication & API Security Standards

* **Base URL**: `/api`
* **Session Token Strategy**: JSON Web Tokens (JWT) transmitted via HTTP-Only cookie (`toktickit_session`) or Bearer header (`Authorization: Bearer <token>`).
* **Standard Response Format**:
  Success responses return HTTP 200 OK or 201 Created with JSON data payloads.
* **Standard Error Format**:
  All API error responses adhere strictly to the standardized error schema:
  ```json
  {
    "error": "Human readable error description",
    "code": "ERROR_CODE_STRING",
    "details": []
  }
  ```
* **HTTP Status Code Mapping**:
  * `200 OK`: Request processed successfully.
  * `201 Created`: Resource successfully created.
  * `400 Bad Request`: Validation failure or business rule violation (e.g. missing fields, resolution gate failure).
  * `401 Unauthorized`: Unauthenticated user or invalid token.
  * `403 Forbidden`: Authenticated user lacks required role or resource ownership.
  * `404 Not Found`: Target resource does not exist (or safe masking for unauthorized items).
  * `409 Conflict`: Stale update concurrency conflict or duplicate record.
  * `500 Internal Server Error`: Unexpected server exception.

---

## 2. Requester Dashboard API

### 2.1. Get Requester Dashboard Summary
* **Method & Path**: `GET /api/requester/dashboard`
* **Authentication**: Required
* **Authorization**: `REQUESTER` role only.
* **Request Parameters**: None
* **Response (200 OK)**:
  ```json
  {
    "metrics": {
      "openTickets": 3,
      "inProgress": 2,
      "resolved": 5,
      "closed": 12
    },
    "recentTickets": [
      {
        "id": 10,
        "ticketNumber": "TXT-2025-001234",
        "summary": "Laptop battery drains quickly",
        "status": "IN_PROGRESS",
        "requestedPriority": "MEDIUM",
        "itPriority": "MEDIUM",
        "updatedAt": "2025-05-12T09:14:00Z"
      },
      {
        "id": 8,
        "ticketNumber": "TXT-2025-001230",
        "summary": "Printer large drawing offline",
        "status": "OPEN",
        "requestedPriority": "HIGH",
        "itPriority": "HIGH",
        "updatedAt": "2025-05-10T02:10:00Z"
      }
    ]
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Session missing or expired.
  * `403 Forbidden`: User has `IT_STAFF` or `ADMINISTRATOR` role (must use staff dashboard endpoint).

---

## 3. IT Staff Dashboard API

### 3.1. Get Staff & Admin Dashboard Summary
* **Method & Path**: `GET /api/staff/dashboard`
* **Authentication**: Required
* **Authorization**: `IT_STAFF` or `ADMINISTRATOR` roles.
* **Request Parameters**: None
* **Response (200 OK)** (For IT Staff actor):
  ```json
  {
    "metrics": {
      "newTickets": 14,
      "openTickets": 23,
      "inProgress": 18,
      "waitingForRequester": 7,
      "myAssigned": 16
    },
    "recentTickets": [
      {
        "id": 10,
        "ticketNumber": "TXT-2025-001234",
        "summary": "Laptop battery drains quickly",
        "status": "IN_PROGRESS",
        "requestedPriority": "MEDIUM",
        "itPriority": "HIGH",
        "owner": {
          "id": 2,
          "name": "Michael Brown"
        },
        "updatedAt": "2025-05-12T09:14:00Z"
      }
    ],
    "quickStats": {
      "unassignedTickets": 14
    }
  }
  ```
* **Response (200 OK)** (For Administrator actor):
  Includes `userCounts` object in addition to IT Staff metrics:
  ```json
  {
    "metrics": {
      "newTickets": 14,
      "openTickets": 23,
      "inProgress": 18,
      "waitingForRequester": 7,
      "myAssigned": 2
    },
    "recentTickets": [...],
    "quickStats": {
      "unassignedTickets": 14,
      "totalUsers": 10,
      "activeUsers": 9
    }
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Session missing or expired.
  * `403 Forbidden`: User has `REQUESTER` role.

---

## 4. Actions Taken APIs

### 4.1. List Actions Taken for a Ticket
* **Method & Path**: `GET /api/tickets/:id/actions-taken`
* **Authentication**: Required
* **Authorization**:
  * `REQUESTER`: Permitted ONLY if `requesterId` matches authenticated user ID.
  * `IT_STAFF`, `ADMINISTRATOR`: Permitted on any ticket.
* **Path Parameters**: `id` (integer) - Target Ticket ID.
* **Response (200 OK)**:
  ```json
  {
    "actionsTaken": [
      {
        "id": 1,
        "ticketId": 10,
        "actionDate": "2025-05-12T10:30:00.000Z",
        "description": "Ran battery health diagnostics and checked power adapter voltage output.",
        "result": "Battery capacity verified degraded at 42% of rated design capacity.",
        "performedBy": {
          "id": 2,
          "name": "Michael Brown",
          "email": "michael@toktickit.com",
          "role": "IT_STAFF"
        },
        "followUpRequired": true,
        "followUpNote": "Replacement battery ordered under hardware warranty (ETA 24 hours).",
        "attachmentNotes": "Refer to diagnostic_log.png in ticket attachments.",
        "createdAt": "2025-05-12T10:30:00.000Z",
        "updatedAt": "2025-05-12T10:30:00.000Z"
      }
    ]
  }
  ```
* **Errors**:
  * `401 Unauthorized`: Unauthenticated.
  * `403 Forbidden` / `404 Not Found`: Ticket owned by another Requester.

### 4.2. Create Action Taken
* **Method & Path**: `POST /api/tickets/:id/actions-taken`
* **Authentication**: Required
* **Authorization**: `IT_STAFF` or `ADMINISTRATOR` roles. Requesters are DENIED.
* **Request Body**:
  ```json
  {
    "description": "Replaced laptop internal battery pack with new OEM unit.",
    "result": "Laptop powered on, holding 100% charge during stress test.",
    "followUpRequired": true,
    "followUpNote": "Follow up with requester after 48 hours to confirm battery stability.",
    "attachmentNotes": "Battery replacement completion report attached."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "actionTaken": {
      "id": 2,
      "ticketId": 10,
      "actionDate": "2025-05-12T14:15:00.000Z",
      "description": "Replaced laptop internal battery pack with new OEM unit.",
      "result": "Laptop powered on, holding 100% charge during stress test.",
      "performedBy": {
        "id": 2,
        "name": "Michael Brown",
        "email": "michael@toktickit.com",
        "role": "IT_STAFF"
      },
      "followUpRequired": true,
      "followUpNote": "Follow up with requester after 48 hours to confirm battery stability.",
      "attachmentNotes": "Battery replacement completion report attached.",
      "createdAt": "2025-05-12T14:15:00.000Z",
      "updatedAt": "2025-05-12T14:15:00.000Z"
    }
  }
  ```
* **Errors**:
  * `400 Bad Request`: Missing `description` or `result`, or `followUpRequired` is `true` but `followUpNote` is empty.
    ```json
    {
      "error": "Follow-up note is required when follow-up is requested",
      "code": "MISSING_FOLLOWUP_NOTE"
    }
    ```
  * `403 Forbidden`: Requester user role attempted operation.
  * `404 Not Found`: Ticket ID does not exist.

### 4.3. Update Action Taken
* **Method & Path**: `PATCH /api/tickets/:id/actions-taken/:actionId`
* **Authentication**: Required
* **Authorization**: `IT_STAFF` or `ADMINISTRATOR` roles.
* **Request Body** (Partial):
  ```json
  {
    "result": "Updated result: Battery burn-in diagnostic passed with zero defects.",
    "followUpRequired": false,
    "followUpNote": null
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "actionTaken": {
      "id": 2,
      "ticketId": 10,
      "actionDate": "2025-05-12T14:15:00.000Z",
      "description": "Replaced laptop internal battery pack with new OEM unit.",
      "result": "Updated result: Battery burn-in diagnostic passed with zero defects.",
      "performedBy": {
        "id": 2,
        "name": "Michael Brown",
        "email": "michael@toktickit.com",
        "role": "IT_STAFF"
      },
      "followUpRequired": false,
      "followUpNote": null,
      "attachmentNotes": "Battery replacement completion report attached.",
      "createdAt": "2025-05-12T14:15:00.000Z",
      "updatedAt": "2025-05-12T15:00:00.000Z"
    }
  }
  ```
* **Errors**:
  * `400 Bad Request`: Validation failure.
  * `403 Forbidden`: Non-staff user.
  * `404 Not Found`: Action Taken or Ticket ID not found.

---

## 5. Ticket Workflow & Resolution Gate API Updates

### 5.1. Update Staff Ticket Workflow & Resolution
* **Method & Path**: `PATCH /api/staff/tickets/:id`
* **Authentication**: Required
* **Authorization**: `IT_STAFF` or `ADMINISTRATOR`.
* **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "resolutionSummary": "Replaced laptop battery pack and validated 100% charging capacity.",
    "itPriority": "HIGH",
    "ownerId": 2,
    "expectedUpdatedAt": "2025-05-12T09:14:00.000Z"
  }
  ```
* **Backend Validation Logic**:
  1. **Status Transition Check**: Validates transition against Status Transition Matrix. Returns `400 Bad Request` if transition is invalid.
  2. **Resolution Gate Check**: If `status` is `RESOLVED` or `CLOSED`:
     - Checks if `resolutionSummary` is non-empty string.
     - Queries `ActionTaken` table: `COUNT(ActionTaken WHERE ticketId = :id)`.
     - If `resolutionSummary` is missing or `COUNT(ActionTaken) === 0`, returns `400 Bad Request`:
       ```json
       {
         "error": "Cannot resolve ticket: At least one Action Taken record and a Resolution Summary are required before resolving or closing a ticket.",
         "code": "RESOLUTION_GATE_FAILED"
       }
       ```
  3. **Stale Update Concurrency Check**: If `expectedUpdatedAt` is provided, compares against DB record `ticket.updatedAt`. If mismatch:
     ```json
     {
       "error": "This ticket has been updated by another user. Please refresh and review before saving changes.",
       "code": "STALE_UPDATE_CONFLICT"
     }
     ```
* **Response (200 OK)**:
  ```json
  {
    "ticket": {
      "id": 10,
      "ticketNumber": "TXT-2025-001234",
      "status": "RESOLVED",
      "resolutionSummary": "Replaced laptop battery pack and validated 100% charging capacity.",
      "itPriority": "HIGH",
      "ownerId": 2,
      "updatedAt": "2025-05-12T16:00:00.000Z"
    }
  }
  ```

---

## 6. Complete API Authorization Matrix

| Endpoint Path | Verb | Requester | IT Staff | Admin | Standard Failure |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/api/auth/login` | POST | Public | Public | Public | 401 |
| `/api/auth/logout` | POST | Permitted | Permitted | Permitted | 401 |
| `/api/auth/me` | GET | Permitted | Permitted | Permitted | 401 |
| `/api/auth/change-password` | POST | Permitted | Permitted | Permitted | 400, 401 |
| `/api/requester/dashboard` | GET | **Permitted (Own)** | Denied | Denied | 403 |
| `/api/staff/dashboard` | GET | Denied | **Permitted** | **Permitted** | 403 |
| `/api/tickets` | GET | Permitted (Own) | Denied | Denied | 403 |
| `/api/tickets` | POST | Permitted | Denied | Denied | 403 |
| `/api/tickets/:id` | GET | Permitted (Own) | Permitted | Permitted | 403, 404 |
| `/api/tickets/:id/actions-taken` | GET | **Permitted (Own)** | **Permitted** | **Permitted** | 403, 404 |
| `/api/tickets/:id/actions-taken` | POST | **Denied** | **Permitted** | **Permitted** | 400, 403 |
| `/api/tickets/:id/actions-taken/:actionId` | PATCH | **Denied** | **Permitted** | **Permitted** | 400, 403, 404 |
| `/api/staff/tickets` | GET | Denied | Permitted | Permitted | 403 |
| `/api/staff/tickets/:id` | PATCH | Denied | Permitted | Permitted | 400, 403, 409 |
| `/api/tickets/:id/public-comments` | GET/POST | Permitted (Own) | Permitted | Permitted | 400, 403 |
| `/api/tickets/:id/internal-notes` | GET/POST | Denied | Permitted | Permitted | 403 |
| `/api/admin/users` | GET/POST | Denied | Denied | Permitted | 403, 409 |
| `/api/admin/users/:id` | PATCH | Denied | Denied | Permitted | 400, 403, 409 |
| `/api/admin/users/:id/reset-password` | POST | Denied | Denied | Permitted | 400, 403 |
