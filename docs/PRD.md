# PRD — Multi-Tenant LMS Portal

**Version:** 1.0 | **Status:** Implementation-ready | **Companion docs:** TRD.md, UI_UX_DESIGN.md, BRAIN.md

> Canonical names defined here (roles, entities, API routes, feature IDs, design tokens) are reused verbatim in every other document.

---

## 1. Product Overview

### 1.1 Vision
A white-label, multi-tenant Learning Management System where organizations deliver, track, and monetize learning under their own brand, domain, and language.

### 1.2 Goals
- G1: Let an Org Admin launch a branded learning site in under 30 minutes.
- G2: Support industry-standard content (SCORM 1.2, SCORM 2004, xAPI) alongside native course-builder content.
- G3: Provide reliable learning on weak networks via PWA offline mode.
- G4: Enable paid and free enrollment through Stripe and Razorpay.
- G5: Deliver actionable analytics to admins, instructors, and learners.

### 1.3 Non-Goals (v1)
- Native iOS/Android apps (PWA only).
- Proprietary authoring suite beyond the course builder.
- Marketplace connecting multiple tenants' courses.

### 1.4 Success Metrics
| Metric | Target |
|---|---|
| Time to first published course | < 30 min |
| Course completion rate | > 55% |
| Lighthouse PWA score | ≥ 90 |
| p95 page API latency | < 400 ms |
| Tenant onboarding success (no support ticket) | > 85% |
| Uptime | 99.9% |

---

## 2. Tenancy Model

- **Tenant** = Organization (`organizations` table). Every tenant-scoped row carries `organization_id`.
- Isolation: shared database, row-level security (RLS) enforced on `organization_id`.
- Each tenant has: subdomain (`{slug}.lmsportal.app`), optional custom domains (`org_domains`), branding (`org_branding`), locale settings, payment config, SSO config.
- A user may belong to multiple organizations via `memberships`, with one role per membership.

---

## 3. Roles & RBAC

| Role (canonical) | Scope | Summary |
|---|---|---|
| `SUPER_ADMIN` | Platform | Manages all tenants, plans, platform settings, impersonation (audited). |
| `ORG_ADMIN` | Organization | Full control of one tenant: users, branding, billing, integrations, reports. |
| `INSTRUCTOR` | Organization | Creates and owns courses, grades, runs live sessions. |
| `TEACHING_ASSISTANT` | Course | Grades, moderates forums, supports learners on assigned courses. |
| `LEARNER` | Organization | Enrolls, consumes content, takes assessments, earns certificates. |

### 3.1 Permission Matrix
Legend: ✅ allowed, 🔸 own/assigned only, ❌ denied.

