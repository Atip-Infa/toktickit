# Lab 2 Sprint Engineering Specification: TokTickIT Requester Ticketing MVP with UI Foundation

## 1. Sprint Goal
The goal of Sprint 2 is to deliver a responsive, production-ready Requester-facing IT support ticketing experience for TokTickIT using the Zen Green visual design system. A Requester can simulate a logged-in session via a temporary Development Requester Selection mechanism, submit support requests with attachments, receive a unique backend-generated Ticket Number, view and filter their own tickets in a paginated list, inspect read-only ticket details, and manage permitted attachments (including soft removal with mandatory reason logging) while strictly enforcing multi-user ticket ownership isolation.

---

## 2. Stakeholder Request Interpretation
The IT department requires an intuitive end-user ticketing interface allowing staff and students to report IT issues. Requesters must be able to categorize problems, select affected systems, indicate requested priority, upload supporting files, and track ticket status. Because real authentication will be introduced in Lab 3, a temporary Development Requester selector acts as the user session context for testing. The system must store data safely in PostgreSQL, generate official Ticket Numbers automatically, guarantee that one Requester cannot view or modify another Requester's tickets or attachments, and establish reusable Zen Green visual components for future sprints.

---

## 3. Scope

### 3.1 Included Scope
- **Development Requester Selection**: Modal/Screen allowing selection of an active Development Requester identity from PostgreSQL to simulate a logged-in user context.
- **Application Shell & Navigation**: Header with TokTickIT identity, navigation links (My Tickets, Create Ticket), active page indicator, and selected Requester widget with a "Change Requester" action.
- **Create IT Support Ticket**: Requester-facing ticket submission form capturing Category, Related System, Requested Priority, Ticket Summary, Detailed Description, and optional initial file attachments.
- **Backend Ticket Number Generation**: Automatic generation of unique, official Ticket Numbers (e.g., `TKT-2025-001234`) upon successful creation.
- **My Tickets Listing**: Paginated table/card view showing tickets owned exclusively by the selected Requester.
- **Search, Filtering, Sorting & Pagination**: Live text search (Ticket Number, Summary), dropdown filters (Category, Requested Priority, Current Status), multi-column sorting, and configurable pagination (default 10 items/page).
- **Requester Ticket Detail (Read-Only)**: Comprehensive detail view presenting ticket header fields, status, assigned IT owner (if any), and resolution summary as read-only.
- **Attachment Lifecycle & Management**:
  - File validation (JPG, JPEG, PNG, WEBP, PDF; max 5 MB per file; max 5 active attachments per ticket).
  - File upload on ticket creation and directly on existing tickets.
  - Inspection of attachment metadata (filename, file size, upload timestamp, uploader identity).
  - Secure streaming download of active attachments.
  - Soft removal of owned attachments with mandatory removal reason logging (metadata retained, download permanently blocked).
- **Ownership Isolation**: Strict backend enforcement ensuring Requesters can only access their own tickets and attachments.
- **Zen Green UI Component Foundation**: Reusable theme tokens, form controls, responsive grid/flex layouts, badges, loading skeletons, empty states, and field-level error messages.

### 3.2 Explicitly Excluded Scope (Out of Scope for Lab 2)
- **Authentication & Security Credentials**: Passwords, password hashing, user registration, JWT/session tokens, real login/logout, and role-based access control (RBAC).
- **IT Staff Workflow & Controls**: IT Staff user dashboard/queue, claiming or reassigning tickets, modifying IT Priority, or setting ticket ownership.
- **Collaboration & Work Tracking**: Public Comments, Internal Notes, Actions Taken tab, or comment submission forms.
- **Post-Creation Ticket Lifecycle**: Status transitions beyond initial `NEW` status (e.g., resolving, closing, reopening, cancelling tickets, or resolution confirmation).
- **Administration Functions**: Admin screens for managing users, requesters, roles, categories, or related systems.

---

## 4. Functional Requirements (FR)

