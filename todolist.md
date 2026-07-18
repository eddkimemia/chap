# ChapKE — Production Readiness Todo List

> Generated from full codebase audit (auth, UI/UX, security, international classifieds standards).  
> Goal: reach production quality comparable to Jiji / OLX / Gumtree / Leboncoin-class platforms.  
> Product: **ChapKE** — Kenyan classifieds marketplace (Next.js 15, Prisma, SQLite, Zustand).

**How to use this file**

- Check items with `[x]` as you complete them.
- Priority: **P0** = blockers / ship-stoppers · **P1** = high · **P2** = medium · **P3** = nice-to-have.
- Phases are ordered; finish Phase 0 before heavy feature work.
- Each item should end in a verifiable outcome (test, PR, or demo).

---

## Progress overview

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Security & integrity blockers | ✅ ~90% done |
| 1 | Auth product complete | ✅ ~70% done |
| 2 | Trust & safety | ✅ ~40% done |
| 3 | SEO, search & public UX | 🔵 ~70% done |
| 4 | Payments & monetization | 🔵 ~25% done |
| 5 | Scale, infra & ops | ⬜ Not started |
| 6 | International standards (a11y, i18n, legal) | 🔵 ~10% done |
| 7 | Dashboard & admin polish | 🔵 ~40% done |
| 8 | Messaging & engagement | ⬜ ~5% done |
| 9 | QA, testing & launch | ⬜ Not started |

---

## Phase 0 — Security & integrity blockers (ship-stoppers)

> Do not market or launch until P0 items are done.

### 0.1 Session & cookie security

- [x] **P0** Stop storing session tokens in `localStorage` (`chapke_auth_token`, `session_token`, `user` as source of truth)
- [x] **P0** Issue sessions only via **HttpOnly + Secure + SameSite=Lax** (or `Strict`) cookies from login/register/2FA/reset APIs
- [x] **P0** Remove client-side `document.cookie = session_token=...` from `src/lib/store.ts`
- [x] **P0** Align logout: always call `POST /api/auth/logout`, destroy server session, clear HttpOnly cookie
- [x] **P0** On password change/reset: invalidate **all** existing sessions for that user
- [x] **P0** Rotate session token on privilege change (role upgrade) and after password reset
- [x] **P1** Reduce default session lifetime (14 days — within recommended 7–14 range)
- [x] **P1** Prefer cryptographically strong random tokens (256-bit via `crypto.getRandomValues`)
- [x] **P1** Document single auth key naming; remove dual keys (`session_token` vs `chapke_auth_token`)

### 0.2 Route protection & authorization

- [x] **P0** Add Next.js `middleware.ts` protecting `/dashboard/*` and `/admin/*` (redirect unauthenticated users to `/login?redirect=...`)
- [x] **P0** Validate redirect targets (same-origin paths only) — fix open redirect on login
- [x] **P0** Server-side admin layout: reject non-admin users (do not rely on `localStorage.user.role`)
- [x] **P0** Audit every admin API for `requireAdmin` (already mostly present — re-verified after middleware)
- [x] **P0** Ensure dashboard APIs never trust client-supplied `userId` for ownership; always use session user
- [ ] **P1** Add optional “remember me” vs short session for shared devices

### 0.3 OTP, password reset & 2FA integrity

- [x] **P0** Bind OTP verification to **userId + type + unused + unexpired**; never accept arbitrary `userId` without ownership proof
- [x] **P0** Password reset: look up OTP by **user + code + type=`reset_password`**, not code alone
- [x] **P0** Fix forgot-password flow: verify step now goes directly to reset (skips broken verify-otp call)
- [x] **P0** Invalidate OTP after use
- [ ] **P0** Limit OTP attempts (e.g. 5) then force resend
- [x] **P0** Rate-limit: login, register, forgot-password, OTP send/verify, reset-password, listing detail (IP + identifier)
- [ ] **P0** Implement real account lockout (UI already mentions `lockoutUntil` — wire backend)
- [ ] **P0** Implement real email delivery (Resend / SES / similar) for verify + reset codes
- [ ] **P0** Implement real SMS delivery (Africa’s Talking / Twilio) for phone OTP (Kenya-first)
- [x] **P0** Never return `devCode` / `userId` outside `NODE_ENV === 'development'`
- [x] **P0** Remove or complete empty `src/app/api/auth/send-otp` route
- [x] **P0** Add or remove empty `src/app/(auth)/reset-password` page (removed — functionality in forgot-password multi-step flow)
- [ ] **P0** Fix 2FA end-to-end **or hide UI**:
  - [ ] Login must create `2fa_session` temp token when 2FA enabled
  - [ ] Login must return `requiresTwoFactor`, `tempToken`, masked destination
  - [x] `POST /api/auth/2fa` now accepts `tempToken` instead of arbitrary `userId`
  - [x] Verify path types already match (`2fa` + `2fa_session`)
