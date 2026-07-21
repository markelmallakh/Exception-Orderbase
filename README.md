# Abdel Rahim Koueider — Static Frontend

A fully **static** version of the Kouider (`orderbase-core`) Next.js e-commerce app,
rebuilt with **plain HTML + Tailwind CSS (Play CDN) + vanilla JavaScript**. No React,
no Next.js, no build step, no server runtime — every page is a standalone `.html`
file you can open in a browser or drop on any static host (S3, Netlify, GitHub Pages,
Cloudflare Pages, nginx…).

The original app is a thin presentational layer over a CMS + commerce API, so all
copy, imagery, products, prices and account data here are **representative placeholders**.
The visual design, layout, spacing, typography, animations, responsive behaviour and
interactions are preserved faithfully from the source components.

---

## Quick start

Because the pages load Tailwind and Google Fonts from a CDN, serve them over HTTP
(recommended) or open directly:

```bash
# from this folder
python3 -m http.server 8899
# then open http://localhost:8899/
```

Any static server works equally well:

```bash
npx serve .
php -S localhost:8899
```

Opening `index.html` via `file://` also works, but the Tailwind CDN and Google Fonts
need an internet connection. Start at **`index.html`** — every other page is reachable
by clicking through the site.

---

## Project structure

```
static-export/
├── index.html                 # Home page
├── <29 page files>.html       # One file per route (see table below)
│
├── tw-config.js               # Tailwind theme config (port of tailwind.config.ts)
├── styles.css                 # Ported global CSS + carousel/drawer/modal/toast styles
├── scripts.js                 # Shared shell + all interactions (see "How it works")
│
├── images/                    # Brand logos, product & branch imagery, icons, payments
├── dummy-images/              # Extra placeholder imagery (also mirrored at images/dummy-images/)
├── css/                       # Copied static CSS assets from the original /public
└── assets-cms/                # Misc copied CMS/order-review assets
```

Only three shared files power the whole site: `tw-config.js`, `styles.css`, and
`scripts.js`. Every page links to all three and provides two mount points
(`#site-header`, `#site-footer`) that `scripts.js` fills in.

---

## Pages

| Route (original)            | File                          | Notes |
|-----------------------------|-------------------------------|-------|
| `/`                         | `index.html`                  | Hero carousel, categories, product tabs, reviews, branches, blogs |
| `/about`                    | `about.html`                  | Brand story + stat band + app CTA |
| `/branches`                 | `branches.html`               | City/area filter + branch cards |
| `/store-closed`             | `store-closed.html`           | "Store closed" state |
| `/faqs`                     | `faqs.html`                   | Category tabs + accordion |
| `/privacy-policy`           | `privacy-policy.html`         | Corporate / WYSIWYG content |
| `/terms-conditions`         | `terms-conditions.html`       | Corporate / WYSIWYG content |
| `/return-policy`            | `return-policy.html`          | Corporate / WYSIWYG content |
| `/contact-us`               | `contact-us.html`             | Split layout + contact form |
| `/blogs`                    | `blogs.html`                  | Category filter + blog card grid |
| `/blogs/:slug`              | `blog.html`                   | Single article + related posts |
| `/shop`                     | `shop.html`                   | Category circles + product grid |
| `/shop/:slug`               | `shop-category.html`          | Breadcrumb, filters, product grid |
| `/products/:slug`           | `product.html`                | Gallery, variations, tabs, related carousel |
| `/cart`                     | `cart.html`                   | Line items + order summary |
| `/checkout`                 | `checkout.html`               | Minimal header, delivery + payment + summary |
| `/thank-you/:orderId`       | `thank-you.html`              | Order confirmation |
| `/login`                    | `login.html`                  | Split layout + social buttons |
| `/register`                 | `register.html`               | Account form |
| `/forget-password`          | `forget-password.html`        | Request + OTP steps |
| `/reset-password`           | `reset-password.html`         | New password form |
| `/my-account`               | `my-account.html`             | Dashboard (sidebar layout) |
| `/my-account/profile`       | `my-account-profile.html`     | Edit profile + change password |
| `/my-account/orders`        | `my-account-orders.html`      | Orders list + status tabs |
| `/my-account/orders/:id`    | `my-account-order.html`       | Order detail + status stepper |
| `/my-account/addresses`     | `my-account-addresses.html`   | Saved addresses |
| `/my-account/favorites`     | `my-account-favorites.html`   | Favorited products |
| `/my-account/wallet`        | `my-account-wallet.html`      | Wallet balance + history |
| `/my-account/point`         | `my-account-point.html`       | Loyalty points + tiers |