- **FR-01 (Requester Identity Selection)**: The system shall present a Development Requester Selection screen populated with active Requesters from PostgreSQL. The chosen Requester identity shall set the application testing context.
- **FR-02 (Requester Identity Switching)**: The application shell shall display the active Requester's name and provide a "Change Requester" action to switch testing context. Switching identity shall immediately clear and reload all requester-specific data.
- **FR-03 (Create Ticket Form)**: The system shall provide a Create Ticket form allowing the active Requester to select a Category, select a Related System, choose a Requested Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), enter a Ticket Summary, enter a Detailed Description, and attach supporting files.
- **FR-04 (Ticket Number Assignment)**: Upon successful ticket creation, the backend shall generate a unique Ticket Number formatted as `TKT-YYYY-XXXXXX` and return it to the client.
- **FR-05 (Initial Ticket Status)**: Every newly created ticket shall automatically be assigned `Current Status = NEW` and default `IT Priority = MEDIUM`.
- **FR-06 (My Tickets View)**: The system shall provide a My Tickets screen listing tickets where `ticket.requesterId` matches the currently selected Development Requester.
- **FR-07 (Ticket Search)**: The My Tickets view shall support case-insensitive text searching against `ticketNumber` and `summary`.
- **FR-08 (Ticket Filtering)**: The My Tickets view shall support filtering by `categoryId`, `requestedPriority`, and `status`. Filters shall combine additively with search queries.
- **FR-09 (Ticket Sorting)**: The My Tickets view shall support sorting by `createdAt` (default DESC), `ticketNumber`, or `updatedAt`.
- **FR-10 (Ticket Pagination)**: The My Tickets API and UI shall paginate results (default page size 10; selectable 5, 10, 25) and include total count and page metadata.
- **FR-11 (Requester Ticket Detail)**: The system shall render a read-only detail view for any ticket owned by the selected Requester, showing header fields, IT owner, resolution summary, and an active Attachments tab.
- **FR-12 (Attachment Upload)**: The system shall support uploading permitted files (JPG, JPEG, PNG, WEBP, PDF up to 5 MB each) during ticket creation and on existing owned tickets.
- **FR-13 (Attachment Active Quota)**: The backend shall reject attachment upload attempts if the target ticket already contains 5 active (non-removed) attachments.
- **FR-14 (Attachment Download)**: The system shall allow downloading active attachments belonging to owned tickets.
- **FR-15 (Attachment Soft Removal)**: The system shall allow a Requester to soft-remove an attachment from an owned ticket by providing a mandatory removal reason. The database record shall set `isRemoved = true`, record `removedAt` and `removalReason`, retain metadata view, and disable downloading.
- **FR-16 (Ownership Protection)**: The backend shall reject any attempt to read, modify, or download tickets or attachments where `ticket.requesterId` does not match the requesting `requesterId` with HTTP `403 Forbidden` or `404 Not Found`.

---

## 5. Business Rules (BR)

