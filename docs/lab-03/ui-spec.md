# TokTickIT Lab 3 User Interface Specification (`ui-spec.md`)

## 1. Zen Green Design System & Theme Consistency

Lab 3 extends the Zen Green visual language established in Lab 2. All new screens, modals, cards, badges, and feedback components MUST adhere to the existing CSS variable system defined in `client/src/zen-green.css`.

### 1.1. Color Tokens & Visual Standards
* **Primary Branding Color**: Deep Zen Green (`--zg-primary: #055037`, `--zg-primary-hover: #033a27`).
* **Surface & Backgrounds**: Crisp White Card Surface (`--zg-surface: #ffffff`), Light Gray Page Background (`--zg-bg: #f4f6f8`).
* **Borders & Dividers**: Subtle Light Gray (`--zg-border: #e2e8f0`).
* **Text Hierarchies**: Dark Slate (`--zg-text: #1e293b`), Muted Gray (`--zg-muted: #64748b`).

### 1.2. Status & Priority Badges
Consistent pill-style badges with uppercase bold text:
* **Status Badges**:
  * `NEW`: Light Blue background (`#e0f2fe`), Dark Blue text (`#0369a1`).
  * `OPEN` / `IN_PROGRESS`: Amber background (`#fef3c7`), Brown text (`#b45309`).
  * `WAITING_FOR_REQUESTER`: Purple background (`#f3e8ff`), Dark Purple text (`#6b21a8`).
  * `RESOLVED`: Emerald background (`#d1fae5`), Dark Emerald text (`#047857`).
  * `CLOSED`: Cool Gray background (`#f1f5f9`), Slate text (`#475569`).
  * `REOPENED`: Orange background (`#ffedd5`), Dark Orange text (`#c2410c`).
  * `CANCELLED`: Rose background (`#ffe4e6`), Dark Red text (`#be123c`).
* **Priority Badges**:
  * `LOW`: Soft Gray (`#f1f5f9`).
  * `MEDIUM`: Warm Amber (`#fef3c7`).
  * `HIGH`: Bright Orange (`#ffedd5`).
  * `URGENT`: Crimson Red (`#ffe4e6`).

---

## 2. Application Shell & Navigation

### 2.1. Unauthenticated Shell
* Rendered when no valid session is present or user is unauthenticated.
* Displays centered, responsive Login Card or Mandatory Password Change Modal without normal app navigation bar.

### 2.2. Authenticated Header Bar (`AppHeader.tsx`)
* Top fixed navigation bar in Zen Green background (`#055037`).
* **Brand Logo**: TokTickIT logo with clock icon.
* **Role-Based Navigation Links**:
  * `Requester`: "My Tickets", "Create Ticket".
  * `IT Staff`: "Ticket Queue".
  * `Administrator`: "User Management".
* **User Identity Profile**:
  * Displays user full name.
  * Role Badge (`Requester`, `IT Staff`, or `Administrator`).
  * **Logout Button**: Clear visual action to end session and invalidate credentials.
* **Development Selector Removal**: The temporary `DevelopmentRequesterSelector` dropdown and Change Requester actions are completely removed from the header.

---

## 3. Screen Specifications

### 3.1. Login Screen
* **Layout**: Centered card layout on Zen Green branded background.
* **Header**: TokTickIT logo and "Sign in to your account" heading.
* **Form Controls**:
  * Email input with placeholder `user@toktickit.com`.
  * Password input with toggleable visibility eye icon.
* **Validation & Errors**: Inline red alert banner for invalid credentials or inactive accounts. Form submit button switches to loading state during authentication.

### 3.2. Mandatory Change Password Screen
* **Behavior**: Displayed automatically when `mustChangePassword = true`. Replaces normal application view.
* **Header**: Warning banner indicating mandatory initial password change requirement.
* **Form Controls**:
  * Current (temporary) Password field.
  * New Password field with visibility toggle.
  * Confirm New Password field.
* **Password Strength Guidance**: Real-time checklist validating:
  * Minimum 8 characters.
  * At least one uppercase letter and one lowercase letter.
  * At least one number and one special character.
* **Actions**: "Update Password" primary button. Application navigation unlocks immediately upon successful submission.

### 3.3. Requester Ticket Detail (Enhanced)
* **Retained Lab 2 Sections**: Ticket header, category/system badges, requested priority badge, status badge, summary, detailed description, resolution summary, and attachment management.
* **New Section 1: Public Comments Feed**:
  * Shared comment stream showing author avatar, author name, role badge, timestamp, and message body.
  * Composer box with text input and "Post Comment" action button.
