# UI/UX Design — Multi-Tenant LMS Portal

**Version:** 1.0 | **Companion docs:** PRD.md, TRD.md, BRAIN.md
Roles, routes, entities, and design tokens use the exact PRD names.

---

## 1. Design Principles

1. **Clarity first:** one primary action per screen.
2. **Brandable by default:** every color, font, and radius is a token; tenants override via `org_branding.tokens`.
3. **Learn anywhere:** mobile-first, offline-aware, low-bandwidth friendly.
4. **Inclusive:** WCAG 2.2 AA, full keyboard support, RTL-ready.
5. **Calm density:** admin views are dense but scannable; learner views are spacious and focused.

---

## 2. Design Tokens

### 2.1 Color (CSS variables, light theme defaults from PRD §9)
```css
:root {
  --color-primary: #4F46E5;
  --color-primary-contrast: #FFFFFF;
  --color-secondary: #0EA5E9;
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F8FAFC;
  --color-text: #0F172A;
  --color-text-muted: #475569;
  --color-border: #E2E8F0;
  --font-sans: Inter, system-ui, sans-serif;
  --radius-md: 8px;
  --radius-lg: 12px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --shadow-sm: 0 1px 2px rgb(0 0 0 / .06);
  --shadow-md: 0 4px 12px rgb(0 0 0 / .08);
}
[data-theme="dark"] {
  --color-surface: #0B1120;
  --color-surface-muted: #111827;
  --color-text: #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-border: #1F2937;
}
```
**Brand override rule:** when a tenant sets `--color-primary`, the system auto-computes a hover shade (−8% lightness), a tint for backgrounds, and validates 4.5:1 contrast against `--color-primary-contrast`; failing colors are rejected in the branding form with a suggested fix.

### 2.2 Typography
| Style | Size / Line | Weight |
|---|---|---|
| Display | 36 / 44 | 700 |
| H1 | 30 / 38 | 700 |
| H2 | 24 / 32 | 600 |
| H3 | 20 / 28 | 600 |
| Body | 16 / 24 | 400 |
| Small | 14 / 20 | 400 |
| Caption | 12 / 16 | 500 |

Arabic/Hebrew fallback stack: `"Noto Sans Arabic", "Noto Sans Hebrew"`. Tenants may choose from a curated Google Fonts list or upload a font (WOFF2).

### 2.3 Spacing, Grid, Breakpoints
| Name | Min width | Columns | Gutter |
|---|---|---|---|
| `sm` | 360 | 4 | 16 |
| `md` | 768 | 8 | 24 |
| `lg` | 1024 | 12 | 24 |
| `xl` | 1440 | 12 (max 1280 content) | 32 |

### 2.4 Elevation, Motion
- Elevation: `shadow-sm` cards, `shadow-md` popovers/modals.
- Motion: 150 ms ease-out for hover/focus, 250 ms for panels; respect `prefers-reduced-motion`.

---

## 3. Component Library (`packages/ui`)

Built on Radix primitives + Tailwind.

| Group | Components |
|---|---|
| Foundations | Button (primary/secondary/ghost/danger), IconButton, Link, Badge, Tag, Avatar, Tooltip, Skeleton |
| Forms | Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, DatePicker, FileUploader (resumable), RichTextEditor, ColorPicker, FormField with inline errors |
| Navigation | Topbar, Sidebar, Breadcrumbs, Tabs, Pagination, CommandPalette (⌘K) |
| Feedback | Toast, Alert, Banner (offline/online), Progress bar, Spinner, EmptyState, ConfirmDialog |
| Data | DataTable (sort, filter, bulk actions, column chooser), StatCard, Chart wrappers (line, bar, funnel, heatmap), Timeline |
| Learning | CourseCard, LessonList, VideoPlayer (HLS, captions, speed, resume), ScormFrame, QuizQuestion, RubricGrader, CertificatePreview, ProgressRing, BadgeShelf, Leaderboard |
| Social | ThreadList, PostComposer, MessageBubble, ConversationList, NotificationItem |
| Offline | DownloadButton (states: idle, queued, downloading %, ready, error), StorageMeter, SyncStatusChip |

**Component states:** default, hover, focus-visible (2 px `--color-primary` ring with 2 px offset), active, disabled, loading, error.

---

## 4. Information Architecture & Routes

### 4.1 Learner App (`LEARNER`)
```
/                         Home (continue learning, recommendations, streak)
/catalog                  Browse & search
/catalog/[courseSlug]     Course detail & enroll
/learn/[enrollmentId]     Course player
/learn/[enrollmentId]/lessons/[lessonId]
/my-learning              Enrollments (in progress / completed / downloaded)
/certificates             My certificates
/forums                   Course discussions
/messages                 DMs
/live                     Upcoming live sessions
/achievements             Points, badges, leaderboard
/profile                  Profile, locale, notifications, devices
/verify/[certificateCode] Public certificate verification
```

