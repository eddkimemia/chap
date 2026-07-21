# Payment System Issues & Todo

## P0 — Critical (Broken / Missing)

### [x] 1. Missing `/api/admin/payments` route
- Created `src/app/api/admin/payments/route.ts` with paginated, filterable payment list (includes user relation)

### [x] 2. Payment stats endpoint returns wrong fields
- Added `monthlyRevenue` (last 30 days), `totalTransactions`, and `averageTransaction` to stats response

### [x] 3. M-Pesa STK Push integration (Daraja API)
- M-Pesa service module created: `src/lib/mpesa.ts` — getAccessToken, stkPush, stkPushQuery, formatPhone
- `POST /api/payments/mpesa/stk-push` — initiates STK Push, creates pending payment record
- `POST /api/payments/mpesa/callback` — handles Daraja callback, updates payment to completed/failed
- Dashboard orders page: M-Pesa dialog with phone input → STK Push → poll → auto-subscribe
- Dashboard listings page: Boost dialog → M-Pesa dialog → STK Push → poll → auto-boost

### [x] 4. Subscriptions created without payment
- `POST /api/subscriptions` now validates `paymentId` for paid plans: checks ownership, completed status, and type='subscription'

### [x] 5. Boost/feature payments auto-completed
- `POST /api/listings/[id]/boost` now accepts `paymentId` and validates it for paid boosts
- Removed auto-created internal payment records

## P1 — Notable Issues

### [x] 6. Free plan enforcement implemented
- `POST /api/listings`: enforces maxListings (fixed -1 bug for Business/unlimited) and maxImages
- `POST /api/listings/[id]/duplicate`: enforces maxListings and maxImages
- Sell page: fetches user's plan and uses dynamic maxImages instead of hardcoded 10
- PostAdDialog: fetches user's plan and uses dynamic maxImages instead of hardcoded 10
- Edit page: fetches user's plan and uses dynamic maxImages instead of hardcoded 10

### [ ] 7. Bulk feature creates boost with amount=0
- `POST /api/listings/bulk` creates Boost records with `amount: 0` — free featuring

### [ ] 8. `/api/listings/[id]/feature` is a free feature toggle
- Sets `isFeatured: true` for 30 days without creating Boost or Payment record
- Duplicates paid boost route — should be removed or restricted to admin only

### [ ] 9. Invoice/receipt history missing
- No receipt history on `/dashboard/orders` — users can't view past payments

### [ ] 10. Admin dashboard uses hardcoded chart data
- `src/app/(admin)/admin/page.tsx` lines 59-77 use hardcoded arrays instead of DB data
