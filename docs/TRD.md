# TRD — Multi-Tenant LMS Portal

**Version:** 1.0 | **Companion docs:** PRD.md, UI_UX_DESIGN.md, BRAIN.md
All names (tables, routes, roles, enums, feature IDs) match PRD.md exactly.

---

## 1. Architecture Overview

### 1.1 Style
Modular monolith (NestJS) with separately scaled workers, deployed as containers. Extract services (media, live, analytics) only when metrics justify it.

```
Browser / PWA ──> CDN ──> Next.js (SSR/ISR, tenant-aware) ──> API (NestJS, /api/v1)
                                                        │
        ┌───────────────┬───────────────┬──────────────┼────────────────┐
   PostgreSQL 16     Redis 7        S3 + CloudFront   OpenSearch     Workers (BullMQ)
   (RLS, pgvector)  (cache, queues,  (HLS, SCORM,      (catalog,      (media, email,
                     rate limits)     uploads)          forums)        certs, sync,
                                                                        webhooks)
```

### 1.2 Tech Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Zustand |
| Backend | Node.js 20, NestJS 10, TypeScript (alternative: FastAPI for AI service only) |
| ORM / migrations | Prisma + SQL migrations for RLS policies |
| Database | PostgreSQL 16 (pgvector for recommendations) |
| Cache / queue | Redis 7, BullMQ |
| Search | OpenSearch (catalog, forums) |
| Storage | S3-compatible with presigned multipart upload; CloudFront CDN |
| Media | FFmpeg workers, HLS ladder (240p–1080p), AES-128 encryption |
| Realtime | WebSocket gateway (Socket.IO) for notifications, forums, DMs |
| Live video | LiveKit (WebRTC) |
| Payments | Stripe, Razorpay |
| Email | SES (fallback SendGrid) |
| Infra | Docker, Kubernetes, Terraform, GitHub Actions |
| Observability | OpenTelemetry, Prometheus, Grafana, Loki, Sentry |

### 1.3 Repository Layout (monorepo, pnpm + Turborepo)
```
apps/web            Next.js frontend + PWA
apps/api            NestJS API
apps/worker         BullMQ workers
packages/db         Prisma schema, migrations, RLS SQL
packages/ui         Shared components (tokens from PRD §9)
packages/config     ESLint, TS, Tailwind presets
packages/sdk        Typed API client (generated from OpenAPI)
packages/scorm      SCORM runtime + manifest parser
```

---

## 2. Multi-Tenancy Implementation

1. **Resolution:** Edge middleware reads `Host` → looks up `organizations` / `org_domains` (cached in Redis, TTL 60 s) → sets `x-organization-id`.
2. **Context:** API guard resolves `organization_id` from JWT claim and host; mismatch → 403.
3. **RLS:** every tenant table enables RLS:
```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON courses
  USING (organization_id = current_setting('app.organization_id')::uuid);
```
   Each request runs `SET LOCAL app.organization_id = $1` inside a transaction.
4. **Super admin bypass:** dedicated DB role `lms_platform` with `BYPASSRLS`, used only via audited impersonation flow (`audit_logs`).
5. **CI test:** automated suite creates two tenants and asserts zero cross-tenant reads/writes on every table.
6. **Custom domains:** CNAME to `edge.lmsportal.app`; verification via TXT record; certificates via ACME (cert-manager / Caddy on-demand TLS); mapping stored in `org_domains`.

---

## 3. Data Model

UUID v7 primary keys. All tables: `id`, `organization_id` (except `users`, `organizations`), `created_at`, `updated_at`, soft-delete `deleted_at` where noted. Naming follows PRD §5.

### 3.1 Core DDL (excerpt)