| BR ID | Business Rule Title | Description & Rule Statement |
| :--- | :--- | :--- |
| **BR-01** | **Backend Ticket Number Generation** | The official Ticket Number must be generated server-side upon database insertion in format `TKT-YYYY-XXXXXX` (where YYYY is current year and XXXXXX is sequential/padded number) and must be globally unique. |
| **BR-02** | **Default Status on Creation** | Every new Ticket must be created with `status = NEW`. Requesters cannot modify status during or after ticket creation. |
| **BR-03** | **Development Selector Scope** | Lab 2 uses a Development Requester selector as a testing mechanism to simulate sessions. It does NOT represent authentication, security passwords, or tokens. |
| **BR-04** | **Active Requesters Only** | The Development Requester selection dropdown must load and display ONLY active Requesters (`isActive = true`). Inactive Requesters must be excluded. |
| **BR-05** | **Requester Context Reloading** | Selecting or changing the Development Requester must clear current client-side ticket state and reload all data strictly for the newly selected `requesterId`. |
| **BR-06** | **Strict Requester Data Isolation** | A Requester can ONLY view, list, query, or manage tickets and attachments where `ticket.requesterId == selectedRequesterId`. Cross-requester access MUST be blocked by the backend. |
| **BR-07** | **Read-Only System Fields** | Ticket Number, Ticket Date, Status, IT Priority, IT Owner Name, and Resolution Summary are system-controlled read-only fields for Requesters. |
| **BR-08** | **Ticket Field Validation & Trimming** | Ticket Summary (min 5, max 120 chars) and Description (min 10, max 2000 chars) are required. Input strings must be trimmed of leading/trailing whitespace before length checks. |
| **BR-09** | **Reference Entity Integrity** | `categoryId` and `relatedSystemId` must reference valid, active database records. |
| **BR-10** | **Duplicate Submission Prevention** | The UI submit button must disable and show a busy spinner during form submission. The backend must reject rapid duplicate submissions. |
| **BR-11** | **Form Data Retention on Error** | If ticket creation fails due to backend validation or network error, the client form MUST preserve user-entered field values and selected attachments. |
| **BR-12** | **Permitted Attachment File Types** | Attachments are restricted strictly to file extensions `.jpg`, `.jpeg`, `.png`, `.webp`, and `.pdf` (matching MIME types `image/jpeg`, `image/png`, `image/webp`, `application/pdf`). |
| **BR-13** | **Attachment Size Limit** | Individual attachment file size must not exceed **5 MB** (5,242,880 bytes). Oversized files must be rejected both client-side and server-side. |
| **BR-14** | **Maximum Active Attachments** | A ticket may contain a maximum of **5 active** (`isRemoved = false`) attachments. Uploading a 6th active attachment must be rejected with an appropriate error. |
| **BR-15** | **Soft Removal Requirement** | Attachment deletion MUST be implemented as a soft removal (`isRemoved = true`, `removedAt = now()`). Records and physical storage must be preserved for auditing. |
| **BR-16** | **Mandatory Removal Reason** | Soft-removing an attachment requires a non-empty `removalReason` text string (min 3, max 255 chars). |
| **BR-17** | **Blocked Download for Removed Files** | Soft-removed attachments remain visible in metadata lists with a "Removed" badge, but file download API endpoints MUST return HTTP `403 Forbidden`. |
| **BR-18** | **Attachment Creation Compensation** | If ticket creation succeeds but an initial attachment upload fails, the ticket creation completes, the ticket number is returned, and a specific warning is shown for the failed attachment. |
| **BR-19** | **Default Ticket Sorting** | Ticket list queries default to sorting by `createdAt` in **descending** order (newest first). |
| **BR-20** | **Pagination Limits** | Page size options are restricted to 5, 10, and 25 items per page (default: 10). Out-of-bounds page requests return an empty array with accurate pagination metadata. |
| **BR-21** | **Search Field Target** | Search string queries match substring occurrences in `ticketNumber` OR `summary` (case-insensitive). |
| **BR-22** | **Lab 3 Authentication Preparedness** | Data schema and API parameters use explicit `requesterId` fields so that Lab 3 can replace the test selector with JWT token authentication without database schema breaks. |

---

## 6. UI Specification Summary
The frontend implements the **Zen Green Theme** visual language. Key component conventions include:
- **Header**: Primary Green (`#006B3C`) app bar displaying **TokTickIT** branding, navigation tabs (My Tickets, Create Ticket), and current Requester session badge with "Change Requester" dropdown.
- **Form Controls**: Labels positioned above controls; mandatory fields marked with red asterisk (`*`). Standardized height inputs with dark charcoal text (`#1A2E26`). Resizable Description textarea.
- **Button Hierarchy**: Primary Green (`#006B3C`) for primary submit actions; Secondary Green (`#0B7A46`) for secondary/filter actions; Neutral Gray for cancels; Destructive Red (`#991B1B`) for soft-removal actions. Disabled buttons visually muted and unclickable.
- **Badges**: Status badges (NEW = Pale Blue, IN_PROGRESS = Amber, RESOLVED = Green, CLOSED = Gray) and Priority badges (LOW = Muted Gray, MEDIUM = Warm Ivory/Amber, HIGH = Orange, URGENT = Red).
- **Responsive Layout**: Desktop (`>=992px`) multi-column form/table layout; Tablet (`768-991px`) two-column layout; Mobile (`<768px`) single-column stacked controls and card-based ticket list view.
- *Detailed visual styling tokens and screenshot checklists are defined in [ui-spec.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-02/ui-spec.md).*