### 4.2 Instructor / TA Workspace (`INSTRUCTOR`, `TEACHING_ASSISTANT`)
```
/studio                         My courses
/studio/courses/new
/studio/courses/[courseId]/builder
/studio/courses/[courseId]/settings
/studio/courses/[courseId]/learners
/studio/courses/[courseId]/grading
/studio/courses/[courseId]/analytics
/studio/question-banks
/studio/live
```

### 4.3 Org Admin Console (`ORG_ADMIN`)
```
/admin                          Dashboard
/admin/users   /admin/groups
/admin/courses  /admin/learning-paths
/admin/branding  /admin/domains  /admin/localization
/admin/billing  (products, prices, coupons, orders)
/admin/integrations  (SSO, HRIS, CRM, webhooks, API keys)
/admin/analytics  /admin/certificates
/admin/audit-log
```

### 4.4 Platform Console (`SUPER_ADMIN`)
```
/platform/tenants   /platform/plans   /platform/health   /platform/impersonate
```

### 4.5 Navigation Behavior
- Desktop: left sidebar (collapsible) + topbar (search, notifications, profile menu).
- Mobile: bottom tab bar (Home, Catalog, My Learning, Messages, Profile); admin console uses a drawer.
- Role switcher in profile menu when the user holds memberships in multiple organizations.

---

## 5. Key Screen Specifications

### 5.1 Login (`/login`)
- Tenant-branded: logo, background image, welcome text.
- Fields: email, password; "Continue with SSO" button when SSO configured; social buttons per toggle.
- Errors inline, generic for credentials ("Email or password is incorrect"). MFA step as separate screen with 6-digit input and recovery link.

### 5.2 Learner Home
- **Hero strip:** "Continue" card with last lesson, progress ring, resume button.
- **Sections:** In progress (horizontal scroll), Recommended for you (`GET /recommendations/me`), Upcoming live sessions, Streak and points summary.
- **Empty state:** illustration + "Browse catalog" CTA.

### 5.3 Catalog & Course Detail
- Filters: category, level, duration, price, language, rating; search with typeahead.
- CourseCard: cover, title, instructor, duration, rating, price/Free badge, progress when enrolled.
- Detail page: summary, syllabus accordion (sections/lessons with type icons), instructor card, reviews, sticky enroll panel (price, coupon field, "Enroll" or "Buy"). Checkout opens provider-hosted page, returns to `/my-learning` with success toast.

### 5.4 Course Player (`/learn/[enrollmentId]`)
```
┌───────────────────────────────────────────────────────────┐
│ Topbar: course title · progress · download · menu         │
├──────────────┬────────────────────────────────────────────┤
│ Outline      │  Lesson content (video / doc / SCORM /     │
│ (sections,   │  quiz / assignment)                        │
│ lessons,     │                                            │
│ status icons)│  ◀ Prev     [Mark complete]     Next ▶     │
│              ├────────────────────────────────────────────┤
│              │  Tabs: Overview · Notes · Q&A · Resources  │
└──────────────┴────────────────────────────────────────────┘
```
- Outline status icons: not started, in progress, completed, locked (tooltip with reason: prerequisite or drip date).
- Mobile: outline becomes a bottom sheet; tabs below content.
- Video: keyboard shortcuts (Space, ←/→ 10 s, M, C, F), speed 0.5–2×, captions, quality auto + manual, resume position.
- SCORM: `ScormFrame` with loading state, "Exit" button commits attempt.

### 5.5 Assessment Experience
- Intro card (time limit, attempts left, passing score).
- Question view: one per screen or paginated per config; flag-for-review; progress dots; autosave answers; countdown (announced to screen readers at 5 min, 1 min).
- Result screen: score, pass/fail, per-question feedback if allowed, retry button, certificate CTA when eligible.

### 5.6 Course Builder (`/studio/courses/[courseId]/builder`)
- Three-pane layout: **Structure tree** (drag-and-drop sections/lessons) | **Canvas** (lesson editor) | **Inspector** (settings: type, drip, prerequisites, completion rule).
- Add-lesson menu by `lesson_type`.
- Status bar: autosave indicator, version number, "Preview as learner", "Publish" (with validation checklist modal).
- Keyboard-accessible reordering (Alt+↑/↓) as an alternative to drag.

### 5.7 Grading Queue
- Table: learner, assessment, submitted at, status. Row opens split view: submission left, rubric and feedback right. Next/previous submission shortcuts; bulk "release grades".

### 5.8 Org Admin Dashboard
- StatCards: Active learners, Enrollments, Completion rate, Revenue.
- Charts: enrollments trend, completion funnel, top courses, activity heatmap.
- Quick actions: Invite users, Create course, Edit branding.

### 5.9 Branding Studio (`/admin/branding`)
- Left: form controls (logo upload, colors, font, terminology, login background). Right: **live preview** with tabs (Login, Home, Course Player, Email). Contrast checker badge per color. "Publish changes" applies within 60 s.

### 5.10 Domains (`/admin/domains`)
- Wizard: enter domain → show CNAME/TXT instructions → "Verify" → TLS status chip (Pending, Active, Failed with retry).

