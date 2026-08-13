# TokTickIT - Full-Stack IT Service Desk

TokTickIT is an IT service desk web application built with React, Vite, Express, PostgreSQL, and Prisma.

## Tech Stack
* **Frontend**: React + TypeScript + Vite + Bootstrap 5
* **Backend**: Node.js + Express + TypeScript
* **Database & ORM**: PostgreSQL + Prisma ORM
* **Testing**: Vitest + Supertest

## Repository Structure
```text
toktickit/
├── client/       # React + Vite + Bootstrap frontend
├── server/       # Node.js + Express + Prisma backend
├── docs/         # Documentation & peer review records
├── .gitignore    # Git ignore configuration
└── README.md     # Setup and usage instructions
```

## Setup Instructions

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL database instance running locally or via Docker

### 1. Backend Setup (`server/`)
```bash
cd server
npm install
cp .env.example .env
# Configure DATABASE_URL in .env to match your PostgreSQL instance
npx prisma generate
npm run dev
```

### 2. Frontend Setup (`client/`)
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Running Automated Tests
* **Client Tests (Vitest)**: `cd client && npm run test`
* **Server Tests (Vitest + Supertest)**: `cd server && npm run test`