---

## 7. Data Changes & Database Model

### 7.1 Prisma Schema Design (`prisma/schema.prisma`)

```prisma
model DevelopmentRequester {
  id          Int          @id @default(autoincrement())
  name        String       @db.VarChar(100)
  email       String       @unique @db.VarChar(150)
  department  String       @db.VarChar(100)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  tickets     Ticket[]
  attachments Attachment[]

  @@map("requesters")
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique @db.VarChar(100)
  code      String   @unique @db.VarChar(50)
  isActive  Boolean  @default(true)
  tickets   Ticket[]

  @@map("categories")
}

model RelatedSystem {
  id        Int      @id @default(autoincrement())
  name      String   @unique @db.VarChar(100)
  code      String   @unique @db.VarChar(50)
  isActive  Boolean  @default(true)
  tickets   Ticket[]

  @@map("related_systems")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  NEW
  IN_PROGRESS
  PENDING
  RESOLVED
  CLOSED
}

model Ticket {
  id                Int                  @id @default(autoincrement())
  ticketNumber      String               @unique @db.VarChar(30)
  requesterId       Int
  categoryId        Int
  relatedSystemId   Int
  requestedPriority Priority             @default(MEDIUM)
  itPriority        Priority             @default(MEDIUM)
  status            TicketStatus         @default(NEW)
  summary           String               @db.VarChar(120)
  description       String               @db.Text
  itOwnerName       String?              @db.VarChar(100)
  resolutionSummary String?              @db.Text
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  requester         DevelopmentRequester @relation(fields: [requesterId], references: [id])
  category          Category             @relation(fields: [categoryId], references: [id])
  relatedSystem     RelatedSystem        @relation(fields: [relatedSystemId], references: [id])
  attachments       Attachment[]

  @@index([requesterId, createdAt])
  @@index([status, categoryId, requestedPriority])
  @@map("tickets")
}

model Attachment {
  id                   Int                  @id @default(autoincrement())
  ticketId             Int
  filename             String               @db.VarChar(255)
  storagePath          String               @db.VarChar(500)
  fileSize             Int
  mimeType             String               @db.VarChar(100)
  uploadedByRequesterId Int
  isRemoved            Boolean              @default(false)
  removedAt            DateTime?
  removalReason        String?              @db.VarChar(255)
  createdAt            DateTime             @default(now())
  ticket               Ticket               @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  uploadedBy           DevelopmentRequester @relation(fields: [uploadedByRequesterId], references: [id])

  @@index([ticketId, isRemoved])
  @@map("attachments")
}
```

### 7.2 Database Seed Data Requirements (Idempotent)
- **Categories (4)**: Account and Access, Hardware, Software, Network.
- **Related Systems (7)**: Email, Campus Wi-Fi, VPN, LEB2 App, Grade Submission App, Printer, Corporate Laptop.
- **Development Requesters (5 total)**:
  - Active (4): `Jennifer Anderson` (`jennifer.a@kmutt.ac.th`), `David Lee` (`david.l@kmutt.ac.th`), `Sarah Johnson` (`sarah.j@kmutt.ac.th`), `Michael Scott` (`michael.s@kmutt.ac.th`).
  - Inactive (1): `Robert Paulson` (`robert.p@kmutt.ac.th`, `isActive: false`).

