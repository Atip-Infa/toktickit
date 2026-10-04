# TokTickIT — Enterprise IT Service Desk Platform

**TokTickIT** is a full-stack, multi-role IT service desk web application built with React, Express, TypeScript, and PostgreSQL. It enables corporate and academic organizations to manage Account & Access, Hardware, Software, and Network support requests across three distinct user roles: **Requester**, **IT Staff**, and **Administrator**.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Bootstrap 5, Zen Green Design System (Custom CSS Tokens)
- **Backend:** Node.js, Express, TypeScript, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), File Uploads (`multer`)
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing Frameworks:** Vitest, Supertest, React Testing Library, Playwright (E2E)
- **Workflow & Engineering:** Git, GitHub Projects, Feature Branches, Pull Requests, Code Review

---

## 🔑 Default Test Credentials

| Role | Email | Default Password | Features & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@toktickit.com` | `Password123!` | Full user management, role assignments, password resets, active/inactive user toggles, IT Queue access, IT Dashboards |
| 🛠️ **IT Staff** | `michael@toktickit.com`<br>`lisa@toktickit.com`<br>`amanda@toktickit.com` | `Password123!` | IT Queue search/filter/sort, IT Staff Dashboard, claim/reassign tickets, update IT Priority, execute status transitions, Actions Taken management, post Public Comments & Internal Notes |
| 📝 **Requester** | `jennifer@toktickit.com`<br>`david@toktickit.com`<br>`sarah@toktickit.com` | `Password123!` | Requester Dashboard, create tickets, view owned tickets, upload attachments, post Public Comments, mark problem appears resolved (advisory) |

---

## 📂 Project Structure

```text
toktickit/
├── client/                  # React + Vite + Bootstrap frontend application
│   ├── src/                 # Components, Context API (Auth & Requester), Zen Green tokens
│   │   ├── components/      # Login, Staff Queue, User Management, Ticket Detail, Dashboards, Actions Taken
│   │   ├── context/         # AuthContext and RequesterContext state providers
│   │   └── index.css        # Zen Green design system tokens & custom utility styles
│   └── tests/               # React component tests (Vitest + React Testing Library)
├── server/                  # Express + Prisma + PostgreSQL backend API
│   ├── prisma/              # Schema definition, migrations & seed script
│   │   ├── schema.prisma    # User, Ticket, Attachment, Comment, Note & ActionTaken models
│   │   └── seed.ts          # Idempotent seed data generator
│   ├── src/                 # Controllers, middleware (Auth & CORS), routes, Prisma client
│   └── tests/               # Server API integration & security tests (Supertest + Vitest)
├── docs/                    # Engineering specifications, contracts & test plans
│   ├── lab-01/              # Lab 1 specification, test design & reviewer records
│   ├── lab-02/              # Lab 2 specification, UI/API contracts & test plans
│   ├── lab-03/              # Lab 3 multi-role specification, security matrix & reviewer records
│   └── lab-04/              # Lab 4 workflow, resolution gate & dashboard specification
├── e2e/                     # Automated End-to-End tests (Playwright)
│   ├── lab-02/              # Lab 2 E2E test suites
│   └── lab-03/              # Lab 3 E2E test suites
├── package.json             # Workspace root scripts
├── playwright.config.ts     # Playwright E2E configuration
└── README.md                # Project documentation & execution guide
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database instance running locally or remotely

---

### 2. Environment Configuration

Copy `.env.example` templates to `.env` in both `client` and `server` directories:

```bash
# Client environment setup
cp client/.env.example client/.env

# Server environment setup
cp server/.env.example server/.env
```

Update `server/.env` with your PostgreSQL database connection string and secret configuration:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/toktickit?schema=public"
PORT=3000
JWT_SECRET="toktickit-secret-jwt-key"
```

Ensure `client/.env` points to the backend API server:

```env
VITE_API_URL="http://localhost:3000"
```

---

### 3. Installation

Install required dependencies for both frontend and backend applications:

```bash
# Install client dependencies
npm install --prefix client

