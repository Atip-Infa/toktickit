# Lab 2 UI Specification: Zen Green Theme & Component Guidelines

## 1. Visual Language & Design System Tokens

The Lab 2 user interface establishes the **Zen Green Theme** visual foundation for TokTickIT. All screens and reusable components must conform strictly to these color tokens, typography rules, spacing standards, and layout conventions.

### 1.1 Color Palette Tokens

| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `--color-primary-green` | `#006B3C` | Application header bar background, primary CTA buttons, major section emphasis. |
| `--color-secondary-green` | `#0B7A46` | Active navigation tab indicator, focus rings, interactive link states, button hover. |
| `--color-pale-green` | `#EAF6EF` | Selected item background, subtle section highlighting, success banner containers. |
| `--color-page-bg` | `#F5F7F6` | Quiet light-neutral page background. |
| `--color-surface-card` | `#FFFFFF` | Card surface, form containers, table background. Requires `1px solid #E2E8F0` border. |
| `--color-text-main` | `#1A2E26` | Dark Charcoal-Green body text; high contrast readability. |
| `--color-text-muted` | `#64748B` | Secondary text, helper labels, table header titles, timestamps. |
| `--color-field-editable-bg` | `#FFFFFF` | Editable input background with `1px solid #CBD5E1` neutral border. |
| `--color-field-readonly-bg` | `#F0F4F2` | Read-only input background; clearly shaded to indicate non-editable state. |
| `--color-error-text` | `#991B1B` | Validation error message text and alert banner font. |
| `--color-error-border` | `#DC2626` | Red border for invalid form controls. |
| `--color-error-bg` | `#FEF2F2` | Background fill for error alert banners. |
| `--color-warning-badge` | `#D97706` | Amber color for PENDING or HIGH priority badges. |
| `--color-success-green` | `#15803D` | Success confirmation banner text and RESOLVED status badge. |

