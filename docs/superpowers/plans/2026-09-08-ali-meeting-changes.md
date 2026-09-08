# Ali Meeting Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect wholesaler financial data from buyers, enforce 10 lifetime free listing/bid attempts, generate a readable title-package PDF, and reset transaction data for clean testing.

**Architecture:** A central response projection removes private finance fields for anonymous and buyer viewers while domain services enforce write permissions and usage limits. Frontend buyer surfaces consume only public property prices and bids. A database-backed usage ledger survives record deletion, while an authenticated mock checkout records test payment without contacting PayPal.

**Tech Stack:** NestJS, Mongoose, Jest, React, TypeScript, TanStack Query, Zod, pdf-lib, Playwright.

## Global Constraints

- Buyers never receive or see rehab, acquisition costs, holding costs, assignment earnings, EMD values/status, or derived margins.
- Preserve total asking, bid, and agreed prices despite legacy `assignmentFeeHigh`, `assignmentPrice`, and `assignmentFeeFinal` names.
- Count accepted listing/bid creations as lifetime attempts; invalid requests do not count and deletion never refunds an attempt.
- Block the 11th listing or bid without active subscription.
- Mock checkout calls only the application backend and never PayPal.
- Preserve users, profiles, verification, subscriptions, admin settings, and support data during reset.

---

### Task 1: Buyer Financial Privacy Boundary

**Files:**
- Create: `tract-app2-backend/src/common/utils/buyer-response.ts`
- Test: `tract-app2-backend/src/common/utils/buyer-response.spec.ts`
- Modify: `tract-app2-backend/src/common/interceptors/transform.interceptor.ts`
- Modify: `tract-app2-backend/src/modules/listings/listings.service.ts`
- Modify: `tract-app2-backend/src/modules/listings/listings.service.spec.ts`
- Modify: `tract-app2-backend/src/modules/bids/dto/create-bid.dto.ts`
- Modify: `tract-app2-backend/src/modules/bids/bids.service.ts`

**Interfaces:**
- Produces: `buyerResponse(value: unknown): unknown` and `responseForViewer(value, role, userId): unknown`.
- Consumes: authenticated role and user ID from Nest request context.

- [ ] **Step 1: Add failing privacy tests**

Assert recursive removal of `rehabTotal`, `rehabBreakdown`, `purchasePrice`, `estimatedHoldingCosts`, `assignmentFeeLow`, `emdAmount`, `emdStatus`, and `projectedBuyerProfit`; assert preservation of total price fields; assert owner/admin responses remain intact; assert `CreateBidDto` rejects `emdAmount`.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --runInBand buyer-response.spec listings.service.spec`
Expected: FAIL until projection and DTO restrictions exist.

- [ ] **Step 3: Implement response-only projection and bid restriction**

Normalize keys case-insensitively, recursively copy plain response objects, preserve dates/buffers, and invoke projection in the global response interceptor. Remove public profit filtering to prevent inference. Remove EMD from the buyer bid DTO and always initialize internal bid EMD to zero.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --runInBand buyer-response.spec listings.service.spec`
Expected: PASS.

### Task 2: Buyer UI Privacy and Bid Flow

**Files:**
- Modify: `tract-app2-frontend/src/pages/buyer/MarketplacePage.tsx`
- Modify: `tract-app2-frontend/src/pages/buyer/BuyerListingDetailPage.tsx`
- Modify: `tract-app2-frontend/src/pages/buyer/DashboardPage.tsx`
- Modify: `tract-app2-frontend/src/pages/buyer/BuyerDealsPage.tsx`
- Modify: `tract-app2-frontend/src/pages/deals/ContractSigningPage.tsx`
- Modify: `tract-app2-frontend/src/pages/deals/DealTrackerPage.tsx`
- Modify: `tract-app2-frontend/src/hooks/useListings.ts`
- Modify: `tract-app2-frontend/src/lib/validators/bid.ts`
- Create: `docs/buyer-bid-privacy-check.cjs`
- Create: `docs/buyer-tracker-privacy-check.cjs`

