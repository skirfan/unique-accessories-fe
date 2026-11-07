# Unique Accessories — Frontend

Next.js App Router storefront with a PostgreSQL-backed Fastify catalog, guest/customer
orders, Google accounts and Shiprocket shipping. See [the launch checkout plan](../doc/01-launch-checkout-plan.md).

## Run locally

Start the backend in `../unique-accessories-be` first, then:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The local `.env.local` contains:

```text
API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`API_URL` is server-side and used by the catalog loader and `/api/*` proxy. Restart
Next after changing it; production rewrites require a rebuild. Set `NEXT_PUBLIC_SITE_URL` to the actual site origin before
deployment. Production requires HTTPS and the matching backend `CORS_ORIGIN`.

## Initial launch behavior

- Catalog/taxonomy and settings come from the API. Server pages and client context
  share a per-request catalog snapshot. There is no silent mock-data fallback.
- Cart/recently viewed persist locally; signed-in wishlists sync to the account. Checkout
  reloads prices, availability and coupons from the server; browser totals are
  never trusted. A cart quote fingerprint requires review after prices/settings change.
- Minimum merchandise order starts at **₹199 after discounts, excluding shipping**.
- Checkout auto-confirms orders, allocates stock and creates invoice records by default. Admin can disable automatic confirmation.
- `/orders/:reference#<private-token>` displays the request, status history, totals,
  tracking, WhatsApp follow-up and payment instructions when applicable. Save this
  private link: the reference alone cannot open order details. The fragment is
  sent to the API only as a redacted Authorization header, not in request URLs.
- COD is collected on delivery. For configured UPI, the order-specific QR appears
  on confirmed orders; UTR submission is pending verification until admin checks receipt.
- `/admin` provides operator sign-in, order acceptance/rejection, fulfillment,
  manual payment/refund recording, and **Store settings**. Find the generated
  local credentials in the backend's ignored `.env`. The minimum amount can be
  changed or disabled using the independent checkbox.
- Configure your real WhatsApp business number and merchant UPI details or a merchant QR image in admin.
  WhatsApp links open a prepared message; the customer must tap Send. UPI stays
  disabled until configured. No gateway, automatic payment verification, email/SMS,
  or money transfer is performed.

The legacy `/checkout/success` demo redirects to checkout. Confirmation now refers
to a persisted order. Google login and account orders/wishlists are implemented; see the current commerce setup below.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

Build does not require a running API; the catalog is fetched when serving requests.
The current small catalog is loaded in one snapshot. Server pagination/cache tuning
can follow when the catalog grows.

## Remaining placeholder content

Seed products retain neutral placeholders until real images are uploaded in admin. Seed reviews and
business/legal policy copy still need business-owned review before launch. The contact form prepares
a WhatsApp enquiry using the configured business number. No gateway, automatic notifications or
automatic payment-collection features are implied by the broader future development plan.

## Separate admin workspace

The customer storefront and admin use separate Next.js layouts. `src/app/(storefront)` owns the
shopping header, footer, cart and catalog provider; its URLs are unchanged. `src/app/admin` uses
its own scoped styles, forms, navigation and session guards, with no storefront catalog dependency.

- `/admin/login`: standalone sign-in, without the shopping navbar or footer.
- `/admin`: live revenue, order and acceptance metrics, interactive period chart, top products and recent orders.
- `/admin/orders`: searchable, filterable and paginated orders.
- `/admin/orders/:reference`: dedicated order details, fulfillment/payment actions and timeline.
- `/admin/settings`: minimum-order switch/amount, shipping, WhatsApp, COD, UPI and merchant QR upload.

Protected pages verify the HttpOnly admin session server-side before fetching private data.
Expired client mutations return to sign-in. The mobile sidebar supports keyboard focus trapping,
Escape dismissal and closing after navigation. Metrics reflect live data; new stores show empty states.


## Product and inventory administration

Mantine 9 components/forms and Zod 4 power the catalog workspace. Geist and neutral/blue theme tokens
apply to admin; the storefront has its own ivory/black/champagne theme.

- `/admin/products`: search/filter/page the catalog; `/new` creates products and `/:id` edits them.
- The editor manages variants, pricing, opening stock, publishing, features and compatibility. The
  Photos tab handles optimized images, ordering, variant assignments, and accessible alt text.
- `/admin/inventory`: stock counts, low-stock report, batch adjustments with reasons, and history.
- `/admin/catalog`: category, subcategory, brand and device-model management.

Existing variants are disabled instead of deleted. Existing stock adjustments happen in Inventory.
Stale product or stock edits require reloading and review; stock batches are idempotent and atomic.
Uploaded photos appear in storefront cards, gallery, selected-variant cart visuals and Product JSON-LD.
`src/lib/validation/catalog.ts` mirrors the API schema in the separate backend repo; update both when
changing the contract. API validation is authoritative.


## Previous dashboard assets

The earlier neumorphic design and illustration provenance remain as reference material in
`public/admin/ASSETS.md`. The current classic interface does not use that illustration or stylesheet.

## Classic UI and product photos — 22 October 2026

The admin now uses `src/app/admin/classic.css` with conventional light/dark surfaces; the earlier
neumorphic stylesheet is no longer imported. The standalone login uses a focused sign-in card.
The storefront follows the supplied premium reference with cinematic campaign photography, warm ivory catalog and product detail surfaces, champagne buttons, and scoped responsive styles.

Admin-uploaded photos appear in homepage features, product cards, gallery and cart. Variant selection
prioritizes the matching photo. Saved carts resolve thumbnails from the current catalog, refreshed on navigation and when returning to the tab. Add to cart
opens the global drawer; drawer open state is not persisted. Menus, cart and filters support mobile
scroll locking and keyboard dismissal. The homepage no longer uses sample testimonials.

Cloudflare R2 configuration is backend-only: see [setup instructions](../doc/02-cloudflare-r2-setup.md).
The frontend `.env.example` only needs API and site origins. Upload a real photo and publish the product
to replace its neutral placeholder; no demo image is written into business data.

Cloudflare R2 setup and owner-supplied environment values: [R2 guide](../doc/02-cloudflare-r2-setup.md).


## Premium storefront reference — 22 October 2026

The storefront uses `src/app/(storefront)/storefront.css`; admin keeps its classic light/dark theme.
Desktop navigation links to Shop, Mobile, Car, Deals and About. Mobile adds a dark menu and a fixed
Shop/Categories/Cart/Help bar. `/categories` provides a visual category entry point. Collection pages
use horizontal category chips, sorting, an accessible filter drawer and a three-column desktop grid.
Product cards show **Add to Cart** text, actual variant swatches, availability and pricing; adding
opens the cart drawer. Product details use admin photos, a thumbnail rail when needed, variant
selection and Buy Now, which takes the selected item to the current checkout.

Decorative campaign assets, their saved paths and the final built-in imagegen prompts are documented
in [public/storefront/ASSETS.md](public/storefront/ASSETS.md). Admin-uploaded photography takes precedence
on category cards/banners; marketing images never replace catalog photos or enter the product database.
See [design and verification notes](../doc/03-premium-storefront-ui.md).


## Customer orders, login and shipping — 23 October 2026

See [current commerce setup](../doc/04-customer-orders-shipping.md) for Google OAuth environment values,
Shiprocket credentials/webhook setup, seller invoice settings, automatic confirmation and current limits.
This module supersedes the original manual-approval default. New orders allocate stock and receive
an invoice snapshot automatically; UPI remains manually verified. Guests retain private order links,
while signed-in customers use account ownership and synchronized server wishlists. Restart the backend
manually after applying migrations/configuration. A provider configuration status is not a live test.

Invoice PDF layout and admin logo upload: [Invoice branding](../doc/05-invoice-branding-light-product.md).