# Install server dependencies
npm install --prefix server
```

---

### 4. Database Schema Migration & Seeding

Initialize the PostgreSQL database using Prisma schema and populate seed data:

```bash
# Apply Prisma schema migrations
npm --prefix server run prisma:migrate

# Seed users, categories, related systems, tickets, comments, notes, and actions taken
npm --prefix server run prisma:seed
```

---

### 5. Running Development Mode

Launch the backend Express API server and frontend Vite development server concurrently:

```bash
# Start Express Backend API Server (http://localhost:3000)
npm --prefix server run dev

# Start Vite Frontend Dev Server (http://localhost:5173)
npm --prefix client run dev
```

---

## 🧪 Automated Testing

Execute automated unit, integration, and E2E test suites:

```bash
# 1. Run all workspace tests (Server + Client)
npm test

# 2. Run Client UI & Component Tests (Vitest + React Testing Library)
npm run test:client

# 3. Run Server API & Integration Tests (Supertest + Vitest)
npm run test:server

# 4. Run Lab-specific test scripts
npm run test:lab-02
npm run test:lab-03
npm run test:lab-04

# 5. Run Playwright End-to-End (E2E) Tests
npm run test:e2e
```

---

## 🚀 Step-by-Step Demonstration Guide

Follow this guide to demonstrate the key features across all user roles and Lab 4 workflows:

### 1. Requester Dashboard & Ticket Creation
1. Sign in as a Requester (`jennifer@toktickit.com` / `Password123!`).
2. You will land on the **Requester Dashboard** showing owned ticket metrics (`Total Tickets`, `Open Tickets`, `Action Required`, `In Progress`, `Resolved`, `Closed`).
3. Click any metric card (e.g., `Action Required` or `Open Tickets`) to view pre-filtered tickets on the **My Tickets** screen.
4. Click **Create Ticket** in the top header.
5. Select a Category, Related System, and Requested Priority. Enter a Summary (5–120 chars) and Detailed Description (10–2000 chars). Optionally attach JPG/PNG/WEBP/PDF files (up to 5 MB each).
6. Click **Submit Ticket**. You will receive an official ticket number (e.g., `TXT-2026-000001`).

### 2. IT Staff Operations, Queue & Actions Taken
1. Sign in as IT Staff (`michael@toktickit.com` / `Password123!`).
2. View the **IT Staff Operational Dashboard** showing operational metrics (`Unassigned Tickets`, `My Owned Tickets`, `Status Breakdown`, `IT Priority Breakdown`, `Recently Updated Tickets`).
3. Click **View Queue** to navigate to the IT Queue. Use search and filter bars (Status, Priority, Owner).
4. Select a ticket in status `NEW`.
5. Click **⚡ Claim to Me** to assign ownership to yourself and automatically set status to `IN_PROGRESS`.
6. Scroll down to the **Actions Taken** section and click **+ Add Action Taken**.
7. Enter Action Description and Result. Toggle **Follow-Up Required** if follow-up is needed and enter a Follow-Up Note. Click **Create Action Taken**.

### 3. Permitted Ticket Workflow & Resolution Rules
1. In `StaffTicketDetailView`, attempt to transition a ticket to `RESOLVED`.
2. Notice the Resolution Gate enforcement:
   - **Resolution Summary** is mandatory.
   - **Actions Taken** count must be $\ge 1$.
3. Enter a Resolution Summary and save workflow changes. The ticket status updates to `RESOLVED`.
4. Sign in as the ticket's Requester (`jennifer@toktickit.com`).
5. Open the ticket detail and click **✅ Problem Appears Resolved**.
6. Verify that an advisory Public Comment is added noting the Requester's indication, while the ticket status remains controlled by IT Staff.

### 4. Administrator User Management
1. Sign in as Administrator (`admin@toktickit.com` / `Password123!`).
2. Click **User Management** in the header.
3. Search users by name/email or filter by Role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`) and Account Status (`Active`, `Inactive`).
4. Click **➕ Create New User** to provision a new user with a temporary password (`mustChangePassword: true`).
5. Edit user details or toggle account active status (`isActive = false` revokes login access immediately).
6. Test self-deactivation protection (the active administrator cannot deactivate their own account).

