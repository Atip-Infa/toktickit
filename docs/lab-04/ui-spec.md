# TokTickIT Lab 4 User Interface Specification (`ui-spec.md`)

## 1. Zen Green Design System & Design Aesthetics

Lab 4 extends the Zen Green visual design language established in Lab 2 and expanded in Lab 3. All dashboard screens, metric cards, Actions Taken tables, modals, and workflow feedback elements MUST use CSS variables defined in `client/src/zen-green.css`.

### 1.1. Color Tokens & Visual Hierarchy
* **Primary Branding Accent**: Deep Zen Green (`--zg-primary: #055037`, hover: `--zg-primary-hover: #033a27`).
* **Card & Surface Backgrounds**: Crisp White Surface (`--zg-surface: #ffffff`), Page Background (`--zg-bg: #f4f6f8`).
* **Borders & Dividers**: Light Slate Gray (`--zg-border: #e2e8f0`).
* **Text Hierarchies**: Primary Dark Slate (`--zg-text: #1e293b`), Muted Body (`--zg-muted: #64748b`).
* **Follow-up Highlight Badge**: Soft Amber (`#fef3c7`), Amber Dark Text (`#92400e`).

### 1.2. Metric Card Design Language
* **Container**: White surface card with 8px border-radius, subtle shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`), and 1px border.
* **Header**: Card title in uppercase muted text (`font-size: 13px`, `font-weight: 600`, `--zg-muted`).
* **Value**: Large bold numeric metric (`font-size: 32px`, `font-weight: 700`, `--zg-text`).
* **Trend / Subtext**: Small pill indicator or text displaying change or context (e.g. `+3 from yesterday` or `Requires attention`).
* **Interaction**: Hover elevates card with subtle border highlight (`border-color: #055037`) and pointer cursor. Focus ring on keyboard navigate (`outline: 2px solid #055037`).

---

## 2. Top Application Navigation (`AppHeader.tsx`)

* **Role-Based Navigation Links**:
  * **Requester**: "Dashboard" (`/requester-dashboard`), "My Tickets" (`/my-tickets`), "Create Ticket" (`/create-ticket`).
  * **IT Staff**: "Dashboard" (`/staff-dashboard`), "Ticket Queue" (`/staff-queue`).
  * **Administrator**: "Dashboard" (`/staff-dashboard`), "Ticket Queue" (`/staff-queue`), "User Management" (`/user-management`).
* **Active Navigation Indicator**: Solid Zen Green bottom border (`3px solid #ffffff` or active tab highlight) indicating current active route.
* **User Identity Widget**: Displays user name, role pill badge (`Requester`, `IT Staff`, `Administrator`), and Logout action button.

---

## 3. Dashboard Screen Specifications

### 3.1. IT Staff Dashboard (`StaffDashboard.tsx`)
* **Header**:
  * Greeting heading: "Welcome back, [User First Name]!"
  * Subtitle: "Here's what's happening with your queue today."
  * Action: "Refresh" button with spin indicator during data fetch.
* **Metric Cards Row** (5 Cards Grid):
  1. `New`: Count of new unassigned tickets. Drill-down: Navigates to `/staff-queue?status=NEW`.
  2. `Open`: Count of open tickets. Drill-down: Navigates to `/staff-queue?status=OPEN`.
  3. `In Progress`: Count of in-progress tickets. Drill-down: Navigates to `/staff-queue?status=IN_PROGRESS`.
  4. `Waiting for Requester`: Count of tickets pending requester response. Drill-down: Navigates to `/staff-queue?status=WAITING_FOR_REQUESTER`.
  5. `My Assigned`: Count of tickets owned by authenticated IT Staff user. Drill-down: Navigates to `/staff-queue?owner=me`.
* **Main Layout Section** (2-Column Desktop Grid):
  * **Left Column (My Recent Tickets)**:
    * Card container displaying up to 5 recently updated tickets assigned to current user.
    * Header with "My Recent Tickets" title and "View all" link (navigates to `/staff-queue?owner=me`).
    * List item: Ticket number link, summary text, status badge, IT priority badge, updated timestamp.
    * Empty state: "No recent tickets found in your queue."
  * **Right Column (Quick Actions Panel)**:
    * "+ Create Ticket" button (primary Zen Green button).
    * "Search Tickets" button (icon button focusing queue search input).
    * "My Queue" button (secondary button navigating to `/staff-queue`).
    * *Administrator Extra*: Concise user account stats box displaying `Total Users: X` and `Active Users: Y`.

### 3.2. Requester Dashboard (`RequesterDashboard.tsx`)
* **Header**:
  * Greeting heading: "Welcome, [User First Name]!"
  * Subtitle: "Here's the latest on your requests."
  * Action: "Refresh" button.
* **Metric Cards Row** (4 Cards Grid):
  1. `My Open Tickets`: Count of active open tickets owned by user. Drill-down: Navigates to `/my-tickets?filter=open`.
  2. `In Progress`: Count of tickets currently being worked on. Drill-down: Navigates to `/my-tickets?filter=in_progress`.
  3. `Resolved`: Count of resolved tickets. Drill-down: Navigates to `/my-tickets?filter=resolved`.
  4. `Closed`: Count of closed tickets. Drill-down: Navigates to `/my-tickets?filter=closed`.
* **Main Layout Section**:
  * **Left Column (My Recent Tickets)**:
    * Displays up to 5 recently updated tickets owned by authenticated Requester.
    * Header with "View all" link to `/my-tickets`.
    * List item: Ticket number, summary, status badge, timestamp.
  * **Right Column (Quick Actions)**:
    * "+ Create Ticket" primary button.
    * "View My Tickets" secondary button.

