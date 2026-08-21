# Lab 2 REST API Specification: TokTickIT Backend Contracts

## 1. Overview & Context

This document defines the RESTful API endpoints for **Lab 2 TokTickIT Requester Ticketing MVP**. All endpoints are prefixed with `/api`. Data transfer formats default to JSON (`application/json`), except file upload endpoints which use `multipart/form-data`.

### 1.1 Testing Authentication / Identity Model
Because real authentication is introduced in Lab 3, Lab 2 uses a temporary Development Requester selection context. The currently selected Requester's ID (`requesterId`) MUST be provided either:
- Via the custom HTTP Header: `X-Requester-Id: <number>`
- Or via the URL Query Parameter: `?requesterId=<number>`

The backend verifies that `requesterId` belongs to an active Development Requester before processing requests.

---

## 2. Global Error Response Schema

All error responses from the API conform to the following standard JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request input parameters",
    "details": [
      {
        "field": "summary",
        "message": "Summary is required and must be between 5 and 120 characters"
      }
    ],
    "timestamp": "2026-08-21T17:25:00.000Z"
  }
}
```

---

## 3. Reference Data Endpoints

### 3.1 `GET /api/requesters`
- **Purpose**: Retrieve list of active Development Requesters for the selection dropdown.
- **Request Headers**: None required.
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer.a@kmutt.ac.th",
      "department": "Computer Engineering",
      "isActive": true
    },
    {
      "id": 2,
      "name": "David Lee",
      "email": "david.l@kmutt.ac.th",
      "department": "Information Technology",
      "isActive": true
    }
  ]
}
```

### 3.2 `GET /api/categories`
- **Purpose**: Retrieve list of active Ticket Categories.
- **Response `200 OK`**:
```json
{
  "data": [
    { "id": 1, "name": "Account and Access", "code": "ACC_ACCESS" },
    { "id": 2, "name": "Hardware", "code": "HARDWARE" },
    { "id": 3, "name": "Software", "code": "SOFTWARE" },
    { "id": 4, "name": "Network", "code": "NETWORK" }
  ]
}
```

### 3.3 `GET /api/related-systems`
- **Purpose**: Retrieve list of active Related Systems.
- **Response `200 OK`**:
```json
{
  "data": [
    { "id": 1, "name": "Email", "code": "EMAIL" },
    { "id": 2, "name": "Campus Wi-Fi", "code": "WIFI" },
    { "id": 3, "name": "VPN", "code": "VPN" },
    { "id": 4, "name": "LEB2 App", "code": "LEB2" },
    { "id": 5, "name": "Grade Submission App", "code": "GRADES" },
    { "id": 6, "name": "Printer", "code": "PRINTER" },
    { "id": 7, "name": "Corporate Laptop", "code": "LAPTOP" }
  ]
}
```

---

## 4. Ticket Management Endpoints

### 4.1 `POST /api/tickets`
- **Purpose**: Create a new IT support ticket for the active Development Requester.
- **Headers**: `Content-Type: application/json`, `X-Requester-Id: 1`
- **Request Body**:
```json
{
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 7,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when idle."
}
```
- **Validation Rules**:
  - `requesterId`: Required positive integer referencing active Requester (BR-04, BR-09).
  - `categoryId`: Required positive integer referencing active Category.
  - `relatedSystemId`: Required positive integer referencing active Related System.
  - `requestedPriority`: Required enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - `summary`: Required string, trimmed, min 5, max 120 chars (BR-08).
  - `description`: Required string, trimmed, min 10, max 2000 chars (BR-08).
- **Response `201 Created`**:
```json
{
  "data": {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 7,
    "requestedPriority": "MEDIUM",
    "itPriority": "MEDIUM",
    "status": "NEW",
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual even when idle.",
    "itOwnerName": null,
    "resolutionSummary": null,
    "createdAt": "2026-08-21T17:25:00.000Z",
    "updatedAt": "2026-08-21T17:25:00.000Z"
  }
}
```
- **Error Status Codes**:
  - `400 Bad Request`: Validation failure on fields.
  - `422 Unprocessable Entity`: Invalid requester or category reference.

---

### 4.2 `GET /api/tickets`
- **Purpose**: Retrieve a paginated list of tickets owned exclusively by the requesting Requester.
- **Query Parameters**:
  - `requesterId` (Required, integer): Must match active session (BR-06).
  - `search` (Optional, string): Substring search against `ticketNumber` or `summary`.
  - `category` (Optional, integer): Filter by `categoryId`.
  - `priority` (Optional, string): Filter by `requestedPriority`.
  - `status` (Optional, string): Filter by `status`.
  - `sortBy` (Optional, string): `createdAt` (default), `ticketNumber`, or `updatedAt`.
  - `sortOrder` (Optional, string): `asc` or `desc` (default: `desc`).
  - `page` (Optional, integer): Page number (default: `1`).
  - `pageSize` (Optional, integer): Items per page (5, 10, 25; default: `10`).
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": 101,
      "ticketNumber": "TKT-2026-000101",
      "createdAt": "2026-08-21T17:25:00.000Z",
      "summary": "Laptop battery drains quickly",
      "category": { "id": 2, "name": "Hardware" },
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "status": "NEW",
      "itOwnerName": null,
      "updatedAt": "2026-08-21T17:25:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```
- **Error Status Codes**:
  - `400 Bad Request`: Missing `requesterId` query parameter.

---

