# BRAIN.md — Master Context for AI Coding Agents

**Project:** Multi-Tenant LMS Portal
**Applies to:** Claude Code, Cursor, Windsurf, and similar agents
**Source of truth order:** PRD.md → TRD.md → UI_UX_DESIGN.md → this file. If anything conflicts, PRD wins; ask before deviating.

---

## 0. How to Use This File

1. Read this file fully at the start of every session.
2. Before coding a feature, open the matching PRD section (`FR-*` ID) and TRD module (§5.x).
3. Use canonical names exactly. Never invent new table, route, role, enum, or token names.
4. Work in small vertical slices, with tests. Commit often with Conventional Commits.
5. When unsure, stop and list assumptions instead of guessing.

---

## 1. Product Snapshot

White-label, multi-tenant LMS. Tenants (`organizations`) get branded sites on subdomains/custom domains. Supports native courses, SCORM 1.2/2004, xAPI, assessments, certificates, analytics, forums/DMs/live video, gamification, AI recommendations, PWA offline, i18n/RTL, SSO, HRIS/CRM connectors, Stripe and Razorpay.

---

## 2. Canonical Vocabulary (DO NOT CHANGE)

**Roles:** `SUPER_ADMIN`, `ORG_ADMIN`, `INSTRUCTOR`, `TEACHING_ASSISTANT`, `LEARNER`

**Enums:**
- `lesson_type`: `VIDEO | DOCUMENT | TEXT | QUIZ | ASSIGNMENT | SCORM | XAPI | LIVE`
- `enrollment_status`: `PENDING | ACTIVE | COMPLETED | EXPIRED | CANCELLED`
- `course_status`: `DRAFT | PUBLISHED | ARCHIVED`
- `order_status`: `PENDING | PAID | FAILED | REFUNDED`

**Permission keys:** `org.manage`, `branding.manage`, `users.manage`, `course.create`, `course.edit`, `course.publish`, `enrollment.manage`, `assessment.grade`, `certificate.issue`, `analytics.view.org`, `analytics.view.course`, `billing.manage`, `forum.moderate`, `content.consume`

**Tables (snake_case plural):** `organizations`, `org_domains`, `org_branding`, `users`, `memberships`, `groups`, `group_members`, `courses`, `course_versions`, `sections`, `lessons`, `content_blocks`, `scorm_packages`, `scorm_attempts`, `xapi_statements`, `learning_paths`, `learning_path_courses`, `enrollments`, `lesson_progress`, `question_banks`, `questions`, `assessments`, `assessment_attempts`, `attempt_answers`, `assignments`, `submissions`, `certificate_templates`, `certificates`, `forum_threads`, `forum_posts`, `conversations`, `messages`, `live_sessions`, `notifications`, `notification_preferences`, `points_ledger`, `badges`, `user_badges`, `recommendations`, `products`, `prices`, `orders`, `payments`, `coupons`, `subscriptions`, `integrations`, `webhook_endpoints`, `webhook_deliveries`, `api_keys`, `audit_logs`, `analytics_events`

**API base:** `/api/v1` (routes listed in PRD §6).

**Design tokens:** `--color-primary`, `--color-primary-contrast`, `--color-secondary`, `--color-success`, `--color-warning`, `--color-danger`, `--color-surface`, `--color-surface-muted`, `--color-text`, `--color-text-muted`, `--color-border`, `--font-sans`, `--radius-md`, `--radius-lg`, `--space-1…--space-12`.

---

## 3. Tech Stack & Versions

| Area | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 14 App Router, React 18, TypeScript (strict), Tailwind, Radix UI, TanStack Query, Zustand, next-intl |
| Backend | NestJS 10, Node 20, Prisma, class-validator/Zod, CASL |
| Data | PostgreSQL 16 (RLS, pgvector), Redis 7, BullMQ, OpenSearch |
| Storage | S3-compatible, CloudFront, FFmpeg for HLS |
| Realtime | Socket.IO + Redis adapter |
| Live | LiveKit |
| Payments | Stripe, Razorpay |
| Testing | Vitest/Jest, Supertest, Testcontainers, Playwright, k6 |
| Tooling | ESLint, Prettier, Husky, Conventional Commits |

---

## 4. Repository Map

```
apps/web         Next.js app (learner, studio, admin, platform routes)
apps/api         NestJS modules (one folder per domain)
apps/worker      BullMQ processors
packages/db      prisma/schema.prisma, migrations, rls/*.sql, seed
packages/ui      Components + Tailwind preset with tokens
packages/sdk     Generated OpenAPI client
packages/scorm   Manifest parser + runtime shim
packages/config  Shared configs
docs/            PRD.md TRD.md UI_UX_DESIGN.md BRAIN.md
```