---

## 4. Actions Taken Component Specification

Embedded within Ticket Detail view (`StaffTicketDetailView.tsx` and `TicketDetailView.tsx`).

### 4.1. Section Header & Actions
* Title: "Actions Taken" with counter badge (e.g. `Actions Taken (2)`).
* Primary Action: "+ Add Action Taken" button (visible ONLY to IT Staff and Administrators).

### 4.2. Actions Taken List / Table View
* Columns:
  1. **Date / Time**: `actionDate` formatted (e.g. `May 12, 2025 10:30 AM`).
  2. **Performed By**: User name with role badge (`Michael Brown [IT Staff]`).
  3. **Action Description**: Complete text description of work performed.
  4. **Result**: Outcome of the action.
  5. **Follow-Up Needed?**: Pill badge (`No` gray / `Yes` amber). If `true`, renders `Follow-Up Note` text box below with alert icon.
  6. **Attachment Notes**: Displayed with paperclip icon if notes are present.
  7. **Controls**: "Edit" icon button (IT Staff / Admin only).

### 4.3. Create / Edit Action Taken Modal / Form
* Modal Title: "Add Action Taken" / "Edit Action Taken".
* Form Controls:
  * **Action Date/Time**: Auto-populated with current timestamp (read-only or editable datetime-local).
  * **Performed By**: Auto-populated with current authenticated user name (read-only).
  * **Action Description** (Textarea, required): Detailed description of work performed.
  * **Result** (Textarea, required): Outcome or measurement result.
  * **Follow-Up Required?** (Toggle switch / Checkbox): Controls visibility of follow-up note field.
  * **Follow-Up Note** (Textarea, conditionally required when Follow-Up Required is checked): Specific instructions for follow-up.
  * **Attachment Notes** (Text input, optional): Notes on associated files/screenshots.
* Modal Actions: "Save Action Taken" (Zen Green primary button), "Cancel".

### 4.4. Requester Visibility Mode
* Requesters see the complete Actions Taken table/list on their owned Ticket Detail screen.
* Modals, "+ Add Action Taken" buttons, and "Edit" action buttons are completely omitted from the UI DOM.

---

## 5. Ticket Workflow & Resolution Feedback UI

### 5.1. Status Selector & Resolution Gate Guidance
* IT Staff Detail status dropdown displays only permitted target statuses per status transition matrix.
* When user selects `RESOLVED` or `CLOSED`:
  * The frontend checks if `resolutionSummary` is filled AND `actionsTaken.length > 0`.
  * If `actionsTaken.length === 0`:
    * A prominent Zen Green / Amber callout alert is displayed above the save button:
      `"⚠️ Resolution Gate: At least one Action Taken entry must be recorded under this ticket before it can be marked as Resolved or Closed."`
    * The save button is disabled until an Action Taken is recorded.
  * If `resolutionSummary` is empty:
    * Inline field error is displayed: `"Resolution Summary is required when resolving or closing a ticket."`

### 5.2. Concurrency Conflict Feedback (409 Conflict)
* If another staff member updated the ticket while the screen was open, submitting changes triggers a warning banner:
  `"⚡ Concurrency Notice: This ticket was updated by another staff member while you were viewing it. Please refresh to load the latest state before saving."`
* Button provided: "Refresh Ticket Data".

---

## 6. Responsive Layout & Accessibility Rules

### 6.1. Responsive Viewport Adaptations
* **Desktop (>= 1024px)**:
  * 5-column metric card grid on IT Staff Dashboard; 4-column metric card grid on Requester Dashboard.
  * 2-column main layout (8 cols recent tickets / 4 cols quick actions).
  * Full Actions Taken table with all columns visible.
* **Tablet (768px - 1023px)**:
  * Metric cards reflow to 3-column or 2-column grid.
  * Recent tickets and quick actions stack vertically.
  * Actions Taken table permits horizontal scrolling inside rounded container.
* **Mobile (< 768px)**:
  * Metric cards stack in 1-column layout.
  * Table rows collapse into stacked card items with bold field labels.
  * Full-width modal action buttons.
  * Zero horizontal page overflow (`body { overflow-x: hidden }`).

### 6.2. Accessibility (WCAG 2.1 AA Compliance)
* High contrast ratios (minimum 4.5:1 for body text, 3:1 for large text and badges).
* Visible focus indicators (`outline: 2px solid #055037`, `outline-offset: 2px`) on all interactive controls.
* Semantic HTML structure (`<header>`, `<main>`, `<section>`, `<nav>`, `<table>`).
* Explicit `aria-label` attributes on icon-only buttons (e.g. Refresh, Search, Edit).
* Keyboard navigable modals with `Escape` key close handling.

---

## 7. Visual Consistency Checklist

- [x] All new screens adopt the Deep Zen Green palette (`#055037`), crisp surface cards (`#ffffff`), and rounded corners.
- [x] Top navigation includes role-appropriate "Dashboard" links with active page indicator.
- [x] Metric cards display large readable numbers with clear label contrast.
- [x] Actions Taken section distinguishes performed-by actor, date, description, result, and follow-up notes.
- [x] Resolution gate warning banner clearly guides staff when actions taken or resolution summaries are missing.
- [x] Zero clipped text, overlapping elements, or horizontal body scrollbars across desktop, tablet, and mobile viewports.
