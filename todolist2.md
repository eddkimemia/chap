# ChapKE — Fix Checklist (from Codebase Audit)

> Generated from full codebase audit on 2026-07-21.  
> Fix issues one by one in order. Mark `[x]` as completed.

---

## P0 — Critical (must fix before anything else)

### 0.1 OTP codes leaked to console & response

- [ ] Fix `src/app/api/auth/resend-code/route.ts:40` — remove `console.log` that logs verification codes
- [ ] Fix `src/app/api/auth/resend-code/route.ts` — only return `devCode` when `NODE_ENV === 'development'`
- [ ] Fix `src/app/api/auth/forgot-password/route.ts:46` — remove `console.log` that logs reset codes
- [ ] Fix `src/app/api/auth/forgot-password/route.ts` — only return code in dev mode

### 0.2 Duplicate database files — fix `.env` pointing to wrong DB

- [ ] Check which DB is correct: `db/custom.db` (49 KB) vs `prisma/db/custom.db` (926 KB)
- [ ] Remove the stale/duplicate database file
- [ ] Update `.env` `DATABASE_URL` to point to the correct path

### 0.3 Review reply not persisted to database

- [ ] Fix `src/app/api/reviews/[id]/reply/route.ts` — actually save the reply to the `Review` model in DB instead of just returning it

### 0.4 Block user API is a stub

- [ ] Implement `src/app/api/messages/block/route.ts` — add actual block/unblock logic (store blocked users, enforce in messaging)

### 0.5 OTP codes stored as plaintext in database

- [ ] Hash `TwoFactorSession.code` before storing (or use a one-time token scheme)
- [ ] Update `src/lib/auth.ts` to hash OTP codes on storage
- [ ] Update `src/app/api/auth/verify-otp/route.ts` to compare hashed values

---

## P1 — Empty Catch Blocks (silently swallowed errors)

### 1.1 Shared library files

- [ ] Fix `src/lib/store.ts` empty catches:
  - [ ] Line 150 — `loadFromStorage` catch should at minimum log
  - [ ] Line 160 — `clearLegacyAuthKeys` catch
  - [ ] Line 168 — `clearLegacyAuthKeys` second catch
  - [ ] Line 232 — `loadFavorites` catch
  - [ ] Line 243 — `toggleFavorite` catch
  - [ ] Line 261 — `getRecentlyViewed` catch
  - [ ] Line 276 — `addRecentlyViewed` catch
  - [ ] Line 307 — `logout` catch
- [ ] Fix `src/lib/auth.ts:197` — `destroySession` catch
- [ ] Fix `src/lib/maintenance.ts:7` — maintenance check catch

### 1.2 API routes

- [ ] Fix `src/app/api/users/check-username/route.ts:13` — empty catch
- [ ] Fix `src/app/api/newsletter/route.ts:11` — empty catch in `getSubscribers`
- [ ] Fix `src/app/api/listings/route.ts:261` — `parsedImages = []` catch
- [ ] Fix `src/app/api/listings/route.ts:296` — `.catch(() => {})` on autoFlag
- [ ] Fix `src/app/api/favorites/searches/route.ts:16` — empty catch
- [ ] Fix `src/app/api/admin/settings/route.ts:15` — silent catch

### 1.3 Public pages & components

- [ ] Fix `src/app/page.tsx:184` — empty catch on homepage
- [ ] Fix `src/app/sell/page.tsx:90` — empty catch
- [ ] Fix `src/app/search/client.tsx:75` — empty catch
- [ ] Fix `src/app/category/[categorySlug]/client.tsx:87,117` — empty catches
- [ ] Fix `src/app/location/[locationSlug]/client.tsx:84` — empty catch
- [ ] Fix `src/app/help/page.tsx:100` — empty catch
- [ ] Fix `src/components/classifieds/product-detail.tsx:345` — empty catch on share fallback
- [ ] Fix `src/components/classifieds/listing-detail.tsx:82,96` — empty catches
- [ ] Fix `src/components/classifieds/newsletter.tsx:31` — empty catch
- [ ] Fix `src/components/classifieds/post-ad-dialog.tsx:115,196` — empty catches
- [ ] Fix `src/components/classifieds/seller-profile-client.tsx:275,307` — empty catches

### 1.4 Auth pages

- [ ] Fix `src/app/(auth)/verify-email/page.tsx:33` — `.catch(() => {})`
- [ ] Fix `src/app/(auth)/register/page.tsx:33` — `.catch(() => {})`
- [ ] Fix `src/app/(auth)/login/page.tsx:40` — `.catch(() => {})`

### 1.5 Dashboard pages

- [ ] Fix `src/app/(dashboard)/dashboard/layout.tsx:149` — `.catch(() => {})`
- [ ] Fix `src/app/(dashboard)/dashboard/messages/page.tsx:106,208` — empty catches
- [ ] Fix `src/app/(dashboard)/dashboard/listings/[id]/edit/page.tsx:112` — empty catch
- [ ] Fix `src/app/(dashboard)/dashboard/settings/page.tsx:66,128` — empty catches
- [ ] Fix `src/app/(dashboard)/dashboard/orders/page.tsx:96` — empty catch
- [ ] Fix `src/app/(dashboard)/dashboard/support/page.tsx:89` — `.catch(() => {})`