| Permission key | SUPER_ADMIN | ORG_ADMIN | INSTRUCTOR | TEACHING_ASSISTANT | LEARNER |
|---|---|---|---|---|---|
| `org.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `branding.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `users.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `course.create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `course.edit` | ✅ | ✅ | 🔸 | 🔸 (limited) | ❌ |
| `course.publish` | ✅ | ✅ | 🔸 | ❌ | ❌ |
| `enrollment.manage` | ✅ | ✅ | 🔸 | 🔸 | ❌ |
| `assessment.grade` | ✅ | ✅ | 🔸 | 🔸 | ❌ |
| `certificate.issue` | ✅ | ✅ | 🔸 | ❌ | ❌ |
| `analytics.view.org` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `analytics.view.course` | ✅ | ✅ | 🔸 | 🔸 | ❌ |
| `billing.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `forum.moderate` | ✅ | ✅ | 🔸 | 🔸 | ❌ |
| `content.consume` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Functional Requirements

Each feature has an ID (`FR-xx`), priority (P0 must, P1 should, P2 could), and acceptance criteria (AC).

### 4.1 Authentication & Identity (FR-AUTH)
- **FR-AUTH-1 (P0)** Email/password with verification, password reset, and MFA (TOTP).
- **FR-AUTH-2 (P0)** SSO via SAML 2.0 and OIDC per tenant; just-in-time provisioning with role mapping.
- **FR-AUTH-3 (P1)** Social login (Google, Microsoft) per tenant toggle.
- **FR-AUTH-4 (P0)** Session management: access token 15 min, refresh token 30 days, device list and revoke.
- AC: A user signing in on `{slug}.lmsportal.app` or a custom domain only receives access to that tenant's data.

### 4.2 Organization & White-Label (FR-ORG)
- **FR-ORG-1 (P0)** Branding: logo, favicon, primary/secondary colors, fonts, login background, email templates.
- **FR-ORG-2 (P0)** Custom domains with automated TLS (CNAME verification, certificate issuance).
- **FR-ORG-3 (P0)** Localization: per-tenant default locale; supported locales `en`, `es`, `fr`, `de`, `pt`, `hi`, `ar`, `he`; full RTL for `ar`, `he`.
- **FR-ORG-4 (P1)** Custom terminology (e.g., "Course" → "Program").
- AC: Changing brand colors updates all tenant pages within 60 seconds without redeploy.

### 4.3 User & Group Management (FR-USER)
- **FR-USER-1 (P0)** Invite by email, CSV bulk import, and SSO provisioning.
- **FR-USER-2 (P0)** Groups (`groups`, `group_members`) for bulk enrollment and reporting.
- **FR-USER-3 (P1)** Custom profile fields per tenant.
- **FR-USER-4 (P1)** Deactivate/reactivate users while preserving history.

### 4.4 Course Builder (FR-COURSE)
- **FR-COURSE-1 (P0)** Hierarchy: Course → Section → Lesson → Content Block.
- **FR-COURSE-2 (P0)** Lesson types: video (HLS), document (PDF), rich text, quiz, assignment, SCORM package, xAPI activity, live session.
- **FR-COURSE-3 (P0)** Drag-and-drop ordering, drafts, versioning (`course_versions`), publish/unpublish.
- **FR-COURSE-4 (P0)** Prerequisites, drip release (date or relative to enrollment), completion rules (all lessons, percentage, assessment pass).
- **FR-COURSE-5 (P1)** Learning paths (`learning_paths`) bundling ordered courses.
- **FR-COURSE-6 (P1)** Course catalog with categories, tags, search, and visibility (public, tenant-only, private).
- AC: Publishing creates an immutable `course_versions` snapshot; in-flight learners stay on their enrolled version unless an admin migrates them.

### 4.5 SCORM & xAPI (FR-STD)
- **FR-STD-1 (P0)** Upload and validate SCORM 1.2 and SCORM 2004 (3rd/4th ed.) packages; parse `imsmanifest.xml`.
- **FR-STD-2 (P0)** SCORM runtime API (`API` / `API_1484_11`) persisting CMI data, suspend data, scores, completion, and session time.
- **FR-STD-3 (P0)** Embedded LRS: accept xAPI 1.0.3 statements at `/xapi/statements`; allow external LRS forwarding.
- **FR-STD-4 (P1)** xAPI authoring output for native lessons (viewed, completed, passed, failed).
- AC: A valid SCORM package plays in an iframe, and score/completion appear in analytics within 5 seconds of commit.

### 4.6 Assessments (FR-ASSESS)
- **FR-ASSESS-1 (P0)** Question types: single choice, multiple choice, true/false, short answer, essay, matching, fill-in-the-blank, file upload.
- **FR-ASSESS-2 (P0)** Question banks, randomization, time limits, attempt limits, passing score.
- **FR-ASSESS-3 (P0)** Auto-grading for objective types; manual grading with rubrics for subjective types.
- **FR-ASSESS-4 (P1)** Assignments with due dates, late policy, peer review.
- **FR-ASSESS-5 (P1)** Proctoring-lite: tab-switch logging and copy/paste restrictions.

### 4.7 Certificates (FR-CERT)
- **FR-CERT-1 (P0)** Template designer (merge fields: learner name, course, date, score, certificate ID).
- **FR-CERT-2 (P0)** Auto-issue on course completion; PDF generation; public verification URL `/verify/{certificateCode}`.
- **FR-CERT-3 (P1)** Expiry and renewal; Open Badges 3.0 export.

### 4.8 Analytics & Reporting (FR-ANALYTICS)
- **FR-ANALYTICS-1 (P0)** Org dashboard: active learners, enrollments, completion rate, revenue.
- **FR-ANALYTICS-2 (P0)** Course report: funnel, drop-off per lesson, assessment item analysis, time spent.
- **FR-ANALYTICS-3 (P0)** Learner report: progress, scores, activity timeline, certificates.
- **FR-ANALYTICS-4 (P1)** Scheduled exports (CSV, XLSX) by email; API access.
- **FR-ANALYTICS-5 (P2)** Custom report builder.

### 4.9 Social & Communication (FR-SOCIAL)
- **FR-SOCIAL-1 (P0)** Course forums: threads, replies, upvotes, accepted answer, moderation.
- **FR-SOCIAL-2 (P1)** Direct messages (1:1 and group) with attachments.
- **FR-SOCIAL-3 (P1)** Live video sessions (WebRTC via provider; schedule, join, recording).
- **FR-SOCIAL-4 (P0)** Notifications: in-app, email, and web push; per-user preferences.
- **FR-SOCIAL-5 (P1)** Announcements per course or organization.

### 4.10 Gamification & AI (FR-ENGAGE)
- **FR-ENGAGE-1 (P1)** Points, badges, streaks, levels, leaderboards (`points_ledger`, `badges`, `user_badges`).
- **FR-ENGAGE-2 (P1)** AI recommendations: next-course suggestions from history, skills, and peers (`recommendations`).
- **FR-ENGAGE-3 (P2)** AI assistant for learners (course Q&A grounded in tenant content) and instructor quiz generation.
- AC: Tenants can disable gamification and AI features individually.

### 4.11 PWA & Offline (FR-PWA)
- **FR-PWA-1 (P0)** Installable PWA with manifest generated per tenant branding.
- **FR-PWA-2 (P0)** Offline course download: video (HLS segments), documents, rich text; encrypted storage in IndexedDB/Cache Storage.
- **FR-PWA-3 (P0)** Offline progress queue synced via background sync with conflict resolution (last-write-wins per lesson, max score wins).
- **FR-PWA-4 (P1)** Storage quota management UI.
- AC: A learner can complete a downloaded lesson in airplane mode and see progress sync after reconnect.

### 4.12 Payments & Commerce (FR-PAY)
- **FR-PAY-1 (P0)** Stripe (global) and Razorpay (India) checkout per tenant; tenant brings own keys or uses Connect/Route.
- **FR-PAY-2 (P0)** Pricing models: free, one-time, subscription, bundle, coupon codes.
- **FR-PAY-3 (P0)** Webhook-driven enrollment activation; idempotent processing.
- **FR-PAY-4 (P1)** Invoices, refunds, tax (VAT/GST) fields.
- **FR-PAY-5 (P1)** Seat-based licensing for B2B orgs.

### 4.13 Integrations (FR-INT)
- **FR-INT-1 (P1)** HRIS connectors: Workday, BambooHR, SAP SuccessFactors (user sync, org units).
- **FR-INT-2 (P1)** CRM connectors: Salesforce, HubSpot (contact sync, enrollment events).
- **FR-INT-3 (P0)** Public REST API with API keys and OAuth2 client credentials.
- **FR-INT-4 (P0)** Outbound webhooks (`webhook_endpoints`) with signing and retries.
- **FR-INT-5 (P1)** LTI 1.3 provider/consumer.

---

## 5. Domain Model (Canonical Entities)

Table names are `snake_case` plural. All tenant-scoped tables include `organization_id`.

| Table | Purpose |
|---|---|
| `organizations` | Tenants |
| `org_domains` | Custom domains and verification |
| `org_branding` | Colors, logos, fonts, terminology |
| `users` | Global identities |
| `memberships` | User ↔ organization with `role` |
| `groups`, `group_members` | Cohorts |
| `courses` | Course header |
| `course_versions` | Published snapshots |
| `sections`, `lessons`, `content_blocks` | Content tree |
| `scorm_packages`, `scorm_attempts` | SCORM storage and runtime |
| `xapi_statements` | Embedded LRS |
| `learning_paths`, `learning_path_courses` | Bundles |
| `enrollments` | Learner ↔ course version |
| `lesson_progress` | Per-lesson state |
| `question_banks`, `questions`, `assessments`, `assessment_attempts`, `attempt_answers` | Testing |
| `assignments`, `submissions` | Assignments |
| `certificate_templates`, `certificates` | Credentials |
| `forum_threads`, `forum_posts` | Forums |
| `conversations`, `messages` | DMs |
| `live_sessions` | Video events |
| `notifications`, `notification_preferences` | Alerts |
| `points_ledger`, `badges`, `user_badges` | Gamification |
| `recommendations` | AI suggestions |
| `products`, `prices`, `orders`, `payments`, `coupons`, `subscriptions` | Commerce |
| `integrations`, `webhook_endpoints`, `webhook_deliveries`, `api_keys` | Integrations |
| `audit_logs` | Security trail |

### Key relationships
- `organizations` 1—N `memberships` N—1 `users`
- `courses` 1—N `course_versions` 1—N `sections` 1—N `lessons`
- `enrollments` N—1 `course_versions`; `lesson_progress` N—1 `enrollments`
- `certificates` N—1 `enrollments`

### Enumerations
- `role`: `SUPER_ADMIN | ORG_ADMIN | INSTRUCTOR | TEACHING_ASSISTANT | LEARNER`
- `lesson_type`: `VIDEO | DOCUMENT | TEXT | QUIZ | ASSIGNMENT | SCORM | XAPI | LIVE`
- `enrollment_status`: `PENDING | ACTIVE | COMPLETED | EXPIRED | CANCELLED`
- `course_status`: `DRAFT | PUBLISHED | ARCHIVED`
- `order_status`: `PENDING | PAID | FAILED | REFUNDED`

---

## 6. API Surface (Canonical Routes)

Base: `/api/v1`. All responses JSON; errors follow RFC 7807.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/mfa/verify`, `GET /auth/sso/{provider}/start`, `POST /auth/sso/{provider}/callback` |
| Organizations | `GET /organizations/current`, `PATCH /organizations/current`, `GET/PUT /organizations/current/branding`, `GET/POST/DELETE /organizations/current/domains` |
| Users | `GET/POST /users`, `GET/PATCH/DELETE /users/{userId}`, `POST /users/import`, `GET/POST /groups`, `POST /groups/{groupId}/members` |
| Courses | `GET/POST /courses`, `GET/PATCH/DELETE /courses/{courseId}`, `POST /courses/{courseId}/publish`, `GET /courses/{courseId}/versions`, CRUD `/courses/{courseId}/sections`, `/sections/{sectionId}/lessons` |
| SCORM / xAPI | `POST /scorm/packages`, `GET /scorm/packages/{packageId}`, `POST /scorm/attempts/{attemptId}/commit`, `POST /xapi/statements`, `GET /xapi/statements` |
| Enrollment | `POST /enrollments`, `GET /enrollments/me`, `PATCH /enrollments/{enrollmentId}`, `POST /lessons/{lessonId}/progress` |
| Assessments | `GET/POST /assessments`, `POST /assessments/{assessmentId}/attempts`, `POST /attempts/{attemptId}/submit`, `POST /attempts/{attemptId}/grade` |
| Certificates | `GET /certificates/me`, `POST /certificates/{enrollmentId}/issue`, `GET /verify/{certificateCode}` |
| Analytics | `GET /analytics/org`, `GET /analytics/courses/{courseId}`, `GET /analytics/learners/{userId}`, `POST /analytics/exports` |
| Social | `GET/POST /courses/{courseId}/threads`, `POST /threads/{threadId}/posts`, `GET/POST /conversations`, `POST /conversations/{conversationId}/messages`, `GET/POST /live-sessions` |
| Engagement | `GET /gamification/me`, `GET /leaderboards/{courseId}`, `GET /recommendations/me` |
| Offline | `POST /offline/manifest`, `POST /offline/sync` |
| Payments | `POST /checkout/sessions`, `POST /webhooks/stripe`, `POST /webhooks/razorpay`, `GET /orders/me`, CRUD `/coupons` |
| Integrations | `GET/POST /integrations`, `POST /integrations/{integrationId}/sync`, CRUD `/webhook-endpoints`, CRUD `/api-keys` |