---

## 🌟 Key Application Features

### 🔐 1. Authentication & Security
- **Role-Based Access Control (RBAC):** Server-side authorization enforcement for `REQUESTER`, `IT_STAFF`, and `ADMINISTRATOR` roles.
- **Secure Credentials:** Passwords hashed with `bcrypt` (cost factor 10). Passwords are never returned in API responses.
- **JWT Session Management:** Session tokens delivered via secure HTTP headers and HTTP-only cookies (`toktickit_session`).
- **First-Login Password Reset:** `mustChangePassword` flag forces users to choose a new password upon first login or admin reset.

### 📊 2. Operational Dashboards (Lab 4)
- **IT Staff Operational Dashboard:** Authoritative metrics (`Unassigned`, `My Owned Tickets`, `Status Breakdown`, `IT Priority Breakdown`, `Recently Updated`).
- **Requester Dashboard:** Summarizes owned tickets only, amber callout for tickets requiring attention (`WAITING_FOR_REQUESTER`), recent tickets, and drill-down links.

### 🛠️ 3. Actions Taken & Ticket Workflow (Lab 4)
- **Actions Taken Section:** Performed By (auto-assigned from authenticated user), Action Date/Time, Description, Result, Follow-Up Required, Follow-Up Note, Attachment Notes.
- **Resolution Gate Rules:** Backend requires $\ge 1$ Action Taken record and a non-empty Resolution Summary before transitioning to `RESOLVED`.
- **Advisory Requester Resolution:** Requester "Problem Appears Resolved" button posts an advisory Public Comment without overriding IT Staff status control.
- **Stale Concurrency Safeguards:** Optimistic concurrency control via `expectedUpdatedAt` timestamp matching (returns `409 Conflict` on race conditions).

### 👑 4. Administrator User Management
- **User List & Search:** Search users by name or email with role and active status filters.
- **User Creation & Role Assignment:** Provision new users with single role assignments and temporary passwords.
- **Account Status Toggle:** Activate or deactivate accounts (`isActive = false` revokes login access immediately).
- **Safety Safeguards:** Self-deactivation protection for current active administrator.

---

## 🔗 Core API Endpoints

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Authenticated | Clear user session token |
| `GET` | `/api/requester/dashboard` | Requester | Get requester ticket summary metrics |
| `GET` | `/api/staff/dashboard` | IT Staff / Admin | Get IT staff operational dashboard metrics |
| `GET` | `/api/tickets` | Authenticated | Fetch tickets (Requesters view owned; Staff/Admin view all) |
| `POST` | `/api/tickets` | Requester | Submit a new IT support ticket |
| `GET` | `/api/tickets/:id` | Authenticated | View ticket detail (ownership & role guarded) |
| `GET/POST` | `/api/tickets/:id/actions-taken` | Authenticated | View (all) or Create (Staff/Admin) Actions Taken |
| `PATCH` | `/api/tickets/:id/actions-taken/:actionId` | IT Staff / Admin | Edit existing Action Taken details |
| `GET/POST` | `/api/tickets/:id/public-comments` | Authenticated | View or add Public Comments |
| `GET/POST` | `/api/tickets/:id/internal-notes` | IT Staff / Admin | View or add internal staff notes (403 for Requesters) |
| `PATCH` | `/api/staff/tickets/:id` | IT Staff / Admin | Update IT Priority, claim/reassign owner, or transition status |
| `GET/POST` | `/api/admin/users` | Administrator | List user accounts or create a new user |
| `PATCH` | `/api/admin/users/:id` | Administrator | Edit user account, role, or active status |
| `POST` | `/api/admin/users/:id/reset-password` | Administrator | Reset user password & set mandatory change flag |

---

## 📄 License & Coursework

Developed as part of the **CPE 334 Software Engineering** course curriculum at KMUTT.