### API module layout (per domain)
```
apps/api/src/modules/<domain>/
  <domain>.module.ts
  <domain>.controller.ts     # thin: validation + delegate
  <domain>.service.ts        # business logic
  <domain>.policy.ts         # CASL ability checks
  dto/*.dto.ts
  <domain>.service.spec.ts
```
Domains: `auth`, `organizations`, `users`, `courses`, `scorm`, `xapi`, `enrollments`, `assessments`, `certificates`, `analytics`, `social`, `engagement`, `offline`, `payments`, `integrations`.

---

## 5. Architecture Rules (Non-Negotiable)

1. **Tenant isolation:** every tenant table has `organization_id` and an RLS policy. Every request runs inside a transaction with `SET LOCAL app.organization_id`. Never query tenant tables outside that context.
2. **Authorization in layers:** route guard (`@Roles`), policy check (ownership/assignment), and RLS. Do not rely on only one.
3. **Immutable published content:** publishing creates a `course_versions` snapshot; enrollments reference a `course_version_id`.
4. **Idempotency:** payments, webhooks, offline sync, and imports must be idempotent (`Idempotency-Key`, unique `provider_event_id`, unique `eventId`).
5. **Side effects via queues:** email, transcoding, certificate PDF, exports, webhooks, connector sync run in BullMQ workers. Controllers stay fast.
6. **Events:** emit domain events (`course.published`, `enrollment.completed`, `lesson.completed`, `order.paid`) through an internal event bus; analytics and gamification subscribe.
7. **SCORM content** is served from a separate cookieless origin in a sandboxed iframe, always.
8. **No secrets in code.** Provider keys per tenant are envelope-encrypted in `integrations`.
9. **Feature flags** gate AI, gamification, live video, and per-tenant betas.

---

## 6. Coding Standards

### General
- TypeScript `strict: true`; no `any` without a justified comment.
- Functions small and pure where possible; services own business logic, controllers stay thin.
- Validate all external input at the boundary (DTOs). Return RFC 7807 errors.
- Use UUID v7 IDs, `timestamptz`, money as integer minor units (`amount_minor`) plus currency code.
- Pagination is cursor-based; list endpoints accept `limit` (≤100), `cursor`, `sort`, `filter[...]`.
- Logging: structured JSON with `requestId`, `organizationId`, `userId`; never log secrets or PII.

### Frontend
- Server Components by default; client components only for interactivity.
- Data fetching via the generated `packages/sdk` + TanStack Query. No ad-hoc `fetch` to the API.
- Styling via Tailwind using token variables (`bg-[var(--color-surface)]` mapped to semantic utilities). **Never hardcode brand colors.**
- Use logical properties (`ms-*`, `pe-*`) for RTL. No `left/right` in layout styles.
- All user-visible text through `next-intl` keys; no hardcoded strings.
- Every interactive component: keyboard accessible, visible focus ring, ARIA where needed.

### Backend
- One migration per change; forward-only; expand/contract for destructive changes.
- Prisma for CRUD, raw SQL for RLS, reporting, and bulk operations.
- Use transactions for multi-table writes (enrollment activation after payment, certificate issue).

### Naming
- Files: `kebab-case`. React components: `PascalCase`. DB columns: `snake_case`. JSON API fields: `camelCase`.
- Tests mirror source path, suffix `.spec.ts` / `.e2e.ts`.

### Git
- Branches: `feat/<fr-id>-short-name`. Commits: `feat(courses): add drip rules (FR-COURSE-4)`.
- PR checklist: tests, RLS test, a11y check, i18n keys, docs updated.

---

## 7. Feature Implementation Playbooks

### 7.1 Add a new tenant-scoped entity
1. Add Prisma model with `organization_id`, indexes, timestamps.
2. Write migration + RLS policy (`tenant_isolation`).
3. Add to cross-tenant isolation test list.
4. Create DTOs, service, policy, controller, OpenAPI decorators.
5. Regenerate SDK (`pnpm sdk:generate`).
6. Add UI via `packages/ui` components; add i18n keys.
7. Tests: unit, integration (incl. RLS), e2e if user-facing.

### 7.2 Course publish flow
`PATCH draft → validate (≥1 section, ≥1 lesson, completion rule set) → snapshot into course_versions.snapshot → set courses.current_version_id and status PUBLISHED → emit course.published → search index job`.

### 7.3 Enrollment & payment
Free: create `enrollments` as `ACTIVE`. Paid: create `orders` (`PENDING`) → provider checkout → webhook → insert `payments` (unique provider event) → in one transaction set `orders.status = PAID`, enrollment `ACTIVE` → emit `order.paid`. Never activate from the client redirect alone.

### 7.4 Progress & completion
`POST /lessons/{lessonId}/progress` → upsert `lesson_progress` → recompute `enrollments.progress_pct` → if completion rule met, set `COMPLETED`, emit `enrollment.completed` → certificate job and gamification points.

### 7.5 SCORM
Upload → worker validates manifest → stores `scorm_packages` → lesson of type `SCORM` references package → player loads in sandbox iframe → shim posts commits to `POST /scorm/attempts/{attemptId}/commit` (debounced) → update `scorm_attempts` and `lesson_progress`.