```sql
CREATE TYPE role AS ENUM ('SUPER_ADMIN','ORG_ADMIN','INSTRUCTOR','TEACHING_ASSISTANT','LEARNER');
CREATE TYPE lesson_type AS ENUM ('VIDEO','DOCUMENT','TEXT','QUIZ','ASSIGNMENT','SCORM','XAPI','LIVE');
CREATE TYPE enrollment_status AS ENUM ('PENDING','ACTIVE','COMPLETED','EXPIRED','CANCELLED');
CREATE TYPE course_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
CREATE TYPE order_status AS ENUM ('PENDING','PAID','FAILED','REFUNDED');

CREATE TABLE organizations (
  id uuid PRIMARY KEY, slug citext UNIQUE NOT NULL, name text NOT NULL,
  default_locale text NOT NULL DEFAULT 'en', plan text NOT NULL DEFAULT 'starter',
  settings jsonb NOT NULL DEFAULT '{}', created_at timestamptz DEFAULT now()
);

CREATE TABLE org_domains (
  id uuid PRIMARY KEY, organization_id uuid REFERENCES organizations, domain citext UNIQUE NOT NULL,
  verification_token text, verified_at timestamptz, tls_status text
);

CREATE TABLE org_branding (
  organization_id uuid PRIMARY KEY REFERENCES organizations,
  logo_url text, favicon_url text, tokens jsonb NOT NULL DEFAULT '{}',
  terminology jsonb NOT NULL DEFAULT '{}', email_templates jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE users (
  id uuid PRIMARY KEY, email citext UNIQUE NOT NULL, password_hash text,
  name text, locale text, mfa_secret text, email_verified_at timestamptz
);

CREATE TABLE memberships (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES users,
  role role NOT NULL, status text NOT NULL DEFAULT 'ACTIVE', profile jsonb DEFAULT '{}',
  UNIQUE (organization_id, user_id)
);

CREATE TABLE courses (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, owner_id uuid REFERENCES users,
  slug text NOT NULL, title text NOT NULL, summary text, status course_status DEFAULT 'DRAFT',
  visibility text DEFAULT 'TENANT', category_id uuid, tags text[], current_version_id uuid,
  UNIQUE (organization_id, slug)
);

CREATE TABLE course_versions (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, course_id uuid NOT NULL REFERENCES courses,
  version int NOT NULL, snapshot jsonb NOT NULL, published_at timestamptz,
  UNIQUE (course_id, version)
);

CREATE TABLE sections (id uuid PRIMARY KEY, organization_id uuid NOT NULL, course_version_id uuid NOT NULL, title text, position int);
CREATE TABLE lessons (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, section_id uuid NOT NULL REFERENCES sections,
  type lesson_type NOT NULL, title text, position int, config jsonb DEFAULT '{}',
  drip jsonb, prerequisites uuid[], duration_sec int
);
CREATE TABLE content_blocks (id uuid PRIMARY KEY, organization_id uuid NOT NULL, lesson_id uuid NOT NULL, kind text, payload jsonb, position int);

CREATE TABLE enrollments (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid NOT NULL,
  course_id uuid NOT NULL, course_version_id uuid NOT NULL, status enrollment_status DEFAULT 'PENDING',
  progress_pct numeric(5,2) DEFAULT 0, enrolled_at timestamptz, completed_at timestamptz, expires_at timestamptz,
  order_id uuid, UNIQUE (user_id, course_id)
);

CREATE TABLE lesson_progress (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, enrollment_id uuid NOT NULL REFERENCES enrollments,
  lesson_id uuid NOT NULL, status text, score numeric, time_spent_sec int DEFAULT 0,
  state jsonb, client_updated_at timestamptz, UNIQUE (enrollment_id, lesson_id)
);

CREATE TABLE scorm_packages (id uuid PRIMARY KEY, organization_id uuid NOT NULL, version text, manifest jsonb, storage_prefix text, entry_href text);
CREATE TABLE scorm_attempts (id uuid PRIMARY KEY, organization_id uuid NOT NULL, enrollment_id uuid, package_id uuid, cmi jsonb, suspend_data text, score_raw numeric, completion text, success text, total_time_sec int);
CREATE TABLE xapi_statements (id uuid PRIMARY KEY, organization_id uuid NOT NULL, statement_id uuid UNIQUE, actor jsonb, verb text, object jsonb, result jsonb, stored_at timestamptz DEFAULT now());
CREATE INDEX ON xapi_statements USING gin (actor);

CREATE TABLE certificates (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, enrollment_id uuid NOT NULL, template_id uuid,
  certificate_code text UNIQUE NOT NULL, issued_at timestamptz, expires_at timestamptz, pdf_url text
);

CREATE TABLE orders (id uuid PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid, status order_status, currency char(3), amount_minor bigint, provider text, provider_ref text);
CREATE TABLE payments (id uuid PRIMARY KEY, organization_id uuid NOT NULL, order_id uuid, provider_event_id text UNIQUE, payload jsonb);

CREATE TABLE audit_logs (id uuid PRIMARY KEY, organization_id uuid, actor_id uuid, action text, entity text, entity_id uuid, meta jsonb, ip inet, created_at timestamptz DEFAULT now());
```
Remaining tables from PRD §5 (`groups`, `group_members`, `learning_paths`, `learning_path_courses`, `question_banks`, `questions`, `assessments`, `assessment_attempts`, `attempt_answers`, `assignments`, `submissions`, `certificate_templates`, `forum_threads`, `forum_posts`, `conversations`, `messages`, `live_sessions`, `notifications`, `notification_preferences`, `points_ledger`, `badges`, `user_badges`, `recommendations`, `products`, `prices`, `coupons`, `subscriptions`, `integrations`, `webhook_endpoints`, `webhook_deliveries`, `api_keys`) follow the same conventions: tenant column, RLS policy, FK indexes, `jsonb` for flexible config.

