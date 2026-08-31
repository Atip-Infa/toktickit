# TokTickIT — IT Service Desk

TokTickIT is a full-stack IT service desk web application for handling Account and Access, Hardware, Software, and Network support requests.

Lab 2 introduces the **Requester Ticketing MVP with Zen Green UI Foundation**, providing an intuitive, accessible, and responsive user experience for submitting and managing IT tickets with attachments.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap 5, Zen Green Design System (Custom CSS Tokens)
- **Backend:** Node.js, Express, TypeScript, Multer (File Upload Handling)
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest, Supertest, React Testing Library
- **Workflow:** Git, GitHub Projects, Feature Branches, Pull Requests

## Project Structure

```text
toktickit/
├── artifacts/       # Screenshots and lab evidence artifacts
│   └── lab-02/      # Lab 2 screenshots
├── client/          # React + Vite + Bootstrap frontend
│   ├── src/         # React components, Zen Green tokens, API handlers
│   └── tests/       # React component tests (Vitest + RTL)
├── docs/            # Engineering contracts & documentation
│   ├── lab-01/      # Lab 1 sprint records
│   └── lab-02/      # Lab 2 sprint contract (specification.md, tests.md, ui-spec.md, api-spec.md, ai-use.md, reviewer.md)
├── e2e/             # End-to-end automated tests (Playwright)
│   └── lab-02/      # Lab 2 E2E test specs
├── server/          # Express + Prisma + PostgreSQL backend
│   ├── prisma/      # Prisma schema and seed script
│   ├── src/         # Express routes, file upload setup, Prisma client
│   ├── uploads/     # Disk storage for ticket file attachments
│   └── tests/       # API integration tests (Supertest + Vitest)
├── .gitignore       # Git ignore specifications
├── package.json     # Root project dependencies & scripts
├── playwright.config.ts # Playwright E2E configuration
├── README.md        # Setup and usage instructions
└── tsconfig.json    # Root TypeScript configuration
```

## Setup & Running Instructions

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL database instance

### 2. Environment Configuration

Copy `.env.example` templates to `.env` in both client and server directories:

```bash
# Client environment setup
cp client/.env.example client/.env

# Server environment setup
cp server/.env.example server/.env
```

Update `server/.env` with your local PostgreSQL database URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/toktickit?schema=public"
PORT=3000
```

### 3. Installation

Install dependencies for both client and server:

```bash
npm install --prefix client
npm install --prefix server
```

### 4. Database Setup & Seeding

Apply Prisma database schema and run the idempotent seed script:

```bash
# Push database schema
npx --prefix server prisma db push

# Seed categories, related systems, and development requesters
npm --prefix server run prisma:seed
```

### 5. Running Development Mode

Start the backend Express API server and frontend Vite development server:

```bash
# Start Express server (http://localhost:3000)
npm --prefix server run dev

# Start Vite React client (http://localhost:5173)
npm --prefix client run dev
```

### 6. Running Test Suites

Run client and server test suites:

```bash
# Run client component tests (16 tests passing)
npm --prefix client run test

# Run server API tests (26 tests passing)
npm --prefix server run test
```

## Key Lab 2 Features

1. **Development Requester Selector**: Session context simulation for testing ticket owner rules without full auth.
2. **Responsive Create Ticket Experience**: Zen Green layout, dynamic category/system selectors, real-time character counters, mandatory field validation, and official Ticket Number generation (`TKT-YYYY-XXXXXX`).
3. **My Tickets Dashboard**: Search by ticket number or summary, additive category/priority/status filters, customizable pagination (5/10/25 per page), and mobile-responsive card view.
4. **Ticket Detail & Attachment Lifecycle**: Read-only ticket fields, upload zone (JPG, PNG, WEBP, PDF up to 5 MB each, max 5 active attachments limit), active attachment downloads, and soft-removal modal with mandatory removal reason tracking.