---

## 8. API Contract Summary
- `GET /api/requesters`: List active Development Requesters.
- `GET /api/categories`: List active Categories.
- `GET /api/related-systems`: List active Related Systems.
- `POST /api/tickets`: Create ticket for selected Requester (`requesterId`).
- `GET /api/tickets`: Query paginated tickets owned by `requesterId` (search, filter, sort, page).
- `GET /api/tickets/:id`: Get single owned ticket details (returns 403 on requester mismatch).
- `POST /api/tickets/:id/attachments`: Upload attachment file (multipart/form-data; checks 5MB, MIME, max 5 active).
- `GET /api/attachments/:id/metadata`: Fetch attachment metadata.
- `GET /api/attachments/:id/download`: Stream download active attachment (returns 403 if removed or unowned).
- `PATCH /api/attachments/:id/remove`: Soft-remove attachment with `removalReason`.
- *Detailed JSON schemas, query parameter specifications, and HTTP response codes are documented in [api-spec.md](file:///c:/Users/Atip/Downloads/toktickit/docs/lab-02/api-spec.md).*

---

## 9. Acceptance Criteria (AC)

- **AC-01 (Successful Ticket Creation)**:
  *Given* a selected active Development Requester (e.g., `requesterId = 1`), *when* the user fills valid category, related system, requested priority, summary ("Laptop battery drains fast"), description, and submits the form, *then* a new ticket record is created in PostgreSQL with `status = NEW`, an official Ticket Number (e.g., `TKT-2026-000001`) is returned, and a success banner is displayed.

- **AC-02 (Unselected Requester Navigation Guard)**:
  *Given* no Development Requester is selected, *when* the user attempts to access `/my-tickets` or `/create-ticket`, *then* the application automatically redirects to the Development Requester Selection screen.

- **AC-03 (Cross-Requester Ticket Access Isolation)**:
  *Given* Requester A (`requesterId = 1`) is selected, *when* Requester A attempts to fetch or view a ticket belonging to Requester B (`requesterId = 2`) via direct URL or API call, *then* the API returns HTTP `403 Forbidden` (or `404 Not Found`) and the client renders an access denied error screen.

- **AC-04 (Mandatory Form Validation)**:
  *Given* the Create Ticket form, *when* the user submits without entering Summary or Description, *then* inline validation messages ("Summary is required (min 5 characters)", "Description is required (min 10 characters)") appear directly below the fields and no API call is made.

- **AC-05 (Unpermitted File Type Upload Block)**:
  *Given* an unpermitted file format (e.g., `script.exe` or `data.zip`), *when* selected in the file uploader, *then* the client displays an error message ("File type not supported. Allowed formats: JPG, PNG, WEBP, PDF") and excludes the file from upload.

- **AC-06 (Oversized File Attachment Upload Block)**:
  *Given* a permitted file exceeding 5 MB (e.g., a 6.2 MB PDF), *when* selected for upload, *then* the uploader displays an error ("File size exceeds 5 MB limit") and prevents upload.

- **AC-07 (Maximum Active Attachments Limit)**:
  *Given* a ticket that already has 5 active attachments, *when* the user attempts to upload a 6th attachment, *then* the API returns HTTP `422 Unprocessable Entity` with message "Maximum 5 active attachments allowed per ticket".

- **AC-08 (Attachment Soft Removal with Reason)**:
  *Given* an active attachment on an owned ticket, *when* the Requester clicks Remove, enters a valid removal reason ("Uploaded duplicate file"), and confirms, *then* the attachment's `isRemoved` field updates to `true`, `removedAt` timestamp and reason are saved, the status badge changes to "Removed", and the download action is disabled.

- **AC-09 (Blocked Download on Soft-Removed Attachment)**:
  *Given* a soft-removed attachment (`isRemoved = true`), *when* any user sends a GET request to `/api/attachments/:id/download`, *then* the server responds with HTTP `403 Forbidden` and message "Removed attachments cannot be downloaded".

- **AC-10 (My Tickets Search and Filtering)**:
  *Given* a list of owned tickets, *when* the user enters search term "VPN" and selects Category "Network", *then* the ticket table updates to display only tickets matching both criteria and updates the total pagination count.

- **AC-11 (Requester Switching Context Reset)**:
  *Given* Requester A's ticket list is displayed, *when* the user switches session context to Requester B via the app header menu, *then* Requester A's tickets disappear immediately and Requester B's tickets are loaded.

- **AC-12 (Form State Retention on API Failure)**:
  *Given* entered ticket form text and files, *when* the submission fails due to a network or server error, *then* a Zen Green error alert displays and all entered form text and selected files are preserved in the form controls.

- **AC-13 (Inactive Requester Filter)**:
  *Given* an inactive Requester in the database (`isActive = false`), *when* the Development Requester selection dropdown renders, *then* the inactive Requester is excluded from the selectable options.

- **AC-14 (Responsive Layout Adaptation)**:
  *Given* viewports at Desktop (>=992px), Tablet (768-991px), and Mobile (<768px), *when* navigating Create Ticket, My Tickets, and Ticket Detail screens, *then* layouts adjust appropriately without text clipping, button overlap, or horizontal page scrolling.

- **AC-15 (Keyboard Accessibility & Focus)**:
  *Given* keyboard navigation (Tab / Shift+Tab / Enter / Space), *when* interacting with forms, dropdowns, filters, modals, and buttons, *then* clear visible focus rings (`#0B7A46`) appear and all controls are operable without a mouse.

---

## 10. Definition of Done (DoD)

### 10.1 Part 1: Product Completion Checklist
- [ ] **Specification Compliance**: All functionality in included scope implemented and matching `specification.md`, `ui-spec.md`, and `api-spec.md`.
- [ ] **Acceptance Criteria Verification**: Every Acceptance Criterion (AC-01 through AC-15) verified by automated tests.
- [ ] **Automated Test Coverage**: 100% pass rate across unit, API, UI component, UI style, responsive, and E2E Playwright test suites on the `main` branch.
- [ ] **Zero Excluded Features**: No code or UI elements added for authentication, passwords, comments, IT staff workflows, or post-creation status changes.
- [ ] **Data Integrity**: Database migrations and seed script run cleanly and idempotently (`npm run prisma:seed`).
- [ ] **Error Handling**: Graceful failure handling with form value retention and user-friendly error banners.

### 10.2 Part 2: Course Delivery Requirements Checklist
- [ ] **GitHub Issues**: Decomposition of sprint into Issues #11–#18, with Kanban board updated to `Done`.
- [ ] **Branch Workflow**: All work developed on feature branches (`feature/11-sprint-specification-test-plan`, etc.) merged into `lab2-staging` via peer-reviewed PRs, and released to `main` via a single staging release PR.
- [ ] **Peer Review Documented**: `docs/lab-02/reviewer.md` contains reviewer identity, PR links, code review comments, responses, and approvals.
- [ ] **AI Reflection Documented**: `docs/lab-02/ai-use.md` contains LLM identity, 6–10 prompt logs, and student reflection.
- [ ] **Submission PDF**: Single PDF generated using exact headings `Answer Part 1` through `Answer Part 9` containing readable screenshots and working links.

---

## 11. Assumptions and Architectural Decisions
1. **Testing Context Storage**: Selected `requesterId` is stored in client `localStorage` under key `toktickit_dev_requester_id` and included in HTTP header `X-Requester-Id` for all API calls.
2. **Attachment Disk Storage**: Uploaded files are stored in `server/uploads/lab-02/` using sanitized UUID filenames (`${uuidv4()}_${originalName}`) to prevent file overwrite collisions.
3. **Ticket Number Format**: Sequential padding based on database primary key ID: `TKT-2026-${String(id).padStart(6, '0')}`.