- [x] **P1** Constant-time password hash comparison (`timingSafeEqual`)
- [x] **P1** Password policy: min 8 + uppercase + number + symbol (match UI badges to real validation)
- [ ] **P2** Optional: HaveIBeenPwned / breach password check

### 0.4 Listings, PII & content integrity

- [x] **P0** Stop exposing `contactPhone` / `contactEmail` on public list endpoints
- [x] **P0** Mask contact on detail until owner-view or authenticated “Reveal contact”
- [x] **P0** Public listings API: forbid arbitrary `status` filter for anonymous users (only `active`)
- [x] **P0** Default new listing status to **`pending`** (not `active`); require moderation or auto-rules
- [x] **P0** Sellers cannot self-set `status: 'active'` if moderation is required
- [ ] **P1** Soft-delete listings (archive) instead of hard delete where possible
- [x] **P1** Strip EXIF / validate magic bytes on uploads; don't trust client MIME alone
- [x] **P1** Restrict upload extensions; UUID filenames prevent path traversal
- [ ] **P1** Serve uploads from private storage + signed URLs long-term (not only `public/uploads`)

### 0.5 Build quality & config

- [x] **P0** Set `typescript.ignoreBuildErrors: false` in `next.config.ts`
- [x] **P0** Re-enable / keep `reactStrictMode: true` (currently false)
- [x] **P1** Add security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] **P1** Ensure `.env` never committed; document required env vars in `.env.example`
- [x] **P1** Fix PWA / icon paths (manifest already references SVG files in `public/`)
- [ ] **P2** Enable ESLint in CI; fail on high-severity issues

---

## Phase 1 — Authentication product complete

### 1.1 Core auth UX & flows

- [x] **P1** Registration: auto-send email (and/or phone) verification code immediately after signup
- [x] **P1** Require verified phone **or** email before posting first ad (market standard in KE/AF)
- [x] **P1** Login: email/phone mode actually switches input validation (accepts both formats)
- [x] **P1** Normalize Kenyan phone numbers (`07…` → `+2547…`) server-side
- [x] **P1** Forgot-password: clear multi-step UX with correct API contract end-to-end
- [x] **P1** Change-password: re-auth, invalidate other sessions, toast + redirect (already done)
- [x] **P1** "Logged in" state restored only from `/api/auth/me` (never trust stored user JSON alone)
- [ ] **P1** Auth pages brand consistency (dark mode, logo, footer links) with public site

### 1.2 Social & alternative login

- [ ] **P1** Google OAuth (replace “coming soon” toast)
- [ ] **P2** WhatsApp / phone passwordless login (high relevance for Kenya)
- [ ] **P2** Apple Sign-In if shipping iOS app later

### 1.3 2FA & account security settings

- [ ] **P1** User setting: enable/disable 2FA (SMS and/or TOTP authenticator app)
- [ ] **P1** Recovery codes for 2FA
- [ ] **P1** Settings → Active sessions list (device, IP, last active) + revoke
- [ ] **P2** Login alerts (email/SMS on new device)

### 1.4 Identity verification

- [ ] **P1** Wire verify-identity page to real storage + admin review workflow
- [ ] **P1** Badge model: phone verified / email verified / ID verified / business verified (distinct meanings)
- [ ] **P2** Business KYC fields (tax ID, registration) with admin approval

---

## Phase 2 — Trust & safety (marketplace core)

### 2.1 Moderation

- [x] **P0** Admin queue: pending listings → approve / reject with reason
- [x] **P1** Notify seller on approve/reject
- [x] **P1** Auto-flag rules (banned words)
- [x] **P1** Suspend listing + suspend user with reason (already partially modeled)
- [x] **P1** Audit log every admin moderation action (who/when/why)
- [ ] **P2** AI-assisted image/text moderation

### 2.2 Reports & abuse

- [ ] **P1** Report listing / user / message from public detail + chat
- [ ] **P1** Admin reports inbox with status workflow (open → investigating → resolved)
- [ ] **P1** SLA targets and filters (critical scam reports first)
- [ ] **P1** Block user (messages + profile) fully enforced server-side
- [ ] **P2** Rate-limit new accounts (max listings/messages per day)