**Interfaces:**
- Consumes: projected listing/deal APIs and total property price fields.
- Produces: buyer bid payload `{ listingId, assignmentPrice, proposedClosingDate?, inspectionDays?, specialTerms? }`.

- [ ] **Step 1: Make browser checks fail on private labels and values**

Mock distinct values for rehab, acquisition, margin, assignment earnings, and EMD. Assert none appears for buyers; assert lister/admin controls remain; assert submitted bid has no `emdAmount`.

- [ ] **Step 2: Remove private buyer UI and inputs**

Remove profit/ROI sorts and cards, rehab and acquisition breakdowns, EMD input/cards/downloads/actions, and private contract terms. Label `assignmentFeeHigh` as market/asking price and `assignmentPrice` as total property bid where those fields are buyer-visible.

- [ ] **Step 3: Preserve the buyer lifecycle**

Verify marketplace browse, total bid submission, contract download/upload, signing status, title choice, and permitted deal progression. Replace internal EMD step copy with neutral seller/admin confirmation copy.

- [ ] **Step 4: Run checks and frontend build**

Run: `node docs/buyer-bid-privacy-check.cjs`, `node docs/buyer-tracker-privacy-check.cjs`, `node docs/manual-contract-ui-check.cjs`, and `npm run build`.
Expected: all checks print PASS and Vite build succeeds.

### Task 3: Lifetime Allowances and Mock Checkout

**Files:**
- Create: `tract-app2-backend/src/modules/subscriptions/schemas/usage-counter.schema.ts`
- Create: `tract-app2-backend/src/modules/subscriptions/usage-limit.service.ts`
- Create: `tract-app2-backend/src/modules/subscriptions/usage-limit.service.spec.ts`
- Modify: `tract-app2-backend/src/modules/subscriptions/subscriptions.controller.ts`
- Modify: `tract-app2-backend/src/modules/subscriptions/subscriptions.service.ts`
- Modify: `tract-app2-backend/src/modules/listings/listings.service.ts`
- Modify: `tract-app2-backend/src/modules/bids/bids.service.ts`
- Modify: `tract-app2-frontend/src/hooks/useSubscription.ts`
- Modify: `tract-app2-frontend/src/components/payments/SubscriptionGate.tsx`
- Modify: `tract-app2-frontend/src/pages/wholesaler/CreateListingPage.tsx`
- Modify: `tract-app2-frontend/src/pages/buyer/BuyerListingDetailPage.tsx`

**Interfaces:**
- Produces: atomic `consumeAttempt(userId, kind)` and authenticated `POST /subscriptions/mock-checkout` available only in mock mode.
- Consumes: existing subscription status and role-specific monthly amount.

- [ ] **Step 1: Add failing allowance tests**

Test attempts 1–10, unpaid 11th rejection, paid 11th success, invalid request not counted, deletion not refunded, and concurrent requests allowing exactly the remaining quota.

- [ ] **Step 2: Implement atomic persistent counters**

Use one unique `{ userId, kind }` document with an atomic conditional increment. Consume only immediately before successful creation and compensate if persistence fails after consumption. Return `{ used, freeLimit: 10, remaining, subscriptionRequired }`.

- [ ] **Step 3: Implement internal mock checkout**

Require authentication and `SUBSCRIPTION_MODE=mock`; upsert a paid test subscription with no external provider ID; reject the endpoint in PayPal mode. Do not import or call the PayPal service.

- [ ] **Step 4: Add frontend counters and gate handling**

Show remaining attempts on listing creation and buyer bidding. On the 11th unpaid attempt, open the subscription panel. Refresh allowance and subscription queries after mock checkout.

- [ ] **Step 5: Run backend and frontend verification**

Run focused usage tests, mock-payment browser checks, both builds, and the full backend Jest suite.

### Task 4: Buyer-Safe Contracts and Readable Title Package