### 7.6 Offline sync
Client queues events in IndexedDB `outbox` → `POST /offline/sync` with `eventId`s → server applies idempotently using merge rules: state by newest `clientUpdatedAt`, `score` = max, `status` furthest along → returns applied/conflicts.

### 7.7 Branding / white-label
Store overrides in `org_branding.tokens`; inject as CSS variables at SSR time based on resolved tenant; validate contrast; invalidate Redis cache key `branding:{organizationId}`.

### 7.8 Certificates
On `enrollment.completed` → worker renders template to PDF → store S3 → insert `certificates` with `certificate_code` (`CERT-{YYYY}-{base32}`) → notify learner → public `/verify/{certificateCode}`.

---

## 8. Testing Requirements

- Every service method with business rules has unit tests.
- Every endpoint has an integration test (happy path, validation error, 401/403, cross-tenant attempt).
- **Mandatory:** cross-tenant isolation test for every new table.
- E2E (Playwright) for: signup/login, enroll + learn + complete, assessment pass + certificate, admin branding change, offline download + sync, payment webhook flow.
- Accessibility: run axe on new pages; fix all serious/critical.
- Do not merge with failing lint, typecheck, or tests.

---

## 9. Security Checklist (apply to every PR)

- [ ] Input validated; output encoded; rich text sanitized
- [ ] AuthN/AuthZ checks (role + policy + RLS)
- [ ] No secrets or PII in logs
- [ ] File uploads: type/size limits, virus scan path
- [ ] Rate limiting on public/auth endpoints
- [ ] `audit_logs` entry for privileged actions
- [ ] Dependencies reviewed; no `eval`/dynamic requires on user input

---

## 10. Environment & Commands

```bash
pnpm install
docker compose up -d            # postgres, redis, minio, opensearch, mailpit
pnpm db:migrate && pnpm db:seed
pnpm dev                        # web :3000, api :4000, worker
pnpm test                       # unit
pnpm test:int                   # integration (Testcontainers)
pnpm test:e2e                   # Playwright
pnpm lint && pnpm typecheck
pnpm sdk:generate               # OpenAPI → packages/sdk
```

### Environment variables (names)
`DATABASE_URL`, `REDIS_URL`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `S3_BUCKET`, `S3_REGION`, `CDN_BASE_URL`, `CONTENT_ORIGIN`, `OPENSEARCH_URL`, `SES_REGION`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `KMS_KEY_ID`, `AI_PROVIDER_API_KEY`

---

## 11. Build Order (Milestones from PRD §10)

1. **M1 Foundation:** monorepo, CI, Prisma, RLS harness, tenancy resolution, auth (email, MFA, SSO skeleton), RBAC, `organizations`, `org_branding`, users/groups.
2. **M2 Content:** course builder, media pipeline, versions, enrollments, `lesson_progress`, catalog + search.
3. **M3 Standards & Assessment:** SCORM runtime, xAPI LRS, question banks, assessments, grading, certificates.
4. **M4 Commerce & Social:** payments (Stripe, Razorpay), coupons, forums, DMs, notifications, live sessions.
5. **M5 Engagement & Offline:** gamification, recommendations, AI assistant, PWA offline + sync.
6. **M6 Enterprise:** SSO hardening, HRIS/CRM, LTI 1.3, analytics exports, custom domains at scale, webhooks/API keys.

Complete each milestone's acceptance criteria (PRD §4) before moving on.

---

## 12. Definition of Done

- Matches PRD acceptance criteria and canonical names.
- Tests (unit, integration, RLS, e2e where applicable) pass in CI.
- No a11y violations (serious/critical); RTL and `sm` breakpoint verified.
- i18n keys added for every new string (`en` required).
- OpenAPI updated, SDK regenerated, docs updated if behavior changed.
- Observability added (logs, metrics, events) for new flows.
- Feature flag in place if risky; migration is backward compatible.

---

## 13. Pitfalls to Avoid

- ❌ Querying tenant tables without tenant context or bypassing RLS.
- ❌ Activating enrollments from client-side payment redirects.
- ❌ Serving SCORM from the main app origin.
- ❌ Hardcoding colors, strings, or `left/right` CSS.
- ❌ Mutating published `course_versions`.
- ❌ Renaming canonical entities, routes, roles, or tokens "for convenience."
- ❌ Doing heavy work (transcoding, PDF, exports) in request handlers.
- ❌ Storing money as floats.
- ❌ Skipping idempotency on webhooks and sync endpoints.

---

## 14. Escalation Protocol

If a requirement is ambiguous, conflicts across docs, or needs a new canonical name:
1. Stop implementation of that piece.
2. Write a short note: question, options, recommendation.
3. Wait for human confirmation; then update PRD/TRD/UI docs and this file in the same PR.