### 1.6 Admin pages

- [ ] Fix `src/app/admin/login/page.tsx:43` — empty catch
- [ ] Fix `src/app/(admin)/admin/verifications/page.tsx:93` — empty catch
- [ ] Fix `src/app/(admin)/admin/users/page.tsx:126,150,166,181,208,230,253,274,289,313,335` — ALL empty catches
- [ ] Fix `src/app/(admin)/admin/listings/page.tsx:110,131,147,162` — empty catches
- [ ] Fix `src/app/(admin)/admin/reports/page.tsx:80,96,109,121` — empty catches
- [ ] Fix `src/app/(admin)/admin/settings/page.tsx:36` — empty catch
- [ ] Fix `src/app/(admin)/admin/seo/page.tsx:33` — empty catch
- [ ] Fix `src/app/(admin)/admin/plans/page.tsx:36` — empty catch
- [ ] Fix `src/app/(admin)/admin/payments/page.tsx:88` — empty catch
- [ ] Fix `src/app/(admin)/admin/locations/page.tsx:37` — empty catch
- [ ] Fix `src/app/(admin)/admin/cms/page.tsx:38` — empty catch
- [ ] Fix `src/app/(admin)/admin/categories/page.tsx:37` — empty catch
- [ ] Fix `src/app/(admin)/admin/blog/page.tsx:41` — empty catch
- [ ] Fix `src/app/(admin)/admin/advertisements/page.tsx:38` — empty catch
- [ ] Fix `src/app/(admin)/admin/analytics/page.tsx:33` — empty catch
- [ ] Fix `src/app/(admin)/admin/page.tsx:97` — empty catch

---

## P2 — `any` TypeScript Annotations

- [ ] Fix `src/app/sell/page.tsx:95` — replace `value: any` with proper type
- [ ] Fix `src/app/sell/page.tsx:166` — replace `err: any` with `unknown`
- [ ] Fix `src/components/classifieds/product-detail.tsx:162,381` — replace `err: any` with `unknown`
- [ ] Fix `src/app/(dashboard)/dashboard/settings/page.tsx:205` — replace `prev: any` with proper type
- [ ] Fix `src/app/(dashboard)/dashboard/reviews/page.tsx:90,98` — replace `err: any` with `unknown`
- [ ] Fix `src/app/(dashboard)/dashboard/page.tsx:61,64,333` — replace `: any` types
- [ ] Fix `src/app/(admin)/admin/users/page.tsx:103,745,763,780` — replace `: any[]` with proper types
- [ ] Fix `src/app/(dashboard)/dashboard/listings/[id]/edit/page.tsx:121,498` — replace `value: any`, `props: any`
- [ ] Fix `src/app/(dashboard)/dashboard/listings/page.tsx:108,120,131` — replace `err: any`
- [ ] Fix `src/app/(auth)/verify-phone/page.tsx:40,55` — replace `err: any`
- [ ] Fix `src/app/(auth)/verify-email/page.tsx:51,66` — replace `err: any`
- [ ] Fix `src/app/(auth)/forgot-password/page.tsx:44,72` — replace `err: any`
- [ ] Fix `src/app/(dashboard)/dashboard/settings/page.tsx:410` — replace `as any`

---

## P3 — API Routes with Misleading Error Handling

- [ ] Fix `src/app/api/admin/analytics/route.ts:63` — stop always returning "Unauthorized"; return proper 500 for non-auth errors
- [ ] Fix `src/app/api/admin/plans/route.ts:13-14` — same pattern
- [ ] Fix `src/app/api/admin/banners/route.ts:10-11` — same pattern
- [ ] Fix `src/app/api/admin/blog/route.ts:24-25` — same pattern
- [ ] Fix `src/app/api/admin/cms/route.ts:10-11` — same pattern
- [ ] Add error logging to all admin API catch blocks that currently have none

---

## P4 — Database Fixes

### 4.1 Missing indexes (prisma/schema.prisma)

- [ ] Add `@@index([role])` on `User` model
- [ ] Add `@@index([isActive])` on `User` model
- [ ] Add `@@index([expiresAt])` on `Session` model
- [ ] Add `@@index([userId])` on `Session` model
- [ ] Add `@@index([createdAt])` on `Notification` model
- [ ] Add `@@index([targetId])` on `Report` model
- [ ] Add `@@index([authorId])` on `Report` model
- [ ] Add composite index on `Message(readAt, isRead)`
- [ ] Add `@@index([endDate])` on `Subscription` model

### 4.2 Missing `onDelete` cascade

- [ ] Add `onDelete: Cascade` (or `SetNull`) on `Listing → Category` relation
- [ ] Add `onDelete: Cascade` (or `SetNull`) on `Listing → Location` relation
- [ ] Add `onDelete: Cascade` on `PriceAlert → Category`
- [ ] Add `onDelete: Cascade` on `PriceAlert → Location`

### 4.3 Missing relations

