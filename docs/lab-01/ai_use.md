# Lab 1 AI Use and Reflection

**AI tools use:** ChatGPT and Antigravity IDE Agent

I use ChatGPT to analyze the Lab 1 requirements, understand the require GitHub workflow and refine or create implementation prompts for the four GitHub Issues. I use the resulting prompts with the Antigravity IDE Agent to inspect the starter scaffold and implement the required code.
I also check the generated changes, running tests, checking Git status and branches and verifying the implementation against the Lab 1 requirements before committing and creating Pull Request too.

## Selected Key Prompts

| Prompt Name | Actual Prompt Text |
|-------------|--------------------|
| Analyze Lab 1 Requirements | **ChatGPT:** Read the attached Lab1_Labsheet.pdf and inspect the existing starter scaffold.Do NOT write or modify code. Your task is to analyze only. Produce: 1. Every acceptance criterion. 2. Every required API. 3. Every required frontend behavior. 4. Every required database task. 5. Every required automated test. 6. Every GitHub requirement. 7. Every required documentation file. 8. Every submission requirement. 9. A dependency graph of the four GitHub Issues. 10. A numbered implementation plan. Then stop.<br><br>**My Reflection:** To understand the complete Lab 1 requirement and plan the work for Issues 1–4. |
| Verify Starter Scaffold | **ChatGPT:** Inspect the provided starter scaffold. Do NOT rewrite existing code. Check whether the scaffold already satisfies: React Vite Bootstrap Express TypeScript Prisma Vitest Supertest List already complete missing broken Only report findings. Do not code.<br><br>**My Reflection:** To understand what was already provide by the scaffold before asking the antigravity ide to make change. |
| Implement Project Foundation | **Antigravity IDE:** Implement ONLY Issue 1. Do not start Issue 2. Requirements: - Bootstrap working - React starts - Express starts - Prisma connects - PostgreSQL connects - Vitest configured - Supertest configured - README - .gitignore - .env.example When finished Run tests. List changed files. Stop.<br><br>**My Reflection:** Antigravity implement the Project Foundation. I review the change files and run the frontend and backend tests. |
| Implement Health Check | **Antigravity IDE:** Implement ONLY Issue 2. Requirements GET /api/health Return {"status":"ok", "service":"TokTickIT API"} Add Supertest. Frontend must call the API. Loading state. Useful backend error. Nothing else. Run tests. Stop.<br><br>**My Reflection:** Antigravity implement the function health-check. I check the implementation and run the require tests. |
| Implement Category Feature | **Antigravity IDE:** Implement ONLY Issue 3. Requirements Category model Migration Seed Seed data Account and Access Hardware Software Network Seed must be idempotent. Run migration. Run tests. Stop.<br><br>**My Reflection:** Antigravity implement database model and seed. I verify the migration, seed behavior and also do tests. |
| Build Category List UI | **Antigravity IDE:** Implement ONLY Issue 4. Requirements GET /api/categories Read from Prisma. Ordered response. Frontend Loading state Error state Category list No hardcoded values. Vitest Supertest Run all tests. Stop.<br><br>**My Reflection:** Antigravity implement category-list. I review the generate code and run the complete test. |

## Reflection
AI was useful for breaking the Lab 1 requirements into smaller implementation tasks and to understand the project structure and GitHub workflow.
My prompts build with instructions such as "Implement ONLY Issue X" and "Do not start Issue X+1" so that the implementation stay within the scope of each GitHub Issue.
I did not rely on the AI output without verification. I inspect the generated changes, checked the Git branch and repository status, run the require tests and also review the Pull Request.
Uusing ChatGPT for prompt creation and Antigravity IDE Agent for implementation help me work through the Lab 1 requirements while keeping the work separate by Issue and feature branch.