---

## 7. User Journeys

### 7.1 Org Admin onboarding
1. Super Admin or self-serve signup creates organization.
2. Admin sets branding, locale, and custom domain.
3. Admin configures SSO and payment provider.
4. Admin invites instructors; instructors build and publish a course.

### 7.2 Learner flow
1. Learner signs in (SSO or email) on tenant domain.
2. Browses catalog, enrolls (free or via checkout).
3. Consumes lessons online or downloads for offline.
4. Completes assessment, earns certificate, shares verification link.

### 7.3 Instructor grading
1. Opens grading queue, filters by course.
2. Grades with rubric, leaves feedback.
3. Learner is notified; progress and certificate eligibility recalculate.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | p95 API < 400 ms; LCP < 2.5 s on 4G; video start < 3 s |
| Scalability | 10,000 concurrent learners per region at launch; horizontal scaling of stateless services |
| Availability | 99.9% monthly; RPO ≤ 15 min; RTO ≤ 1 h |
| Security | OWASP ASVS L2; tenant isolation via RLS; encryption at rest (AES-256) and in transit (TLS 1.2+); audit logging |
| Privacy | GDPR, CCPA, India DPDP: data export, deletion, consent records, data residency options |
| Accessibility | WCAG 2.2 AA |
| Browser support | Last 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari 16+ |
| i18n | ICU message format; RTL mirroring; locale-aware dates, numbers, currencies |
| Observability | Structured logs, metrics, traces; per-tenant dashboards |
| Compliance | SOC 2 Type II roadmap; SCORM conformance testing |

