# TokTickIT — IT Service Desk

TokTickIT is a full-stack IT service desk web application for handling Account and Access, Hardware, Software, and Network requests.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap 5
- **Backend:** Node.js, Express, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest, Supertest, React Testing Library
- **Workflow:** Git, GitHub Projects, Feature Branches, Pull Requests

## Project Structure

```text
toktickit/
├── client/          # React + Vite + Bootstrap frontend
├── server/          # Express + Prisma + PostgreSQL backend
│   ├── prisma/      # Prisma schema and seed script
│   ├── src/         # Express server source code
│   └── tests/       # API integration tests (Supertest + Vitest)
├── docs/            # Documentation & engineering records
│   └── lab-01/      # Lab 1 evidence (ai_use.md, reviewer.md, tests.md)
├── .gitignore       # Git ignore specifications
└── README.md        # Setup and usage instructions
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
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>?schema=public"
PORT=3000
```

### 3. Installation

Install dependencies for both client and server:

```bash
npm install --prefix client
npm install --prefix server
```

### 4. Database Setup (Prisma)

Initialize and seed the PostgreSQL database using Prisma:

```bash
# Run database migrations
npm --prefix server run prisma:migrate

# Seed starter categories
npm --prefix server run prisma:seed
```

### 5. Development Mode

Start the backend API server and frontend Vite development server:

```bash
# Start backend Express server (http://localhost:3000)
npm --prefix server run dev

# Start frontend Vite dev server (http://localhost:5173)
npm --prefix client run dev
```

### 6. Running Automated Tests

Run unit and integration tests using Vitest and Supertest:

```bash
# Run client UI tests
npm --prefix client run test

# Run server API tests
npm --prefix server run test
```