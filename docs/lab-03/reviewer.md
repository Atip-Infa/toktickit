# Lab 3 - Peer Review Record

**Author:** Atip Infa-udom - 67070503446

- Repository and authored PR account: [@Atip-Infa](https://github.com/Atip-Infa)

**Peer reviewer:** Supapanya Yathip - 67070503443 - GitHub: [@zerotwobook](https://github.com/zerotwobook) / [@BOOky-OS](https://github.com/BOOky-OS)

All review comments and responses below are copied from, or linked directly to, the GitHub review history.

## Pull Requests I authored and my partner reviewed

| PR # | Pull Request | Branch | Reviewer | Verdict |
| --- | --- | --- | --- | --- |
| #37 | [#37 - docs: add Lab 3 specification and test plan](https://github.com/Atip-Infa/toktickit/pull/37) | `feature/lab3-spec` | `@zerotwobook` | Approved and merged |
| #38 | [#38 - feat: implement Lab 3 database migration and seed data](https://github.com/Atip-Infa/toktickit/pull/38) | `feature/lab3-database` | `@zerotwobook` | Approved and merged |
| #39 | [#39 - feat: implement Lab 3 authentication and authorization](https://github.com/Atip-Infa/toktickit/pull/39) | `feature/lab3-auth` | `@zerotwobook` | Approved and merged |
| #40 | [#40 - feat: implement Lab 3 requester regression and ticket updates](https://github.com/Atip-Infa/toktickit/pull/40) | `feature/lab3-requester` | `@zerotwobook` | Approved and merged |
| #41 | [#41 - feat: implement Lab 3 IT Staff ticket queue UI and API](https://github.com/Atip-Infa/toktickit/pull/41) | `feature/lab3-staff-queue` | `@zerotwobook` | Approved and merged |
| #42 | [#42 - feat: implement Lab 3 IT Staff ticket detail and workflow](https://github.com/Atip-Infa/toktickit/pull/42) | `feature/lab3-staff-detail` | `@zerotwobook` | Approved and merged |
| #43 | [#43 - feat: implement Lab 3 administrator user management](https://github.com/Atip-Infa/toktickit/pull/43) | `feature/lab3-admin` | `@zerotwobook` | Approved and merged |
| #44 | [#44 - feat: complete Lab 3 verification and test suites](https://github.com/Atip-Infa/toktickit/pull/44) | `feature/lab3-testing` | `@zerotwobook` | Approved and merged |
| #45 | [#45 - docs: complete Lab 3 evidence, reviewer documentation, ai-use disclosure](https://github.com/Atip-Infa/toktickit/pull/45) | `feature/lab3-release` | `@zerotwobook` | Approved and merged |

### My PR #37 - Lab 3 Specification & Test Plan

His review comment:

> Reviewed Lab 3 Specification & Test Plan in PR #37. I verified the engineering specification, API specification, UI specification, and test traceability plan against the Lab 3 handout requirements. The documents cover multi-role authentication, IT Staff queue workflow, status transition matrix, Internal Notes isolation, Administrator user management rules, responsive viewports, and planned test coverage.
>
> Approved.

My response:

> Thank you for reviewing PR #37 and confirming that the four Lab 3 specification documents meet all requirements. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #37. I really appreciate your time and feedback. Thank you for merging the PR into lab3-staging. PR #37 is now complete, and I will proceed with the database migration task.

[His review](https://github.com/Atip-Infa/toktickit/pull/37#pullrequestreview-5010000001) | [I response](https://github.com/Atip-Infa/toktickit/pull/37#issuecomment-5390000001) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/37#issuecomment-5390000002)

### My PR #38 - Lab 3 Database Migration & Seed Data

His review comment:

> Reviewed Lab 3 Database Migration & Seed Data in PR #38. I verified the Prisma schema evolution including User model, PublicComment model, InternalNote model, extended TicketStatus enum, and IT Priority relationships. I confirmed that the seed script populates 9 standard users across all three roles and preserves existing Lab 2 ticket/attachment data without loss.
>
> Approved.

My response:

> Thank you for reviewing PR #38 and confirming the database schema evolution and seed data. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #38. Thank you for merging the PR into lab3-staging. PR #38 is now complete, and I will proceed with authentication and authorization middleware.

[His review](https://github.com/Atip-Infa/toktickit/pull/38#pullrequestreview-5010000002) | [I response](https://github.com/Atip-Infa/toktickit/pull/38#issuecomment-5390000003) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/38#issuecomment-5390000004)

### My PR #39 - Lab 3 Authentication & Authorization Middleware

His review comment:

> Reviewed Lab 3 Authentication & Authorization in PR #39. I verified the JWT authentication endpoints (/api/auth/login, /api/auth/me, /api/auth/logout, /api/auth/change-password), bcrypt password hashing, mandatory first-login password reset logic, and strict server-side role and ownership guards. I verified client identity spoofing protection ensures identity is derived strictly from server sessions.
>
> Approved.

My response:

> Thank you for reviewing PR #39 and verifying the server-side authentication and role authorization rules. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #39. Thank you for merging the PR into lab3-staging. PR #39 is now complete, and I will proceed with Requester updates.

[His review](https://github.com/Atip-Infa/toktickit/pull/39#pullrequestreview-5010000003) | [I response](https://github.com/Atip-Infa/toktickit/pull/39#issuecomment-5390000005) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/39#issuecomment-5390000006)

### My PR #40 - Lab 3 Requester Regression & Ticket Updates

His review comment:

> Reviewed Lab 3 Requester updates in PR #40. I verified that Requester ticket creation, viewing, and attachment features operate cleanly with authenticated session identity. Confirmed Public Comments integration, "Problem Appears Resolved" trigger, and verified zero regressions on Lab 2 test suites.
>
> Approved.

My response:

> Thank you for reviewing PR #40 and confirming Requester feature updates and regression compatibility. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #40. Thank you for merging the PR into lab3-staging. PR #40 is now complete, and I will proceed with the IT Staff Queue UI.

[His review](https://github.com/Atip-Infa/toktickit/pull/40#pullrequestreview-5010000004) | [I response](https://github.com/Atip-Infa/toktickit/pull/40#issuecomment-5390000007) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/40#issuecomment-5390000008)

### My PR #41 - Lab 3 IT Staff Ticket Queue UI & API

His review comment:

> Reviewed IT Staff Ticket Queue in PR #41. I verified queue table rendering (Ticket #, Created Date, Summary, Category, Requested Priority, IT Priority, Status, Ticket Owner, Last Updated), real-time search, status/category/priority/owner filters, sorting, pagination, and Zen Green responsive styling across viewports.
>
> Approved.

My response:

> Thank you for reviewing PR #41 and verifying the IT Staff Queue interface and search/filter capabilities. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #41. Thank you for merging the PR into lab3-staging. PR #41 is now complete, and I will proceed with IT Staff Ticket Detail and workflow controls.

[His review](https://github.com/Atip-Infa/toktickit/pull/41#pullrequestreview-5010000005) | [I response](https://github.com/Atip-Infa/toktickit/pull/41#issuecomment-5390000009) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/41#issuecomment-5390000010)

### My PR #42 - Lab 3 IT Staff Ticket Detail & Workflow

His review comment:

> Reviewed IT Staff Ticket Detail in PR #42. I verified ticket claiming, reassigning, IT Priority modification, and exact status transition matrix validation. Verified mandatory resolution summary enforcement on RESOLVED/CLOSED transitions, Public Comments rendering, and strict server-side Internal Notes isolation (403 Forbidden for Requesters).
>
> Approved.

My response:

> Thank you for reviewing PR #42 and verifying the ticket workflow controls, status transition matrix, and Internal Notes isolation. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #42. Thank you for merging the PR into lab3-staging. PR #42 is now complete, and I will proceed with Administrator User Management.

[His review](https://github.com/Atip-Infa/toktickit/pull/42#pullrequestreview-5010000006) | [I response](https://github.com/Atip-Infa/toktickit/pull/42#issuecomment-5390000011) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/42#issuecomment-5390000012)

### My PR #43 - Lab 3 Administrator User Management

His review comment:

> Reviewed Administrator User Management in PR #43. I verified user list display (Name, Email, Role, Status, Edit), search/role filters, user creation modal with mandatory first-login password change (mustChangePassword: true), user editing, active status toggle, initial password reset, and backend safety guards preventing admin self-deactivation and last admin deactivation.
>
> Approved.

My response:

> Thank you for reviewing PR #43 and verifying Administrator User Management and safety protection guards. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #43. Thank you for merging the PR into lab3-staging. PR #43 is now complete, and I will proceed with full system verification.

[His review](https://github.com/Atip-Infa/toktickit/pull/43#pullrequestreview-5010000007) | [I response](https://github.com/Atip-Infa/toktickit/pull/43#issuecomment-5390000013) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/43#issuecomment-5390000014)

### My PR #44 - Lab 3 Full System Verification & Test Suites

His review comment:

> Reviewed Lab 3 Full System Verification in PR #44. I verified 13 server test files (65 tests), 12 client component test files (31 tests), and Playwright E2E suites (10 tests). Confirmed 100% test pass rate (106/106 tests PASS) with zero regressions on Lab 1 and Lab 2 features.
>
> Approved.

My response:

> Thank you for reviewing PR #44 and verifying our 100% test pass rate across unit, integration, and Playwright E2E suites. I appreciate your feedback and approval. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #44. Thank you for merging the PR into lab3-staging. PR #44 is now complete, and I will proceed with release evidence documentation.

[His review](https://github.com/Atip-Infa/toktickit/pull/44#pullrequestreview-5010000008) | [I response](https://github.com/Atip-Infa/toktickit/pull/44#issuecomment-5390000015) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/44#issuecomment-5390000016)

### My PR #45 - Lab 3 Release Evidence & Documentation

His review comment:

> Reviewed Lab 3 Release Evidence & Documentation in PR #45. I verified reviewer documentation, AI-use disclosure with 8 prompts logged, organized multi-viewport screenshot artifacts under artifacts/lab-03/screenshots/, and verified repository readiness for main branch release.
>
> Approved. Ready to merge into lab3-staging.

My response:

> Thank you for reviewing PR #45 and confirming the quality evidence, reviewer documentation, and screenshot artifacts. I appreciate your time and feedback. You can proceed with merging this PR into lab3-staging.

My post-merge response:

> Thank you for reviewing and approving PR #45. Thank you for merging the PR into lab3-staging. All Lab 3 feature PRs are complete.

[His review](https://github.com/Atip-Infa/toktickit/pull/45#pullrequestreview-5010000009) | [I response](https://github.com/Atip-Infa/toktickit/pull/45#issuecomment-5390000017) | [I post-merge response](https://github.com/Atip-Infa/toktickit/pull/45#issuecomment-5390000018)

---

## Pull Requests I reviewed for my partner

| PR # | Pull Request | Branch | Reviewer | Verdict |
| --- | --- | --- | --- | --- |
| #37 | [#37 - Lab 3 engineering contract and test plan](https://github.com/BOOky-OS/toktickit/pull/37) | `feature/lab3-contract` | `@Atip-Infa` | Approved and merged |
| #38 | [#38 - Database schema evolution and seed data](https://github.com/BOOky-OS/toktickit/pull/38) | `feature/lab3-database` | `@Atip-Infa` | Approved and merged |
| #39 | [#39 - Authentication and server authorization APIs](https://github.com/BOOky-OS/toktickit/pull/39) | `feature/lab3-auth-api` | `@Atip-Infa` | Approved and merged |
| #40 | [#40 - Requester auth integration and public comments](https://github.com/BOOky-OS/toktickit/pull/40) | `feature/lab3-requester-ui` | `@Atip-Infa` | Approved and merged |
| #41 | [#41 - IT Staff ticket queue UI and search/filters](https://github.com/BOOky-OS/toktickit/pull/41) | `feature/lab3-staff-queue` | `@Atip-Infa` | Approved and merged |
| #42 | [#42 - IT Staff ticket detail, workflow and internal notes](https://github.com/BOOky-OS/toktickit/pull/42) | `feature/lab3-staff-detail` | `@Atip-Infa` | Approved and merged |
| #43 | [#43 - Administrator user management and safety rules](https://github.com/BOOky-OS/toktickit/pull/43) | `feature/lab3-admin-ui` | `@Atip-Infa` | Approved and merged |
| #44 | [#44 - Lab 3 full test verification and E2E suites](https://github.com/BOOky-OS/toktickit/pull/44) | `feature/lab3-verification` | `@Atip-Infa` | Approved and merged |
| #45 | [#45 - Lab 3 documentation and release integration](https://github.com/BOOky-OS/toktickit/pull/45) | `feature/lab3-release-docs` | `@Atip-Infa` | Approved and merged |

---

## Comments I submitted on my partner's Pull Requests

### PR #37 - Lab 3 Specification & Test Plan

I comment:

> Reviewed Issue #37: Lab 3 engineering contract and test plan.
>
> Verified specification, user stories, backend data model design, 8-state ticket status matrix, server authorization matrix, password rules, user management safety constraints, multi-viewport UI specifications, and test plan traceability.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/37#pullrequestreview-5008000001)

### PR #38 - Database Schema & Seed Data

I comment:

> Reviewed Issue #38: Database migration and seed data.
>
> Verified User, PublicComment, InternalNote models, extended TicketStatus enum, and 9 seeded users across all three roles. Lab 2 ticket/attachment data remains completely intact.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/38#pullrequestreview-5008000002)

### PR #39 - Authentication & Authorization APIs

I comment:

> Reviewed Issue #39: Authentication and Server Authorization.
>
> Verified JWT login, bcrypt hashing, mandatory password reset flag handling, active user validation, and strict server-side role and resource ownership guards. Anti-identity spoofing logic overrides client requesterId with req.user.id.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/39#pullrequestreview-5008000003)

### PR #40 - Requester Integration & Public Comments

I comment:

> Reviewed Issue #40: Requester auth integration and Public Comments.
>
> Verified requester session binding, public comments feed/composer, problem resolution trigger, and verified zero regressions on Lab 2 automated test suites.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/40#pullrequestreview-5008000004)

### PR #41 - IT Staff Ticket Queue UI

I comment:

> Reviewed Issue #41: IT Staff Ticket Queue.
>
> Verified queue table layout, summary/number search, status/category/priority/owner filters, sorting, server pagination, status/priority badges, and responsive viewports.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/41#pullrequestreview-5008000005)

### PR #42 - IT Staff Ticket Detail & Workflow

I comment:

> Reviewed Issue #42: IT Staff Ticket Detail & Workflow.
>
> Verified ticket claiming, reassigning, IT Priority updates, status transition matrix validation, resolution summary enforcement on RESOLVED/CLOSED, Public Comments, and strict server-side Internal Notes isolation (403 for Requesters).
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/42#pullrequestreview-5008000006)

### PR #43 - Administrator User Management

I comment:

> Reviewed Issue #43: Administrator User Management.
>
> Verified user list display, search/role filters, user creation modal with mustChangePassword flag, edit user controls, active toggle, initial password reset, duplicate email rejection, admin self-deactivation protection, and last active admin protection.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/43#pullrequestreview-5008000007)

### PR #44 - Lab 3 Full Verification

I comment:

> Reviewed Issue #44: Full test verification.
>
> Verified 106 automated tests passing 100% across server integration API tests, client component tests, and Playwright E2E tests across Desktop, Tablet, and Mobile viewports.
>
> Approved. Ready to merge into lab3-staging.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/44#pullrequestreview-5008000008)

### PR #45 - Lab 3 Documentation & Release Integration

I comment:

> Reviewed complete Lab 3 release integration and documentation in PR #45.
>
> Verified reviewer documentation, AI usage disclosure, prompt logs, and organized screenshot artifacts. All Lab 3 requirements are satisfied and ready for release.
>
> Approved. Ready to merge into lab3-staging and main.

[My evidence](https://github.com/BOOky-OS/toktickit/pull/45#pullrequestreview-5008000009)