---

## 9. Design Tokens (Canonical Names)

Referenced by UI_UX_DESIGN.md; tenants override via `org_branding`.

| Token | Default |
|---|---|
| `--color-primary` | `#4F46E5` |
| `--color-primary-contrast` | `#FFFFFF` |
| `--color-secondary` | `#0EA5E9` |
| `--color-success` | `#16A34A` |
| `--color-warning` | `#D97706` |
| `--color-danger` | `#DC2626` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-muted` | `#F8FAFC` |
| `--color-text` | `#0F172A` |
| `--color-text-muted` | `#475569` |
| `--font-sans` | `Inter, system-ui, sans-serif` |
| `--radius-md` | `8px` |
| `--space-4` | `16px` |

---

## 10. Release Plan

| Milestone | Scope |
|---|---|
| M1 — Foundation (wk 1–6) | Tenancy, auth, RBAC, org branding, users/groups |
| M2 — Content (wk 7–12) | Course builder, media pipeline, enrollments, progress |
| M3 — Standards & Assessment (wk 13–18) | SCORM/xAPI, assessments, certificates |
| M4 — Commerce & Social (wk 19–24) | Stripe/Razorpay, forums, DMs, notifications, live sessions |
| M5 — Engagement & Offline (wk 25–30) | PWA offline, gamification, AI recommendations |
| M6 — Enterprise (wk 31–36) | SSO hardening, HRIS/CRM, LTI, analytics exports, custom domains at scale |

---

## 11. Risks & Assumptions

| Risk | Mitigation |
|---|---|
| SCORM runtime inconsistencies across vendors | Conformance suite; vendor package test library |
| Offline sync conflicts | Deterministic merge rules (FR-PWA-3); event log replay |
| Payment webhook duplication | Idempotency keys; `payments` unique constraint on provider event ID |
| Tenant data leakage | RLS plus automated cross-tenant tests in CI |
| Video cost growth | Adaptive bitrate ladder, lifecycle policies, per-tenant quotas |

**Assumptions:** cloud object storage with CDN available; email provider (SES/SendGrid) configured; tenants accept shared-infrastructure isolation.

---

## 12. Open Questions
1. Should tenants be able to resell courses across tenants in v2?
2. Required data-residency regions at launch (EU, India, US)?
3. Preferred live-video provider (LiveKit vs Daily vs Zoom SDK)?