### 3.2 Indexing Rules
- B-tree on every FK and `(organization_id, created_at)` for list views.
- Partial indexes for active records (`WHERE deleted_at IS NULL`).
- Full-text search in OpenSearch; Postgres `tsvector` fallback.
- `recommendations.embedding vector(768)` with HNSW index.

---

## 4. API Design

- REST under `/api/v1`, OpenAPI 3.1 generated from NestJS decorators; SDK generated into `packages/sdk`.
- Auth: `Authorization: Bearer <JWT>`; API keys via `X-API-Key` (hashed in `api_keys`).
- Pagination: cursor-based (`?cursor=&limit=`), max 100.
- Filtering: `?filter[status]=ACTIVE&sort=-created_at`.
- Idempotency: `Idempotency-Key` header on POST for payments, enrollments, imports.
- Errors: RFC 7807 `application/problem+json`.
- Rate limits (Redis sliding window): 100 req/min/user, 1000 req/min/API key, auth endpoints 10 req/min/IP.
- Versioning: URL major version; additive changes only within `v1`.

### 4.1 Representative Contracts

`POST /api/v1/enrollments`
```json
{ "courseId": "uuid", "userId": "uuid (admin only)", "couponCode": "SPRING25" }
```
→ `201 { "id": "uuid", "status": "PENDING|ACTIVE", "checkoutUrl": "https://..." }`

`POST /api/v1/lessons/{lessonId}/progress`
```json
{ "status": "IN_PROGRESS", "timeSpentSec": 42, "state": {"videoPosition": 128}, "clientUpdatedAt": "2026-11-20T10:00:00Z" }
```

`POST /api/v1/offline/sync`
```json
{ "events": [ { "eventId": "uuid", "type": "LESSON_PROGRESS", "lessonId": "uuid", "payload": {}, "clientUpdatedAt": "..." } ] }
```
→ `{ "applied": ["eventId"], "conflicts": [ { "eventId": "...", "resolution": "SERVER_WINS" } ] }`

### 4.2 Authorization
Decorators: `@Roles('ORG_ADMIN')`, `@Permission('course.edit')`. Ownership checks (🔸 in PRD §3.1) are enforced in policy classes (`CoursePolicy`, `EnrollmentPolicy`) using CASL abilities. TA scope is resolved via `course_staff` mapping (stored in `memberships.profile.assignedCourseIds` for v1).

---

## 5. Module Specifications

### 5.1 Auth (FR-AUTH)
- Argon2id password hashing; JWT RS256, access 15 min, refresh 30 days with rotation and reuse detection (revoke family).
- MFA TOTP (RFC 6238), recovery codes hashed.
- SSO: SAML 2.0 (`samlify`) and OIDC (`openid-client`); per-tenant config in `integrations`; JIT provisioning with attribute→role mapping table.
- Session store in Redis keyed by refresh token family.

### 5.2 Course Builder (FR-COURSE)
- Editing happens on a draft `course_versions` row; autosave every 5 s with optimistic version counter.
- Publish: validates structure, freezes `snapshot`, sets `courses.current_version_id`, emits `course.published` event.
- Drip and prerequisites evaluated server-side in `LessonAccessService.canAccess(enrollment, lesson)`.
- Completion engine recalculates `enrollments.progress_pct` on each `lesson_progress` write (queue job for large courses).

### 5.3 Media Pipeline
1. Client requests presigned multipart URL; uploads directly to S3 `uploads/`.
2. S3 event → BullMQ `media.transcode` job.
3. FFmpeg → HLS ladder (240/360/480/720/1080), AES-128 keys stored in KMS-wrapped form, thumbnails, WebVTT captions via optional ASR.
4. Playback through signed CloudFront cookies, short TTL (5 min), tenant-prefixed paths.
5. Documents: PDF scanned with ClamAV, preview generated.

### 5.4 SCORM / xAPI (FR-STD)
- Upload ZIP → worker unzips to `scorm/{organizationId}/{packageId}/`, validates `imsmanifest.xml` against XSD, detects 1.2 vs 2004, extracts launch href and sequencing.
- Serve content from a separate cookieless domain (`content.lmsportal.app`) inside sandboxed iframe to prevent XSS against the main origin.
- Runtime shim exposes `window.API` (1.2) and `window.API_1484_11` (2004) via `postMessage` bridge; commits debounce 3 s and write `scorm_attempts`.
- LRS: `POST /xapi/statements` validates against xAPI 1.0.3 schema, stores in `xapi_statements`, optional forward to external LRS queue.

