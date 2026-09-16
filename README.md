# TokTickIT — Enterprise IT Service Desk Platform

**TokTickIT** is a full-stack, multi-role IT service desk web application built with React, Express, TypeScript, and PostgreSQL. It enables corporate and academic organizations to manage Account and Access, Hardware, Software, and Network support requests across three distinct user roles: **Requester**, **IT Staff**, and **Administrator**.

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
| 👑 **Administrator** | `admin@toktickit.com` | `Password123!` | Full user management, role assignments, password resets, active/inactive user toggles, IT queue access |
| 🛠️ **IT Staff** | `michael@toktickit.com`<br>`lisa@toktickit.com`<br>`amanda@toktickit.com` | `Password123!` | IT Queue search/filter/sort, claim/reassign tickets, update IT Priority, execute status transitions, post Public Comments & Internal Notes |
| 📝 **Requester** | `jennifer@toktickit.com`<br>`david@toktickit.com`<br>`sarah@toktickit.com` | `Password123!` | Create tickets, view owned tickets, upload attachments, post Public Comments, mark problem appears resolved |

---

## 📂 Project Structure

```text
toktickit/
├── client/                  # React + Vite + Bootstrap frontend application
│   ├── src/                 # Components, Context API (Auth & Requester), Zen Green tokens
│   │   ├── components/      # Login, Staff Queue, User Management, Ticket Detail components
│   │   ├── context/         # AuthContext and RequesterContext state providers
│   │   └── index.css        # Zen Green design system tokens & custom utility styles
│   └── tests/               # React component tests (Vitest + React Testing Library)
├── server/                  # Express + Prisma + PostgreSQL backend API
│   ├── prisma/              # Schema definition, migrations & seed script
│   │   ├── schema.prisma    # User, Ticket, Attachment, Comment & Note data models
│   │   └── seed.ts          # Idempotent seed data generator
│   ├── src/                 # Controllers, middleware (Auth & CORS), routes, Prisma client
│   └── tests/               # Server API integration & security tests (Supertest + Vitest)
├── docs/                    # Engineering specifications, contracts & test plans
│   ├── lab-01/              # Lab 1 specification, test design & reviewer records
│   ├── lab-02/              # Lab 2 specification, UI/API contracts & test plans
│   └── lab-03/              # Lab 3 multi-role specification, security matrix, reviewer records & AI disclosure
├── e2e/                     # Automated End-to-End tests (Playwright)
│   ├── lab-02/              # Lab 2 E2E test suites
│   └── lab-03/              # Lab 3 E2E test suites (Authentication, Staff Queue & Admin User Management)
├── artifacts/               # Verification screenshot evidence across Desktop, Tablet & Mobile viewports
├── .gitignore               # Git ignore specifications
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

# Seed users, categories, related systems, tickets, comments, and notes
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
# 1. Run Client UI & Component Tests (Vitest + React Testing Library)
npm --prefix client run test

# 2. Run Server API & Integration Tests (Supertest + Vitest)
npm --prefix server run test

# 3. Run Playwright End-to-End (E2E) Tests
npx playwright test e2e/lab-03
```

---

## 🌟 Key Application Features

### 🔐 1. Authentication & Security (Lab 3)
- **Role-Based Access Control (RBAC):** Strict server-side authorization enforcement for `REQUESTER`, `IT_STAFF`, and `ADMINISTRATOR` roles.
- **Secure Credentials:** Passwords hashed with `bcrypt` (cost factor 10). Passwords are never returned in API payloads.
- **JWT Session Management:** Session tokens delivered via secure HTTP headers and HTTP-only cookies (`toktickit_session`).
- **First-Login Password Reset:** `mustChangePassword` flag forces users to choose a new password upon first login or admin reset.

### 🛠️ 2. IT Staff Ticket Queue & Workflow (Lab 3)
- **Queue Search & Filters:** Real-time search by summary or description, combined with Category, IT Priority, and Status filters.
- **Ticket Claiming & Reassignment:** One-click `"Claim to Me"` button and team reassignment dropdown.
- **IT Priority Management:** Independent IT Priority setting (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) separate from Requester's requested priority.
- **Permitted Status Transitions:** State machine enforcing valid transitions:
  `NEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `PENDING_CLIENT` ➔ `RESOLVED` / `CLOSED` / `CANCELLED`.
- **Public Comments vs. Internal Notes:** Public comments visible to Requesters; Internal Notes strictly restricted to IT Staff and Administrators.

### 👑 3. Administrator User Management (Lab 3)
- **User List & Search:** Search users by name or email with role filters.
- **User Creation & Role Assignment:** Provision new users with single role assignments and temporary passwords.
- **Account Status Toggle:** Activate or deactivate accounts (`isActive = false` revokes login access immediately).
- **Safety Safeguards:** Self-deactivation protection and last active Administrator lockout protection.

### 📝 4. Requester Ticket Experience (Lab 2)
- **Ticket Creation:** Official ticket numbering (`TXT-YYYY-XXXXXX`), dynamic category and system selection, character count limits, and field validations.
- **My Tickets Dashboard:** Filter and view owned tickets, paginated display (5/10/25 per page), and responsive cards.
- **Attachment Management:** Upload zone (JPG, PNG, WEBP, PDF up to 5 MB each, max 5 active attachments limit) with soft-removal modal dialogs.

---

## 🔗 Core API Endpoints

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Authenticated | Clear user session token |
| `GET` | `/api/tickets` | Authenticated | Fetch tickets (Requesters view owned; Staff/Admin view all) |
| `POST` | `/api/tickets` | Requester | Submit a new IT support ticket |
| `GET` | `/api/tickets/:id` | Authenticated | View ticket detail (ownership & role guarded) |
| `GET/POST` | `/api/tickets/:id/public-comments` | Authenticated | View or add Public Comments |
| `GET/POST` | `/api/tickets/:id/internal-notes` | IT Staff / Admin | View or add internal staff notes (403 for Requesters) |
| `PATCH` | `/api/staff/tickets/:id` | IT Staff / Admin | Update IT Priority, claim/reassign owner, or transition status |
| `GET/POST` | `/api/admin/users` | Administrator | List user accounts or create a new user |
| `PATCH` | `/api/admin/users/:id` | Administrator | Edit user account, role, or active status |
| `POST` | `/api/admin/users/:id/reset-password` | Administrator | Reset user password & set mandatory change flag |

---

## 📄 License & Coursework

Developed as part of the **CPE 334 Software Engineering** course curriculum at KMUTT.