### 2.3 Scam prevention UX

- [x] **P0** Chat-first contact policy (or masked phone) — contact masked on public detail, only owner sees full
- [ ] **P1** Inline safety tips on first message and before reveal contact
- [ ] **P1** Never share OTP / payment-off-platform warnings
- [ ] **P1** Public Safety Center page (expand beyond homepage `SafetyTips`)
- [ ] **P2** "Meet in public / use agent" guidance for high-value categories

### 2.4 Reviews & reputation

- [ ] **P1** Only allow reviews after meaningful interaction (message exchange or marked sold)
- [ ] **P1** Prevent self-reviews and duplicate reviews
- [ ] **P1** Seller reply to reviews (API exists — ensure UI complete)
- [ ] **P2** Verified transaction badge on reviews

---

## Phase 3 — SEO, search & public UX

### 3.1 Information architecture (fix SPA anti-pattern)

- [ ] **P0** Replace homepage SPA views (`home` / `listings` / `detail` in Zustand) with real routes — partial: fixed `setListings(data)` bug that broke all SPA views
- [x] **P0** Category pages: `/c/[categorySlug]` (and nested subcategories) — route pages created with server components + client interactivity
- [x] **P0** Location pages: `/l/[locationSlug]` — created with sub-location navigation and filtering
- [x] **P0** Search page: `/search?q=...&filters` with shareable URLs and faceted filters
- [x] **P1** Canonical URLs via `alternates.canonical` in metadata
- [x] **P1** Breadcrumbs on category, location, search pages

### 3.2 Search & discovery

- [x] **P1** Server-side pagination (offset-based with `skip`/`limit`, returns `pagination` metadata)
- [x] **P1** “Load more” on category, search, and location browse pages (append-based pagination)
- [ ] **P1** Full-text search (SQLite FTS5 short-term; Postgres/OpenSearch later)
- [x] **P1** Faceted filters: price, condition, location, category attributes
- [x] **P1** Sort: newest, price, popularity
- [ ] **P1** Saved searches with real email/push alerts
- [ ] **P1** Price alerts that actually fire
- [ ] **P2** “Recently viewed” synced to account (not only localStorage)
- [ ] **P2** Personalized “Recommended for you” with real signals

### 3.3 Listing detail & post ad UX

- [x] **P1** Image count consistency: dialog `MAX_IMAGES` changed 5→10 (matches validator & dashboard max)
- [x] **P1** Mark as sold / Edit / Boost CTAs added to `ProductDetailClient` when `currentUser.id === listing.user.id`
- [x] **P1** Share links: listing-detail overlay now uses `listing.slug` (with `listing.id` fallback) instead of always using `id`
- [ ] **P1** Align Post Ad dialog vs `/dashboard/listings/new` (one primary flow) — partially aligned (image count now matches)
- [ ] **P1** Draft autosave
- [ ] **P1** Category-specific custom fields from schema `customFields`
- [ ] **P1** Multi-image reorder (dnd-kit already in deps)
- [ ] **P2** Video upload support (schema has `ListingVideo`)
- [ ] **P2** Similar listings quality ranking

### 3.4 Homepage & marketing sections

- [ ] **P1** Reduce homepage weight; lazy-load below-fold sections
- [x] **P1** Popular Brands → wired to navigate to `/search?q=Brand`
- [x] **P1** Newsletter → wired to real `POST /api/newsletter` endpoint with rate limiting
- [x] **P1** Mobile App buttons → functional hrefs (placeholder App Store / Google Play URLs)
- [x] **P1** Fixed `setListings(data)` bug breaking all homepage data-driven sections
- [ ] **P1** MarketplaceStats: still hardcoded (needs DB aggregate API)
- [ ] **P1** Testimonials: still hardcoded (acceptable for MVP marketing)
- [ ] **P1** Newsletter signup → real provider + double opt-in
- [ ] **P2** A/B hero search prominence (search is primary job-to-be-done)

### 3.5 SEO technical

- [x] **P1** Dynamic sitemap for categories, locations (extend `sitemap.ts` with DB queries)
- [x] **P1** `robots.txt` reviewed — allows Google/Bing/Twitter/FB, blocks `/api/` `/dashboard/` `/admin/`, points to sitemap
- [ ] **P1** Open Graph images per listing (absolute HTTPS URLs)
- [x] **P1** JSON-LD: Organization schema in root layout; BreadcrumbList on category, location, search pages; pages have proper OG/metadata
- [ ] **P2** Blog SEO: author, publish date, article schema