* **New Section 2: "Problem Appears Resolved" Action**:
  * Secondary button available when ticket is in `IN_PROGRESS` or `WAITING_FOR_REQUESTER`.
  * Triggers modal prompting user for optional feedback comment, posting a Public Comment requesting formal resolution review by IT Staff.

### 3.4. IT Staff Ticket Queue (`StaffTicketQueueView`)
* **Header**: Queue title, total ticket counter badge, search input, and filter expander button.
* **Search & Filter Controls**:
  * **Search Input**: Live filter across ticket number, summary, and description.
  * **Category Filter**: Dropdown select.
  * **Status Filter**: Multi-select dropdown.
  * **Priority Filter**: Requested Priority & IT Priority dropdowns.
  * **Owner Filter**: Dropdown select (`All`, `Unassigned`, `Assigned to Me`, or specific owner).
* **Desktop Queue Table**:
  * Columns: Ticket No, Created Date, Summary, Category, Requested Priority, IT Priority, Status, Owner, Actions.
  * Sortable column headers (`Ticket No`, `Created Date`, `Status`, `IT Priority`).
  * Action button: "Open Ticket Detail".
* **Pagination Controls**: Page size selector (10, 25, 50), current page range text, "Previous" and "Next" buttons.

### 3.5. IT Staff Ticket Detail (`StaffTicketDetailView`)
* **Breadcrumb Navigation**: Link back to "Ticket Queue".
* **Ticket Header**: Ticket number, category, related system, requester identity, created date.
* **Editable Operational Controls**:
  * **Ticket Owner Control**: Dropdown selector allowing IT Staff to claim unassigned ticket or assign to active IT Staff/Admin.
  * **IT Priority Control**: Dropdown selector (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  * **Status Transition Control**: Dropdown selector presenting ONLY permitted target statuses per status transition matrix.
* **Tabbed / Grouped Content Sections**:
  * **Ticket Details**: Summary, full description, resolution summary box (required when setting status to `RESOLVED`).
  * **Public Comments Section**: Shared communication feed with composer.
  * **Internal Notes Section**: Visually distinct callout styling (yellow/amber border accent) clearly demarcating private operational notes. Includes composer box labeled "Add Private Internal Note".
  * **Attachments Section**: Full attachment viewing and download capabilities.

### 3.6. Administrator User Management (`UserManagementView`)
* **Header**: Screen title "User Management", total user counter, and "+ Create User" primary action button.
* **Search & Filters**: Search input (Name or Email), Role filter dropdown (`All`, `Requester`, `IT Staff`, `Administrator`).
* **User List Table**:
  * Columns: Name, Email, Role (colored badge), Status (`Active` green / `Inactive` gray), Actions.
  * Action buttons: "Edit User", "Reset Password".
* **Modals**:
  1. **Create User Modal**: Name, Email, Role select, Active toggle switch, Initial Password field.
  2. **Edit User Modal**: Name, Email, Role select, Active toggle switch.
  3. **Set Initial Password Modal**: New initial password input with `mustChangePassword = true` indicator checkbox.

---

## 4. Required Screen Modes & User Feedback

* **Loading State**: Pulse skeletons or Zen Green spinner overlay during API fetches.
* **Saving / Processing State**: Buttons display loading spinner and disabled state during submission.
* **Empty Queue State**: Friendly Zen Green illustration and text when no tickets match queue filters.
* **Validation State**: Field-level red outline and inline validation message placed directly below inputs.
* **Forbidden (403) Feedback**: Zen Green warning banner explaining insufficient role permissions without exposing internal data.
* **Safe Error Feedback**: Generic failure notification toasts for unexpected server errors.

---

## 5. Responsive Behavior & Accessibility

* **Desktop (> 992px)**: Full multi-column data tables, side-by-side filter panels, and side-by-side detail controls.
* **Tablet (768px - 991px)**: Responsive data tables with scrollable horizontal containers, collapsed filter drawer.
* **Mobile (< 767px)**: Data tables collapse into stacked Zen Green card lists with bold labels. Single-column forms with full-width primary buttons.
* **Accessibility (WCAG 2.1 AA)**: Minimum contrast ratio 4.5:1, keyboard focus outlines on interactive controls, explicit `aria-label` attributes on icon buttons and search inputs.
