# Exception Pastry — Site Structure, Pages & Flows

**Purpose of this document:** a complete map of the current Exception website (exception-group.com) — every page, its content sections, the product taxonomy, and the core user flows — cross-referenced against the existing OrderBase template pages. Use this to restructure/recategorize the OrderBase template so it matches Exception's real information architecture before applying the new brand UI.

> Source site: https://www.exception-group.com/?lang=en
> Redesign target: OrderBase template in this repo (`/Exception - Redesign`)
> Status note: Page inventory and taxonomy below are confirmed from the live site + template. Items marked _(verify live)_ should be re-checked with a full browser crawl of the live site for exact section order/copy.

---

## 1. Brand & platform context

- **Business:** Exception — a Pâtisserie & bakery chain in Egypt (oriental sweets + western desserts). 20+ branches and cafés across Cairo/Giza. Same-day delivery in Cairo, Giza, Fayoum.
- **Nature of site:** e-commerce storefront (browse → order → deliver) + brand/marketing pages (about, branches, export) + support pages (FAQ, policies).
- **Bilingual / RTL:** the site runs English **and** Arabic (`?lang=en` / `?lang=ar`). Arabic is a first-class language for this brand, so the redesigned template **must support RTL layout and an EN/AR language switch**. Treat this as a structural requirement, not an add-on.
- **Contact channels:** customer service hotline **16687**, WhatsApp for custom-cake requests, export email for international.

---

## 2. Sitemap (information architecture)

```
Home (/)
│
├── Shop (/shop/)                         ← all products / entry to catalog
│   └── Category pages                    ← one listing page per category
│       ├── Cakes
│       ├── Gateaux           (/cakes-gateaux/)
│       ├── Oriental Sweets
│       ├── Chocolate
│       ├── Petit Four
│       ├── Gift Boxes
│       └── (+ Ice Cream, Kahk & Biscuits, Dairy — verify live)
│           └── Product detail page (PDP)  ← single product
│
├── Ordering flow
│   ├── Cart
│   ├── Checkout
│   └── Order confirmation / Thank you
│
├── Account (auth-gated)
│   ├── Login / Register
│   ├── Forgot / Reset password
│   ├── My Account (dashboard)
│   ├── Orders  →  Order detail
│   ├── Profile
│   ├── Addresses
│   ├── Wallet
│   ├── Points / Loyalty
│   └── Favorites / Wishlist
│
├── Brand & info
│   ├── About (/about/)
│   ├── Branches (/branches/)
│   ├── Export (/export/)
│   └── Blog  →  Blog post
│
└── Support & legal
    ├── Contact us
    ├── FAQs (/faqs/)
    ├── Terms & Conditions (/terms-and-conditions/)
    ├── Privacy Policy
    ├── Return Policy
    └── Store Closed / 404 (system states)
```

---

## 3. Product taxonomy (categories)

These are the top-level shop categories to configure in the redesigned catalog. Confirmed from the live site + template navigation:

| Category | Notes |
|---|---|
| Cakes | Signature cakes, celebration cakes |
| Gateaux | e.g. cheesecake, mille-feuille, English cake, cupcakes, muffins |
| Oriental Sweets | Baklava, Kunafa, Basbousa, date-filled pastries |
| Chocolate | Chocolate range |
| Petit Four | Assorted small pastries |
| Gift Boxes | Gifting sets (promoted with discounts) |
| Ice Cream | _(verify live)_ |
| Kahk & Biscuits | Dry cookies, seasonal kahk _(verify live)_ |
| Dairy | _(verify live)_ |

Each category = one **category listing page**; each item = one **product detail page (PDP)**.

---

## 4. Page-by-page breakdown → OrderBase template mapping

For each page: what it is, the key sections it needs, and which existing template file it maps to.