---

## Phase 4 — Payments & monetization

### 4.1 Payment rails (Kenya-first)

- [ ] **P0** Never trust client-only payment completion
- [ ] **P0** M-Pesa STK Push integration + webhook signature verification
- [ ] **P1** Idempotent payment references; reconcile statuses (`pending` → `completed`/`failed`)
- [ ] **P1** Card payments (Flutterwave / Paystack / Stripe) as secondary
- [ ] **P1** Receipts & invoice history on `/dashboard/orders`
- [ ] **P1** Admin payment console with real stats (replace hard-coded chart data)
- [ ] **P2** Refunds & chargebacks workflow

### 4.2 Paid products

- [ ] **P1** Listing boost / feature packages (schema has Boost / featuredUntil)
- [ ] **P1** Subscription plans for businesses (Plan / Subscription models)
- [x] **P1** Enforce paid benefits in search ranking: `isFeatured` always sorted first regardless of user sort choice
- [x] **P1** Enforce plan limits: listing POST checks user's subscription plan `maxListings` (defaults to 5 if no active plan)
- [ ] **P2** Banner ads admin → public placement
- [ ] **P2** Promoted “Premium businesses” only for paid verified accounts

---

## Phase 5 — Scale, infrastructure & data

### 5.1 Database & storage

- [ ] **P0** Migrate from SQLite to **PostgreSQL** for production concurrency
- [ ] **P1** Prisma migrations in CI (not only `db push`)
- [ ] **P1** Object storage for images (S3 / Cloudflare R2 / GCS)
- [ ] **P1** CDN for static assets and listing images
- [ ] **P1** Image pipeline: compress, WebP/AVIF, responsive sizes (stop overusing `unoptimized`)
- [ ] **P2** Read replicas / connection pooling (PgBouncer) at scale

### 5.2 Background jobs

- [ ] **P1** Job queue for: emails, SMS, expire listings, price alerts, boost expiry
- [ ] **P1** Cron: expire listings, clean sessions, purge used OTPs
- [ ] **P2** Nightly analytics rollups for seller/admin dashboards

### 5.3 Observability

- [ ] **P1** Error tracking (Sentry or equivalent)
- [ ] **P1** Structured logging (request id, user id, route)
- [ ] **P1** Uptime monitoring + API latency alerts
- [ ] **P2** Product analytics (search → view → message conversion)

---

## Phase 6 — International standards (a11y, i18n, legal, UX quality)

### 6.1 Accessibility (WCAG 2.1 AA target)

- [ ] **P1** All form inputs: labels, `aria-invalid`, error text linked via `aria-describedby`
- [ ] **P1** Focus management on modals, sheets, route changes
- [ ] **P1** Keyboard navigation for filters, galleries, message composer
- [ ] **P1** Color contrast audit (navy/royal/orange on light & dark)
- [ ] **P1** Skip-to-content link
- [ ] **P1** Meaningful `alt` text on listing images (not only decorative)
- [ ] **P2** Screen-reader pass on post-ad and checkout flows

### 6.2 Internationalization & localization

- [ ] **P1** i18n framework (next-intl or similar): **English + Swahili**
- [ ] **P1** Consistent KES formatting (`formatPrice`) everywhere including admin
- [ ] **P1** Date/time in Africa/Nairobi timezone
- [ ] **P2** RTL readiness if expanding regions
- [ ] **P2** Multi-currency only if expanding outside KE

### 6.3 Legal & compliance (Kenya DPA / GDPR-aligned)

- [ ] **P0** Align Privacy Policy claims with actual security practices (no false “encrypted/audited” claims)
- [ ] **P1** Cookie consent banner + preference center
- [ ] **P1** Account data export
- [ ] **P1** Account deletion (cascade or anonymize per policy)
- [ ] **P1** Terms acceptance versioning (store accepted version + timestamp)
- [ ] **P2** Age gate if required for certain categories

### 6.4 Maps & location quality

- [ ] **P1** Hierarchical locations (county → sub-county → area) fully used in UI
- [ ] **P1** Map pin / radius search (Mapbox or Google Maps)
- [ ] **P2** “Near me” using browser geolocation with permission UX

---

## Phase 7 — Dashboard & admin polish

### 7.1 Seller dashboard