### 5.5 Assessments (FR-ASSESS)
- Attempt creation snapshots drawn questions into `assessment_attempts.snapshot` to guarantee stable grading.
- Auto-grading pure functions per question type; essay/file → `PENDING_REVIEW`.
- Timer enforced server-side (`started_at + limit`); late submissions rejected or flagged per config.
- Rubric scoring stored on `attempt_answers.rubric_scores`.

### 5.6 Certificates (FR-CERT)
- Trigger: `enrollment.completed` event → `CertificateService.issue`.
- PDF via headless Chromium (Playwright) from `certificate_templates` HTML; stored in S3; verification page SSR at `/verify/{certificateCode}` with signed hash.
- Code format: `CERT-{YYYY}-{base32 8 chars}`.

### 5.7 Analytics (FR-ANALYTICS)
- Event stream (`lesson.viewed`, `lesson.completed`, `assessment.submitted`, etc.) written to `analytics_events` (partitioned monthly) via queue.
- Nightly + incremental rollups into materialized views (`mv_course_funnel`, `mv_org_daily`).
- Exports run as BullMQ jobs producing CSV/XLSX in S3 with expiring links.
- Optional later: ClickHouse sink.

### 5.8 Social & Realtime (FR-SOCIAL)
- Socket.IO gateway with Redis adapter; rooms `org:{id}`, `course:{id}`, `conversation:{id}`.
- Notifications fan-out worker: in-app (DB + socket), email (SES), web push (VAPID).
- Live sessions: LiveKit rooms created on schedule; JWT join tokens; recordings stored to S3 and attached as lessons.
- Forum moderation: soft-delete, report queue, profanity filter hook.

### 5.9 Gamification & AI (FR-ENGAGE)
- `points_ledger` is append-only; balance derived. Rules engine config per tenant in `organizations.settings.gamification`.
- Recommendations: nightly job computes embeddings (course text + learner history) in pgvector; hybrid scoring = 0.5 semantic + 0.3 collaborative + 0.2 popularity; stored in `recommendations` with TTL.
- AI assistant: RAG over tenant content only (metadata filter by `organization_id`); provider abstraction; PII scrubbing; per-tenant token budgets; feature flag.

### 5.10 PWA & Offline (FR-PWA)
- Service worker (Workbox): app-shell precache, stale-while-revalidate for API GETs, cache-first for static.
- Dynamic manifest at `/manifest.webmanifest` per tenant (name, icons, theme from `--color-primary`).
- Offline download: `POST /offline/manifest` returns lesson asset list with signed, time-boxed URLs; client stores HLS segments + docs in Cache Storage and metadata in IndexedDB (Dexie). Content encrypted with AES-GCM using a key derived from the session via Web Crypto.
- Progress queue: events stored in IndexedDB `outbox`; Background Sync flushes to `POST /offline/sync`.
- Conflict rules: per `lesson_progress`, newer `clientUpdatedAt` wins for state; `score` = max; `status` = furthest along (`COMPLETED` > `IN_PROGRESS`).
- Quota checks via `navigator.storage.estimate()`; LRU eviction UI.

### 5.11 Payments (FR-PAY)
- Provider adapter interface: `createCheckout`, `handleWebhook`, `refund`.
- Stripe: Checkout Sessions + Connect (Standard) for tenant payouts; Razorpay: Orders + Route.
- Webhooks verify signature, insert into `payments` with unique `provider_event_id` (idempotent), then transition `orders` and activate `enrollments` in one transaction.
- Subscriptions reconcile nightly against provider state.
- Tax fields stored (`tax_id`, `tax_amount_minor`); calculation via Stripe Tax where available.

### 5.12 Integrations (FR-INT)
- Connector framework: `Connector` interface with `pull()`, `push()`, `mapFields()`; scheduled via BullMQ repeatable jobs; per-tenant credentials encrypted (envelope encryption, KMS).
- Webhooks: HMAC-SHA256 signature header `X-LMS-Signature`, exponential retry (up to 8 attempts over 24 h), delivery logs in `webhook_deliveries`.
- LTI 1.3: OIDC launch, deep linking, Assignment and Grade Services.