### Home — `index.html`
Primary sections (from template, aligned to Exception's marketing style):
- Header nav + language switch (EN/AR) + cart/account icons
- Hero ("Celebrate life's sweetest moments") with primary CTA to Shop
- Featured/promo band (e.g. "Up to 20% off gift boxes")
- **Signature categories** grid → links into category pages
- **Perfect picks for you** — featured products carousel
- Oriental-sweets story / heritage band ("A legacy of taste…")
- App download band (if mobile app exists — verify live)
- Testimonials ("Loved by sweet lovers everywhere")
- Branches teaser ("Find our branches near you")
- Footer (links, contact, socials, payment icons)

### Shop / catalog — `shop.html` (all products) + `shop-category.html` (per category)
- Category header + breadcrumb
- Filters/sort (category, price, availability) _(verify live)_
- Product grid (card: image, name, price, quick add-to-cart)
- Pagination / load more

### Product detail (PDP) — `product.html`
- Gallery, title, price, variant/size selectors, quantity
- Add to cart, add to favorites
- Description, ingredients/allergens, delivery info
- Related / "you may also like"

### Cart — `cart.html`
- Line items (edit qty, remove), order summary, promo code, proceed to checkout

### Checkout — `checkout.html`
- Delivery vs pickup, address selection, branch/region + date/time slot
- Contact details, payment method, order review → place order

### Order confirmation — `thank-you.html`
- Success state, order number, summary, track/continue shopping

### Account
| Page | Template file |
|---|---|
| Login | `login.html` |
| Register | `register.html` |
| Forgot password | `forget-password.html` |
| Reset password | `reset-password.html` |
| Account dashboard | `my-account.html` |
| Orders list | `my-account-orders.html` |
| Order detail | `my-account-order.html` |
| Profile | `my-account-profile.html` |
| Addresses | `my-account-addresses.html` |
| Wallet | `my-account-wallet.html` |
| Points / loyalty | `my-account-point.html` |
| Favorites | `my-account-favorites.html` |

### Brand & info
| Live page | Template file | Key sections |
|---|---|---|
| About (`/about/`) | `about.html` | Brand story/heritage, values, stats, gallery |
| Branches (`/branches/`) | `branches.html` | Branch list + map, hours, area filter, delivery zones |
| Export (`/export/`) | _new page — none in template yet_ | International shipping info + export contact/enquiry form |
| Blog index | `blogs.html` | Article grid |
| Blog post | `blog.html` | Single article |

### Support & legal
| Live page | Template file |
|---|---|
| Contact us | `contact-us.html` (form + hotline 16687 + WhatsApp) |
| FAQs (`/faqs/`) | `faqs.html` |
| Terms & Conditions | `terms-conditions.html` |
| Privacy Policy | `privacy-policy.html` |
| Return Policy | `return-policy.html` |
| Store closed | `store-closed.html` |
| 404 | (404 asset exists in `images/`) |

**Gaps to add in redesign:** an **Export** page (live site has one, template does not) and confirm whether a **Franchise/Careers** page exists on the live site _(verify live)_.

---

## 5. Core user flows

**A. Browse & buy (primary conversion flow)**
`Home → Shop / Category → PDP → Add to cart → Cart → Checkout (delivery/pickup + address + slot + payment) → Place order → Thank-you / order confirmation → (Track in My Account → Orders → Order detail)`

**B. Guest vs. account**
Checkout should support guest checkout _(verify live)_ and prompt sign-in/registration. Registered users get saved addresses, wallet, points, and order history.

**C. Authentication**
`Login ↔ Register`, and `Login → Forgot password → email → Reset password → Login`.

**D. Loyalty / wallet**
Earn points on orders → view in My Account → Points; wallet balance usable at checkout _(verify live for exact rules)_.

**E. Custom cake enquiry**
"Contact via WhatsApp for special/custom cakes" — surfaced on Contact and likely PDP/Home. Keep this path in the redesign.

**F. Locate a branch**
`Home branches teaser / nav → Branches → filter by area → branch detail (map, hours)`.

**G. Export / international**
`Export page → enquiry via export email/form`.

**H. Language switch**
EN ↔ AR toggle available in header on every page; flips layout to RTL for Arabic.

---

## 6. Global navigation

**Header:** Logo · primary nav (Shop + categories mega-menu, About, Branches, Blog, Contact) · language switch (EN/AR) · search _(verify live)_ · account · cart.

**Footer:** brand blurb + logo · quick links (Shop/categories) · info (About, Branches, Export, Blog) · support (Contact, FAQs) · legal (Terms, Privacy, Return) · contact (hotline 16687, WhatsApp, email) · social icons · payment method icons · language.

---

## 7. Restructure checklist for Claude Code

1. Keep the OrderBase page set; **rename/recategorize** navigation and categories to match Section 3 taxonomy.
2. **Add an Export page** (not in current template).
3. Confirm & wire **EN/AR + RTL** across all pages (language switch in header/footer).
4. Ensure the **custom-cake WhatsApp** path is present (Contact + Home/PDP).
5. Replace all placeholder brand copy (template currently carries leftover "Kouider" strings — e.g. "Download the Kouider app", "A legacy of taste since 1961") with Exception content.
6. Apply the new brand UI (colors, typography, icons) from the Figma file — see the styles doc / `images/icons/`.
7. _(verify live)_ Confirm exact category list, filters, guest-checkout, search, and any Franchise/Careers page via a full browser crawl of the live site.

---

_Items marked "(verify live)" need a live browser crawl to lock down exact copy, section order, and edge pages. Everything else is confirmed from the live site page map and the template._