### 4.3 `GET /api/tickets/:id`
- **Purpose**: Retrieve single ticket details for an owned ticket.
- **Headers / Query**: `X-Requester-Id: 1`
- **Ownership Rule**: The backend queries the ticket and verifies `ticket.requesterId == callerRequesterId`. Mismatches return HTTP `403 Forbidden` (BR-06).
- **Response `200 OK`**:
```json
{
  "data": {
    "id": 101,
    "ticketNumber": "TKT-2026-000101",
    "requester": { "id": 1, "name": "Jennifer Anderson", "email": "jennifer.a@kmutt.ac.th" },
    "category": { "id": 2, "name": "Hardware" },
    "relatedSystem": { "id": 7, "name": "Corporate Laptop" },
    "requestedPriority": "MEDIUM",
    "itPriority": "MEDIUM",
    "status": "NEW",
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual even when idle.",
    "itOwnerName": null,
    "resolutionSummary": null,
    "createdAt": "2026-08-21T17:25:00.000Z",
    "updatedAt": "2026-08-21T17:25:00.000Z",
    "attachments": []
  }
}
```
- **Error Status Codes**:
  - `403 Forbidden`: Requesting user does not own the ticket (AC-03).
  - `404 Not Found`: Ticket ID does not exist.

---

## 5. Attachment Management Endpoints

### 5.1 `POST /api/tickets/:id/attachments`
- **Purpose**: Upload a supporting attachment file to an existing owned ticket.
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (Binary file), `requesterId` (Integer).
- **Validation Rules**:
  - Ticket ownership verified (`ticket.requesterId == requesterId`).
  - Active attachment count limit: Ticket must have `< 5` active attachments (`isRemoved = false`) (BR-14).
  - File extension & MIME type: Restricted to `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` (BR-12).
  - File size: Must be `<= 5 MB` (5,242,880 bytes) (BR-13).
- **Response `201 Created`**:
```json
{
  "data": {
    "id": 501,
    "ticketId": 101,
    "filename": "battery_diagnostics.pdf",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "uploadedByRequesterId": 1,
    "isRemoved": false,
    "removedAt": null,
    "removalReason": null,
    "createdAt": "2026-08-21T17:26:00.000Z"
  }
}
```
- **Error Status Codes**:
  - `403 Forbidden`: Mismatched ticket ownership.
  - `413 Payload Too Large`: File exceeds 5 MB (AC-06).
  - `415 Unsupported Media Type`: Unpermitted MIME type or extension (AC-05).
  - `422 Unprocessable Entity`: Maximum 5 active attachments quota exceeded (AC-07).

---

### 5.2 `GET /api/attachments/:id/metadata`
- **Purpose**: Retrieve metadata for a single attachment.
- **Headers / Query**: `X-Requester-Id: 1`
- **Response `200 OK`**:
```json
{
  "data": {
    "id": 501,
    "ticketId": 101,
    "filename": "battery_diagnostics.pdf",
    "fileSize": 1048576,
    "mimeType": "application/pdf",
    "isRemoved": false,
    "removedAt": null,
    "removalReason": null,
    "createdAt": "2026-08-21T17:26:00.000Z"
  }
}
```
- **Error Status Codes**: `403 Forbidden`, `404 Not Found`.

---

### 5.3 `GET /api/attachments/:id/download`
- **Purpose**: Stream and download an active attachment file.
- **Headers / Query**: `X-Requester-Id: 1`
- **Rules**:
  - Ownership verified (`attachment.ticket.requesterId == requesterId`).
  - If `isRemoved == true`, download is BLOCKED (BR-17).
- **Response `200 OK`**: Binary file stream with headers:
  - `Content-Disposition: attachment; filename="battery_diagnostics.pdf"`
  - `Content-Type: application/pdf`
- **Error Status Codes**:
  - `403 Forbidden`: Download attempted on a soft-removed attachment (AC-09) OR ownership mismatch.
  - `404 Not Found`: Attachment ID or underlying disk file not found.

---

### 5.4 `PATCH /api/attachments/:id/remove`
- **Purpose**: Soft-remove an attachment from an owned ticket.
- **Headers**: `Content-Type: application/json`, `X-Requester-Id: 1`
- **Request Body**:
```json
{
  "requesterId": 1,
  "removalReason": "Uploaded duplicate file by mistake"
}
```
- **Validation Rules**:
  - `removalReason`: Mandatory string, min 3, max 255 characters (BR-16).
  - Ownership verified.
- **Response `200 OK`**:
```json
{
  "data": {
    "id": 501,
    "ticketId": 101,
    "filename": "battery_diagnostics.pdf",
    "isRemoved": true,
    "removedAt": "2026-08-21T17:27:00.000Z",
    "removalReason": "Uploaded duplicate file by mistake"
  }
}
```
- **Error Status Codes**:
  - `400 Bad Request`: Missing or empty `removalReason` (API-15).
  - `403 Forbidden`: Ownership mismatch.
  - `404 Not Found`: Attachment ID not found.

---

## 6. HTTP Status Code Summary

| HTTP Code | Name | Application Usage |
| :--- | :--- | :--- |
| **200** | OK | Successful retrieval (`GET`), sorting, pagination, or soft removal update (`PATCH`). |
| **201** | Created | Resource successfully created (`POST /api/tickets`, `POST /api/tickets/:id/attachments`). |
| **400** | Bad Request | Validation failure on input fields or missing mandatory removal reason. |
| **403** | Forbidden | Ticket/Attachment ownership mismatch or download request on a soft-removed file. |
| **404** | Not Found | Requested ticket, attachment, or requester resource ID does not exist. |
| **413** | Payload Too Large | Attachment file upload size exceeds 5 MB limit. |
| **415** | Unsupported Media Type | File extension or MIME type not in allowed list (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`). |
| **422** | Unprocessable Entity | Business logic failure (e.g., ticket already has 5 active attachments). |
| **500** | Internal Server Error | Server runtime error; returns safe error response banner. |