---

## How it works

### Styling — Tailwind Play CDN + a config port
Each page loads the Tailwind Play CDN and then `tw-config.js`, which is a faithful
port of the original `tailwind.config.ts` — all custom colors (`primaryDark`, `cta`,
`accent`, `neutral-support-bg`, …), radii, shadows, px-based font sizes, and the
`Caveat` / `DM Sans` font families. This means the original Tailwind utility classes
render exactly as they did in the app. `styles.css` adds the ported `globals.css`
component rules and the CSS for the vanilla widgets that replace Swiper / overlays.

### Shared shell — injected once, DRY across pages
Every page is just its own content plus:
```html
<div id="site-header"></div>
<main>…page content…</main>
<div id="site-footer"></div>
```
`scripts.js` injects the header (support bar, mega-menu nav, location selector, search,
account, cart badge), the footer (columns, newsletter, socials), and all overlays
(cart drawer, mobile menu, search modal, location sheet, toasts) into those mount
points on load — so the shell stays consistent and there's no markup duplication.

Two body attributes control the shell:
- `data-page="checkout"` renders the minimal centered-logo header + minimal footer.
- `data-path="/route"` drives nav active state.

### Interactions — vanilla JS contracts
React state/hooks were replaced with small, declarative markup contracts that
`scripts.js` wires automatically (call `window.kInit(scope)` after injecting new markup):

| Widget | Markup hook |
|--------|-------------|
| Carousel (replaces Swiper) | `.carousel > .carousel-track > .carousel-slide*` + `.carousel-prev/.carousel-next/.carousel-dots`, optional `data-autoplay` |
| Accordion | `[data-accordion] > .accordion-item > .accordion-trigger + .accordion-panel` (+ `.accordion-chevron`) |
| Tabs | `[data-tabs]` with `.tab-btn[data-tab]` + `.tab-panel[data-panel]` |
| Quantity stepper | `[data-stepper]` with `[data-step="-1|1"]` + `[data-qty]` |
| Demo form | `<form data-demo-form="toast message">`, optional `data-redirect="page.html"`, `data-reset="false"` |
| Overlays | any trigger `[data-open="cart|menu|search|location"]`, close via `[data-close]`, backdrop, or `Esc` |
| Toast | `window.kToast("message")` / `window.kToast("message","error")` |

### Navigation — fully click-through
All internal links resolve to real files. The success-flow forms navigate on submit:
- Login / Register → `my-account.html`
- Forget-password → verify → `reset-password.html` → `login.html`
- Checkout "Place order" → `thank-you.html`

So you can click the whole site: account icon → login → dashboard → all account pages
→ log out; product → cart → checkout → thank-you → track order; etc.

---

## What's real vs. placeholder

- **Preserved from source:** page structure, Tailwind classes, layout, spacing,
  typography, colors, hover/transition states, animations, responsive breakpoints,
  and the shell (header/footer/menus/drawers).
- **Placeholder:** all text content, product names/prices (EGP), imagery, branch and
  account data. The original values come from a CMS + commerce API at runtime, which
  a static export cannot include.
- **Mocked (no backend):** cart, checkout, auth, and account flows are navigable
  mockups. Forms validate required fields natively, show a toast, and move to the next
  page, but nothing is persisted.

---

## Customizing

- **Content / images:** edit the HTML directly, or swap files under `images/` and
  `dummy-images/` (keep the same filenames to avoid touching markup).
- **Theme:** change tokens in `tw-config.js` (colors, fonts, radii) — applies site-wide.
- **Shared shell / menus / footer links:** edit the data arrays and templates at the
  top of `scripts.js`.
- **Production Tailwind (offline, no CDN, smaller):** compile the classes into a static
  stylesheet instead of the Play CDN, e.g.
  ```bash
  npx tailwindcss -i ./styles.css -o ./dist.css --content "./*.html" --minify
  ```
  then replace the two CDN `<script>` tags with `<link rel="stylesheet" href="dist.css">`
  in each page's `<head>`.

---

## Limitations / production notes

- Tailwind and Google Fonts load from a CDN (needs internet); compile locally for a
  fully offline/production build (see above).
- The Play CDN prints a "not for production" console notice — expected; it disappears
  once you switch to a compiled stylesheet.
- No backend: search, cart totals, auth and orders are illustrative only.

---

*Converted from the `orderbase-core` Next.js app. Brand: Abdel Rahim Koueider.*