**Files:**
- Modify: `tract-app2-backend/src/common/utils/contract-pdf.generator.ts`
- Create: `tract-app2-backend/src/modules/contracts/realtor-signature-page.ts`
- Test: `tract-app2-backend/src/modules/contracts/realtor-signature-page.spec.ts`
- Modify: `tract-app2-backend/src/modules/contracts/contracts.service.ts`
- Modify: `tract-app2-backend/src/docuseal/docuseal.service.ts`
- Modify: `tract-app2-backend/src/modules/deals/title-package.ts`
- Modify: `tract-app2-backend/src/modules/deals/title-package.spec.ts`
- Modify: `tract-app2-backend/src/modules/deals/deals.service.ts`
- Modify: `tract-app2-backend/src/modules/pdf/pdf.controller.ts`

**Interfaces:**
- Consumes: buyer-safe deal details and managed file URLs.
- Produces: ZIP containing `property-summary.pdf`, property pictures, signed contract, and available supporting documents.

- [ ] **Step 1: Add failing PDF/ZIP tests**

Inspect generated PDF text and ZIP entries. Assert readable headings/address/public total price, required files, and absence of rehab, EMD, acquisition, assignment earnings, and JSON summary. Verify the realtor's original bytes remain stored separately, a signature page is appended to the prepared copy, and DocuSeal receives six role-scoped fields on that appended page.

- [ ] **Step 2: Generate the readable PDF summary**

Use the existing `pdf-lib` dependency and brand-safe typography. Include property address, public details, agreed total price, title handling choice, and included-file inventory.

- [ ] **Step 3: Prepare realtor contracts for DocuSeal**

Preserve the realtor's original PDF, append one standard signature page to a prepared copy, and create an uploaded DocuSeal template with seller legal-name/signature/date fields assigned to the realtor and buyer legal-name/signature/date fields assigned to the buyer. Require realtor completion before buyer signing. Accept drawn mouse/touch signatures through DocuSeal and use existing webhook handling to store the completed PDF and audit trail and notify both clients in real time.

- [ ] **Step 4: Enforce document authorization**

Block buyer EMD document endpoints. Generate new platform contracts without private buyer-facing values. Never rewrite an original realtor upload or a completed signed PDF.

- [ ] **Step 5: Run document and deal tests**

Run title-package, contract, PDF controller, and deal service suites. Expected: PASS.

### Task 5: Transaction Reset and Release Verification

**Files:**
- Create: `tract-app2-backend/scripts/reset-transaction-data.ts`
- Create: `tract-app2-backend/scripts/reset-transaction-data.spec.ts`
- Modify: `tract-app2-backend/package.json`

**Interfaces:**
- Consumes: configured MongoDB database and managed Cloudinary asset identifiers.
- Produces: dry-run counts by collection and explicit `--execute` deletion report.

- [ ] **Step 1: Test reset allowlist and dry run**

Assert that only listings, bids, contracts, deals, chats/messages, title records, related notifications/compliance records, and usage counters are selected. Assert users, profiles, verification, subscriptions, admin configuration, and support records are excluded.

- [ ] **Step 2: Implement guarded reset command**

Require `--execute`, require the configured database name to match the application database, print collection counts first, delete allowlisted records, then delete referenced managed uploads and report individual cleanup failures.

- [ ] **Step 3: Verify all code before deletion**

Run both builds, full backend Jest suite, and all mocked browser privacy/signing/payment checks. Expected: PASS.

- [ ] **Step 4: Run dry-run reset and inspect targets**

Run: `npm run reset:transactions -- --dry-run`
Expected: exact configured database name and per-collection/per-upload counts with zero mutations.

- [ ] **Step 5: Execute the authorized reset**

Run: `npm run reset:transactions -- --execute`
Expected: deleted counts for allowlisted transaction collections, preserved account/configuration counts, and upload cleanup report.

- [ ] **Step 6: Verify fresh state**

Re-run dry-run and read-only API checks. Expected: zero transaction records, preserved users/subscriptions/configuration, and 10 free attempts available to preserved users.