### 5.11 Forums & Messages
- Forum: thread list with filters (Unanswered, Mine, Top), composer with markdown + attachments, accepted-answer badge, moderator actions in overflow menu.
- Messages: two-pane list/conversation; typing indicator, read receipts, attachment preview.

### 5.12 Certificates
- List with preview thumbnails, download PDF, copy verification link, add to LinkedIn. Public verify page shows issuer branding, learner name, course, date, status (Valid / Expired / Revoked).

### 5.13 Gamification
- Achievements page: points total, level progress bar, badge shelf (earned vs locked silhouette), leaderboard (course or org; opt-out toggle in profile).

---

## 6. Offline / PWA Experience

| State | UI |
|---|---|
| Install prompt | Dismissible banner after 2nd visit, uses tenant name and icon |
| Download course | `DownloadButton` on course page and in player; shows size estimate before start |
| Downloading | Progress %, pause/resume, background continue |
| Ready offline | Green "Available offline" chip on lessons |
| Offline mode | Persistent top `Banner`: "You're offline. Progress will sync when you reconnect." Non-downloadable features disabled with explanatory tooltips |
| Sync | `SyncStatusChip` (Synced, Syncing…, Pending N) in topbar; toast on conflict resolution |
| Storage | `/profile` → Storage Meter with per-course sizes and "Remove download" |

---

## 7. Internationalization & RTL

- All strings via ICU keys; no concatenation. Layouts use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*` in Tailwind).
- In RTL (`ar`, `he`): mirror navigation, progress bars, arrows/chevrons, carousels; do **not** mirror video controls timeline, numerals graphs, or logos.
- Text expansion: allow +40% width; avoid fixed-width buttons.
- Locale-aware formatting through `Intl` for dates, numbers, currencies (INR, USD, EUR).
- Language switcher in footer and profile; tenant default respected for logged-out users.

---

## 8. Accessibility (WCAG 2.2 AA)

- Contrast: text 4.5:1, large text/UI 3:1.
- Focus: visible 2 px ring, logical order, no keyboard traps, skip-to-content link.
- Semantics: landmarks, headings in order, `aria-live` for toasts, quiz timers, sync status.
- Targets: minimum 44×44 px on touch (WCAG 2.2 target size).
- Media: captions required for video lessons (upload or auto-generate), transcripts, audio descriptions option, pause/stop animations.
- Forms: labels always visible, error summaries focus first invalid field, no reliance on color alone.
- Drag-and-drop always has a keyboard alternative.
- Testing: axe in CI, screen-reader passes (NVDA, VoiceOver) on key flows.

---

## 9. Content & Microcopy Guidelines

- Voice: encouraging, concise, plain language (grade 8).
- Buttons: verb + object ("Enroll in course", "Save changes").
- Errors: say what happened, how to fix; avoid blame ("We couldn't verify that domain. Check your CNAME record and try again.").
- Empty states: explain value + one CTA.
- Terminology: pull from `org_branding.terminology` (default: Course, Lesson, Learner, Instructor).

---

## 10. Responsive Behavior

| Pattern | sm | md | lg+ |
|---|---|---|---|
| Navigation | Bottom tabs | Collapsed rail | Full sidebar |
| Course grid | 1 col | 2 cols | 3–4 cols |
| Player outline | Bottom sheet | Drawer | Persistent panel |
| DataTable | Card list | Scrollable table | Full table |
| Builder | Read-only preview + "Edit on desktop" notice | Two panes | Three panes |

---

## 11. States & Edge Cases

| Scenario | Behavior |
|---|---|
| Loading | Skeletons matching final layout, no spinners over 1 s without skeleton |
| Error 5xx | Inline retry with request ID |
| Forbidden 403 | Page explaining required role (`ORG_ADMIN`, etc.) and contact admin link |
| Session expired | Modal to re-authenticate, preserve unsaved work |
| Locked lesson | Reason + unlock date/prerequisite link |
| Payment failed | Banner with retry; enrollment remains `PENDING` |
| SCORM load failure | Error panel, "Reload" and "Report issue" actions |
| Course updated mid-learning | Notice "A new version is available" (admin may migrate); learner stays on `course_versions` snapshot |
| Tenant suspended | Branded maintenance page |

---

## 12. Email & Notification Templates

Branded via `org_branding.email_templates`; MJML-based.
Templates: Welcome/verify email, Password reset, Invitation, Enrollment confirmation, Receipt, Assignment due reminder, Grade released, Certificate issued, Live session reminder (24 h / 15 min), Weekly digest, Inactivity nudge.
Rules: plain-text alternative, dark-mode safe, unsubscribe link except transactional, RTL variants.

---

## 13. Design Deliverables & Handoff

- Figma library mirrors `packages/ui` with token variables synced (Tokens Studio).
- Each screen includes states (default, loading, empty, error), mobile and desktop, LTR and RTL.
- Storybook documents every component with accessibility checks and visual regression (Chromatic).
- Acceptance: design QA checklist (tokens, spacing, contrast, keyboard, RTL, reduced motion) passed before merge.