- [ ] **P1** Dashboard stats from real APIs only; empty states when zero data
- [ ] **P1** Listings management: bulk actions, filters by status, renew/boost
- [ ] **P1** Analytics charts with real time series (not placeholders)
- [x] **P1** Notifications: mark read, deep links to listing/message
- [ ] **P1** Settings: profile, business profile, notification prefs (model exists)
- [x] **P1** Support tickets fully wired to admin (fetch from real API, loading state)
- [ ] **P2** Onboarding checklist for new sellers (verify phone → first listing → first reply)

### 7.2 Admin console

- [x] **P0** Server-side role gate for all admin pages (middleware already checks `user.role !== 'admin'`)
- [ ] **P1** Replace hard-coded revenue/demo chart data with live queries
- [ ] **P1** Users: search, suspend, role change, force logout
- [ ] **P1** Categories & locations CRUD with slug safety and reordering
- [ ] **P1** CMS pages & blog publishing workflow
- [ ] **P1** SEO admin tools only if backed by real meta overrides
- [ ] **P1** Roles page: define real RBAC (admin vs moderator vs support) — not UI-only
- [x] **P1** Maintenance mode: middleware check + DB toggle via admin settings page + `/maintenance` page
- [ ] **P2** Impersonate user (audited) for support

---

## Phase 8 — Messaging & engagement

### 8.1 Messaging product

- [ ] **P1** Replace 3s polling with WebSockets or SSE (examples folder has websocket sample — productize)
- [ ] **P1** Conversation list API shape matches UI (`participantName`, unread counts)
- [ ] **P1** Media messages via upload pipeline
- [ ] **P1** Typing indicators / read receipts (optional but expected)
- [ ] **P1** Block, report, and delete conversation
- [ ] **P1** Start chat from listing with listing context card
- [ ] **P2** Message templates for sellers (“Is this available?”)

### 8.2 Favorites & social

- [ ] **P1** Sync favorites to server for logged-in users (API exists — wire UI fully)
- [ ] **P1** Follow sellers (model exists) + new listing notifications
- [ ] **P2** Public seller storefront polish (cover, hours, map)

### 8.3 Notifications

- [ ] **P1** Create notifications on: new message, listing approved, price drop, review
- [ ] **P1** Honor `NotificationPreference` flags for email/SMS/push/WhatsApp
- [ ] **P2** Web push (PWA) for mobile web

---

## Phase 9 — QA, testing & launch checklist

### 9.1 Automated quality

- [ ] **P1** Unit tests: password hash/verify, OTP, slug generation, phone normalize
- [ ] **P1** Integration tests: register → verify → login → post listing → message
- [ ] **P1** API authz tests: user cannot edit others’ listings; non-admin cannot hit admin APIs
- [ ] **P1** E2E (Playwright): critical paths desktop + mobile
- [ ] **P2** Load test search and listing detail

### 9.2 Manual QA matrix (all pages)

**Auth**

- [ ] Login (email)
- [ ] Login (phone)
- [ ] Register + terms
- [ ] Forgot / reset password
- [ ] Verify email
- [ ] Verify phone
- [ ] 2FA (if enabled)
- [ ] Verify identity
- [ ] Logout all devices

**Public**

- [ ] Home
- [ ] Search & filters
- [ ] Category browse
- [ ] Location browse
- [ ] Listing detail (share, favorite, report, contact)
- [ ] Seller profile
- [ ] Blog list + post
- [ ] Help / FAQs
- [ ] Privacy
- [ ] Terms
- [ ] Post ad (guest vs logged-in)

**Dashboard**

- [ ] Overview
- [ ] My listings
- [ ] New listing
- [ ] Edit listing
- [ ] Messages
- [ ] Favorites
- [ ] Reviews
- [ ] Analytics
- [ ] Orders & payments
- [ ] Notifications
- [ ] Support
- [ ] Settings

**Admin**

- [ ] Dashboard
- [ ] Users
- [ ] Listings moderation
- [ ] Reports
- [ ] Payments
- [ ] Categories
- [ ] Locations
- [ ] Plans
- [ ] Advertisements
- [ ] Analytics
- [ ] CMS
- [ ] Blog
- [ ] SEO
- [ ] Settings
- [ ] Roles
- [ ] Audit logs
- [ ] Maintenance

### 9.3 Launch readiness