### 5.13 Internationalization
- `next-intl`, ICU messages, locale from user → tenant default → `Accept-Language`.
- RTL via logical CSS properties (`margin-inline-start`) and `dir` attribute on `<html>`.
- Server-side translations of emails and certificates; content translation fields stored as `jsonb` maps (`{"en": "...", "ar": "..."}`).

---

## 6. Security

| Area | Control |
|---|---|
| Transport | TLS 1.2+, HSTS, secure cookies (`SameSite=Lax`, `HttpOnly`) |
| Input | Zod/class-validator on all DTOs; HTML sanitization (DOMPurify server-side) for rich text |
| AuthZ | RBAC + ownership policies + RLS (defense in depth) |
| Secrets | AWS Secrets Manager / KMS; no secrets in env files committed |
| Uploads | MIME sniffing, size caps, ClamAV scanning, quarantine bucket |
| SCORM isolation | Separate origin, iframe `sandbox`, CSP `frame-ancestors` |
| CSP | Nonce-based CSP; no inline scripts on app origin |
| Abuse | Rate limits, bot detection on auth, account lockout after 10 failed attempts |
| Audit | `audit_logs` for auth events, role changes, exports, impersonation |
| Privacy | Data export and deletion jobs; PII encrypted columns (`pgcrypto`) for sensitive profile fields |
| Dependency | Renovate, `npm audit`, SAST (CodeQL), container scanning (Trivy) |

---

## 7. Performance & Scalability

- Stateless API pods behind HPA (CPU 60% / RPS-based).
- Read replicas for analytics queries; PgBouncer transaction pooling (note: use `SET LOCAL` only).
- Redis caching: org config, branding, course catalog pages (tag-based invalidation).
- Next.js ISR for public catalog and certificate verify pages.
- CDN caching for HLS segments (immutable, long TTL) and static assets.
- Queue concurrency tuned per queue; dead-letter queues with alerting.
- Load targets: 10k concurrent learners, 500 RPS sustained API, transcode throughput 100 hours video/day.

---

## 8. DevOps & Environments

| Env | Purpose |
|---|---|
| `local` | docker-compose (Postgres, Redis, MinIO, Mailpit, OpenSearch) |
| `preview` | Per-PR ephemeral environment |
| `staging` | Production-like, synthetic tenants |
| `production` | Multi-AZ, regional clusters (US, EU, IN) |

- CI (GitHub Actions): lint → typecheck → unit → integration (Testcontainers) → e2e (Playwright) → build → scan → deploy.
- Migrations: forward-only, run as pre-deploy job; expand/contract pattern for zero downtime.
- Feature flags: Unleash/ConfigCat, per-tenant targeting.
- Backups: PITR (RPO 15 min), daily snapshots retained 35 days, quarterly restore drills.
- Disaster recovery: cross-region replica for the primary region; RTO 1 h.

---

## 9. Testing Strategy

| Level | Tooling | Target |
|---|---|---|
| Unit | Vitest / Jest | 80% on domain services |
| Integration | Testcontainers, Supertest | All routes, RLS isolation suite |
| Contract | Pact / OpenAPI diff | No breaking changes in `v1` |
| E2E | Playwright | Critical journeys (PRD §7) |
| SCORM conformance | ADL test suite + vendor package library | Pass for 1.2, 2004 |
| Performance | k6 | p95 < 400 ms at target load |
| Accessibility | axe-core in CI, manual audits | WCAG 2.2 AA |
| Security | ZAP baseline, quarterly pen test | No high findings |

---

## 10. Observability & Operations

- Logs: JSON with `requestId`, `organizationId`, `userId`; PII redacted.
- Metrics: RED metrics per route; queue depth/latency; tenant-level usage (storage, minutes streamed, active users).
- Tracing: OpenTelemetry across web → API → workers.
- SLOs: availability 99.9%, p95 latency 400 ms; burn-rate alerts via PagerDuty.
- Runbooks for: payment webhook backlog, transcode failures, tenant domain TLS failure, queue stall.

---

## 11. Data Retention & Compliance

| Data | Retention |
|---|---|
| `audit_logs` | 2 years |
| `analytics_events` | 25 months raw, aggregates indefinite |
| Deleted users | Anonymized within 30 days of request |
| Media for cancelled tenants | 90 days then purged |
| Backups | 35 days |

Regional data residency via region-pinned clusters selected at `organizations` creation.

---

## 12. Open Technical Decisions
1. Postgres-only analytics vs adding ClickHouse at what volume threshold.
2. LiveKit self-hosted vs cloud.
3. Stripe Connect Standard vs Express for tenant onboarding.
4. Native mobile wrapper (Capacitor) if PWA offline limits on iOS block adoption.
