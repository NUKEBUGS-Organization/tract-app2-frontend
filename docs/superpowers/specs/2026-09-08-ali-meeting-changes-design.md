# Ali Meeting Changes Design

## Scope

Implement the final requirements from the 7 September 2026 meeting, together with the user's later clarification. Buyers browse properties, submit a total property bid, sign contracts, and follow the deal. Buyers must never receive or see rehab estimates, acquisition costs, wholesaler assignment fees or earnings, EMD amounts or status, holding costs, or calculations derived from those private values.

Wholesalers, realtors, and administrators retain the financial data needed to create and administer listings. The visible property asking price and buyer's total bid remain available because they are transaction prices, even where legacy database fields use names such as `assignmentFeeHigh`, `assignmentPrice`, or `assignmentFeeFinal`.

This work also adds the lifetime free allowance Ali specified, creates a readable PDF in the title ZIP, and resets existing transaction data for fresh testing.

## Buyer financial privacy

Use one centralized, response-only backend projection for anonymous and buyer responses. Apply it recursively to nested listings, bids, contracts, deals, notifications, exports, generated documents, and title-package metadata. Remove private fields without modifying stored documents. Preserve total asking, bid, and agreed property prices.

Do not accept an EMD field in buyer bid requests. Remove public filters and sort modes that disclose or allow inference of rehab costs, private margins, or assignment earnings. Buyer-facing screens show property details, asking price, total bid input, contract status, and the permitted deal workflow. They do not render private financial labels, values, downloadable EMD instructions, acquisition details, or profit cards.

Wholesaler, realtor, admin, and applicable title administration views keep their authorized data and controls. Existing uploaded and signed contracts are immutable and are not rewritten. The transaction reset removes the current contract files before fresh testing, so new generated buyer-facing documents must follow the privacy projection.

## Bid and contract flow

The buyer submits one total property bid. The backend continues to store it in the existing bid price field for compatibility. The wholesaler or realtor accepts a bid and completes the existing contract flow.

For realtor contracts, preserve the original uploaded PDF, append a standard signature page, and create a DocuSeal signing session from that prepared copy. The appended page contains seller-side legal name, drawn signature, and date fields assigned to the realtor, followed by buyer-side legal name, drawn signature, and date fields assigned to the buyer. The realtor signs first and the buyer signs second using mouse or touch. DocuSeal completion webhooks store the final signed PDF and audit trail and update both parties without a page refresh. This replaces the manual buyer download/sign/re-upload flow for newly created realtor contracts.

The buyer does not configure, deposit, advance, download, or view EMD information. The lister or administrator handles any internal EMD state required by the current pipeline. Buyer timeline language uses a neutral seller/admin confirmation label where an internal pipeline step remains necessary.

## Free allowance and subscriptions

Each wholesaler or realtor receives 10 free lifetime listing submissions. Each buyer receives 10 free lifetime bid submissions. Attempts count permanently when the backend accepts creation, regardless of later deletion, withdrawal, rejection, publication, or acceptance. Failed validation and server failures do not consume an attempt.

Before the 11th listing or bid, the backend requires an active paid subscription. The frontend displays remaining free attempts and opens the existing subscription experience when the limit is reached. The backend is authoritative so direct API calls cannot bypass the limit. Wholesaler pricing remains $50 per month; buyers and realtors remain $100 per month.

The explicitly requested mock-payment mode remains in place until PayPal credentials are supplied. The test “Subscribe with PayPal” button calls only an application-owned mock backend endpoint, which records `PAID_TEST` for that authenticated user. It must never call PayPal, create a PayPal order, redirect to PayPal, or charge money. This server-side test status lets the backend enforce and unlock the 11th attempt consistently. Production PayPal activation is outside this change.

Persist counters independently from listing and bid records so deletion cannot restore free attempts. The requested transaction reset also resets these usage counters, giving preserved user accounts a fresh 10-attempt allowance.

## Title package

Replace the technical JSON property summary with a readable PDF summary inside the ZIP. The PDF includes the property address, public property details, the agreed total property price, and a clear inventory of included files. It excludes rehab, acquisition costs, assignment earnings, EMD, holding costs, and derived margins for buyer downloads.

The ZIP continues to contain property pictures, the fully signed contract, and relevant deal documents available in managed storage. Missing required files return a clear error rather than generating an incomplete package.

## Visual consistency

Use the established App 1 typography, colors, cards, spacing, and responsive patterns on buyer marketplace, listing, bid, contract, and deal screens touched by this work. This is targeted consistency work, not an unrelated redesign of every application screen.

## Transaction reset

Create a narrowly scoped, auditable reset operation for the configured platform database. Delete listings, bids, contracts, deals, chats/messages, title handling records, listing/deal notifications, related compliance records, usage counters, and managed listing/contract uploads. Preserve users, profiles, identity/license verification, subscription/payment status, admin configuration, and unrelated support data.

Before deletion, resolve and report the exact database and collection counts. Delete only after confirming the targets match the configured application database. Report deleted counts and failed upload cleanup. The reset is run once after code verification and immediately before the fresh testing handoff.

## Errors and security

The backend remains the authority for privacy and allowance enforcement. The 11th unpaid attempt returns a distinct subscription-required response that the frontend turns into a clear subscription prompt. The mock checkout endpoint is authenticated, idempotent, available only while subscription mode is `mock`, and writes no external payment identifier. Privacy projection must not mutate database objects, remove total transaction prices, or redact authorized lister/admin responses.

The original realtor upload remains immutable. Only a prepared copy receives the appended signature page, and only DocuSeal's completed output becomes the final signed contract. New generated documents exclude private buyer-facing fields; realtor-supplied contract body content remains the realtor's responsibility. The reset removes existing contract files from the fresh test environment.

## Verification

Add backend tests for recursive privacy, role-specific responses, direct EMD injection, inference-resistant listing queries, lifetime counters, concurrent 10th/11th attempts, subscription bypass prevention, and reset scoping. Add frontend tests or mocked browser checks proving buyers can browse, bid, sign, and track a deal while private values remain absent, and that lister/admin views retain required controls.

Run both builds, focused suites, the full backend suite, and end-to-end mocked buyer/lister flows. Verify exact database counts before and after the authorized reset.