- [ ] **P0** Production env secrets rotated; no default admin passwords in seed for prod
- [ ] **P0** Seed data disabled or isolated from production
- [ ] **P1** Staging environment with production-like data volume
- [ ] **P1** Backup & restore drill (DB + media)
- [ ] **P1** Domain, TLS, Caddy/Nginx config reviewed (`Caddyfile.txt`)
- [ ] **P1** Legal pages reviewed by counsel
- [ ] **P1** Support email/phone live
- [ ] **P2** Status page
- [ ] **P2** Soft launch (one county) before national marketing

---

## Cross-cutting UI/UX debt (from audit)

Track these whenever touching related pages:

- [ ] Unify navigation model: real routes only; deprecate Zustand `view` for primary navigation
- [ ] Unify auth state: single store + server session; remove dual localStorage keys
- [ ] Auth pages vs public theme consistency (light-only auth vs dark mode site)
- [ ] Empty states + error boundaries on every data page
- [ ] Loading skeletons consistent (already used in places — standardize)
- [ ] Touch targets ≥ 44px on mobile filters and bottom nav
- [ ] Mobile dashboard: sticky primary CTA (Post ad)
- [ ] Toast copy: human, actionable errors (not raw API dumps)
- [ ] Remove or implement all “coming soon” buttons (Google, WhatsApp login, app stores)

---

## Competitive gap backlog (vs Jiji / OLX / Gumtree / Leboncoin)

| Capability | Target behavior | Todo status |
|------------|-----------------|-------------|
| SEO category/location URLs | Indexable browse | ⬜ Phase 3 |
| Phone verification to post | Mandatory or strongly gated | ⬜ Phase 1 |
| Contact privacy | Masked / chat-first | ⬜ Phase 0–2 |
| Moderation queue | Pending → live | ⬜ Phase 0–2 |
| Realtime chat | WS/SSE | ⬜ Phase 8 |
| M-Pesa payments | STK + webhooks | ⬜ Phase 4 |
| Map/radius search | Map provider | ⬜ Phase 6 |
| Saved search alerts | Email/push | ⬜ Phase 3 |
| Multi-language | EN + Sw | ⬜ Phase 6 |
| Mobile apps | Later / PWA first | ⬜ Phase 8–9 |
| Fraud ops | Reports + SLA | ⬜ Phase 2 |
| Paid promote | Boost/feature | ⬜ Phase 4 |

---

## Suggested sprint plan (8 weeks)

| Week | Focus | Exit criteria |
|------|--------|----------------|
| 1 | Phase 0 sessions, middleware, listing PII, pending status | Cannot steal session via XSS easily; no public phones in list API |
| 2 | Phase 0 OTP email/SMS, rate limits, build strictness | Reset + verify work in staging with real providers |
| 3 | Phase 1 auth product + Google OAuth | Full register→verify→post path |
| 4 | Phase 2 moderation + reports | No auto-publish without rules |
| 5 | Phase 3 routes + pagination + SEO | Category/location URLs live |
| 6 | Phase 4 M-Pesa MVP + boost | Paid feature works E2E |
| 7 | Phase 5 Postgres + S3 + jobs | Staging load test passes |
| 8 | Phase 6–9 a11y, Swahili, QA, soft launch | Launch checklist signed off |

---

## Definition of done (per todo)

A todo is done only when:

1. Code merged and reviewed  
2. Works on mobile + desktop  
3. Authz verified (positive + negative test)  
4. No secrets logged  
5. Docs/env updated if config changed  
6. Checkbox marked `[x]` in this file with PR link (optional note)

---

## File / area quick reference

| Area | Primary paths |
|------|----------------|
| Auth lib | `src/lib/auth.ts`, `src/lib/store.ts`, `src/lib/validators.ts` |
| Auth APIs | `src/app/api/auth/**` |
| Auth UI | `src/app/(auth)/**` |
| Dashboard shell | `src/app/(dashboard)/layout.tsx` |
| Listings API | `src/app/api/listings/**` |
| Upload | `src/app/api/upload/route.ts` |
| Public home | `src/app/page.tsx`, `src/components/classifieds/**` |
| Listing SEO page | `src/app/listing/[slug]/page.tsx` |
| Schema | `prisma/schema.prisma` |
| Config | `next.config.ts`, `.env` |

---

## Notes

- This list is intentionally larger than a single sprint; use **P0/P1** for sequencing.
- Prefer fixing broken flows (2FA, reset password, OTP types) over adding new admin screens.
- International “classifieds standard” is mostly **trust, search, safety, and reliability** — not more dashboard pages.

**Last updated:** 2026-07-18  
**Source:** Full codebase audit (authentication, UI/UX, page inventory, competitive comparison)