### 1.2 Typography & Spacing
- **Font Family**: System UI stack (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Font Sizes**: Heading 1 (`1.5rem / 24px`, bold), Heading 2 (`1.25rem / 20px`, semi-bold), Body (`0.875rem / 14px`, regular), Small (`0.75rem / 12px`, medium).
- **Spacing System**: Base unit 4px (Padding/Margin options: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Border Radius**: Cards (`8px`), Buttons (`6px`), Input Fields (`6px`), Badges (`9999px` full pill).

---

## 2. Reusable Component Rules & Control States

### 2.1 Form Controls
- **Labeling**: Field labels MUST appear directly above input controls in semi-bold charcoal text (`#1A2E26`). Mandatory fields display a red asterisk (`*`) immediately following the label text.
- **Input Height**: Standard text inputs, select dropdowns, and file buttons use a uniform height of `40px` (`44px` on mobile for touch compliance).
- **Multiline Description**: Textarea for Description defaults to 5 visible rows (`min-height: 120px`), resizable vertically only without breaking container margins.
- **Focus Rings**: All interactive controls display a `2px solid #0B7A46` focus ring with `2px` offset when focused via keyboard navigation.
- **Disabled State**: Disabled controls render with opacity `0.5`, background `#E2E8F0`, cursor `not-allowed`, and cannot be activated.

### 2.2 Button Hierarchy

| Button Style | Styling | Behavior / Purpose |
| :--- | :--- | :--- |
| **Primary CTA** | Solid `#006B3C` background, white text. | Form submission, primary actions (e.g., "Submit Ticket", "Continue"). |
| **Secondary Button** | White background, `#0B7A46` border and text. | Filter actions, navigation triggers (e.g., "Clear Filters", "Cancel"). |
| **Destructive Button** | White background, `#991B1B` border and text. | Soft removal confirm actions (e.g., "Confirm Soft Removal"). |
| **Busy State** | Disabled style with animated spinner icon. | Displayed automatically when an API request is in-flight. |

### 2.3 Status & Priority Badges

- **Current Status Badges**:
  - `NEW`: Pale Blue fill (`#EFF6FF`), Blue text (`#1D4ED8`).
  - `IN_PROGRESS`: Amber fill (`#FEF3C7`), Dark Amber text (`#B45309`).
  - `PENDING`: Light Purple fill (`#F3E8FF`), Purple text (`#6B21A8`).
  - `RESOLVED`: Green fill (`#DCFCE7`), Dark Green text (`#15803D`).
  - `CLOSED`: Gray fill (`#F1F5F9`), Dark Gray text (`#475569`).

- **Priority Badges**:
  - `LOW`: Muted Gray fill (`#F1F5F9`), Dark Gray text (`#475569`).
  - `MEDIUM`: Warm Ivory fill (`#FEF3C7`), Dark Amber text (`#B45309`).
  - `HIGH`: Orange fill (`#FFEDD5`), Dark Orange text (`#C2410C`).
  - `URGENT`: Red fill (`#FEE2E2`), Dark Red text (`#B91C1C`).

---

## 3. Screen Layout Specifications

### 3.1 Development Requester Selection Screen Layout
- **Container**: Centered card (`max-width: 520px`) resting on quiet background (`#F5F7F6`).
- **Header Icon & Title**: User selection icon surrounded by pale green circle (`#EAF6EF`); Title "Select Development Requester".
- **Notice Banner**: Light green alert banner explaining: *"Select a Development Requester to test requester-specific ticket behavior. This is not a login screen. Authentication will be introduced in Lab 3."*
- **Controls**: Dropdown select loading active Requesters; Primary "Continue" button.
- **States**:
  - *Loading*: Displays centered loading spinner inside card.
  - *Empty Active Requesters*: Displays warning callout: "No active Development Requesters found."
  - *API Failure*: Displays red error alert banner with retry button.

### 3.2 Application Shell & Header
- **App Bar**: Full width background in Primary Green (`#006B3C`), height `64px`.
- **Branding**: Left-aligned bold white title **TokTickIT**.
- **Navigation Links**: Horizontal nav items ("My Tickets", "Create Ticket") in crisp white text. Active link features a secondary green bottom indicator bar (`3px solid #0B7A46`).
- **Profile / Context Widget**: Right-aligned user menu showing current Requester name (e.g., `Jennifer Anderson`) with a "Change Requester" menu item to return to the selection screen.

### 3.3 Create Ticket Screen (`/create-ticket`) Layout
- **Top Section**: Read-only preview card displaying system-generated fields (Ticket Date = current timestamp, Status = `NEW`).
- **Main Section (Classification & Content)**:
  - Row 1: Category dropdown (50% width) & Related System dropdown (50% width).
  - Row 2: Requested Priority pill selector (Low, Medium, High, Urgent).
  - Row 3: Ticket Summary input field (full width).
  - Row 4: Description textarea (full width).
  - Row 5: Attachments dropzone (drag-and-drop file upload container with file list preview, file size indicators, and file removal buttons).
- **Footer**: Right-aligned action buttons: "Cancel" (Secondary) and "Submit Ticket" (Primary Green).

### 3.4 My Tickets Screen (`/my-tickets`) Layout
- **Header Action Bar**:
  - Search input with magnifying glass icon (filters by Ticket Number or Summary).
  - Category dropdown filter ("All Categories").
  - Requested Priority dropdown filter ("All Priorities").
  - Status dropdown filter ("All Statuses").
  - "Clear Filters" secondary button.
  - "+ Create Ticket" primary button.
- **Desktop Table View (`>=992px`)**:
  - Columns: Ticket No., Created Date, Summary, Category, Requested Priority, IT Priority, Current Status, Ticket Owner, Last Updated.
  - Hover row effect (`#F8FAFC`). Clicking Ticket No. opens Ticket Detail.
- **Mobile Card View (`<768px`)**:
  - Table converts to vertical stacked card view. Each card displays Ticket No. header, status badge, summary text, category, and date.
- **Pagination Footer**: Left side displays item count (e.g., "Showing 1 to 10 of 42 tickets"); Right side displays Previous/Next buttons and page numbers.

### 3.5 Requester Ticket Detail Screen (`/tickets/:id`) Layout
- **Breadcrumbs**: Top left links `My Tickets > Ticket Details` with a "← Back to My Tickets" button.
- **Header Detail Card (Read-Only)**:
  - 2-Column layout displaying read-only shaded fields: Ticket No., Ticket Date, Category, Related System, Requester Name, Requested Priority, IT Priority, Current Status, IT Owner, Summary, Description, and Resolution Summary.
- **Tab Control**: Single active tab **Attachments** (Note: Comments, Actions, Event Log disabled/hidden per Lab 2 exclusions).
- **Attachments Tab Section**:
  - File uploader dropzone (visible if active attachments < 5).
  - Table of attachments showing: Filename, File Size, Uploaded Date, Status Badge ("Active" vs "Removed").
  - Actions: "Download" button (active files only); "Remove" destructive button (opens soft-removal modal).
- **Soft Removal Modal Dialog**:
  - Modal overlay (`rgba(0,0,0,0.5)`).
  - Title: "Soft Remove Attachment".
  - Prompt: "Please provide a reason for removing this attachment (required):"
  - Mandatory textarea for `removalReason` (min 3 chars).
  - Buttons: "Cancel" and "Confirm Removal" (Destructive red, disabled until reason is entered).

---

## 4. Responsive Layout Rules & Breakpoints

| Breakpoint | Viewport Width | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop** | `>= 992px` | Multi-column grid forms; full data table with all 9 columns visible; centered max container width `1200px`. |
| **Tablet** | `768px - 991px` | 2-column form grids; Summary & Description take full width; table compresses with horizontal scroll container if needed. |
| **Mobile** | `< 768px` | Form fields stack vertically into single column; My Tickets table converts to stacked card list; buttons expand to full width; 44px minimum tap targets. |

---

## 5. Accessibility Rules

1. **Keyboard Navigation**: All interactive elements (inputs, select options, buttons, pagination, tabs) are reachable via `Tab` key in logical order.
2. **Screen Reader ARIA**: Form inputs include `aria-required="true"` and `aria-describedby` linking to field error message IDs. Modals use `role="dialog"` and `aria-modal="true"`.
3. **Non-Color Reliance**: Status and priority badges rely on readable text labels alongside color fills so colorblind users can distinguish states.

---

## 6. Visual Inspection Checklist & Screenshot Artifact Paths

### 6.1 Inspection Checklist
- [ ] Primary Green `#006B3C` applied to header app bar and primary CTA buttons.
- [ ] Read-only fields shaded in `#F0F4F2`; editable inputs styled with clean white background.
- [ ] Red asterisk `*` displayed next to mandatory labels.
- [ ] Validation errors positioned immediately below corresponding fields in dark red.
- [ ] Submit button displays busy spinner and disables when processing.
- [ ] Zero clipped labels, unreadable text, or horizontal page scroll at 375px viewport.

### 6.2 Target Screenshot Artifact Paths
- `artifacts/lab-02/screenshots/create-ticket/`
  - `initial-state.png`
  - `validation-error.png`
  - `submitting-state.png`
  - `success-state.png`
- `artifacts/lab-02/screenshots/my-tickets/`
  - `ticket-list-desktop.png`
  - `ticket-list-mobile.png`
  - `filtered-state.png`
  - `empty-state.png`
- `artifacts/lab-02/screenshots/ticket-detail/`
  - `detail-view-read-only.png`
  - `attachments-active.png`
  - `attachment-soft-removal-modal.png`
  - `attachment-removed-state.png`