- [ ] Fix `Boost.userId` — add proper relation to `User` model

### 4.4 Missing timestamps

- [ ] Add `createdAt` and `updatedAt` to `Faq` model
- [ ] Add `updatedAt` to `Report` model
- [ ] Add `updatedAt` to `ModerationLog` model
- [ ] Add `updatedAt` to `Banner` model

### 4.5 String enums — add DB-level constraints

- [ ] Add `@validate` or enum type for `User.role` ("user", "seller", "business", "admin")
- [ ] Add `@validate` or enum type for `Listing.status` ("draft", "pending", "active", "sold", "expired", "suspended", "archived")
- [ ] Add `@validate` or enum type for `Payment.status` ("pending", "completed", "failed", "refunded")
- [ ] Add `@validate` or enum type for `Report.type`
- [ ] Add `@validate` for `Review.rating` (1-5 range)

### 4.6 Generate migration files

- [ ] Run `npx prisma migrate dev --name init` to create proper migration history
- [ ] Verify `prisma/migrations/` directory is created
- [ ] Remove the duplicate database file after migration

---

## P5 — Console.log Removal

- [ ] Remove or guard `console.log` in `src/lib/email.ts:32-34` (dev email logging)
- [ ] Remove or guard `console.log` in `src/app/api/auth/resend-code/route.ts:40` *(already in P0.1)*
- [ ] Remove or guard `console.log` in `src/app/api/auth/forgot-password/route.ts:46` *(already in P0.1)*

---

## P6 — Dead Code Cleanup

- [ ] Remove unused `generateAndStoreOTP` function at `src/app/api/auth/verify-otp/route.ts:95-113`
- [ ] Remove unused `import { generateOTP }` from `src/app/api/auth/verify-otp/route.ts:4` (if no longer needed)

---

## P7 — Hardcoded Values

- [ ] Move social media URLs to env vars or config: `footer.tsx:110-119`, `seo.ts:69-71`
- [ ] Move App Store / Google Play URLs to config: `mobile-app.tsx:43,52`
- [ ] Move phone number placeholders to constants file
- [ ] Move Analytics/Tag Manager placeholders to env vars
- [ ] Move email sender address to env-only (no fallback to hardcoded value): `email.ts:2`

---

## P8 — Database Schema Normalization (Future)

- [ ] Consider normalizing `UserProfile.socialLinks` into a separate table
- [ ] Consider normalizing `BusinessProfile.socialLinks` into a separate table
- [ ] Consider normalizing `Listing.tags` into a many-to-many relation
- [ ] Consider normalizing `Category.customFields` into a separate table
- [ ] Consider normalizing `Notification.data` into proper columns
- [ ] Consider normalizing `Payment.metadata` into proper columns
- [ ] Consider normalizing `Plan.features` into a separate table
- [ ] Consider normalizing `SavedSearch.query` into proper columns

---

## Summary of Progress

| Priority | Area | Total Items | Completed |
|----------|------|-------------|-----------|
| P0 | Critical fixes | 8 | 0 |
| P1 | Empty catch blocks | 59 | 0 |
| P2 | `any` types | 27 | 0 |
| P3 | Misleading API errors | 6 | 0 |
| P4 | Database fixes | ~25 | 0 |
| P5 | Console.log removal | 5 | 0 |
| P6 | Dead code cleanup | 2 | 0 |
| P7 | Hardcoded values | 5+ | 0 |
| P8 | Schema normalization | 8 | 0 |

**Total: ~140+ items** — Fix in order. P0 first, then P1, etc.

---

## File Quick Reference

| Area | Files |
|------|-------|
| Auth OTP leak | `src/app/api/auth/resend-code/route.ts`, `src/app/api/auth/forgot-password/route.ts` |
| Empty catches (lib) | `src/lib/store.ts`, `src/lib/auth.ts`, `src/lib/maintenance.ts` |
| Empty catches (API) | `src/app/api/**/route.ts` |
| Empty catches (pages) | `src/app/**/page.tsx`, `src/app/**/client.tsx` |
| Empty catches (admin) | `src/app/(admin)/admin/**/page.tsx` |
| Empty catches (dashboard) | `src/app/(dashboard)/dashboard/**/page.tsx` |
| `any` types | `src/app/sell/page.tsx`, `src/app/(dashboard)/**/*.tsx`, `src/app/(admin)/**/*.tsx`, `src/components/**/*.tsx` |
| API error handling | `src/app/api/admin/analytics/route.ts`, `plans/route.ts`, `banners/route.ts`, `blog/route.ts`, `cms/route.ts` |
| Database schema | `prisma/schema.prisma` |
| Duplicate DB | `db/custom.db` vs `prisma/db/custom.db` |
| Review reply bug | `src/app/api/reviews/[id]/reply/route.ts` |
| Block user stub | `src/app/api/messages/block/route.ts` |
| Dead code | `src/app/api/auth/verify-otp/route.ts:95-113` |
| Console.log cleanup | `src/lib/email.ts` |
| Hardcoded values | `footer.tsx`, `seo.ts`, `mobile-app.tsx`, `email.ts`, admin SEO page |
