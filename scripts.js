/* =====================================================================
   scripts.js — shared behaviour for the static Kouider build.

   Replaces the React runtime with vanilla JS:
     • Injects the shared header, footer and overlay chrome into every
       page (each page only ships a #site-header / #site-footer mount
       point, so markup stays DRY and works from the file:// protocol).
     • Re-implements the interactive pieces that were React components:
       mobile menu drawer, cart drawer, search modal, location bottom
       sheet, sticky-on-scroll navbar, mega-menu hover, language toggle.
     • Provides page-level helpers: carousels (replacing Swiper),
       accordions, tabs, quantity steppers, toasts and demo forms.

   Content that the CMS used to supply (menus, footer columns, socials)
   is baked in below as representative placeholder data.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Placeholder content (formerly fetched from the CMS)
     --------------------------------------------------------------- */
  /* Store listings for the footer banner and app.html. */
  /* ---------------------------------------------------------------
     Colour theme. Dark mode is a preview: rather than adding dark:
     variants to 31 pages of markup, the theme sheet re-points the handful
     of surface/text utilities the site actually uses (see DARK MODE in
     styles.css). Read and applied before boot() so the theme is already
     on <html> while the boot cover is still up — no flash of the wrong
     theme on reload.
     --------------------------------------------------------------- */
  const THEME_KEY = "ex-theme";
  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }
  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch (e) {}
    document.querySelectorAll("[data-theme-set]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === t));
    });
  }
  document.documentElement.setAttribute("data-theme", storedTheme());

  const APP_LINKS = {
    android: "https://play.google.com/store/apps/details?id=com.exception.exception&pcampaignid=web_share",
    /* Egyptian storefront; Apple forwards visitors elsewhere to their own. */
    ios: "https://apps.apple.com/eg/app/exception-patissier/id6741048876",
  };

  /* The utility bar / drawer secondary menu. Deliberately shorter than the
     footer's Company column: FAQs and Careers live in the footer only, so
     this row stays scannable. */
  const SUPPORT_MENU = [
    { title: "About", url: "/about" },
    { title: "Branches", url: "/branches" },
    { title: "Exception Cafe", url: "/exception-cafe" },
    { title: "Special Orders", url: "/special-orders" },
    { title: "Export & Partnership", url: "/export" },
    { title: "Media Center", url: "/blogs" },
    { title: "Contact Us", url: "/contact-us" },
  ];

  const MAIN_MENU = [
    {
      name: "Cakes",
      url: "/shop/cakes",
      image: "images/menudeafult.webp",
      children: [
        { name: "Birthday Cakes", url: "/shop/birthday-cakes" },
        { name: "Wedding Cakes", url: "/shop/wedding-cakes" },
        { name: "Celebration Cakes", url: "/shop/celebration-cakes" },
        { name: "Cake Slices", url: "/shop/cake-slices" },
      ],
    },
    {
      name: "Gateaux",
      url: "/shop/gateaux",
      image: "images/menudeafult.webp",
      children: [
        { name: "Cheesecake", url: "/shop/cheesecake" },
        { name: "Mille-Feuille", url: "/shop/mille-feuille" },
        { name: "English Cake", url: "/shop/english-cake" },
        { name: "Cupcakes & Muffins", url: "/shop/cupcakes-muffins" },
      ],
    },
    {
      name: "Oriental Sweets",
      url: "/shop/oriental-sweets",
      image: "images/menudeafult.webp",
      children: [
        { name: "Baklava", url: "/shop/baklava" },
        { name: "Kunafa", url: "/shop/kunafa" },
        { name: "Basbousa", url: "/shop/basbousa" },
        { name: "Date-Filled Pastries", url: "/shop/date-pastries" },
      ],
    },
    {
      name: "Chocolate",
      url: "/shop/chocolate",
      image: "images/menudeafult.webp",
      children: [
        { name: "Chocolate Boxes", url: "/shop/chocolate-boxes" },
        { name: "Truffles", url: "/shop/truffles" },
        { name: "Dates & Chocolate", url: "/shop/dates-chocolate" },
      ],
    },
    { name: "Petit Four", url: "/shop/petit-four" },
    { name: "Gift Boxes", url: "/shop/gift-boxes" },
    { name: "Ice Cream", url: "/shop/ice-cream" },
    { name: "Kahk & Biscuits", url: "/shop/kahk-biscuits" },
    { name: "Dairy", url: "/shop/dairy" },
  ];

  /* Category navigation bar (Figma "Navigation 2", node 6038:15815).
     Icons are the 48px doodle-backed SVGs in images/icons/ (spaces → %20).
     `big` = Figma renders these 5 labels at 14px/Medium vs 12px/SemiBold. */
  const CATEGORY_NAV = [
    { label: "OFFERS", icon: "Categories%20icons/offers.webp", url: "/shop/offers" },
    { label: "BOUGHT BEFORE", icon: "Categories%20icons/bought%20before.webp", url: "/shop/bought-before" },
    { label: "MAKE YOUR CAKE", icon: "Categories%20icons/make%20your%20cake.webp", url: "/shop/make-your-cake", badge: "TRY NOW" },
    { label: "SPECIAL CAKES", icon: "Categories%20icons/special%20cakes.webp", url: "/shop/special-cakes" },
    { label: "BAKERIES", icon: "Categories%20icons/image%201820.webp", url: "/shop/bakeries" },
    { label: "CHOCOLATES", icon: "Categories%20icons/chocolate.webp", url: "/shop/chocolate" },
    { label: "ORIENTAL SWEETS", icon: "Categories%20icons/oriental%20sweets.webp", url: "/shop/oriental-sweets" },
    // NOTE: this url must stay DISTINCT from the CAKES entry below — they both
    // pointed at /shop/cakes, which made the current-category match highlight
    // two items at once. Any /shop/* still falls back to shop-category.html.
    { label: "CAKES & GATEAUX", icon: "Categories%20icons/cakes%20%26%20gataux.webp", url: "/shop/cakes-gateaux", big: true },
    { label: "CAKES", icon: "Categories%20icons/cakes.webp", url: "/shop/cakes", big: true },
    { label: "ICE CREAM", icon: "Categories%20icons/icecream.webp", url: "/shop/ice-cream", big: true },
    { label: "KAHK & BISCUITS", icon: "Categories%20icons/kahk%20and%20biscuits.webp", url: "/shop/kahk-biscuits", big: true },
    { label: "DAIRY", icon: "Categories%20icons/dairy.webp", url: "/shop/dairy", big: true },
  ];

  const FOOTER_COLUMNS = [
    {
      name: "Shop",
      links: [
        { title: "Cakes & Gateaux", url: "/shop/cakes" },
        { title: "Special Cakes", url: "/shop/special-cakes" },
        { title: "Make Your Cake", url: "/shop/make-your-cake" },
        { title: "Bakeries", url: "/shop/bakeries" },
        { title: "Chocolates", url: "/shop/chocolate" },
        { title: "Oriental Sweets", url: "/shop/oriental-sweets" },
        { title: "Cakes", url: "/shop/cakes" },
        { title: "Ice Cream", url: "/shop/ice-cream" },
        { title: "Kahk & Biscuits", url: "/shop/kahk-biscuits" },
        { title: "Dairy", url: "/shop/dairy" },
      ],
    },
    {
      name: "Company",
      /* Carries the whole secondary menu plus the two entries kept out of it.
         "Blogs" and "Media Center" were two names for /blogs — unified here
         as Media Center, which is what the top menu calls it. */
      links: [
        { title: "About Us", url: "/about" },
        { title: "Branches", url: "/branches" },
        { title: "Exception Cafe", url: "/exception-cafe" },
        { title: "Special Orders", url: "/special-orders" },
        { title: "Export & Partnership", url: "/export" },
        { title: "Media Center", url: "/blogs" },
        { title: "Careers", url: "/careers" },
        { title: "Contact Us", url: "/contact-us" },
      ],
    },
    {
      name: "Support",
      links: [
        { title: "FAQs", url: "/faqs" },
        { title: "Privacy Policy", url: "/privacy-policy" },
        { title: "Terms & Conditions", url: "/terms-conditions" },
        { title: "Return Policy", url: "/return-policy" },
      ],
    },
  ];

  const SOCIALS = [
    {
      title: "Facebook",
      href: "#",
      svg: '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.06 5.66 21.21 10.44 22v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22C18.34 21.21 22 17.06 22 12.06Z"/>',
    },
    {
      title: "Instagram",
      href: "#",
      svg: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.4-10.4a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z"/>',
    },
    {
      title: "TikTok",
      href: "#",
      svg: '<path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.84-2.48V9.76a5.68 5.68 0 1 0 4.93 5.63V9.01a7.3 7.3 0 0 0 4.05 1.23V7.15a4.28 4.28 0 0 1-2.99-1.33Z"/>',
    },
    {
      title: "YouTube",
      href: "#",
      svg: '<path d="M23 12s0-3.2-.4-4.73a2.5 2.5 0 0 0-1.76-1.77C19.31 5.1 12 5.1 12 5.1s-7.31 0-8.84.4A2.5 2.5 0 0 0 1.4 7.27C1 8.8 1 12 1 12s0 3.2.4 4.73a2.5 2.5 0 0 0 1.76 1.77c1.53.4 8.84.4 8.84.4s7.31 0 8.84-.4a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12Zm-13 3.5v-7l6 3.5Z"/>',
    },
    {
      /* The one social we have a real destination for — same number as the
         sticky button. `ext` opens it in a new tab; the others are still
         placeholder hrefs. */
      title: "WhatsApp",
      href: "https://wa.me/201099335774",
      ext: true,
      svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>',
    },
  ];

  /* ---------------------------------------------------------------
     Route → static-file mapping
     --------------------------------------------------------------- */
  function pageHref(url) {
    if (!url) return "#";
    if (/^https?:\/\//.test(url) || url.startsWith("#") || url.endsWith(".html"))
      return url;
    const clean = "/" + url.replace(/^\/+/, "").replace(/\/+$/, "");
    const map = {
      "/": "index.html",
      "/about": "about.html",
      "/exception-cafe": "exception-cafe.html",
      "/branches": "branches.html",
      "/export": "export.html",
      "/special-orders": "special-orders.html",
      "/careers": "careers.html",
      "/faqs": "faqs.html",
      "/contact-us": "contact-us.html",
      "/privacy-policy": "privacy-policy.html",
      "/terms-conditions": "terms-conditions.html",
      "/return-policy": "return-policy.html",
      "/blogs": "blogs.html",
      "/shop": "shop.html",
      "/shop/make-your-cake": "make-your-cake.html",
      "/shop/special-cakes": "special-cakes.html",
      "/cart": "cart.html",
      "/checkout": "checkout.html",
      "/thank-you": "thank-you.html",
      "/login": "login.html",
      "/register": "register.html",
      "/store-closed": "store-closed.html",
      "/my-account": "my-account.html",
    };
    if (map[clean]) return map[clean];
    if (clean.startsWith("/shop/")) return "shop-category.html";
    if (clean.startsWith("/products/")) return "product.html";
    if (clean.startsWith("/blogs/")) return "blog.html";
    if (clean.startsWith("/my-account/"))
      return "my-account-" + clean.split("/")[2] + ".html";
    return "index.html";
  }

  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  /* ---------------------------------------------------------------
     SVG icons (ported from the React icon components)
     --------------------------------------------------------------- */
  const ICON = {
    account:
      '<svg viewBox="0 0 29 29" fill="none" class="w-6 h-6"><path d="M4.47 22.96C7.43 21.29 10.85 20.33 14.5 20.33s7.07.96 10.03 2.63M18.88 11.58a4.38 4.38 0 1 1-8.75 0 4.38 4.38 0 0 1 8.75 0ZM27.63 14.5A13.13 13.13 0 1 1 1.38 14.5a13.13 13.13 0 0 1 26.25 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search:
      '<svg viewBox="0 0 29 29" fill="none" class="w-6 h-6"><path d="M27.63 27.63 18.88 18.88M21.79 11.58a10.21 10.21 0 1 1-20.42 0 10.21 10.21 0 0 1 20.42 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    location:
      '<svg viewBox="0 0 22 20" fill="none" class="w-[22px] h-5"><path d="M16.75 11.75c-3 0-4 2-4 2h-3l-.14-.22c-.86-1.35-1.29-2.03-1.87-2.52-.51-.43-1.11-.76-1.75-.96-.72-.23-1.53-.23-3.13-.23H.75M16.75 11.75c3 0 4 2 4 2M16.75 11.75 15.23 3.38c-.17-.94-.26-1.4-.5-1.75a2 2 0 0 0-.84-.71c-.39-.17-.86-.17-1.81-.17h-.33M3.75 6.75h2M.75 3.75h4M15.75 5.75h1.42a1.5 1.5 0 0 0 .58-2.9c-.2-.09-.42-.1-.58-.1H15.25M6.75 15.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM18.75 16.75a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg width="31" height="30" viewBox="0 0 31 30" fill="none"><path d="M21 6 9 6M21 12 3 12M15 18H3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M20 7H8M20 12H4M20 17H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M6.5 8h11l-.7 10.4a1.6 1.6 0 0 1-1.6 1.5H8.8a1.6 1.6 0 0 1-1.6-1.5L6.5 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    /* Empty-cart glyph for the count badge. Sized in % (not a fixed px
       class) so the one markup fits every badge it's dropped into —
       22px desktop/floating and 16px mobile — and inherits the badge's
       white via currentColor. Heavier stroke than ICON.bag: at ~13px the
       1.6 weight of the full-size icon renders too faint to read. */
    bagBadge:
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="w-3/5 h-3/5"><path d="M6.5 8h11l-.7 10.4a1.6 1.6 0 0 1-1.6 1.5H8.8a1.6 1.6 0 0 1-1.6-1.5L6.5 8Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    close2: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronDown:
      '<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M2.5 3h1.6c.5 0 .93.35 1.03.84l.34 1.66m0 0 1.4 6.86c.16.8.87 1.37 1.68 1.37h7.9c.79 0 1.48-.54 1.66-1.31l1.3-5.4a.85.85 0 0 0-.83-1.05H5.47M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm9 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowRight:
      '<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowLeft:
      '<svg viewBox="0 0 24 24" fill="none" class="w-5 h-5"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const isCheckout = () => document.body.getAttribute("data-page") === "checkout";
  const currentPath = () => document.body.getAttribute("data-path") || "/";

  /* ---------------------------------------------------------------
     Brand logo — official Exception Pâtisserie artwork from
     images/logos/. `dark` = true uses the dark logo for LIGHT surfaces
     (checkout header, light sections); false uses the white logo for
     DARK surfaces (main header/footer). Each <img> carries both the
     English and Arabic artwork; applyLang() swaps the src on EN⇄AR.
     `size` is the rendered logo height in px.
     --------------------------------------------------------------- */
  function logoMark(dark, size) {
    const h = size || 40;
    const en = dark ? "images/logos/logo-dark.png" : "images/logos/logo-light.png";
    const ar = dark ? "images/logos/LogoAr.webp" : "images/logos/logoArWhite.webp";
    return `<img src="${en}" data-logo-en="${en}" data-logo-ar="${ar}" alt="Exception Pâtisserie" style="height:${h}px" class="w-auto object-contain" />`;
  }

  /* ---------------------------------------------------------------
     Header
     --------------------------------------------------------------- */
  function desktopNavItem(item) {
    const href = pageHref(item.url);
    const active = currentPath() === item.url ? "text-cta" : "text-primaryDark";
    if (!item.children || !item.children.length) {
      return `<li class="group relative shrink-0">
        <a href="${href}" class="flex items-center gap-1 ${active} hover:text-cta text-sm font-medium whitespace-nowrap py-1 transition-colors">${esc(item.name)}</a>
      </li>`;
    }
    const cols = item.children
      .map(
        (c) =>
          `<li><a href="${pageHref(c.url)}" class="block py-1.5 text-textSecondary hover:text-primaryDark text-sm font-medium transition-colors">${esc(c.name)}</a></li>`,
      )
      .join("");
    return `<li class="group relative shrink-0">
      <a href="${href}" class="flex items-center gap-1 ${active} hover:text-cta text-sm font-medium whitespace-nowrap py-1 transition-colors">
        ${esc(item.name)}<span class="w-3 h-3 transition-transform group-hover:rotate-180">${ICON.chevronDown}</span>
      </a>
      <div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full start-0 pt-4 z-50 transition-all duration-200">
        <div class="flex gap-6 bg-white shadow-custom3 rounded-2xl p-6 w-max min-w-[420px]">
          <div class="flex-1">
            <div class="mb-3 font-semibold text-primaryDark text-base capitalize">${esc(item.name)}</div>
            <ul class="grid grid-cols-2 gap-x-8">${cols}</ul>
            <a href="${href}" class="inline-flex items-center gap-1 mt-4 font-semibold text-cta hover:text-cta-hover text-sm">View all ${esc(item.name)} ${ICON.arrowRight}</a>
          </div>
          <div class="w-[180px] rounded-xl overflow-hidden bg-primary-light shrink-0">
            <img src="${item.image}" alt="${esc(item.name)}" class="w-full h-[160px] object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </li>`;
  }

  function headerHTML() {
    const checkout = isCheckout();

    /* --- desktop primary nav --- */
    const nav = MAIN_MENU.map(desktopNavItem).join("");

    /* Language switch — one tap, no modal and no country step (Egypt is the
       only market). The label always names the language you would switch
       TO, so it doubles as the action. updateLangLabel() fills it in. */
    const langSelector = `<button type="button" data-lang-toggle class="lang-switch shrink-0"></button>`;

    /* Support pages. These used to sit behind a hamburger in the header;
       they now run along a slim utility bar above it, so they are visible
       without a click. Mobile still reaches them through its drawer
       (menuSecondaryLinks). */
    const utilityLinks = SUPPORT_MENU.map(
      (i) => `<a href="${pageHref(i.url)}" class="hdr-utility__link">${esc(i.title)}</a>`,
    ).join("");
    /* Theme switch — a preview of dark mode for the client. Segmented so the
       current mode is readable at a glance rather than guessed from an icon. */
    const themeToggle = `
      <div class="theme-toggle" role="group" aria-label="Colour theme">
        <button type="button" data-theme-set="light" class="theme-toggle__opt" aria-label="Light mode">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </button>
        <button type="button" data-theme-set="dark" class="theme-toggle__opt" aria-label="Dark mode">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
        </button>
      </div>`;
    const utilityBar = `
      <div class="hdr-utility">
        <div class="mx-auto flex max-w-[1512px] items-center justify-between gap-4 px-6 lg:px-[60px]">
          ${themeToggle}
          <nav aria-label="Support" class="flex items-center gap-6">${utilityLinks}<a href="tel:16689" class="hdr-utility__link hdr-utility__link--tel" dir="ltr"><img src="images/icons/phone-icon.svg" alt="" width="14" height="14" />16689</a></nav>
        </div>
      </div>`;

    const desktop = `
      <div class="hidden md:block">
        ${
          checkout
            ? `<div class="relative z-40 bg-white shadow-header border-t-[4px] lg:!border-t-[10px] border-primaryDark py-[22px]">
                 <div class="mx-auto flex max-w-[1392px] items-center justify-center relative px-4 2xl:px-0">
                   <a href="index.html" aria-label="Exception home">${logoMark(true, 44)}</a>
                   <div class="absolute end-4 2xl:end-0">${langSelector}</div>
                 </div>
               </div>`
            : `<div class="relative z-40 bg-primary-200">
                 ${utilityBar}
                 <div class="mx-auto flex items-center justify-between gap-4 max-w-[1512px] px-6 lg:px-[60px] py-[20px]">
                   <!-- Left: search + Location picker -->
                   <div class="flex flex-1 items-center gap-2 min-w-0">
                     <button type="button" data-open="search" aria-label="Search" class="grid place-items-center shrink-0 rounded-[4px] size-[34px] text-primaryDark border border-primaryDark shadow-custom-5 hover:bg-primaryDark/5 transition-colors"><img src="images/icons/search-icon.svg" alt="" width="18" height="18" /></button>
                     <div class="relative min-w-0" data-locmenu>
                       <button type="button" data-loc-toggle class="relative flex items-center gap-1.5 bg-[#E7FFFC]/80 rounded-[5px] px-2.5 h-[34px] text-primaryDark min-w-0">
                         <span class="absolute -top-2 start-2 -rotate-[4deg] bg-cta text-white text-[11px] leading-none px-1.5 py-0.5 rounded-[4px]">Location</span>
                         <span class="shrink-0"><img src="images/icons/delivery.webp" alt="" class="w-6 h-6 object-contain" /></span>
                         <span class="text-xs whitespace-nowrap truncate"><span class="font-normal">Street 9</span> <span class="font-semibold" data-loc-place>| Maadi, Cairo</span></span>
                       </button>
                       <div class="loc-panel absolute top-full start-0 mt-2 bg-white rounded-[12px] p-4 shadow-custom3 z-[60] w-[320px] text-start">
                         <p class="font-semibold text-primaryDark text-sm mb-3">Choose your delivery location</p>
                         <p class="loc-gate-only text-xs text-textSecondary leading-[150%] mb-3">Stock differs by branch — pick your area and we'll only show what we can actually deliver to you.</p>
                         <p class="loc-hint" data-loc-hint hidden></p>
                         <form data-location-form class="flex flex-col gap-3">
                           <label class="flex items-center gap-3">
                             <span class="label w-16 shrink-0">City</span>
                             <select data-loc-city class="placeholder-select flex-1 min-w-0 border border-gray-300 rounded-lg px-3 h-11 text-sm text-primaryDark"></select>
                           </label>
                           <label class="flex items-center gap-3">
                             <span class="label w-16 shrink-0">Area</span>
                             <select data-loc-area class="placeholder-select flex-1 min-w-0 border border-gray-300 rounded-lg px-3 h-11 text-sm text-primaryDark"></select>
                           </label>
                           <label class="flex items-center gap-3">
                             <span class="label w-16 shrink-0">District</span>
                             <select data-loc-district class="placeholder-select flex-1 min-w-0 border border-gray-300 rounded-lg px-3 h-11 text-sm text-primaryDark"></select>
                           </label>
                           <button type="submit" class="btn btn--primary btn--md mt-1 w-full justify-center">Confirm Location</button>
                         </form>
                       </div>
                     </div>
                   </div>
                   <!-- Center: logo -->
                   <a href="index.html" aria-label="Exception home" class="shrink-0">${logoMark(true, 52)}</a>
                   <!-- Right: language · account + favourites/cart (search sits in the left group, the hotline on the utility bar) -->
                   <div class="flex flex-1 items-center justify-end gap-6 min-w-0">
                     <!-- Language · account · favourites: one row, even gaps,
                          a hairline between each. The cart keeps its own gap
                          because it is a filled chip, not a bare icon. -->
                     <div class="hdr-actions">
                       ${langSelector}
                       <span class="hdr-actions__sep" aria-hidden="true"></span>
                       <a href="login.html" aria-label="Account" class="hdr-actions__item"><img src="images/icons/user-icon.svg" alt="" width="20" height="20" /></a>
                       <span class="hdr-actions__sep" aria-hidden="true"></span>
                       <a href="my-account-favorites.html" aria-label="Favorites" class="hdr-actions__item relative"><img src="images/icons/favourite.svg" alt="" width="20" height="20" /><span class="absolute -top-[6px] -end-[7px] grid place-items-center bg-primaryDark border border-primary-200 text-white text-[10px] font-semibold leading-none rounded-full size-[16px]" data-fav-count>6</span></a>
                     </div>
                     <button type="button" data-open="cart" aria-label="Cart" class="relative grid place-items-center shrink-0 size-[34px] rounded-[10px] bg-primaryDark shadow-[0_1px_1px_rgba(0,0,0,0.05)]"><img src="images/icons/shopping-basket.svg" alt="" width="26" height="26" /><span class="absolute -top-[4px] -end-[8px] grid place-items-center bg-cta border border-primary-200 text-white text-[12px] font-semibold leading-none rounded-full size-[18px]" data-cart-count>4</span></button>
                   </div>
                 </div>
               </div>`
        }
      </div>`;

    /* --- mobile header (light mint, matches desktop) --- */
    const mobile = `
      <div class="md:hidden block">
        ${
          checkout
            ? ""
            : `<div class="bg-primary-light px-3 py-1.5">
                 <div class="flex items-center justify-center gap-1.5 text-primaryDark">
                   <span class="text-[10px]">🎁 Enjoy 10% off your first order with code</span>
                   <span class="text-[10px] font-semibold uppercase text-cta">EXCEPTION10</span>
                 </div>
               </div>`
        }
        <div class="relative flex items-center ${checkout ? "justify-center" : "justify-between"} bg-primary-200 px-4 py-4">
          ${
            checkout
              ? ""
              : `<button type="button" data-open="menu" class="grid place-items-center bg-white rounded-[12px] text-primaryDark shadow-custom-5 size-[42px]" aria-label="Menu"><img src="images/icons/menu-icon.svg" alt="" width="20" height="20" /></button>`
          }
          <a href="index.html" class="block" aria-label="Exception home">${logoMark(true, 26)}</a>
          ${
            checkout
              ? ""
              : `<button type="button" data-open="cart" aria-label="Cart" class="relative grid place-items-center size-[34px] rounded-[10px] bg-primaryDark shadow-[0_1px_1px_rgba(0,0,0,0.05)]"><img src="images/icons/shopping-basket.svg" alt="" width="26" height="26" /><span class="absolute -top-[4px] -end-[8px] grid place-items-center bg-cta border border-primary-200 text-white text-[12px] font-semibold leading-none rounded-full size-[18px]" data-cart-count>4</span></button>`
          }
        </div>
      </div>
      ${
        checkout
          ? ""
          : `<div class="md:hidden block bg-backgroundLocationBar px-4 py-2">
               <div class="mx-auto max-w-7xl bg-white shadow-custom-5 rounded-[12px] px-[22px] py-1">
                 <button type="button" data-open="location" class="flex items-center gap-1 justify-between py-[10px] w-full text-primaryDark">
                   <span class="flex items-center gap-[5px]">
                     <span class="shrink-0"><img src="images/icons/delivery.webp" alt="" class="w-6 h-6 object-contain" /></span>
                     <span class="flex items-center gap-1">
                       <span class="font-normal text-[10px] leading-[140%]">Location</span>
                       <span class="font-semibold text-[12px] leading-[140%]">Street 9 <span data-loc-place>| Maadi, Cairo</span></span>
                     </span>
                   </span>
                   <span class="w-[13px] h-[13px]">${ICON.chevronDown}</span>
                 </button>
               </div>
             </div>`
      }`;

    /* --- category navigation bar (icons + labels, scroll arrows) ---
       The current category comes from the page's own <body data-path>
       (e.g. "/shop/cakes"), matched against CATEGORY_NAV[].url. */
    const currentPath = (document.body && document.body.dataset.path) || "";
    const catItems = CATEGORY_NAV.map((c) => {
      const isCurrent = !!c.url && c.url === currentPath;
      return `
        <a href="${pageHref(c.url)}" class="catnav-item relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2 px-2 py-2 md:px-3 md:py-2 rounded-[12px] shrink-0 hover:bg-primary-50 transition-colors${isCurrent ? " is-current" : ""}"${isCurrent ? ' aria-current="page"' : ""}>
          ${c.badge ? `<span class="catnav-badge">${esc(c.badge)}</span>` : ""}
          <img src="images/icons/${c.icon}" alt="" width="64" height="64" class="size-14 md:size-16 shrink-0" />
          <span class="text-primaryDark whitespace-nowrap text-[10px] md:${c.big ? "text-[13px]" : "text-xs"} ${c.big ? "font-medium" : "font-semibold"}">${esc(c.label)}</span>
        </a>`;
    }).join("");

    const categoryNav = checkout
      ? ""
      : `<div data-navbar class="w-full bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.08)] relative z-30">
           <div class="relative mx-auto max-w-[1512px]">
             <div data-catnav-track class="flex items-center gap-1.5 px-3 py-1.5 md:gap-1 md:px-[60px] md:py-1.5 overflow-x-auto no-scrollbar scroll-smooth">
               ${catItems}
             </div>
             <div class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-between px-6">
               <button type="button" data-catnav-prev aria-label="Scroll left" class="pointer-events-auto grid place-items-center bg-white border border-gray-300 rounded-full size-8 text-primaryDark shadow-sm hover:bg-gray-100 transition-colors">${ICON.arrowLeft}</button>
               <button type="button" data-catnav-next aria-label="Scroll right" class="pointer-events-auto grid place-items-center bg-white border border-gray-300 rounded-full size-8 text-primaryDark shadow-sm hover:bg-gray-100 transition-colors">${ICON.arrowRight}</button>
             </div>
           </div>
         </div>`;

    return `<header>${desktop}${mobile}${categoryNav}</header>`;
  }

  /* ---------------------------------------------------------------
     Footer
     --------------------------------------------------------------- */
  function footerHTML() {
    if (isCheckout()) {
      /* Checkout keeps its stripped-down footer — no menus to distract from
         paying — but the bottom line now matches the main one exactly:
         copyright, payment marks, credit. Same three-part row, same
         stack-on-mobile behaviour. */
      return `<footer class="bg-neutral-support-bg py-6">
        <div class="mx-auto flex max-w-[1392px] flex-col-reverse items-center gap-4 px-4 md:flex-row">
          <span class="text-[10px] leading-[1.4] text-white dir-ltr md:flex-1 md:text-start">© Exception ${YEAR} - All Copyrights Reserved</span>
          <img src="dummy-images/payment-method.png" alt="Accepted payment methods" width="374" height="24" class="shrink-0 object-contain" />
          <span class="text-[10px] leading-[1.4] text-white md:flex-1 md:text-end"><a href="https://www.mitchdesigns.com" target="_blank" rel="noopener noreferrer" class="hover:underline">Designed &amp; Developed By Mitchdesigns</a></span>
        </div>
      </footer>`;
    }

    // Plain white social marks (Figma shows bare icons, no circles).
    const socials = SOCIALS.map(
      (s) =>
        `<li><a href="${s.href}"${s.ext ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${s.ext ? "Chat with us on " + s.title : "Visit our " + s.title + " page"}" class="text-white transition-opacity hover:opacity-70"><svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">${s.svg}</svg></a></li>`,
    ).join("");

    /* Store badges are markup rather than image files: they inherit the site
       font, stay crisp at any size, and need no extra requests. */
    const PLAY_MARK =
      '<svg class="store-badge__mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.06 2.29a1.5 1.5 0 0 0-.31.94v17.54c0 .36.11.68.31.94l.06.06 9.83-9.83v-.23L3.12 2.23l-.06.06Z" fill="#00A0FF"/><path d="M16.2 15.24l-3.25-3.25v-.23l3.25-3.26.07.05 3.87 2.2c1.1.63 1.1 1.65 0 2.28l-3.87 2.2-.07.01Z" fill="#FFBC00"/><path d="M16.27 15.19 12.95 11.87 3.06 21.71c.36.39.96.44 1.63.05l11.58-6.57Z" fill="#FF3A44"/><path d="M16.27 8.55 4.69 1.98C4.02 1.6 3.42 1.65 3.06 2.04l9.89 9.83 3.32-3.32Z" fill="#00C853"/></svg>';
    const APPLE_MARK =
      '<svg class="store-badge__mark" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.05 12.04c-.03-2.75 2.25-4.07 2.35-4.13-1.28-1.87-3.27-2.13-3.98-2.16-1.69-.17-3.3 1-4.16 1-.86 0-2.18-.98-3.58-.95-1.84.03-3.54 1.07-4.49 2.72-1.91 3.32-.49 8.23 1.38 10.92.91 1.32 2 2.8 3.42 2.75 1.37-.06 1.89-.89 3.55-.89 1.65 0 2.12.89 3.57.86 1.47-.02 2.41-1.34 3.31-2.67 1.04-1.53 1.47-3.01 1.5-3.09-.03-.01-2.88-1.11-2.91-4.4Z"/><path d="M14.5 4.2c.75-.92 1.26-2.19 1.12-3.46-1.08.04-2.4.72-3.18 1.63-.7.81-1.31 2.11-1.15 3.35 1.21.09 2.45-.61 3.21-1.52Z"/></svg>';
    const storeBadges = `
      <a href="${APP_LINKS.android}" target="_blank" rel="noopener noreferrer" class="store-badge">${PLAY_MARK}<span class="store-badge__txt"><small>Download on the</small><strong>Google Play</strong></span></a>
      <a href="${APP_LINKS.ios}" target="_blank" rel="noopener noreferrer" class="store-badge">${APPLE_MARK}<span class="store-badge__txt"><small>Download on the</small><strong>App Store</strong></span></a>`;

    /* One QR for both platforms. A QR only carries a URL, so it points at
       app.html, which reads the user agent and forwards to the right store.
       It is a link too, so a desktop visitor can just click it. */
    const appBanner = `
      <div class="app-banner">
        <div class="app-banner__copy">
          <p class="app-banner__title">Download Now Exception App</p>
          <div class="app-banner__badges">${storeBadges}</div>
        </div>
        <a href="app.html" class="app-banner__qr" aria-label="Get the Exception app">
          <img src="images/icons/app-qr.svg" alt="QR code linking to the Exception app" width="81" height="81" />
        </a>
        <!-- Phones get a button instead: you cannot scan a code with the
             device already in your hand. Same destination — app.html sends
             each device to its own store. -->
        <a href="app.html" class="app-banner__cta">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 16.5v1.75A2.75 2.75 0 0 0 7.25 21h9.5a2.75 2.75 0 0 0 2.75-2.75V16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download App
        </a>
      </div>`;

    const panelLink = (title, url) =>
      `<li><a href="${pageHref(url)}" class="text-sm leading-[1.35] text-primaryDark transition-colors hover:text-primary-700 hover:underline">${esc(title)}</a></li>`;

    const shopLinks = FOOTER_COLUMNS[0].links;
    const shopCol = (links) =>
      `<ul class="flex flex-col gap-1.5">${links.map((l) => panelLink(l.title, l.url)).join("")}</ul>`;

    const mailIcon =
      '<svg viewBox="0 0 24 24" fill="none" class="h-[19px] w-[19px]"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    return `<footer class="relative overflow-hidden bg-[#0F3B36] pb-6 pt-[60px]">
      <!-- DotField interactive background (canvas, boots from dotfield.js) -->
      <div data-dotfield aria-hidden="true" class="pointer-events-none absolute inset-0 z-0"></div>
      <div class="relative z-10 mx-auto flex max-w-[1512px] flex-col gap-[60px] px-4 lg:px-[60px]">
        <!-- Brand mark — smaller, centered -->
        <a href="index.html" aria-label="Exception home" class="footer-anim mx-auto block w-full max-w-[560px]"><img src="images/logos/footer-logo.svg" alt="Exception Pâtissier" class="h-auto w-full" /></a>

        <!-- Panels: mint links panel + turquoise newsletter panel -->
        <div class="flex flex-col gap-2 lg:flex-row">
          <div class="footer-anim flex min-w-0 flex-1 flex-col gap-8 rounded-[20px] bg-primary-light px-8 py-10" style="--footer-delay: 0.1s">
           <div class="flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
            <!-- Shop (2 columns) -->
            <div class="flex flex-col gap-4">
              <p class="text-[18px] font-semibold leading-[1.4] text-primaryDark">Shop</p>
              <div class="flex gap-10 xl:gap-[60px]">
                ${shopCol(shopLinks.slice(0, 5))}
                ${shopCol(shopLinks.slice(5))}
              </div>
            </div>
            <div class="hidden w-px self-stretch bg-primaryDark/10 md:block"></div>
            <!-- Company -->
            <div class="flex flex-col gap-4">
              <p class="text-[18px] font-semibold leading-[1.4] text-primaryDark">Company</p>
              <ul class="flex flex-col gap-1.5">
                ${FOOTER_COLUMNS[1].links.map((l) => panelLink(l.title, l.url)).join("")}
              </ul>
            </div>
            <div class="hidden w-px self-stretch bg-primaryDark/10 md:block"></div>
            <!-- Support (links + contact rows) -->
            <div class="flex flex-col gap-4 md:pe-2">
              <p class="text-[18px] font-semibold leading-[1.4] text-primaryDark">Support</p>
              <ul class="flex flex-col gap-1.5 text-primaryDark">
                ${panelLink("FAQs", "/faqs")}
                ${panelLink("Contact Us", "/contact-us")}
                <li><a href="tel:16689" class="flex items-center gap-2 text-sm leading-[1.35] transition-colors hover:text-primary-700 dir-ltr">${ICON.phone}16689</a></li>
                <li><a href="mailto:export@exception-group.com" class="flex items-center gap-2 text-sm leading-[1.35] transition-colors hover:text-primary-700 dir-ltr">${mailIcon}export@exception-group.com</a></li>
                ${panelLink("Privacy Policy", "/privacy-policy")}
                ${panelLink("Terms & Conditions", "/terms-conditions")}
              </ul>
            </div>
           </div>
           ${appBanner}
          </div>

          <!-- Newsletter panel. justify-between per Figma 6508:52157: the heading
               and form sit at the top, the socials at the bottom, and the space
               between them absorbs whatever height the column beside it ends up
               being. gap-10 is only a floor, for when the panel is short (mobile)
               and there is no spare height to distribute. -->
          <div class="footer-anim flex w-full flex-col items-start justify-between gap-10 rounded-[20px] bg-[#8CBAB5] px-8 py-10 lg:w-[406px] lg:shrink-0" style="--footer-delay: 0.2s">
            <div class="flex w-full flex-col gap-2">
              <div class="flex flex-col gap-[5px] text-white">
                <p class="text-[24px] font-semibold leading-[1.2]">Join Our Newsletter</p>
                <p class="text-base leading-[1.4]">Enjoy exclusive offers and updates</p>
              </div>
              <form data-newsletter class="flex w-full items-center justify-between gap-2 rounded-[12px] border border-[#F5F5F6] bg-white py-2 pl-4 pr-2 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <input type="email" required placeholder="Enter your Email Address" class="min-w-0 flex-1 bg-transparent text-[14px] text-[#2C3340] outline-none placeholder:text-[#2C3340]/70" aria-label="Email address" />
                <button type="submit" aria-label="Subscribe" class="grid shrink-0 place-items-center rounded-[8px] bg-primaryDark p-[10px] transition-colors hover:bg-black"><img src="images/icons/sent.svg" alt="" class="h-[26px] w-[26px]" /></button>
              </form>
            </div>
            <ul class="flex w-full items-center justify-end gap-4">${socials}</ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <!-- Equal-weight side columns rather than justify-between: the
             copyright and the credit are different lengths, so space-between
             pushed the payment marks off true centre. -->
        <div class="footer-anim flex flex-col-reverse items-center gap-4 md:flex-row" style="--footer-delay: 0.3s">
          <span class="text-[10px] leading-[1.4] text-white dir-ltr md:flex-1 md:text-start">© Exception ${YEAR} - All Copyrights Reserved</span>
          <img src="dummy-images/payment-method.png" alt="Accepted payment methods" width="374" height="24" class="shrink-0 object-contain" />
          <span class="text-[10px] leading-[1.4] text-white md:flex-1 md:text-end"><a href="https://www.mitchdesigns.com" target="_blank" rel="noopener noreferrer" class="hover:underline">Designed &amp; Developed By Mitchdesigns</a></span>
        </div>
      </div>
    </footer>`;
  }

  const YEAR = 2025; // static build stamp (Date.now avoided for determinism)

  /* Single source of truth for the demo cart's starting contents — read by
     overlaysHTML() to render the drawer AND by cartCount's initial value
     below, so the header badge always starts equal to the actual number
     of units in the drawer (and so reaches exactly 0 when it's emptied,
     instead of stopping at a leftover offset from an unrelated seed). */
  /* `key` ties a demo row to a product page, so that page can paint its own
     state (currently the PDP add-ons summary) into the matching cart row. */
  const DEMO_CART_ITEMS = [
    { key: "chocolate-fudge-cake", name: "Chocolate Fudge Cake", price: 650, qty: 1, img: "dummy-images/image-7.webp", variants: [["Size", "1 Kg"]] },
    { key: "assorted-baklava-box", name: "Assorted Baklava Box", price: 420, qty: 1, img: "dummy-images/image.webp", variants: [["Weight", "500 g"]] },
  ];

  /* ---------------------------------------------------------------
     Overlays: backdrop, cart drawer, mobile menu, search, location
     --------------------------------------------------------------- */
  function overlaysHTML() {
    /* Menu drawer, top section: the shop categories — what people actually
       came to browse — each with its own icon, at the drawer's headline size. */
    const menuCategoryLinks = CATEGORY_NAV.map(
      (c) =>
        `<li><a href="${pageHref(c.url)}" class="flex items-center gap-3 text-primaryDark text-[22px] font-medium leading-none capitalize hover:text-cta transition-colors">
          <img src="images/icons/${c.icon}" alt="" class="size-8 shrink-0 object-contain" />
          <span>${esc(c.label.toLowerCase())}</span>
        </a></li>`,
    ).join("");

    /* Bottom section: the secondary pages (About, FAQs, …) — still reachable,
       deliberately quieter than the categories above them. */
    const menuSecondaryLinks = SUPPORT_MENU.map(
      (i) =>
        `<li><a href="${pageHref(i.url)}" class="text-textSecondary text-[15px] font-medium leading-none hover:text-cta transition-colors">${esc(i.title)}</a></li>`,
    ).join("");

    const demoCartItems = DEMO_CART_ITEMS;
    // Variation tags — variable products only; simple products get no row.
    const vtags = (variants) =>
      variants && variants.length
        ? `<div class="vtags mt-1.5">${variants
            .map(([k, v]) => `<span class="vtag"><span class="vtag__k">${esc(k)}:</span><span class="vtag__v">${esc(v)}</span></span>`)
            .join("")}</div>`
        : "";
    const cartRows = demoCartItems
      .map(
        (it) => `
      <div class="flex gap-3 py-4 border-b border-neutral-100" data-cart-row data-unit-price="${it.price}" data-cart-product="${it.key || ""}">
        <img data-shot-img="ui" src="${it.img}" alt="${esc(it.name)}" class="w-[72px] h-[72px] rounded-lg object-cover bg-primary-light" />
        <!-- Text column and counter sit side-by-side (counter no longer stacks
             below the price), so the row is only as tall as the thumbnail. -->
        <div class="flex flex-1 items-start gap-2 min-w-0">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-textSecondary text-sm">${esc(it.name)}</p>
            ${vtags(it.variants)}
            <p class="mt-1 font-semibold text-cta text-sm">EGP ${it.price}</p>
            <!-- Filled by the product page with its chosen add-ons; stays
                 empty (and collapsed) on every row that has none. -->
            <div data-cart-addons></div>
          </div>
          <div class="counter counter--sm shrink-0 self-center" data-stepper data-removable>
            <button type="button" data-step="-1" class="counter__btn" aria-label="Decrease quantity"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
            <span data-qty class="counter__qty">${it.qty}</span>
            <button type="button" data-step="1" class="counter__btn counter__inc" aria-label="Increase quantity"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
          </div>
        </div>
      </div>`,
      )
      .join("");

    /* Cross-sell grid — "Complete Your Order". Sits inside the same
       scrollable region as the line items (not pinned above the footer),
       so it doesn't eat into checkout visibility on a short drawer. Fixed
       2-row × 3-column grid (not a carousel — everything is visible at
       once, no swiping needed for 6 items). Reuses the standard
       data-add-widget/data-add-btn quick-add pattern (see product cards)
       at a smaller scale, so the existing global click-delegation in
       initDelegation() wires it up for free — no drawer-specific JS. */
    const demoUpsellItems = [
      { name: "Pistachio Kunafa", price: 260, img: "dummy-images/image-1.webp" },
      { name: "Mini Cupcake Dozen", price: 280, img: "dummy-images/image-4.webp" },
      { name: "Dark Chocolate Gift Box", price: 500, img: "dummy-images/image-7.webp" },
      { name: "Basbousa Tray", price: 240, img: "dummy-images/image-8.webp" },
      { name: "Kahk Assortment", price: 220, img: "dummy-images/image-9.webp" },
      { name: "Vanilla Bean Tub", price: 160, img: "dummy-images/image-3.webp" },
    ];
    const upsellCards = demoUpsellItems
      .map(
        (it) => `
      <div>
        <div class="relative">
          <div class="rounded-[10px] aspect-square overflow-hidden bg-primary-light">
            <img data-shot-img="ui" src="${it.img}" alt="${esc(it.name)}" class="w-full h-full object-cover" />
          </div>
          <span class="absolute end-1.5 -bottom-2.5 z-10" data-add-widget data-type="simple">
            <button type="button" data-add-btn aria-label="Add ${esc(it.name)} to cart" class="grid place-items-center bg-primary-200 text-primaryDark rounded-[6px] size-[24px] shadow-custom-5 hover:bg-primary-300 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" class="w-3 h-3"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
            </button>
            <span class="hidden items-center gap-0.5 bg-white rounded-[6px] h-[24px] px-1 shadow-custom-5" data-counter>
              <button type="button" data-dec aria-label="Remove" class="grid place-items-center size-[16px] rounded-[3px] hover:bg-black/5 transition-colors">
                <img data-dec-icon src="images/icons/trash.svg" alt="" width="10" height="10" />
              </button>
              <span data-qty class="w-[14px] text-center text-[10px] font-medium text-primaryDark tabular-nums">1</span>
              <button type="button" data-inc aria-label="Add" class="grid place-items-center size-[16px] rounded-[3px] bg-primary-200 text-primaryDark hover:bg-primary-300 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" class="w-2.5 h-2.5"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
              </button>
            </span>
          </span>
        </div>
        <p class="mt-3 text-[11px] font-semibold text-cta leading-tight">EGP ${it.price}</p>
        <p class="text-[11px] font-medium text-textSecondary leading-tight line-clamp-1">${esc(it.name)}</p>
      </div>`,
      )
      .join("");
    /* data-no-oos: this is a cross-sell strip, so everything in it must be
       addable in one tap — available and simple. Without the opt-out the
       demo seeding in initStock() treats the grid like any other product
       list and marks one card out of stock, which turned an upsell into a
       "Schedule" button nobody can act on from the drawer. */
    const cartUpsell = `
      <div class="py-4">
        <p class="font-semibold text-textSecondary text-sm mb-3">Complete Your Order</p>
        <div class="grid grid-cols-3 gap-x-2.5 gap-y-4" data-no-oos>${upsellCards}</div>
      </div>`;

    const initialSubtotal = demoCartItems.reduce((sum, it) => sum + it.price * it.qty, 0);

    return `
    <div data-backdrop class="overlay-backdrop"></div>

    <!-- Cart drawer: header and footer (summary + CTA) are shrink-0 siblings
         of the flex-1 overflow-y-auto scroll region, so only the middle
         (line items + cross-sell grid) scrolls when the cart is full —
         header and footer stay pinned. The free-shipping strip is ALSO
         shrink-0, sitting directly above the footer (not below the header)
         so it stays in view next to the CTA rather than scrolling away
         with the line items it's reporting on. -->
    <aside data-drawer="cart" class="side-drawer side-drawer--right" aria-label="Shopping cart">
      <!-- Close sits OUTSIDE the panel (see .side-drawer__close) so the header
           is all content; it tucks back inside on narrow screens where there
           is no room beside the drawer. -->
      <button type="button" data-close class="side-drawer__close" aria-label="Close cart">${ICON.close}</button>
      <div class="shrink-0 flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
        <!-- Same basket mark the header chip and floating cart use, in its
             dark-stroke variant for this light header (decorative). -->
        <img src="images/icons/shopping-basket-dark.svg" alt="" class="cart-mark w-6 h-6 shrink-0 object-contain" />
        <h2 class="font-semibold text-textSecondary text-lg">Your Cart</h2>
        <a href="cart.html" class="ms-1 text-sm font-medium text-primaryDark underline underline-offset-2 hover:text-cta">View Cart</a>
      </div>
      <div class="flex-1 overflow-y-auto px-5">
        <div data-cart-rows>${cartRows}</div>
        ${cartUpsell}
      </div>
      <div class="shrink-0${initialSubtotal <= 0 ? " hidden" : ""}" data-free-shipping data-fs-unlocked="${initialSubtotal >= FREE_SHIP_THRESHOLD ? "1" : "0"}">${freeShippingHTML(initialSubtotal)}</div>
      <div class="shrink-0 px-5 py-4 border-t border-neutral-100 shadow-cart-overview">
        <div data-promo class="mb-3"></div>
        <div class="flex justify-between"><span class="text-neutral-600 text-sm">Subtotal</span><span class="font-semibold text-primaryDark" data-cart-subtotal>${egp(initialSubtotal)}</span></div>
        <!-- Discount + Total appear only once a code is applied, so the drawer
             stays a two-line summary until there's actually maths to show. -->
        <div class="flex justify-between mt-1.5" data-cart-discount-row hidden>
          <span class="text-neutral-600 text-sm">Discount</span>
          <span class="font-medium text-sm text-[#209B34]" data-cart-discount></span>
        </div>
        <div class="flex justify-between mt-1.5" data-cart-total-row hidden>
          <span class="text-neutral-600 text-sm">Total</span>
          <span class="font-semibold text-primaryDark" data-cart-total></span>
        </div>
        <a href="checkout.html" class="btn btn--primary btn--md w-full justify-center mt-3">Checkout Now</a>
        <!-- View Cart moved beside the drawer title; shop.html is the
             all-products listing ("Shop the Full Collection"). -->
        <a href="shop.html" class="mt-2 block w-full text-center text-primaryDark font-medium py-2 text-sm">Continue Shopping</a>
      </div>
    </aside>

    <!-- Menu drawer: secondary pages (white panel, opens from the menu button) -->
    <aside data-drawer="menu" class="side-drawer side-drawer--left bg-white" aria-label="Menu">
      <div class="px-6 pt-6">
        <button type="button" data-close aria-label="Close menu" class="grid place-items-center bg-white rounded-[14px] text-primaryDark shadow-custom-5 border border-gray-200 size-[52px]">${ICON.close2}</button>
      </div>
      <nav class="flex-1 overflow-y-auto px-6 pb-4 pt-8">
        <ul class="flex flex-col gap-5">
          ${menuCategoryLinks}
        </ul>
        <hr class="my-7 border-gray-200" />
        <ul class="flex flex-col gap-4 pb-2">
          ${menuSecondaryLinks}
        </ul>
      </nav>
      <div class="flex flex-col gap-3 border-t border-gray-200 px-6 py-5">
        <button type="button" data-lang-toggle class="lang-switch lang-switch--block"></button>
        <a href="login.html" class="btn btn--black btn--md w-full justify-center">Sign In</a>
      </div>
    </aside>

    <!-- Search modal -->
    <div data-modal="search" class="modal-shell">
      <div class="w-full max-w-[640px] bg-white rounded-2xl shadow-custom3 overflow-hidden" data-modal-box>
        <div class="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <span class="w-5 h-5 text-neutral-500">${ICON.search}</span>
          <input type="search" data-search-input placeholder="Search for cakes, sweets, gifts…" class="flex-1 outline-none text-textSecondary text-base" />
          <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
        </div>
        <div class="px-5 py-6">
          <p class="text-neutral-500 text-xs uppercase tracking-wide mb-3">Popular searches</p>
          <div class="flex flex-wrap gap-2">
            ${["Birthday Cakes", "Baklava", "Chocolate Boxes", "Cheesecake", "Gift Boxes"]
              .map(
                (s) =>
                  `<a href="shop-category.html" class="px-3 py-1.5 rounded-full bg-primary-light text-textSecondary text-sm hover:bg-cta hover:text-white transition-colors">${s}</a>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- Store picker (checkout → "Pickup from store"). City → Area → the
         branches assigned to that area. Body is rendered by
         initCheckoutOptions(); this is just the shell. -->
    <!-- First-visit location prompt. One ask, one button: tapping Allow
         raises the browser's own location prompt, and the answer either
         way lands in the area picker with the detected area pre-selected. -->
    <div data-modal="welcome" class="modal-shell">
      <div class="flex w-full max-w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-custom3" data-modal-box>
        <div class="wc-step is-active">
          <img src="images/icons/detect-location.webp" alt="" class="wc-art" width="96" height="96" />
          <h2 class="wc-title">Allow location for a better experience</h2>
          <p class="wc-copy">We deliver from the branch nearest to you, and stock differs by branch. Share your location once and we&#39;ll pick your area automatically.</p>
          <button type="button" data-wc-allow class="btn btn--primary btn--md mt-1 w-full justify-center">Allow location</button>
          <button type="button" data-wc-skip class="wc-link">I&#39;ll choose my area</button>
          <p class="wc-note" data-wc-note hidden></p>
        </div>
      </div>
    </div>

    <div data-modal="storepicker" class="modal-shell">
      <div class="flex w-full max-w-[520px] max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-custom3" data-modal-box>
        <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 class="font-semibold text-textSecondary text-lg">Choose a store</h2>
          <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
        </div>
        <div class="flex shrink-0 flex-col gap-3 px-5 py-4 sm:flex-row">
          <label class="block flex-1">
            <span class="label">City</span>
            <select data-store-city class="placeholder-select mt-1 h-12 w-full rounded-lg border border-neutral-200 px-3 text-textSecondary"></select>
          </label>
          <label class="block flex-1">
            <span class="label">Area</span>
            <select data-store-area class="placeholder-select mt-1 h-12 w-full rounded-lg border border-neutral-200 px-3 text-textSecondary"></select>
          </label>
        </div>
        <div class="min-h-[120px] flex-1 overflow-y-auto px-5" data-store-list></div>
        <div class="shrink-0 border-t border-neutral-100 px-5 py-4">
          <button type="button" data-store-confirm class="btn btn--primary btn--md w-full justify-center">Choose Store</button>
        </div>
      </div>
    </div>

    <!-- Schedule picker (checkout → "Schedule for later"). Day chips across
         the top, that day's slots below, confirmed with a Schedule CTA. -->
    <div data-modal="schedule" class="modal-shell">
      <div class="flex w-full max-w-[560px] max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-custom3" data-modal-box>
        <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 class="font-semibold text-textSecondary text-lg">Schedule a time</h2>
          <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
        </div>
        <div class="shrink-0 border-b border-neutral-100 px-5 py-4">
          <div class="flex items-center gap-2">
            <button type="button" data-sched-prev class="sched-nav" aria-label="Earlier days">
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="no-scrollbar flex flex-1 gap-2 overflow-x-auto scroll-smooth" data-sched-days></div>
            <button type="button" data-sched-next class="sched-nav" aria-label="Later days">
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div class="min-h-[140px] flex-1 overflow-y-auto px-5" data-sched-slots></div>
        <div class="shrink-0 border-t border-neutral-100 px-5 py-4">
          <button type="button" data-sched-confirm class="btn btn--primary btn--md w-full justify-center">Schedule</button>
        </div>
      </div>
    </div>

    <!-- Country & Language modal (opened by the header lang button) -->
    <!-- Regional settings (Figma 6324-60291). A .bottom-sheet, not a
         .modal-shell: it slides up from the bottom on phones and becomes a
         centered popup at md+, which is exactly what the design asks for. -->
    <div data-sheet="location" class="bottom-sheet">
      <div class="mx-auto w-10 h-1 rounded-full bg-neutral-200 mb-4 md:hidden"></div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-textSecondary text-lg">Choose Your Location</h2>
        <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
      </div>
      <p class="loc-gate-only text-xs text-textSecondary leading-[150%] -mt-2 mb-4">Stock differs by branch — pick your area and we'll only show what we can actually deliver to you.</p>
      <p class="loc-hint" data-loc-hint hidden></p>
      <form data-location-form class="flex flex-col gap-3">
        <label class="block">
          <span class="label">City</span>
          <select data-loc-city class="placeholder-select w-full border border-neutral-200 rounded-lg px-3 h-12 mt-1 text-textSecondary"></select>
        </label>
        <label class="block">
          <span class="label">Area</span>
          <select data-loc-area class="placeholder-select w-full border border-neutral-200 rounded-lg px-3 h-12 mt-1 text-textSecondary"></select>
        </label>
        <label class="block">
          <span class="label">District</span>
          <select data-loc-district class="placeholder-select w-full border border-neutral-200 rounded-lg px-3 h-12 mt-1 text-textSecondary"></select>
        </label>
        <button type="submit" class="btn btn--primary btn--md mt-2 w-full justify-center">Confirm Location</button>
      </form>
    </div>

    <!-- Review bottom sheet — opened only by the gated "Leave a review" button on product pages -->
    <div data-sheet="review" class="bottom-sheet">
      <div class="mx-auto w-10 h-1 rounded-full bg-neutral-200 mb-4 md:hidden"></div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-textSecondary text-lg">Write a Review</h2>
        <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
      </div>
      <form data-review-form class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <span class="label">Your rating</span>
          <div class="flex items-center gap-1" data-review-stars>
            ${[1, 2, 3, 4, 5]
              .map(
                (n) =>
                  `<button type="button" data-review-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}" class="review-star text-gray-300 hover:text-cta transition-colors"><svg viewBox="0 0 24 24" class="w-7 h-7 fill-current"><path d="M12 2l2.9 6.26L21.6 9.27l-4.8 4.68 1.13 6.6L12 17.77l-5.93 3.12 1.13-6.6-4.8-4.68 6.7-1.01L12 2z"/></svg></button>`,
              )
              .join("")}
          </div>
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="label">Your review</span>
          <textarea rows="4" required placeholder="Tell others what you loved about it…" class="w-full text-sm text-textSecondary outline-none bg-white border border-neutral-200 rounded-lg p-3 resize-none placeholder:text-customGrayMedium"></textarea>
        </label>
        <button type="submit" class="btn btn--primary btn--md w-full justify-center">Submit Review</button>
      </form>
    </div>

    <!-- Floating cart — sticks directly under the category bar once scrolled.
         Same component as the header cart, colours inverted (Figma 6508:49209):
         pink chip + dark badge, against the header's dark chip + pink badge. -->
    <button type="button" data-open="cart" data-floating-cart aria-label="Cart" class="floating-cart fixed top-[100px] z-[80] grid place-items-center size-[40px] rounded-[12px] bg-cta shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <img src="images/icons/shopping-basket.svg" alt="" width="30" height="30" />
      <span class="absolute -top-[5px] -end-[10px] grid place-items-center bg-primaryDark border border-primary-200 text-white text-[16px] font-semibold leading-[1.4] rounded-full size-[22px]" data-cart-count>4</span>
    </button>

    <!-- Sticky WhatsApp. Number is Exception's own published one. Shares the
         floating cart's inset so the two fixed actions sit on one vertical
         line, and sits at z 75: above the mobile checkout bar (70) but under
         the overlay backdrop (90), so opening a drawer still dims it. -->
    <a href="https://wa.me/201099335774" target="_blank" rel="noopener noreferrer" class="wa-fab" aria-label="Chat with us on WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    </a>`;
  }

  /* ---------------------------------------------------------------
     Overlay open/close plumbing
     --------------------------------------------------------------- */
  const openMap = {
    cart: '[data-drawer="cart"]',
    menu: '[data-drawer="menu"]',
    search: '[data-modal="search"]',
    location: '[data-sheet="location"]',
    review: '[data-sheet="review"]',
    storepicker: '[data-modal="storepicker"]',
    schedule: '[data-modal="schedule"]',
    voucher: '[data-modal="voucher"]',
    redeem: '[data-modal="redeem"]',
    address: '[data-modal="address"]',
    welcome: '[data-modal="welcome"]',
    /* Rendered by the product page, not by this shell — both are PDP-only and
       would be dead markup on the other 30 pages. Listing them here is all
       they need to join the shared open/close/backdrop/Esc plumbing. */
    addons: '[data-modal="addons"]',
    share: '[data-modal="share"]',
    cakeshare: '[data-modal="cakeshare"]',
  };
  let openEl = null;

  function openOverlay(key) {
    const sel = openMap[key];
    if (!sel) return;
    const el = document.querySelector(sel);
    const backdrop = document.querySelector("[data-backdrop]");
    if (!el) return;
    openEl = el;
    el.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    document.body.classList.add("no-scroll");
    const input = el.querySelector("[data-search-input]");
    if (input) setTimeout(() => input.focus(), 80);
  }

  function closeOverlay() {
    /* Captured before the class is stripped: closing the onboarding shell
       without having resolved an area falls through to the manual picker. */
    const wasWelcome = !!(openEl && openEl.matches('[data-modal="welcome"]'));
    document
      .querySelectorAll(".side-drawer.is-open, .modal-shell.is-open, .bottom-sheet.is-open")
      .forEach((el) => el.classList.remove("is-open"));
    const backdrop = document.querySelector("[data-backdrop]");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    openEl = null;
    /* Any close path out of the first-visit gate (backdrop, Esc, X, "not
       now") counts as "didn't choose" → fall back to the default area. A
       confirmed pick calls commitLocation() first, which clears the gate
       flag, so this can't overwrite a real choice. */
    dismissLocationGate();
    if (wasWelcome && !storedLocation()) setTimeout(openLocationGate, 0);
  }

  /* ---------------------------------------------------------------
     Delivery location — the catalogue is inventory-scoped per area, so
     the first visit must resolve to *some* area before browsing. The
     picker opens over a dimmed page; dismissing it silently accepts
     DEFAULT_LOCATION. The pick is remembered so the gate is one-time.
     --------------------------------------------------------------- */
  const LOCATION_KEY = "ex-location";
  const DEFAULT_LOCATION = "Maadi, Cairo";

  function storedLocation() {
    try {
      return localStorage.getItem(LOCATION_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function paintLocation(place) {
    document
      .querySelectorAll("[data-loc-place]")
      .forEach((el) => (el.textContent = "| " + place));
  }

  /* Persist + reflect a resolved area, and drop the gate. */
  function commitLocation(place) {
    document.body.classList.remove("loc-gate");
    try {
      localStorage.setItem(LOCATION_KEY, place);
    } catch (e) {
      /* private mode — the pick just won't survive a reload */
    }
    paintLocation(place);
  }

  /* Close the gate without a choice → default area. No-op otherwise. */
  function dismissLocationGate() {
    if (!document.body.classList.contains("loc-gate")) return;
    document
      .querySelectorAll("[data-locmenu].is-open")
      .forEach((w) => w.classList.remove("is-open"));
    const backdrop = document.querySelector("[data-backdrop]");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    commitLocation(DEFAULT_LOCATION);
  }

  /* The manual picker: header dropdown on desktop, bottom sheet on mobile.
     Shared by the first-visit gate and by every "choose manually" exit out
     of the onboarding flow below. */
  function openLocationGate() {
    document.body.classList.add("loc-gate");
    const wrap = document.querySelector("[data-locmenu]");
    if (wrap && window.matchMedia("(min-width: 768px)").matches) {
      wrap.classList.add("is-open");
      const backdrop = document.querySelector("[data-backdrop]");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.classList.add("no-scroll");
    } else {
      openOverlay("location"); // mobile: the bottom sheet, already above the backdrop
    }
  }

  /* ---------------------------------------------------------------
     First-visit onboarding — notifications, then automatic area
     detection.

     The two prompts are presented as one flow because that is how it
     reads to a visitor, but they are separate browser permissions:
     granting notifications tells us nothing about where someone is, so
     geolocation still raises its own prompt. Every failure path (either
     permission denied, no geolocation, timeout, outside our delivery
     range) lands on the manual picker, so an area is always resolved.

     Detection snaps the device coordinates to the nearest serviceable
     area rather than calling a reverse-geocoding service: no API key, no
     third-party request, and the answer is always an area we actually
     deliver to — which is the only thing the catalogue can be scoped by.
     --------------------------------------------------------------- */
  const AREA_KEY = "ex-area";
  const BRANCH_KEY = "ex-branch";
  const SERVICE_RADIUS_KM = 25;

  /* Exception's real branch network, scraped from the branch list on
     exception-group.com and resolved through each branch's own Google
     Maps link (the short links redirect to a place whose !3d/!4d pair is
     the authoritative coordinate). 28 branches across Cairo, Giza and
     Fayoum — the company has no Alexandria branch.

     Matching runs against BRANCHES, not against area centroids: stock is
     held per branch, so the branch a visitor is closest to is the thing
     that actually determines what can be delivered. The area shown in the
     picker is then read off that branch. */
  /* `busy` marks a branch the kitchen has flagged as under pressure. In
     production the backend sets it (per branch, live); here a few are
     pre-marked so the rush-hour delivery note can be demonstrated. It only
     ever softens an expectation — nothing is blocked by it.

     `addr` is a human-readable street line, needed where an area holds
     several branches (Maadi has three, Hadayek El Ahram three) and the area
     name alone can't tell them apart. PLACEHOLDER STREET LINES — plausible
     for each area but NOT verified against the real stores; the lat/lng are
     the surveyed values and remain the source of truth for directions.
     Add a `phone` here when per-branch numbers exist; until then every
     branch shows the real 16689 hotline. */
  const BRANCHES = [
    // ---- Cairo ----
    { name: "Nasr City", ar: "مدينة نصر", city: "Cairo", area: "Nasr City", addr: "Abbas El Akkad St, Nasr City", busy: true, lat: 30.0444517, lng: 31.3395126 },
    { name: "Gesr El Suez", ar: "جسر السويس", city: "Cairo", area: "Gesr El Suez", addr: "Gesr El Suez Rd, El Amiriya", lat: 30.1430239, lng: 31.4044377 },
    { name: "Madinaty", ar: "مدينتي", city: "Cairo", area: "Madinaty", addr: "Craft Zone, Madinaty", lat: 30.0900938, lng: 31.6416597 },
    { name: "Maadi El Laselky", ar: "المعادي الاسلكي", city: "Cairo", area: "Maadi", addr: "El Laselky St, New Maadi", lat: 29.9737016, lng: 31.2806005 },
    { name: "Bitasho — Zahraa El Maadi", ar: "بيتشو زهراء المعادي", city: "Cairo", area: "Maadi", addr: "Bitasho Mall, Zahraa El Maadi", lat: 29.969111, lng: 31.329472 },
    { name: "Ring Road — Maadi", ar: "دائري المعادي", city: "Cairo", area: "Maadi", addr: "Ring Rd, Kotsika, Maadi", lat: 29.9865319, lng: 31.3084817 },
    { name: "Mokattam", ar: "المقطم", city: "Cairo", area: "Mokattam", addr: "Street 9, Mokattam", lat: 30.0158428, lng: 31.2808804 },
    { name: "Fifth Settlement", ar: "التجمع الخامس", city: "Cairo", area: "New Cairo", addr: "South Teseen St, Fifth Settlement", busy: true, lat: 29.9965936, lng: 31.420283 },
    { name: "Ninetieth Street", ar: "التجمع التسعين", city: "Cairo", area: "New Cairo", addr: "North Teseen St, New Cairo", lat: 30.0210596, lng: 31.4343541 },
    { name: "Mohamed Naguib", ar: "محمد نجيب", city: "Cairo", area: "New Cairo", addr: "Mohamed Naguib Axis, New Cairo", lat: 29.9755148, lng: 31.4701463 },
    { name: "Masr El Gedida", ar: "مصر الجديدة", city: "Cairo", area: "Heliopolis", addr: "El Higaz St, Masr El Gedida", lat: 30.1107628, lng: 31.3450177 },
    { name: "El Nozha", ar: "النزهة", city: "Cairo", area: "Heliopolis", addr: "El Nozha St, Heliopolis", lat: 30.0900009, lng: 31.3418913 },
    { name: "Obour City", ar: "مدينة العبور", city: "Cairo", area: "Obour City", addr: "Golf City, Obour", lat: 30.1788257, lng: 31.4728002 },
    // ---- Giza ----
    { name: "Mohandessin", ar: "المهندسين", city: "Giza", area: "Mohandessin", addr: "Gamet El Dowal El Arabeya St, Mohandessin", busy: true, lat: 30.0525021, lng: 31.1955117 },
    { name: "Faisal", ar: "فيصل", city: "Giza", area: "Faisal", addr: "Faisal Main St, Giza", lat: 30.0016073, lng: 31.1677954 },
    { name: "Sahl Hamza", ar: "سهل حمزة", city: "Giza", area: "Haram", addr: "Sahl Hamza, Haram", lat: 29.9922453, lng: 31.155171 },
    { name: "El Mansoureya", ar: "المنصورية", city: "Giza", area: "Haram", addr: "El Mansoureya Rd, Haram", lat: 29.9870712, lng: 31.1415566 },
    { name: "Tersa", ar: "ترسا", city: "Giza", area: "Haram", addr: "Tersa St, Haram", lat: 29.9940063, lng: 31.1730213 },
    { name: "Hadayek El Ahram — Gate A", ar: "حدائق الأهرام ا", city: "Giza", area: "Hadayek El Ahram", addr: "Gate A, Hadayek El Ahram", lat: 29.9812693, lng: 31.10878 },
    { name: "Hadayek El Ahram — Gate N", ar: "حدائق الأهرام ن", city: "Giza", area: "Hadayek El Ahram", addr: "Gate N, Hadayek El Ahram", lat: 29.9574127, lng: 31.08931 },
    { name: "Hadayek El Ahram — Gate S", ar: "حدائق الأهرام س", city: "Giza", area: "Hadayek El Ahram", addr: "Gate S, Hadayek El Ahram", lat: 29.9530873, lng: 31.0965007 },
    { name: "October — El Hosary", ar: "اكتوبر الحصري", city: "Giza", area: "6th of October", addr: "El Hosary Square, 6th of October", lat: 29.9783935, lng: 30.9469547 },
    { name: "West Sumed", ar: "غرب سوميد", city: "Giza", area: "6th of October", addr: "West Sumed, 6th of October", lat: 29.9827653, lng: 30.95296 },
    { name: "Gamal Axis", ar: "محور جمال", city: "Giza", area: "6th of October", addr: "Gamal Abdel Nasser Axis, 6th of October", lat: 29.9912966, lng: 30.9454978 },
    { name: "Hadayek October", ar: "حدائق أكتوبر", city: "Giza", area: "6th of October", addr: "Hadayek October, 6th of October", lat: 29.9304775, lng: 31.0436434 },
    { name: "Sheikh Zayed", ar: "زايد", city: "Giza", area: "Sheikh Zayed", addr: "Zayed 2000 St, Sheikh Zayed", lat: 30.0351359, lng: 30.9675977 },
    { name: "Smart Village", ar: "القرية الذكية", city: "Giza", area: "Smart Village", addr: "Smart Village, Cairo–Alex Desert Rd", lat: 30.0723333, lng: 31.0232222 },
    // ---- Fayoum ----
    { name: "Fayoum", ar: "الفيوم", city: "Fayoum", area: "Fayoum", addr: "Gomhoreya St, Fayoum", lat: 29.3124599, lng: 30.8515567 },
  ];
  /* Published for pages that need the branch list themselves (branches.html
     draws them on a map). One source of truth — the nearest-branch matcher,
     the store picker and the map all read this same array, so a new branch
     appears everywhere at once. */
  window.EXCEPTION_BRANCHES = BRANCHES;

  /* Sub-districts, only where the area genuinely has them. Areas absent
     from this map hide the District field rather than inventing one. */
  const AREA_DISTRICTS = {
    "Cairo|Maadi": ["Degla", "Sarayat El Maadi", "New Maadi", "Zahraa El Maadi", "El Laselky"],
    "Cairo|New Cairo": ["First Settlement", "Third Settlement", "Fifth Settlement", "Ninetieth Street", "Katameya"],
    "Cairo|Nasr City": ["First District", "Sixth District", "Seventh District", "Eighth District", "Tenth District", "Zahraa Nasr City"],
    "Cairo|Heliopolis": ["Korba", "Roxy", "Almaza", "El Nozha", "Triumph"],
    "Cairo|Mokattam": ["Hadaba Wosta", "Hadaba Olya"],
    "Giza|6th of October": ["First District", "Third District", "Seventh District", "El Hosary", "Central Axis", "Hadayek October"],
    "Giza|Sheikh Zayed": ["First Neighbourhood", "Third Neighbourhood", "Seventh Neighbourhood", "Beverly Hills"],
    "Giza|Hadayek El Ahram": ["Gate A (Khufu)", "Gate N (Mina)", "Gate S (Horus)"],
    "Giza|Haram": ["Sahl Hamza", "El Mansoureya", "Tersa", "Kom El Akhdar"],
  };

  /* City -> areas, derived from where branches actually are, so the picker
     can never offer an area nothing can be delivered from. */
  const EG_GEO = BRANCHES.reduce((map, b) => {
    (map[b.city] = map[b.city] || {})[b.area] = true;
    return map;
  }, {});

  /* A branch's catchment. Beyond this from EVERY branch we say we don't
     deliver, rather than snapping to something implausibly far away. */
  const BRANCH_RADIUS_KM = 20;

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /* Closest branch to a fix, with its distance. Straight-line: good enough
     to rank branches, and it never fails or costs a request the way a
     routing/distance-matrix call would. */
  function nearestBranch(lat, lng) {
    let best = null, bestKm = Infinity;
    BRANCHES.forEach((b) => {
      const km = haversineKm(lat, lng, b.lat, b.lng);
      if (km < bestKm) { bestKm = km; best = b; }
    });
    if (!best || bestKm > BRANCH_RADIUS_KM) return null;
    return { branch: best, km: bestKm, city: best.city, area: best.area };
  }

  /* Fill one picker's three selects and keep them cascading: city -> its
     areas -> that area's sub-districts. Areas with no real sub-division
     hide the District select rather than inventing "First/Second/Third".

     Native <select>s here are replaced by the custom ui-select widget,
     which renders its own trigger from the options it saw at init, so
     every repopulation re-syncs it through the hook it exposes. */
  function fillLocationSelects(form, sel) {
    const citySel = form.querySelector("[data-loc-city]");
    const areaSel = form.querySelector("[data-loc-area]");
    const distSel = form.querySelector("[data-loc-district]");
    if (!citySel || !areaSel || !distSel) return;
    const want = sel || {};
    const opts = (el, list, chosen) => {
      el.innerHTML = list.map((v) => "<option" + (v === chosen ? " selected" : "") + ">" + v + "</option>").join("");
      if (typeof el._uiSelectRefresh === "function") el._uiSelectRefresh();
    };

    const cities = Object.keys(EG_GEO);
    const city = cities.indexOf(want.city) > -1 ? want.city : citySel.value || cities[0];
    opts(citySel, cities, city);

    const areas = Object.keys(EG_GEO[city] || {});
    const area = areas.indexOf(want.area) > -1 ? want.area : areas[0];
    opts(areaSel, areas, area);

    const districts = AREA_DISTRICTS[city + "|" + area] || [];
    const lbl = distSel.closest("label");
    if (districts.length) {
      opts(distSel, districts, want.district);
      distSel.disabled = false;
      if (lbl) lbl.hidden = false;
    } else {
      opts(distSel, [], null);
      distSel.disabled = true;
      if (lbl) lbl.hidden = true;
    }
  }

  /* Every picker on the page (desktop dropdown + mobile sheet). */
  function fillAllLocationSelects(sel) {
    document.querySelectorAll("[data-location-form]").forEach((f) => fillLocationSelects(f, sel));
  }

  function initLocationSelects() {
    document.querySelectorAll("[data-location-form]").forEach((f) => {
      fillLocationSelects(f);
      f.addEventListener("change", (e) => {
        const t = e.target;
        if (t.matches("[data-loc-city]")) fillLocationSelects(f, { city: t.value });
        else if (t.matches("[data-loc-area]"))
          fillLocationSelects(f, { city: f.querySelector("[data-loc-city]").value, area: t.value });
      });
    });
  }

  /* Every real branch serving an area, nearest-first is not meaningful
     here (no fix), so declaration order stands. */
  function branchFor(city, area) {
    const hit = BRANCHES.filter((b) => b.city === city && b.area === area);
    return hit.length ? hit[0].name : "";
  }

  /* Resolve an area: persist it, paint the header, and announce it so
     inventory-scoped views can requery. This is the single place the rest
     of the app should read the delivery area from. */
  function commitArea(entry) {
    document.body.dataset.area = entry.area;
    /* The branch is the unit stock is held in, so it travels with the
       area. Manual picks resolve it from the area instead of from a fix. */
    const branch = entry.branch || BRANCHES.filter((b) => b.city === entry.city && b.area === entry.area)[0];
    if (branch) {
      document.body.dataset.branch = branch.name;
      try { localStorage.setItem(BRANCH_KEY, branch.name); } catch (e) {}
    }
    try {
      localStorage.setItem(AREA_KEY, entry.area + "|" + entry.city);
    } catch (e) {}
    commitLocation(entry.area + ", " + entry.city);
    document.dispatchEvent(
      new CustomEvent("ex:area-change", {
        detail: { area: entry.area, city: entry.city, branch: branch ? branch.name : "" },
      })
    );
  }

  function initOnboarding() {
    const qs = window.location.search;
    const force = /[?&](welcome|loc)=1\b/.test(qs);
    if (force) {
      try {
        localStorage.removeItem(LOCATION_KEY);
        localStorage.removeItem(AREA_KEY);
        localStorage.removeItem(BRANCH_KEY);
      } catch (e) {}
    }
    const saved = force ? "" : storedLocation();
    if (saved) {
      paintLocation(saved);
      try {
        const a = (localStorage.getItem(AREA_KEY) || "").split("|")[0];
        if (a) document.body.dataset.area = a;
        const b = localStorage.getItem(BRANCH_KEY);
        if (b) document.body.dataset.branch = b;
      } catch (e) {}
      return;
    }
    paintLocation(DEFAULT_LOCATION);
    // Checkout runs the minimal header — no location control to anchor to.
    if (document.body.dataset.page === "checkout") return;

    const modal = document.querySelector('[data-modal="welcome"]');
    // No prompt shell on this page -> the plain manual gate still runs.
    if (!modal) { setTimeout(openLocationGate, 400); return; }

    const allowBtn = modal.querySelector("[data-wc-allow]");
    const note = modal.querySelector("[data-wc-note]");

    /* Hand off to the picker, pre-selecting `sel` when we resolved one.
       Deferred a tick: the click that got us here still has to bubble to
       the document-level "clicked outside a menu" handler, which would
       otherwise strip .is-open straight back off the picker. */
    function toPicker(sel, msg) {
      closeOverlay();
      setTimeout(() => {
        fillAllLocationSelects(sel || {});
        openLocationGate();
        if (msg) {
          document.querySelectorAll("[data-loc-hint]").forEach((el) => {
            el.textContent = msg;
            el.hidden = false;
          });
        }
      }, 0);
    }

    function detect() {
      allowBtn.disabled = true;
      allowBtn.textContent = "Finding your area\u2026";
      if (!navigator.geolocation) return toPicker(null, "This browser can\u2019t share a location \u2014 pick your area below.");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const hit = nearestBranch(pos.coords.latitude, pos.coords.longitude);
          if (!hit) {
            return toPicker(null, "You\u2019re outside every branch\u2019s delivery range \u2014 pick an area below to browse.");
          }
          /* Resolve straight away so the header and anything inventory-
             scoped update, then open the picker on that area so the choice
             is visible and correctable in one click. */
          commitArea(hit);
          const km = hit.km < 1 ? Math.round(hit.km * 1000) + " m" : hit.km.toFixed(1) + " km";
          toPicker(hit, "Nearest branch: Exception " + hit.branch.name + " (" + km + " away). Change it if that\u2019s not right.");
        },
        (err) => {
          const msg =
            err && err.code === 1
              ? "Location is off \u2014 pick your area below and we\u2019ll remember it."
              : "Couldn\u2019t get a location \u2014 pick your area below.";
          toPicker(null, msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }

    allowBtn.addEventListener("click", detect);
    modal.querySelector("[data-wc-skip]").addEventListener("click", () => toPicker(null, ""));

    setTimeout(() => openOverlay("welcome"), 400);
  }

  /* ---------------------------------------------------------------
     Fly-to-cart — a liquid pink dot arcs from the add button into the
     visible cart button, then the cart badge bumps. Replaces the toast.
     --------------------------------------------------------------- */
  function visibleCart() {
    const fc = document.querySelector("[data-floating-cart]");
    if (fc && fc.classList.contains("is-visible")) return fc;
    const carts = [...document.querySelectorAll('[data-open="cart"]')];
    const onScreen = carts.find((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    });
    return onScreen || fc || carts[0] || null;
  }

  function flyToCart(srcRect, onArrive) {
    const cart = visibleCart();
    if (!srcRect || !cart) {
      if (onArrive) onArrive();
      return;
    }
    const t = cart.getBoundingClientRect();
    const sx = srcRect.left + srcRect.width / 2;
    const sy = srcRect.top + srcRect.height / 2;
    const ex = t.left + t.width / 2;
    const ey = t.top + t.height / 2;
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.left = sx + "px";
    dot.style.top = sy + "px";
    document.body.appendChild(dot);
    const midX = (sx + ex) / 2 - sx;
    const midY = Math.min(sy, ey) - 90 - sy; // arc upward
    const anim = dot.animate(
      [
        { transform: "translate(-50%,-50%) translate(0,0) scale(1)", borderRadius: "50% 50% 50% 50%", opacity: 1, offset: 0 },
        { transform: `translate(-50%,-50%) translate(${midX}px,${midY}px) scale(1.35)`, borderRadius: "60% 40% 55% 45%", opacity: 1, offset: 0.5 },
        { transform: `translate(-50%,-50%) translate(${ex - sx}px,${ey - sy}px) scale(0.35)`, borderRadius: "50%", opacity: 0.5, offset: 1 },
      ],
      { duration: 750, easing: "cubic-bezier(0.5,0,0.35,1)" },
    );
    anim.onfinish = () => {
      dot.remove();
      cart.classList.remove("cart-bump");
      void cart.offsetWidth; // restart animation
      cart.classList.add("cart-bump");
      if (onArrive) onArrive();
    };
  }

  /* ---------------------------------------------------------------
     Carousel (Swiper replacement)
     --------------------------------------------------------------- */
  function initCarousel(root) {
    const track = root.querySelector(".carousel-track");
    if (!track) return;
    const prev = root.querySelector(".carousel-prev");
    const next = root.querySelector(".carousel-next");
    const dotsWrap = root.querySelector(".carousel-dots");
    const loop = root.hasAttribute("data-loop");
    const maxScroll = () => track.scrollWidth - track.clientWidth - 1;

    function slideStep() {
      const first = track.querySelector(".carousel-slide");
      if (!first) return track.clientWidth;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
      return first.getBoundingClientRect().width + gap;
    }

    const fadeStart = root.querySelector('[data-fade="start"]');
    const fadeEnd = root.querySelector('[data-fade="end"]');
    const alignArrows = root.hasAttribute("data-align-arrows");

    // Center the prev/next arrows on the product IMAGE (top square), not the
    // full card height which also includes price + title below the image.
    function positionArrows() {
      if (!alignArrows || (!prev && !next)) return;
      const slide = track.querySelector(".carousel-slide");
      const imgBox = slide && (slide.querySelector(".aspect-square") || slide.querySelector("img"));
      if (!imgBox) return;
      const rr = root.getBoundingClientRect();
      const ir = imgBox.getBoundingClientRect();
      const top = Math.round(ir.top - rr.top + ir.height / 2) + "px";
      if (prev) prev.style.top = top;
      if (next) next.style.top = top;
    }

    function update() {
      const max = maxScroll();
      // A looping carousel never disables its arrows.
      if (prev) prev.classList.toggle("is-disabled", !loop && track.scrollLeft <= 1);
      if (next) next.classList.toggle("is-disabled", !loop && track.scrollLeft >= max);
      // Edge fades hint at more products: show on a side only when it overflows.
      const pos = Math.abs(track.scrollLeft);
      if (fadeStart) fadeStart.style.opacity = pos > 2 ? "1" : "0";
      if (fadeEnd) fadeEnd.style.opacity = max > 0 && pos < max - 2 ? "1" : "0";
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll(".carousel-dot");
        const idx = Math.round(track.scrollLeft / slideStep());
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
      }
    }

    if (prev)
      prev.addEventListener("click", () => {
        if (loop && track.scrollLeft <= 1) track.scrollLeft = maxScroll() + 2;
        else track.scrollLeft -= slideStep();
      });
    if (next)
      next.addEventListener("click", () => {
        if (loop && track.scrollLeft >= maxScroll()) track.scrollLeft = 0;
        else track.scrollLeft += slideStep();
      });

    if (dotsWrap) {
      const slides = track.querySelectorAll(".carousel-slide");
      const perView = Math.max(1, Math.round(track.clientWidth / slideStep()));
      const pages = Math.max(1, slides.length - perView + 1);
      dotsWrap.innerHTML = "";
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        dot.addEventListener("click", () => (track.scrollLeft = i * slideStep()));
        dotsWrap.appendChild(dot);
      }
    }

    track.addEventListener("scroll", () => window.requestAnimationFrame(update));
    window.addEventListener("resize", () => {
      update();
      positionArrows();
    });
    update();
    positionArrows();
    // Re-align once product images settle, in case layout shifts on load.
    window.addEventListener("load", positionArrows);

    if (root.hasAttribute("data-autoplay")) {
      setInterval(() => {
        const max = track.scrollWidth - track.clientWidth - 1;
        if (track.scrollLeft >= max) track.scrollLeft = 0;
        else track.scrollLeft += slideStep();
      }, 4500);
    }
  }

  /* ---------------------------------------------------------------
     Accordion / tabs / steppers / forms
     --------------------------------------------------------------- */
  function initAccordions(scope) {
    scope.querySelectorAll("[data-accordion]").forEach((acc) => {
      acc.querySelectorAll(".accordion-item").forEach((item) => {
        const btn = item.querySelector(".accordion-trigger");
        if (!btn) return;
        btn.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          if (!acc.hasAttribute("data-accordion-multi")) {
            acc
              .querySelectorAll(".accordion-item.is-open")
              .forEach((o) => o.classList.remove("is-open"));
          }
          item.classList.toggle("is-open", !isOpen);
        });
      });
    });
  }

  function initTabs(scope) {
    scope.querySelectorAll("[data-tabs]").forEach((tabs) => {
      const btns = tabs.querySelectorAll(".tab-btn");
      const panels = tabs.querySelectorAll(".tab-panel");
      btns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab");
          btns.forEach((b) =>
            b.classList.toggle("is-active", b === btn),
          );
          panels.forEach((p) =>
            p.toggleAttribute("hidden", p.getAttribute("data-panel") !== target),
          );
        });
      });
    });
  }

  function initSegmented(scope) {
    scope.querySelectorAll("[data-segmented]").forEach((seg) => {
      const thumb = seg.querySelector(".segmented__thumb");
      if (!thumb || seg.dataset.segReady) return;
      seg.dataset.segReady = "1";
      /* Direct-child buttons, not .tab-btn — the FAQ tabs and the media-center
         filters use their own class names but are the same control. */
      const btns = seg.querySelectorAll(":scope > button");
      const activeBtn = () => seg.querySelector(":scope > button.is-active") || btns[0];
      const place = (btn, animate) => {
        if (!btn) return;
        if (!animate) seg.classList.add("is-init");
        thumb.style.width = btn.offsetWidth + "px";
        thumb.style.transform = "translateX(" + btn.offsetLeft + "px)";
        seg.classList.add("is-ready");
        if (!animate) {
          void thumb.offsetWidth; /* reflow so the next click animates */
          seg.classList.remove("is-init");
        }
      };
      btns.forEach((b) => b.addEventListener("click", () => place(b, true)));
      place(activeBtn(), false);
      let raf;
      window.addEventListener("resize", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => place(activeBtn(), false));
      });
    });
  }

  /* Gooey product tabs — slides the grey-05 "thumb" to the active tab
     (it liquid-merges into the panel via #goo-tabs) and swaps the crisp
     content panel with a blur/slide-in. Vanilla port of the shadcn goo
     tabs; markup = [data-goo-tabs] > [data-goo-thumb] + [data-goo-tab] +
     [data-goo-content]. */
  function initGooTabs(scope) {
    scope.querySelectorAll("[data-goo-tabs]").forEach((root) => {
      if (root.dataset.gooReady) return;
      root.dataset.gooReady = "1";
      const thumb = root.querySelector("[data-goo-thumb]");
      const tabs = [...root.querySelectorAll("[data-goo-tab]")];
      const panels = [...root.querySelectorAll("[data-goo-content]")];
      if (!thumb || !tabs.length) return;
      const place = (btn, animate) => {
        if (!btn) return;
        if (!animate) thumb.style.transition = "none";
        thumb.style.width = btn.offsetWidth + "px";
        thumb.style.transform = "translateX(" + btn.offsetLeft + "px)";
        if (!animate) {
          void thumb.offsetWidth; /* reflow so the next slide animates */
          thumb.style.transition = "";
        }
      };
      const activate = (key, animate) => {
        const btn =
          tabs.find((t) => t.getAttribute("data-goo-tab") === key) || tabs[0];
        tabs.forEach((t) => t.classList.toggle("is-active", t === btn));
        place(btn, animate);
        panels.forEach((p) => {
          const on = p.getAttribute("data-goo-content") === key;
          p.toggleAttribute("hidden", !on);
          if (on && animate) {
            p.style.animation = "none";
            void p.offsetWidth; /* replay the blur/slide-in */
            p.style.animation = "";
          }
        });
      };
      tabs.forEach((t) =>
        t.addEventListener("click", () =>
          activate(t.getAttribute("data-goo-tab"), true),
        ),
      );
      const initKey = (
        root.querySelector("[data-goo-tab].is-active") || tabs[0]
      ).getAttribute("data-goo-tab");
      activate(initKey, false);
      const reposition = () =>
        place(root.querySelector("[data-goo-tab].is-active") || tabs[0], false);
      let raf;
      window.addEventListener("resize", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(reposition);
      });
      // Re-measure once the web font has loaded (tab widths shift otherwise).
      window.addEventListener("load", reposition);
      setTimeout(reposition, 300);
      if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(reposition);
    });
  }

  /* Decrement-button glyphs for removable counters (cart / cart summary):
     qty 1 shows a trash (remove) icon, qty ≥ 2 shows a minus. */
  const STEP_ICON_MINUS =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const STEP_ICON_TRASH =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------------------------------------------------------------
     Delivery note — THE single delivery/ETA bar for the whole site.
     Rendered from here so editing this one function (or .delivery-note
     in styles.css) updates every page at once. Never hand-write the
     markup again; drop a placeholder instead:

       <div data-delivery-note></div>
       <div data-delivery-note data-lead="Delivery within 1 hour"
            data-place="New Cairo, 5th Settlement" data-edit="false"></div>

     data-lead  → lead text        (default "Order now")
     data-place → location         (default DELIVERY_PLACE)
     data-edit  → "false" hides the Edit button (default: shown)
     Classes on the placeholder are KEPT, so pages can still pass layout
     utilities (mt-4, etc.); .delivery-note is added to it.
     --------------------------------------------------------------- */
  const DELIVERY_PLACE = "Maadi, Cairo";
  function deliveryNoteHTML(o) {
    o = o || {};
    const lead = o.lead || "Order now";
    const place = o.place || DELIVERY_PLACE;
    const edit = o.edit !== false;
    return `
      <span class="delivery-note__main">
        <span class="delivery-note__icon"><img src="images/icons/delivery.webp" alt="" /></span>
        <span class="delivery-note__text">${esc(lead)} | <span class="delivery-note__place">${esc(place)}</span></span>
      </span>
      ${edit ? `<button type="button" data-open="location" class="btn btn--secondary btn--sm shrink-0">Edit</button>` : ""}`;
  }
  function initDeliveryNote(scope) {
    scope.querySelectorAll("[data-delivery-note]").forEach((el) => {
      if (el.dataset.dnReady) return;
      el.dataset.dnReady = "1";
      el.classList.add("delivery-note");
      el.innerHTML = deliveryNoteHTML({
        lead: el.dataset.lead,
        place: el.dataset.place,
        edit: el.dataset.edit !== "false",
      });
    });
  }

  /* ---------------------------------------------------------------
     Product callouts — the three trust badges under the PDP price
     (Freshly Baked / Fast Delivery / Natural Ingredients). This is
     the PDP's replacement for the single .delivery-note bar; cart
     and checkout still use .delivery-note. Drop a placeholder:

       <div data-pdp-callouts></div>
       <div data-pdp-callouts data-place="New Cairo" data-eta="90 mins"></div>

     data-place → delivery location (default DELIVERY_PLACE)
     data-eta   → delivery window   (default DELIVERY_ETA)
     Classes on the placeholder are KEPT; .pdp-callouts is added.
     --------------------------------------------------------------- */
  const DELIVERY_ETA = "60 mins";
  /* action → optional trailing control (e.g. the Edit button), rendered as
     its own flex child so CSS can pin it to the end of the box instead of
     running it inline after the subtitle text. */
  function calloutHTML(variant, icon, title, sub, action) {
    return `
      <div class="callout callout--${variant}">
        <span class="callout__icon"><img src="images/icons/${icon}.webp" alt="" /></span>
        <span class="callout__body">
          <span class="callout__title">${title}</span>
          <span class="callout__sub">${sub}</span>
        </span>
        ${action ? `<span class="callout__action">${action}</span>` : ""}
      </div>`;
  }
  /* The shipping callout on its own — shared by the PDP's three-badge set
     and by any page that wants just this one (cart summary uses it in
     place of the older .delivery-note bar). Defined once so the copy,
     icon and Edit affordance can't drift between the two. */
  function deliveryCalloutHTML(o) {
    o = o || {};
    const place = o.place || DELIVERY_PLACE;
    const eta = o.eta || DELIVERY_ETA;
    // edit:false drops the trailing Edit control (cart page — the location
    // is edited at checkout, so an Edit here led nowhere useful).
    const edit = o.edit !== false;
    return calloutHTML(
      "delivery",
      "delivery",
      "Fast Delivery",
      `Within ${esc(eta)} to ${esc(place)}`,
      edit ? `<button type="button" data-open="location" class="callout__edit">Edit</button>` : ""
    );
  }
  function pdpCalloutsHTML(o) {
    /* Delivery first: it carries the longest copy (location + Edit) and takes
       the full-width top row, with the other two splitting the row below. */
    return [
      deliveryCalloutHTML(o),
      calloutHTML("baked", "baked-fresh", "Freshly Baked", "Fresh from the oven to you"),
      calloutHTML("natural", "natural-ingredients", "Natural Ingredients", "Guaranteed pure goodness inside"),
    ].join("");
  }
  function initPdpCallouts(scope) {
    scope.querySelectorAll("[data-pdp-callouts]").forEach((el) => {
      if (el.dataset.pcReady) return;
      el.dataset.pcReady = "1";
      el.classList.add("pdp-callouts");
      el.innerHTML = pdpCalloutsHTML({ place: el.dataset.place, eta: el.dataset.eta });
    });
  }
  /* Standalone shipping callout: <div data-shipping-callout></div>
     Reuses the .pdp-callouts wrapper so it inherits the same spacing, and
     .callout--delivery spans the full width when it's the only child. */
  function initShippingCallout(scope) {
    scope.querySelectorAll("[data-shipping-callout]").forEach((el) => {
      if (el.dataset.scReady) return;
      el.dataset.scReady = "1";
      el.classList.add("pdp-callouts");
      el.innerHTML = deliveryCalloutHTML({
        place: el.dataset.place,
        eta: el.dataset.eta,
        edit: el.dataset.edit !== "false",
      });
    });
  }

  /* ---------------------------------------------------------------
     Promo code — one field, "Apply" as an inline link, and a confetti
     celebration on success (modelled on the reference clip). Demo-only
     codes; a real build would validate server-side.
     --------------------------------------------------------------- */
  const PROMO_CODES = {
    SWEET50: { type: "amount", value: 50 },
    EXCEPTION10: { type: "percent", value: 10 },
    WELCOME15: { type: "percent", value: 15 },
  };
  /* Confetti colours — Exception analogues of the reference clip's three
     saturated hues (green / coral / periwinkle). Kept saturated on purpose:
     the pale end of the brand palette (#B0DED9, #EED3B8, #E4BCB5) all but
     disappears against the white cart/checkout page. */
  const FX_COLORS = ["#209B34", "#DB336C", "#8CBAB5"];
  const PROMO_ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PROMO_ICON_X =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const egp = (n) => "EGP " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const parseEGP = (s) => Number(String(s).replace(/[^\d.]/g, "")) || 0;

  /* PROMO PAPER CELEBRATION — matched to the reference clip Mark supplied
     (~/Downloads/original-…mp4, frames studied at 3.5–5.2s). The reference is
     deliberately SPARSE and calm: only a handful of pieces on screen at once,
     mostly thick wavy S-ribbons with round caps, plus the odd tumbling square
     and hollow ring, drifting slowly out and down from the field. No trails —
     the pieces are clean-edged. Keep it restrained: a dense spray of little
     rectangles is NOT what the reference does.
     Plain canvas 2D; self-removes. */
  const PAPER_COUNT = 13;
  // Ribbon-heavy mix, matching the reference's shape ratio.
  const PAPER_SHAPES = ["ribbon", "ribbon", "ribbon", "square", "ribbon", "ring"];
  /* opts lets a caller retune the burst for a different context WITHOUT
     touching the promo defaults above (those are matched to Mark's
     reference clip and should stay put):
       count / spread / speed / speedVar / scale / decay — burst shape
       className — extra class, e.g. to lift the canvas above an overlay */
  /* Exposed so pages can fire the brand confetti themselves (thank-you
     celebration). Same helper the promo-code success uses, so every
     celebratory moment on the site shares one look. */
  function promoPaperBurst(x, y, opts) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    opts = opts || {};
    const count = opts.count || PAPER_COUNT;
    const spread = opts.spread != null ? opts.spread : 190;
    const speedMin = opts.speed != null ? opts.speed : 2.3;
    const speedVar = opts.speedVar != null ? opts.speedVar : 2.5;
    const scale = opts.scale || 1;
    const canvas = document.createElement("canvas");
    canvas.className = "promo-fx" + (opts.className ? " " + opts.className : "");
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const papers = Array.from({ length: count }, (_, i) => {
      // Start across the actual field, then drift up and out in a slow arc.
      const launchX = x + (Math.random() - 0.5) * spread;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = speedMin + Math.random() * speedVar; // slow — the reference floats
      return {
        x: launchX,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.7,
        shape: PAPER_SHAPES[i % PAPER_SHAPES.length],
        // Sized off the reference: a ribbon reads ~15% of the field's width
        // there. At 32–58px they came out about half that and looked timid.
        len: (44 + Math.random() * 30) * scale,
        amp: (9 + Math.random() * 7) * scale, // ribbon wave depth
        s: (7 + Math.random() * 3) * scale, // square / ring size
        lw: (5 + Math.random() * 1.8) * scale, // ribbon stroke weight
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05, // slow tumble, not a flutter
        color: FX_COLORS[i % FX_COLORS.length],
        life: 1,
        decay: opts.decay || 0.0045 + Math.random() * 0.003, // ~2.5–3.7s on screen
      };
    });

    let raf;
    let frame = 0;
    const destroy = () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      window.removeEventListener("resize", size);
      canvas.remove();
    };
    // rAF stalls while the tab is hidden, which would strand the canvas
    // over the page until the user returns. Hard-stop regardless.
    const safety = setTimeout(destroy, 9000);

    const tick = () => {
      frame++;
      // Clear outright — the reference's pieces are clean-edged, no trails.
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let alive = 0;
      papers.forEach((paper) => {
        if (paper.life <= 0) return;
        alive++;
        paper.vy += 0.045; // light gravity — the pieces hang, then settle
        paper.vx *= 0.99;
        paper.vy *= 0.99;
        paper.x += paper.vx;
        paper.y += paper.vy;
        paper.rotation += paper.spin;
        paper.life -= paper.decay;

        ctx.save();
        ctx.translate(paper.x, paper.y);
        ctx.rotate(paper.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, paper.life));
        ctx.fillStyle = paper.color;
        ctx.strokeStyle = paper.color;
        ctx.lineCap = "round";

        if (paper.shape === "ribbon") {
          // Thick wavy S — the reference's signature piece.
          ctx.lineWidth = paper.lw;
          ctx.beginPath();
          ctx.moveTo(0, -paper.len / 2);
          ctx.bezierCurveTo(paper.amp, -paper.len / 6, -paper.amp, paper.len / 6, 0, paper.len / 2);
          ctx.stroke();
        } else if (paper.shape === "ring") {
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, paper.s / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillRect(-paper.s / 2, -paper.s / 2, paper.s, paper.s);
        }
        ctx.restore();
      });

      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
      else destroy();
    };
    window.addEventListener("resize", size);
    raf = requestAnimationFrame(tick);
  }

  /* The discount currently applied, remembered so the cart DRAWER can
     re-apply it whenever its subtotal is recomputed (quantity change,
     row removal) rather than losing it. */
  let promoDiscount = 0;

  /* Drawer totals. Discount + Total stay hidden until a code is applied,
     so the drawer is just "Subtotal" in the normal case. */
  function syncCartDrawerTotals() {
    const drawer = document.querySelector('[data-drawer="cart"]');
    if (!drawer) return;
    const subEl = drawer.querySelector("[data-cart-subtotal]");
    const dRow = drawer.querySelector("[data-cart-discount-row]");
    const dEl = drawer.querySelector("[data-cart-discount]");
    const tRow = drawer.querySelector("[data-cart-total-row]");
    const tEl = drawer.querySelector("[data-cart-total]");
    if (!subEl || !dRow || !tRow) return;
    const show = promoDiscount > 0;
    dRow.hidden = !show;
    tRow.hidden = !show;
    if (show) {
      const sub = parseEGP(subEl.textContent);
      if (dEl) dEl.textContent = "− " + egp(promoDiscount);
      if (tEl) tEl.textContent = egp(Math.max(0, sub - promoDiscount));
    }
  }

  /* THE one source of truth for the page order summary. Promo code and
     wallet balance are two deductions against the SAME total, so neither
     may own a private copy of the arithmetic — each sets its own module
     state and then calls this to recompute every row. No-ops on any page
     without a summary. */
  let walletApplied = 0;
  function syncSummary() {
    const totalEl = document.querySelector("[data-summary-total]");
    const subtotalEl = document.querySelector("[data-summary-subtotal]");
    if (!totalEl || !subtotalEl) return null;
    const deliveryEl = document.querySelector("[data-summary-delivery]");
    const subtotal = parseEGP(subtotalEl.textContent);
    const delivery = deliveryEl ? parseEGP(deliveryEl.textContent) : 0;

    const discountRow = document.querySelector("[data-summary-discount-row]");
    const discountEl = document.querySelector("[data-summary-discount]");
    if (discountRow) discountRow.hidden = promoDiscount <= 0;
    if (discountEl) discountEl.textContent = "− " + egp(promoDiscount);

    /* The wallet spends against what is still owed AFTER the promo, and
       is capped at the bill — so a balance larger than the order can
       never drive the total negative or "refund" the difference. */
    const afterPromo = Math.max(0, subtotal + delivery - promoDiscount);
    const walletUsed = Math.min(walletApplied, afterPromo);
    const walletRow = document.querySelector("[data-summary-wallet-row]");
    const walletEl = document.querySelector("[data-summary-wallet]");
    if (walletRow) walletRow.hidden = walletUsed <= 0;
    if (walletEl) walletEl.textContent = "− " + egp(walletUsed);

    totalEl.textContent = egp(Math.max(0, afterPromo - walletUsed));
    return { afterPromo, walletUsed };
  }

  /* Reflect the applied/removed discount in the page's order summary. */
  function promoSyncSummary(discount) {
    promoDiscount = discount || 0;
    syncCartDrawerTotals(); // drawer exists on every page; page summary may not
    syncSummary();
  }

  /* ---------------------------------------------------------------
     Free-shipping banner — cart drawer only. Sits as its own shrink-0
     strip directly ABOVE the footer (not below the header), so it stays
     next to the checkout CTA it's motivating rather than scrolling away
     with the line items.

     Matched to the Figma pair (Frame 2147227129 / 2147227130): BOTH
     states share the same pink card and only the copy changes —
     "Add {n} EGP and get [FREE DELIVERY]" while short, "[WOW] You
     Unlocked FREE DELIVERY" once reached. The progress bar is not a
     separate widget: it IS the bottom divider between the pink card and
     the white footer below, so the fill doubles as the seam. Turquoise =
     covered, light pink (cta-light) = still to go, so the empty space
     stays inside the pink family instead of reading as a dark rule; at
     100% the seam reads as one solid turquoise rule. Keeping the pink
     card square-cornered lets it sit flush against the footer, and the
     strip is kept short (py-1.5) so it nudges without shouting over the
     checkout CTA below it. Keeping the pink constant means the footer never
     jumps or colour-flashes when the threshold flips — only the bar and
     the words change. Reuses promoPaperBurst() for the celebration so
     cart and promo-code success feel like the same brand moment. */
  const FREE_SHIP_THRESHOLD = 1000;
  function freeShippingHTML(subtotal) {
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100));
    const unlocked = remaining <= 0;
    const chip = (text) =>
      `<span class="inline-flex shrink-0 items-center rounded-[3px] bg-primary-100 px-1.5 py-[3px]"><span class="text-[10px] font-bold text-primaryDark leading-none tracking-[0.2px]">${text}</span></span>`;
    const label = unlocked
      ? `${chip("WOW")}<span class="text-[11px] font-medium text-white leading-none">You Unlocked <span class="font-bold">FREE DELIVERY</span></span>`
      : `<span class="text-[11px] font-medium text-white leading-none">Add <span data-fs-remaining>${Math.ceil(remaining)} EGP</span> and get</span>${chip("FREE DELIVERY")}`;
    return `
      <div class="bg-cta" data-fs-state="${unlocked ? "unlocked" : "progress"}">
        <div class="flex items-center gap-1.5 px-4 py-1.5">${label}</div>
        <div class="h-[5px] w-full bg-cta-light"><div class="h-full bg-primary-200 transition-[width] duration-500 ease-out" style="width:${unlocked ? 100 : pct}%"></div></div>
      </div>`;
  }
  /* Recomputed from the actual cart-row prices/quantities (not the
     cross-sell grid — nothing on this site persists a real "add to
     cart", including the grid's own quick-add, so counting it would
     move the bar without a line item ever appearing above it). Hidden
     entirely once the cart is empty — there's nothing to show progress
     toward. */
  function updateFreeShipping() {
    const drawer = document.querySelector('[data-drawer="cart"]');
    const mount = drawer && drawer.querySelector("[data-free-shipping]");
    if (!drawer || !mount) return;
    const rows = drawer.querySelectorAll("[data-cart-row]");
    let subtotal = 0;
    rows.forEach((row) => {
      const price = parseFloat(row.dataset.unitPrice) || 0;
      const qtyEl = row.querySelector("[data-qty]");
      const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 0 : 0;
      subtotal += price * qty;
    });
    // Update the footer subtotal BEFORE the empty-cart early-return, or an
    // emptied cart keeps showing the last non-zero total.
    const subtotalEl = drawer.querySelector("[data-cart-subtotal]");
    if (subtotalEl) subtotalEl.textContent = egp(subtotal);
    // Re-apply any active promo against the new subtotal.
    syncCartDrawerTotals();

    if (!rows.length) {
      mount.classList.add("hidden");
      mount.innerHTML = "";
      delete mount.dataset.fsUnlocked;
      return;
    }

    mount.classList.remove("hidden");
    const wasUnlocked = mount.dataset.fsUnlocked === "1";
    const isUnlocked = subtotal >= FREE_SHIP_THRESHOLD;
    mount.innerHTML = freeShippingHTML(subtotal);
    mount.dataset.fsUnlocked = isUnlocked ? "1" : "0";
    if (isUnlocked && !wasUnlocked) {
      const r = mount.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      /* Launch from the banner's TOP edge, not its centre: the strip sits
         low in the drawer, so pieces spawned at the middle immediately
         fall off-screen. From the top edge they arc up over the cart. */
      const cy = r.top;
      /* Retuned vs the promo default for this context: the drawer is only
         ~420px wide (vs a full-page field), so a 13-piece burst at that
         spread reads as a few stray specks. More pieces, tighter spread,
         and a harder launch make it POP; slightly smaller shapes keep it
         from swamping a narrow panel. Lifted above the drawer's z-100. */
      const burst = (delay, opts) =>
        setTimeout(() => promoPaperBurst(cx, cy, Object.assign({ className: "promo-fx--over-overlay" }, opts)), delay);
      burst(0, { count: 26, spread: 150, speed: 4.2, speedVar: 3.4, scale: 0.78 });
      // Second, softer wave a beat later so the effect blooms rather than
      // firing once and instantly thinning out.
      burst(160, { count: 14, spread: 230, speed: 3.2, speedVar: 3, scale: 0.62 });
    }
  }

  /* Empty-cart state — swapped into [data-cart-rows] once the last line
     item is removed via the stepper (see initSteppers). The bag icon
     reuses shopping-bag-icon.svg (a white-stroke outline) on a dark
     circle backdrop, matching the floating cart button's own empty state
     so the two read as the same "empty" motif. */
  function cartEmptyStateHTML() {
    return `
      <div class="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <span class="grid place-items-center size-14 rounded-full bg-primaryDark"><img src="images/icons/shopping-bag-icon.svg" alt="" class="w-6 h-6" /></span>
        <p class="font-medium text-textSecondary">Your cart is empty</p>
        <a href="shop.html" class="text-cta font-medium text-sm hover:underline">Continue shopping →</a>
      </div>`;
  }
  function checkCartEmpty() {
    const drawer = document.querySelector('[data-drawer="cart"]');
    const rowsWrap = drawer && drawer.querySelector("[data-cart-rows]");
    if (!rowsWrap) return;
    if (!rowsWrap.querySelector("[data-cart-row]")) rowsWrap.innerHTML = cartEmptyStateHTML();
  }

  /* Cart PAGE (cart.html) summary — the drawer has its own updater above;
     this keeps the full-page version honest when a line item's quantity
     changes or the row is removed via the counter. Removing the row but
     leaving a stale "EGP 1,830.00" subtotal would be worse than not
     supporting removal at all, so this runs on every stepper change.
     No-ops on pages without per-row price data (e.g. checkout.html, whose
     summary is a static order review with no counters), so the static
     demo figures there are left alone. */
  function syncCartPageSummary() {
    const subtotalEl = document.querySelector("[data-summary-subtotal]");
    // Scoped to [data-cart-list]: the cart DRAWER is injected into every
    // page and its line items also carry [data-cart-row], so an unscoped
    // query double-counts the drawer's contents into the page subtotal.
    const list = document.querySelector("[data-cart-list]");
    // Bail on pages with no cart list at all (checkout.html) — but NOT on a
    // list that has emptied out, which must still fall through and zero the
    // figures rather than leave the last stale subtotal on screen.
    if (!subtotalEl || !list) return;
    const rows = list.querySelectorAll("[data-cart-row][data-unit-price]");
    let subtotal = 0;
    rows.forEach((row) => {
      const price = parseFloat(row.dataset.unitPrice) || 0;
      const qtyEl = row.querySelector("[data-qty]");
      const qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 0 : 0;
      const line = price * qty;
      subtotal += line;
      /* The prominent pink figure is the LINE TOTAL (unit x qty); the small
         grey line under it carries the unit x quantity breakdown. Rebuilt
         from the same three-span structure the static markup uses so the
         EGP / integer / decimal type sizes survive the update. */
      const lineEl = row.querySelector("[data-line-total]");
      if (lineEl) {
        const intp = Math.floor(line);
        const dec = (line - intp).toFixed(2).substring(1);
        lineEl.innerHTML =
          '<span class="md:text-lg font-medium">EGP</span>' +
          '<span class="md:text-2xl font-semibold">' + intp.toLocaleString("en-US") + "</span>" +
          '<span class="md:text-lg font-medium">' + dec + "</span>";
      }
      const breakdownEl = row.querySelector("[data-line-breakdown]");
      if (breakdownEl) breakdownEl.innerHTML = egp(price) + " &times; " + qty;
      /* Compare-at ("was") price scales with quantity too — otherwise a
         qty-2 row would show a doubled total struck through against a
         single-unit original. */
      const compareEl = row.querySelector("[data-line-compare]");
      if (compareEl) {
        const unitWas = parseFloat(compareEl.dataset.compareUnit) || 0;
        if (unitWas) compareEl.textContent = egp(unitWas * qty);
      }
    });
    subtotalEl.textContent = egp(subtotal);
    /* Nothing in the cart means nothing to deliver — leaving the 40 EGP
       fee standing would show a non-zero Total on an empty cart. Stashed
       on first zero-out so it can be restored if items come back. */
    const deliveryEl = document.querySelector("[data-summary-delivery]");
    if (deliveryEl) {
      if (!deliveryEl.dataset.baseFee) deliveryEl.dataset.baseFee = String(parseEGP(deliveryEl.textContent));
      deliveryEl.textContent = egp(subtotal > 0 ? parseFloat(deliveryEl.dataset.baseFee) || 0 : 0);
    }
    // Re-apply whatever discount is currently showing so Total stays right.
    const dRow = document.querySelector("[data-summary-discount-row]");
    const dEl = document.querySelector("[data-summary-discount]");
    const discount = dRow && !dRow.hidden && dEl ? parseEGP(dEl.textContent) : 0;
    promoSyncSummary(discount);
  }

  /* Empty state for the cart PAGE list (distinct from the drawer's).
     Targets [data-cart-list] rather than deriving the <ul> from a row —
     by the time this runs the last row is already gone, so there'd be
     nothing left to walk up from. */
  function checkCartPageEmpty() {
    const list = document.querySelector("[data-cart-list]");
    if (!list || list.querySelector("[data-cart-row]")) return;
    list.outerHTML = `
      <div class="flex flex-col justify-center items-center gap-5 py-16 text-center">
        <span class="grid place-items-center size-14 rounded-full bg-primaryDark"><img src="images/icons/shopping-bag-icon.svg" alt="" class="w-6 h-6" /></span>
        <div class="font-medium text-blackText text-2xl">Your cart is empty</div>
        <a href="shop.html" class="text-cta font-medium hover:underline">Continue shopping →</a>
      </div>`;
  }

  /* ---------------------------------------------------------------
     POST CARD — the ONE editorial card for the whole site (Mark:
     "this is our posts global component, use it also in the media
     center for all posts pages").

     Vertical card: badge + date → 1:1 image → title → turquoise
     "Read more →". Drop a placeholder and it fills itself:

       <div data-posts></div>                  all posts
       <div data-posts data-posts-limit="4"></div>   latest N

     POSTS below is the single source for both the homepage strip and
     the media-center grid, so a post added once shows up in both. The
     media center previously used a completely different horizontal
     192px-thumbnail card; that markup is gone.
     --------------------------------------------------------------- */
  const POST_BADGE = {
    event: "bg-accent-50 text-accent-700",
    recipe: "bg-accent-50 text-accent-700",
    blog: "bg-primary-100 text-primaryDark",
    guide: "bg-primary-100 text-primaryDark",
    news: "bg-primary-100 text-primaryDark",
  };
  const POSTS = [
    { cat: "event", label: "Event", date: "12 Jun 2025", title: "Hosting the Perfect Celebration at Home", img: "dummy-images/exception-image.jpg", url: "blog.html" },
    { cat: "blog", label: "Blog", date: "3 Jun 2025", title: "The Story Behind Our Signature Baklava", img: "dummy-images/chocolate%20cover.webp", url: "blog.html" },
    { cat: "blog", label: "Blog", date: "21 May 2025", title: "Five Cake Flavours Everyone Will Love", img: "dummy-images/image-4.webp", url: "blog.html" },
    { cat: "news", label: "News", date: "8 May 2025", title: "New Flagship Branch Opens in New Cairo", img: "dummy-images/exception-image-2.jpg", url: "blog.html" },
    { cat: "blog", label: "Blog", date: "27 Apr 2025", title: "How to Store Oriental Sweets and Keep Them Fresh", img: "dummy-images/image-7.webp", url: "blog.html" },
    { cat: "event", label: "Event", date: "15 Apr 2025", title: "Ramadan Gift Boxes: a Taste of Tradition", img: "dummy-images/special-cake.webp", url: "blog.html" },
  ];
  function postCardHTML(p, i) {
    const badge = POST_BADGE[p.cat] || POST_BADGE.blog;
    return `
      <a href="${p.url}" class="group flex flex-col gap-3" data-category="${p.cat}" data-reveal style="--reveal-delay:${(i % 4) * 0.08}s">
        <div class="flex items-center gap-3">
          <span class="rounded-[2px] ${badge} px-2.5 py-1 text-xs font-medium">${p.label}</span>
          <span class="text-xs text-neutral-500">${p.date}</span>
        </div>
        <div class="relative aspect-square w-full overflow-hidden rounded-[12px]">
          <img src="${p.img}" alt="${esc(p.title)}" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <h3 class="text-lg font-semibold leading-snug text-textSecondary group-hover:text-primaryDark">${p.title}</h3>
        <span class="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-primaryDark" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </a>`;
  }
  function initPosts(scope) {
    scope.querySelectorAll("[data-posts]").forEach((el) => {
      if (el.dataset.postsReady) return;
      el.dataset.postsReady = "1";
      const limit = parseInt(el.dataset.postsLimit, 10);
      const list = limit > 0 ? POSTS.slice(0, limit) : POSTS;
      el.innerHTML = list.map(postCardHTML).join("");
    });
  }

  /* ---------------------------------------------------------------
     Vouchers (my-account-vouchers.html). A voucher is a one-time code
     worth a fixed EGP amount; activating it moves it to "Used" and adds
     its value to the wallet balance (see walletBalance above).

     Two entry points, matching the design: activate an existing voucher
     from the list, or add one by code. Both land in the same
     [data-modal="voucher"] shell — one modal with two bodies — so there
     is a single close/backdrop path rather than two competing overlays.
     --------------------------------------------------------------- */
  const VOUCHER_CODES = { EX150: 150, SWEET100: 100, GIFT250: 250 };
  /* A voucher is "old" once it is either spent or past its date. Which of
     the two is carried ONLY by the meta line (Used … / Expired …) — Mark:
     the two states share a row style and are told apart by the label. */
  function voucherState(v) {
    if (v.used) return "used";
    return new Date(v.expires) < startOfToday() ? "expired" : "available";
  }
  function voucherMeta(v) {
    const st = voucherState(v);
    if (st === "used") return "Used " + fmtDate(new Date(v.usedOn));
    if (st === "expired") return "Expired " + fmtDate(new Date(v.expires));
    return "Valid till " + fmtDate(new Date(v.expires));
  }
  function voucherRowHTML(v) {
    const st = voucherState(v);
    const old = st !== "available";
    return `
      <li class="voucher${old ? " voucher--old" : ""}" data-voucher-id="${v.id}" data-voucher-value="${v.value}" data-voucher-state="${st}">
        <span class="voucher__ico"><img src="images/icons/account%20icons/voucher.webp" alt="" /></span>
        <span class="voucher__body">
          <span class="voucher__title">${v.value} EGP Discount</span>
          <span class="voucher__meta">${voucherMeta(v)}</span>
        </span>
        ${
          old
            ? ""
            : `<button type="button" class="voucher__action" data-voucher-activate aria-label="Activate ${v.value} EGP voucher">
                 <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
               </button>`
        }
      </li>`;
  }
  function initVouchers(scope) {
    const root = scope.querySelector("[data-vouchers]");
    if (!root || root.dataset.vouchersReady) return;
    root.dataset.vouchersReady = "1";

    const availList = root.querySelector("[data-voucher-list='available']");
    const oldList = root.querySelector("[data-voucher-list='old']");
    const modal = document.querySelector('[data-modal="voucher"]');
    const paneAdd = modal.querySelector("[data-voucher-pane='add']");
    const paneActivate = modal.querySelector("[data-voucher-pane='activate']");
    const codeInput = modal.querySelector("[data-voucher-code]");
    const codeError = modal.querySelector("[data-voucher-error]");
    const activateCopy = modal.querySelector("[data-voucher-activate-copy]");
    let pending = null; // the <li> awaiting confirmation

    const render = () => {
      availList.innerHTML = VOUCHERS.filter((v) => voucherState(v) === "available").map(voucherRowHTML).join("");
      oldList.innerHTML = VOUCHERS.filter((v) => voucherState(v) !== "available").map(voucherRowHTML).join("");
      // Empty states — an empty <ul> with a heading above reads as broken.
      root.querySelectorAll("[data-voucher-empty]").forEach((el) => {
        const which = el.dataset.voucherEmpty;
        const n = VOUCHERS.filter((v) =>
          which === "old" ? voucherState(v) !== "available" : voucherState(v) === "available"
        ).length;
        el.hidden = n > 0;
      });
    };
    const showPane = (which) => {
      paneAdd.hidden = which !== "add";
      paneActivate.hidden = which !== "activate";
    };
    const open = (which) => {
      showPane(which);
      if (codeError) codeError.hidden = true;
      openOverlay("voucher");
    };

    root.addEventListener("click", (e) => {
      const act = e.target.closest("[data-voucher-activate]");
      if (act) {
        pending = act.closest("[data-voucher-id]");
        activateCopy.textContent = `${pending.dataset.voucherValue} EGP will be added to your wallet balance`;
        open("activate");
        return;
      }
      if (e.target.closest("[data-voucher-add]")) {
        if (codeInput) codeInput.value = "";
        open("add");
      }
    });

    // Confirm activation → credit the wallet, move the row to Used.
    modal.querySelector("[data-voucher-confirm]").addEventListener("click", () => {
      if (!pending) return;
      const v = VOUCHERS.find((x) => String(x.id) === pending.dataset.voucherId);
      let before = null;
      if (v && !v.used) {
        before = walletBalance();
        v.used = true;
        v.usedOn = isoToday();
        addVoucherRedeemed(v.value);
      }
      pending = null;
      render();
      closeOverlay();
      celebrateVoucher();
      /* after the modal is out of the way, so the balance is on screen */
      if (before !== null) setTimeout(() => animateWalletCredit(before, walletBalance()), 260);
    });

    // Add by code → validates against the demo code table.
    modal.querySelector("[data-voucher-submit]").addEventListener("click", () => {
      const code = (codeInput.value || "").trim().toUpperCase();
      const value = VOUCHER_CODES[code];
      if (!value) {
        codeError.textContent = code ? "That code isn't valid or has already been used." : "Enter a voucher code.";
        codeError.hidden = false;
        return;
      }
      if (VOUCHERS.some((v) => v.code === code)) {
        codeError.textContent = "That voucher is already in your list.";
        codeError.hidden = false;
        return;
      }
      VOUCHERS.push({ id: "v" + (VOUCHERS.length + 1), code, value, used: false, expires: isoInMonths(3) });
      render();
      closeOverlay();
      celebrateVoucher();
    });

    // Enter submits the code without submitting any surrounding form.
    if (codeInput) {
      codeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          modal.querySelector("[data-voucher-submit]").click();
        }
      });
      codeInput.addEventListener("input", () => {
        if (codeError) codeError.hidden = true;
      });
    }

    render();
    syncWalletBalance(document);
  }
  /* Reuses the promo-code confetti so redeeming feels like the same
     brand moment as applying a discount. */
  function celebrateVoucher() {
    if (typeof promoPaperBurst !== "function") return;
    const r = { left: innerWidth / 2 - 40, top: innerHeight / 2, width: 80, height: 10 };
    try {
      promoPaperBurst(r.left + r.width / 2, r.top);
    } catch (e) {}
  }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(d) {
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  /* Midnight today — comparing against `new Date()` would call a voucher
     expiring today "expired" from one second past midnight. */
  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const iso = (d) => d.toISOString().slice(0, 10);
  function isoToday() {
    return iso(new Date());
  }
  function isoInMonths(n) {
    const d = new Date();
    d.setMonth(d.getMonth() + n);
    return iso(d);
  }
  /* `expires` drives available-vs-expired, so the demo ages on its own
     rather than needing dates edited by hand. v7 is deliberately an
     expired-but-never-used voucher — the case the old model couldn't show. */
  const VOUCHERS = [
    { id: "v1", code: "EX100A", value: 100, used: false, expires: "2026-10-20" },
    { id: "v2", code: "EX100B", value: 100, used: false, expires: "2026-10-20" },
    { id: "v3", code: "EX150A", value: 150, used: false, expires: "2026-11-05" },
    { id: "v4", code: "EX250A", value: 250, used: false, expires: "2026-12-18" },
    { id: "v5", code: "EX100C", value: 100, used: true, usedOn: "2025-10-20", expires: "2025-12-01" },
    { id: "v6", code: "EX100D", value: 100, used: true, usedOn: "2025-10-20", expires: "2025-12-01" },
    { id: "v7", code: "EX050A", value: 50, used: false, expires: "2025-09-03" },
  ];

  /* ---------------------------------------------------------------
     Membership tier badge — Golden / Silver / Platinum
     (Figma 6233-56907). Gradient pill + circular avatar + uppercase
     label. Drop a placeholder anywhere: <span data-tier-badge></span>,
     or force one with <span data-tier-badge="platinum"></span>.

     ONE constant drives every instance. The badge appears 14 times
     across the 8 account pages (most render the profile block twice —
     mobile pills + desktop sidebar) and was previously hard-coded to
     "Gold" in all 14, in three different markup variants. Change
     USER_TIER and the whole demo follows.

     The avatar reuses the account-icon person illustration, per the
     images-only-from-dummy-images-or-icons rule — there is no
     dedicated tier artwork in either allowed folder.
     --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
     Wallet balance — vouchers are the ONLY way to add balance (there is
     no card/Fawry top-up). Base balance + whatever vouchers have been
     activated this session.

     Redeemed total is persisted in localStorage so the balance survives
     the hop from the vouchers page to the wallet page and the checkout
     wallet toggle — without it, "activating" a voucher would claim to
     top up a balance that never changed. This is the only persisted
     state on the site; clear `ex_voucher_redeemed` to reset the demo.
     --------------------------------------------------------------- */
  const WALLET_BASE = 1250;
  const VOUCHER_STORE = "ex_voucher_redeemed";
  function voucherRedeemed() {
    try {
      return parseFloat(localStorage.getItem(VOUCHER_STORE)) || 0;
    } catch (e) {
      return 0; // private mode / storage disabled — degrade to base balance
    }
  }
  function addVoucherRedeemed(amount) {
    try {
      localStorage.setItem(VOUCHER_STORE, String(voucherRedeemed() + amount));
    } catch (e) {}
  }
  function walletBalance() {
    return WALLET_BASE + voucherRedeemed();
  }
  /* Paints every wallet-balance readout on the page. */
  function syncWalletBalance(scope) {
    (scope || document).querySelectorAll("[data-wallet-balance]").forEach((el) => {
      el.textContent = egp(walletBalance());
    });
  }

  /* Counts every wallet figure from one balance to the next instead of
     swapping the number, and floats the credited amount out of it — the
     point of activating a voucher is watching the value land. */
  function animateWalletCredit(from, to) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [...document.querySelectorAll("[data-wallet-balance]")];
    if (!targets.length || to === from) return syncWalletBalance(document);
    if (reduced) return syncWalletBalance(document);

    const DUR = 1100;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    targets.forEach((el) => {
      /* the +N pill floats out of the figure; needs a positioned anchor */
      const host = el.offsetParent ? el : null;
      if (host) {
        const rect = el.getBoundingClientRect();
        const pill = document.createElement("span");
        pill.className = "wallet-credit__delta";
        pill.textContent = "+" + egp(to - from);
        pill.style.left = rect.left + rect.width / 2 + "px";
        pill.style.top = rect.top - 6 + "px";
        pill.style.position = "fixed";
        pill.style.transform = "translateX(-50%)";
        document.body.appendChild(pill);
        setTimeout(() => pill.remove(), 1600);
      }

      el.classList.remove("wallet-credit");
      void el.offsetWidth; /* restart the highlight if it's still running */
      el.classList.add("wallet-credit");

      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / DUR);
        el.textContent = egp(from + (to - from) * ease(k));
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = egp(to);
      };
      requestAnimationFrame(step);
    });
  }

  const USER_TIER = "golden"; // golden | silver | platinum
  const TIERS = { golden: "Golden", silver: "Silver", platinum: "Platinum" };
  function tierBadgeHTML(tier) {
    const key = TIERS[tier] ? tier : "golden";
    return `<span class="tier-badge tier-badge--${key}">
        <span class="tier-badge__ico"><img src="images/icons/account%20icons/account.webp" alt="" /></span>
        <span class="tier-badge__label">${TIERS[key]}</span>
      </span>`;
  }
  function initTierBadge(scope) {
    scope.querySelectorAll("[data-tier-badge]").forEach((el) => {
      if (el.dataset.tierReady) return;
      el.dataset.tierReady = "1";
      el.innerHTML = tierBadgeHTML(el.dataset.tierBadge || USER_TIER);
    });
  }

  /* ---------------------------------------------------------------
     Wallet balance toggle — "Use My Wallet Balance" (Figma 6231-56797).
     Mint card, brand wallet illustration, the balance as a turquoise
     badge, switch on the end. Drop a placeholder anywhere in an order
     summary: <div data-wallet-toggle></div>

     Switching it on applies the WHOLE balance and leaves any remainder
     payable on the selected method (capped at the bill — see
     syncSummary). The balance mirrors my-account-wallet.html.

     The control is a real <input type="checkbox"> so it is keyboard- and
     screen-reader-operable for free, wrapped in a <label> so the entire
     card is a hit target. It is deliberately NOT a <button>: this card
     sits inside checkout's one giant place-order <form>, where a
     default-type button submits and places the order (the same trap
     already hit by the promo Apply button and the delivery-note Edit
     button).
     --------------------------------------------------------------- */
  function walletCardHTML(balance) {
    return `
      <label class="wallet-toggle">
        <img src="images/icons/wallet.webp" alt="" class="wallet-toggle__icon" />
        <span class="wallet-toggle__label">Use My Wallet Balance</span>
        <span class="wallet-toggle__amount">${Math.round(balance).toLocaleString("en-US")} EGP</span>
        <input type="checkbox" class="wallet-toggle__input" data-wallet-input aria-label="Use my wallet balance" />
        <span class="wallet-toggle__switch" aria-hidden="true"></span>
      </label>`;
  }
  function initWalletToggle(scope) {
    scope.querySelectorAll("[data-wallet-toggle]").forEach((root) => {
      if (root.dataset.walletReady) return;
      root.dataset.walletReady = "1";
      root.innerHTML = walletCardHTML(walletBalance());
      const input = root.querySelector("[data-wallet-input]");
      input.addEventListener("change", () => {
        walletApplied = input.checked ? walletBalance() : 0;
        syncSummary();
      });
    });
  }

  /* ---------------------------------------------------------------
     Send as a gift (checkout) — toggling on reveals the recipient
     fields and rules out the options gifts can't use: "Pickup from
     store" (meta swaps to an unavailable notice) and "Cash on
     delivery" (auto-moves the selection to card). Toggling off
     restores both, including whatever the pickup meta said before.
     --------------------------------------------------------------- */
  function initGiftToggle(scope) {
    scope.querySelectorAll("[data-gift]").forEach((root) => {
      if (root.dataset.giftReady) return;
      root.dataset.giftReady = "1";
      const input = root.querySelector("[data-gift-input]");
      const fields = root.querySelector("[data-gift-fields]");
      if (!input) return;
      let prevPickupMeta = "";
      input.addEventListener("change", () => {
        const on = input.checked;
        if (fields) {
          fields.hidden = !on;
          if (on) {
            fields.classList.remove("sc-tile");
            void fields.offsetWidth;
            fields.classList.add("sc-tile");
          }
        }
        /* Pickup from store — not available for gift orders */
        const pickup = document.querySelector('[data-optgroup="shiptype"] [data-opt="pickup"]');
        const pickupMeta = pickup && pickup.querySelector("[data-opt-meta]");
        if (pickup) {
          if (on) {
            if (pickup.classList.contains("is-selected")) {
              const deliver = document.querySelector('[data-optgroup="shiptype"] [data-opt="deliver"]');
              if (deliver) deliver.click();
            }
            if (pickupMeta) {
              prevPickupMeta = pickupMeta.textContent;
              pickupMeta.textContent = "Not available for gift orders";
            }
          } else if (pickupMeta) {
            pickupMeta.textContent = prevPickupMeta || "Choose Store";
          }
          pickup.classList.toggle("is-disabled", on);
          pickup.disabled = on;
        }
        /* Cash on delivery — not available for gift orders. Routed through
           the shared blocker so it can't fight the scheduled-order rule. */
        setCodBlock("gift", on);
      });
    });
  }

  /* ---------------------------------------------------------------
     Order note — a pink link that expands into a compose form, then
     collapses into a saved white card with a remove control.
     Drop a placeholder anywhere: <div data-order-note></div>
     --------------------------------------------------------------- */
  /* The three things couriers are asked for most. Offered as chips so the
     common case is one tap, while the field stays a free-text box — a chip
     writes into it and leaves the caret at the end, rather than locking the
     buyer into a canned choice. */
  const NOTE_PRESETS = ["Avoid phone calls", "Leave it at the door", "Don't ring the bell"];

  function orderNoteHTML() {
    return `
      <button type="button" class="ordernote__toggle" data-note-toggle aria-expanded="false">
        <span class="ordernote__toggleMain">
          <svg class="ordernote__noteIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span data-note-toggle-label>Add Order Note</span>
        </span>
        <svg class="ordernote__plus" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
      <div class="ordernote__panel" data-note-panel>
        <div class="ordernote__panelInner">
          <textarea rows="3" class="ordernote__field" data-note-field placeholder="Write a note for your order (e.g. happy birthday message)…"></textarea>
          <!-- Under the field: the box is the primary way in, and these are
               shortcuts into it — offering them first read as a menu to pick
               from rather than as help with writing. -->
          <div class="ordernote__chips" data-note-chips>
            ${NOTE_PRESETS.map(
              (t) => `<button type="button" class="ordernote__chip" data-note-chip="${esc(t)}">${esc(t)}</button>`,
            ).join("")}
          </div>
          <div class="ordernote__actions">
            <button type="button" class="btn btn--primary btn--sm" data-note-save>Add Note</button>
          </div>
        </div>
      </div>
      <div data-note-saved hidden></div>`;
  }
  function initOrderNote(scope) {
    scope.querySelectorAll("[data-order-note]").forEach((root) => {
      if (root.dataset.noteReady) return;
      root.dataset.noteReady = "1";
      root.classList.add("ordernote");
      root.innerHTML = orderNoteHTML();

      const toggle = root.querySelector("[data-note-toggle]");
      const label = root.querySelector("[data-note-toggle-label]");
      const field = root.querySelector("[data-note-field]");
      const savedWrap = root.querySelector("[data-note-saved]");

      const open = (on) => {
        root.classList.toggle("is-open", on);
        toggle.setAttribute("aria-expanded", String(on));
        if (on) setTimeout(() => field.focus(), 180);
      };

      function showSaved(text) {
        savedWrap.hidden = false;
        /* The saved note is the way back in to edit it — the only other
           control here removes it, and a note you can't correct without
           deleting it first is a trap. */
        savedWrap.innerHTML = `
          <div class="ordernote__saved" role="button" tabindex="0" aria-label="Edit order note" title="Click to edit">
            <span class="ordernote__savedIcon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <span class="ordernote__savedText">${esc(text)}</span>
            <button type="button" class="ordernote__remove" data-note-remove aria-label="Remove note"><svg viewBox="0 0 24 24" fill="none" class="w-4 h-4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          </div>`;
        // With a note saved, the link becomes the way back in to edit it.
        toggle.hidden = true;
      }

      /* A chip appends rather than replaces, so two can be combined ("Leave
         it at the door. Don't ring the bell."), and the caret lands at the
         end ready to keep typing. Tapping the same chip again removes its
         line, so a mis-tap is one tap to undo. */
      const chips = root.querySelector("[data-note-chips]");
      function syncChips() {
        const v = field.value;
        root.querySelectorAll("[data-note-chip]").forEach((c) => {
          const on = v.indexOf(c.getAttribute("data-note-chip")) !== -1;
          c.classList.toggle("is-on", on);
          c.setAttribute("aria-pressed", String(on));
        });
      }
      if (chips) {
        chips.addEventListener("click", (e) => {
          const chip = e.target.closest("[data-note-chip]");
          if (!chip) return;
          const text = chip.getAttribute("data-note-chip");
          const has = field.value.indexOf(text) !== -1;
          if (has) {
            field.value = field.value
              .replace(new RegExp("\\s*" + text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\.?", "g"), "")
              .replace(/\s{2,}/g, " ")
              .trim();
          } else {
            field.value = (field.value.trim() ? field.value.trim().replace(/\.?$/, ".") + " " : "") + text + ".";
          }
          syncChips();
          field.focus();
          field.setSelectionRange(field.value.length, field.value.length);
        });
        field.addEventListener("input", syncChips);
      }

      /* The +/× in the toggle is the only open AND close control — a separate
         "Close" button in the actions row would duplicate what the × does. */
      toggle.addEventListener("click", () => open(!root.classList.contains("is-open")));
      root.querySelector("[data-note-save]").addEventListener("click", () => {
        const text = field.value.trim();
        if (!text) {
          field.focus();
          return;
        }
        open(false);
        showSaved(text);
      });
      function editSaved() {
        savedWrap.hidden = true;
        savedWrap.innerHTML = "";
        toggle.hidden = false;
        label.textContent = "Edit order note";
        open(true); // field keeps its text, so editing starts where it left off
      }
      savedWrap.addEventListener("click", (e) => {
        if (e.target.closest("[data-note-remove]")) {
          savedWrap.hidden = true;
          savedWrap.innerHTML = "";
          field.value = "";
          syncChips();
          toggle.hidden = false;
          label.textContent = "Add order note";
          return;
        }
        if (e.target.closest(".ordernote__saved")) editSaved();
      });
      /* role=button, so it has to answer the keyboard like one. */
      savedWrap.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (!e.target.closest(".ordernote__saved")) return;
        e.preventDefault();
        editSaved();
      });
    });
  }

  /* Promo markup, so a bare <div data-promo></div> is enough to place the
     field. Pages that still ship the full markup inline keep working —
     this only fills in an empty container. */
  function promoFieldHTML() {
    return `
      <div class="promo__form" data-promo-form>
        <input type="text" class="promo__input" placeholder="Promo code" aria-label="Promo code" data-promo-input />
        <button type="button" class="promo__apply" data-promo-apply>Apply</button>
      </div>
      <div class="promo__success" data-promo-success hidden>
        <span class="promo__check"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="promo__meta">
          <span class="promo__code" data-promo-code></span>
          <span class="promo__desc" data-promo-desc></span>
        </span>
        <button type="button" class="promo__remove" data-promo-remove aria-label="Remove promo code"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
      <span class="promo__flash" aria-hidden="true"><span class="promo__wipe"></span></span>
      <p class="promo__error" data-promo-error role="alert" hidden></p>`;
  }

  function initPromo(scope) {
    scope.querySelectorAll("[data-promo]").forEach((promo) => {
      if (promo.dataset.promoReady) return;
      promo.dataset.promoReady = "1";
      promo.classList.add("promo");
      if (!promo.querySelector("[data-promo-form]")) promo.innerHTML = promoFieldHTML();
      const form = promo.querySelector("[data-promo-form]");
      const input = promo.querySelector("[data-promo-input]");
      const applyBtn = promo.querySelector("[data-promo-apply]");
      const success = promo.querySelector("[data-promo-success]");
      const errorEl = promo.querySelector("[data-promo-error]");
      if (!form || !input || !success) return;

      const subtotalEl = document.querySelector("[data-summary-subtotal]");
      const subtotal = subtotalEl ? parseEGP(subtotalEl.textContent) : 0;

      // The link is inert until there's something to apply.
      const syncApply = () => {
        if (applyBtn) applyBtn.disabled = !input.value.trim();
      };
      syncApply();
      input.addEventListener("input", () => {
        syncApply();
        promo.classList.remove("is-invalid");
        if (errorEl) errorEl.hidden = true;
      });

      const fail = (msg) => {
        promo.classList.remove("is-invalid");
        void promo.offsetWidth; // restart the shake
        promo.classList.add("is-invalid");
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.hidden = false;
        }
      };

      const submit = () => {
        const code = input.value.trim().toUpperCase();
        if (!code) return;
        const rule = PROMO_CODES[code];
        // EXCEPTION10 is the code the header announcement bar advertises,
        // so that's the one to point people at.
        if (!rule) return fail("That code isn't valid. Try EXCEPTION10.");

        const discount = rule.type === "percent" ? Math.round(subtotal * rule.value) / 100 : rule.value;
        const desc =
          rule.type === "percent"
            ? rule.value + "% discount (−" + egp(discount) + ")"
            : egp(discount) + " off your order";

        promo.classList.remove("is-invalid");
        if (errorEl) errorEl.hidden = true;
        promo.classList.add("is-applying");

        // Launch from the centre of the field, as the wipe opens.
        const r = promo.getBoundingClientRect();
        setTimeout(() => promoPaperBurst(r.left + r.width / 2, r.top + r.height / 2), 160);

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setTimeout(
          () => {
            promo.querySelector("[data-promo-code]").textContent = code;
            promo.querySelector("[data-promo-desc]").textContent = desc;
            form.hidden = true;
            success.hidden = false;
            promo.classList.remove("is-applying");
            promo.classList.add("is-applied");
            promoSyncSummary(discount);
          },
          reduce ? 0 : 400,
        );
      };

      // NOT a <form> submit: on checkout the promo sits INSIDE the page's
      // one big place-order <form>, and a nested <form> is dropped by the
      // parser — a submit button there would place the order. So: an
      // explicit click, plus Enter with preventDefault so the keyboard
      // path can't submit the outer form either.
      if (applyBtn) applyBtn.addEventListener("click", submit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      });

      const removeBtn = promo.querySelector("[data-promo-remove]");
      if (removeBtn)
        removeBtn.addEventListener("click", () => {
          success.hidden = true;
          form.hidden = false;
          promo.classList.remove("is-applied");
          input.value = "";
          syncApply();
          promoSyncSummary(0);
        });

      // Start from a clean slate so the demo total is always consistent.
      promoSyncSummary(0);
    });
  }

  /* ---------------------------------------------------------------
     Select → styled dropdown. Vanilla equivalent of the shadcn/Radix
     "same width as trigger" menu: the popup is absolutely positioned
     with inset-inline:0 inside a wrapper that matches the trigger, so
     it always spans exactly the trigger's width.

     Progressive enhancement — the original <select> is left in place and
     still owns the value, so anything already listening for `change`
     (branch filters, the store picker's city→area cascade, …) keeps
     working untouched. If a select's <option>s are rebuilt at runtime,
     call el._uiSelectRefresh() to re-sync the menu.
     --------------------------------------------------------------- */
  const UI_SELECT_CHEVRON =
    '<svg class="ui-select__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const UI_SELECT_CHECK =
    '<svg class="ui-select__check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let uiSelectOpen = null;
  function uiSelectCloseAll() {
    if (!uiSelectOpen) return;
    uiSelectOpen.root.classList.remove("is-open");
    uiSelectOpen.menu.hidden = true;
    uiSelectOpen.trigger.setAttribute("aria-expanded", "false");
    uiSelectOpen = null;
  }

  function initSelects(scope) {
    scope.querySelectorAll("select").forEach((sel) => {
      if (sel.dataset.uiSelectReady) return;
      sel.dataset.uiSelectReady = "1";

      const root = document.createElement("div");
      root.className = "ui-select";
      sel.parentNode.insertBefore(root, sel);
      root.appendChild(sel);
      sel.classList.add("ui-select__native");
      sel.setAttribute("aria-hidden", "true");
      sel.setAttribute("tabindex", "-1");

      const trigger = document.createElement("button");
      trigger.type = "button";
      /* Inherit the select's own utility classes so each context keeps its
         shape (pill on shop filters, rounded-md on checkout, etc.) — only
         the chevron/padding behaviour is unified. */
      trigger.className = (sel.dataset.uiSelectClass || sel.className)
        .replace(/\bui-select__native\b/, "")
        .trim();
      trigger.classList.add("ui-select__trigger");
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.innerHTML = '<span class="ui-select__value"></span>' + UI_SELECT_CHEVRON;
      root.appendChild(trigger);

      const menu = document.createElement("div");
      menu.className = "ui-select__menu";
      menu.setAttribute("role", "listbox");
      menu.hidden = true;
      root.appendChild(menu);

      const valueEl = trigger.querySelector(".ui-select__value");

      function render() {
        const opts = [...sel.options];
        valueEl.textContent = sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].textContent : "";
        menu.innerHTML = opts
          .map(
            (o, i) =>
              `<button type="button" role="option" class="ui-select__item${i === sel.selectedIndex ? " is-selected" : ""}" aria-selected="${i === sel.selectedIndex}" data-i="${i}">${UI_SELECT_CHECK}<span>${esc(o.textContent)}</span></button>`,
          )
          .join("");
      }
      render();
      // Lets callers that repopulate <option>s re-sync the custom menu.
      sel._uiSelectRefresh = render;

      /* form.reset() restores the native <select>, but this widget paints its
         own label — which otherwise kept showing the previous choice after a
         submit. The reset event fires BEFORE the fields are cleared, so the
         re-render has to wait a tick. */
      if (sel.form) sel.form.addEventListener("reset", () => setTimeout(render, 0));

      function open() {
        uiSelectCloseAll();
        render();
        menu.hidden = false;
        root.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        uiSelectOpen = { root, menu, trigger };
        const cur = menu.querySelector(".is-selected");
        if (cur) cur.classList.add("is-active");
      }

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (root.classList.contains("is-open")) uiSelectCloseAll();
        else open();
      });

      menu.addEventListener("click", (e) => {
        const item = e.target.closest(".ui-select__item");
        if (!item) return;
        e.stopPropagation();
        sel.selectedIndex = parseInt(item.dataset.i, 10);
        // Native event so existing change listeners fire exactly as before.
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        render();
        uiSelectCloseAll();
      });

      trigger.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!root.classList.contains("is-open")) open();
        } else if (e.key === "Escape") {
          uiSelectCloseAll();
        }
      });
      menu.addEventListener("keydown", (e) => {
        const items = [...menu.querySelectorAll(".ui-select__item")];
        const cur = items.findIndex((i) => i.classList.contains("is-active"));
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = e.key === "ArrowDown" ? Math.min(items.length - 1, cur + 1) : Math.max(0, cur - 1);
          items.forEach((i, n) => i.classList.toggle("is-active", n === next));
          items[next].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (items[cur]) items[cur].click();
        } else if (e.key === "Escape") {
          uiSelectCloseAll();
          trigger.focus();
        }
      });
    });
  }
  document.addEventListener("click", uiSelectCloseAll);

  function initSteppers(scope) {
    scope.querySelectorAll("[data-stepper]").forEach((st) => {
      const qtyEl = st.querySelector("[data-qty]");
      // Only [data-removable] counters (cart line items + cart summary) swap
      // the minus for a trash icon at qty 1; the product-page picker keeps minus.
      const removable = st.hasAttribute("data-removable");
      const decBtn = st.querySelector('[data-step="-1"]');
      const syncDec = () => {
        if (!removable || !decBtn) return;
        const one = (parseInt(qtyEl.textContent, 10) || 1) <= 1;
        decBtn.innerHTML = one ? STEP_ICON_TRASH : STEP_ICON_MINUS;
        decBtn.setAttribute("aria-label", one ? "Remove item" : "Decrease quantity");
      };
      syncDec();
      // Cart-row steppers feed the free-shipping banner, the footer
      // subtotal, and the header cart badge; harmless no-op for every
      // other stepper (PDP qty picker, etc.) since updateFreeShipping()
      // bails out when it finds no cart drawer content, and the removal
      // branch below only fires when a [data-cart-row] ancestor exists.
      const inCartDrawer = !!st.closest('[data-drawer="cart"]');
      st.querySelectorAll("[data-step]").forEach((b) => {
        b.addEventListener("click", () => {
          const delta = parseInt(b.getAttribute("data-step"), 10);
          const cur = parseInt(qtyEl.textContent, 10) || 1;
          // The trash icon at qty 1 is a promise, not just a floor: a
          // removable stepper decrementing past 1 removes the whole row
          // instead of clamping at 1 forever (which is what silently
          // broke "remove item" before this fix).
          if (delta < 0 && cur <= 1 && removable) {
            const row = st.closest("[data-cart-row]");
            if (row) {
              row.remove();
              if (inCartDrawer) {
                bumpCart(delta);
                checkCartEmpty();
                updateFreeShipping();
              } else {
                // Cart page: no badge to bump, but the summary and the
                // empty state both have to keep up with the removal.
                syncCartPageSummary();
                checkCartPageEmpty();
              }
              return;
            }
          }
          qtyEl.textContent = Math.max(1, cur + delta);
          syncDec();
          if (removable && inCartDrawer) bumpCart(delta);
          if (inCartDrawer) updateFreeShipping();
          else syncCartPageSummary();
        });
      });
    });
  }

  /* Flash-sale countdown — ticks Days / Hrs / Min toward a deadline that
     is (days,hrs,min) from first load, so the demo always counts down. */
  function initCountdown(scope) {
    scope.querySelectorAll("[data-countdown]").forEach((el) => {
      if (el.dataset.cdInit) return;
      el.dataset.cdInit = "1";
      const d = parseInt(el.dataset.days || "1", 10);
      const h = parseInt(el.dataset.hrs || "9", 10);
      const m = parseInt(el.dataset.min || "46", 10);
      const deadline =
        new Date().getTime() + (d * 86400 + h * 3600 + m * 60) * 1000;
      const dEl = el.querySelector("[data-cd-days]");
      const hEl = el.querySelector("[data-cd-hrs]");
      const mEl = el.querySelector("[data-cd-min]");
      const sEl = el.querySelector("[data-cd-sec]");
      const pad = (n) => String(n).padStart(2, "0");
      function tick() {
        let diff = Math.max(0, deadline - new Date().getTime());
        const days = Math.floor(diff / 86400000);
        diff -= days * 86400000;
        const hrs = Math.floor(diff / 3600000);
        diff -= hrs * 3600000;
        const mins = Math.floor(diff / 60000);
        diff -= mins * 60000;
        const secs = Math.floor(diff / 1000);
        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hrs);
        if (mEl) mEl.textContent = pad(mins);
        if (sEl) sEl.textContent = pad(secs);
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------------------------------------------------------------
     Checkout steps — the page ships a two-tab stepper (Shipping →
     Payment) but everything used to render at once. Sections carry
     [data-checkout-step="1"|"2"]; step 1 collects shipping + personal
     details and ends in "Continue to payment", step 2 reveals the
     payment methods and the real "Place order" submit.

     Both steps live inside ONE <form>, so step 1's CTA must be
     type="button" — a submit there would fire the form's demo handler
     and skip straight to thank-you.html without ever showing payment.
     --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
     Card details form (checkout) — revealed only while the "Credit /
     debit card" method is selected, so the step stays short for the
     methods that need no input. Also formats the three fields as the
     user types (groups of 4 / MM/YY / digits only) and keeps them out
     of validation while hidden, since hidden required fields block
     submit with no visible field to fix.
     --------------------------------------------------------------- */
  function initCardForm(scope) {
    const form = scope.querySelector("[data-card-form]");
    if (!form || form.dataset.cardReady) return;
    form.dataset.cardReady = "1";
    const radios = document.querySelectorAll('input[name="payment"]');
    if (!radios.length) return;

    const sync = () => {
      const cc = document.querySelector('input[name="payment"][value="cc"]');
      const on = !!cc && cc.checked && !cc.disabled;
      form.hidden = !on;
      if (on) {
        form.classList.remove("is-in");
        void form.offsetWidth; /* restart the reveal */
        form.classList.add("is-in");
      }
    };
    radios.forEach((r) => r.addEventListener("change", sync));
    sync();

    const digits = (v) => v.replace(/\D/g, "");
    const num = form.querySelector("[data-card-number]");
    if (num)
      num.addEventListener("input", () => {
        num.value = digits(num.value).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
      });
    const exp = form.querySelector("[data-card-exp]");
    if (exp)
      exp.addEventListener("input", () => {
        const d = digits(exp.value).slice(0, 4);
        exp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
      });
    const cvv = form.querySelector("[data-card-cvv]");
    if (cvv) cvv.addEventListener("input", () => (cvv.value = digits(cvv.value).slice(0, 4)));
  }

  function initCheckoutSteps(scope) {
    const form = scope.querySelector("[data-checkout-next]") && document.querySelector("form");
    if (!form || form.dataset.stepsReady) return;
    const nextBtn = document.querySelector("[data-checkout-next]");
    const backBtn = document.querySelector("[data-checkout-back]");
    const submitBtn = document.querySelector("[data-checkout-submit]");
    if (!nextBtn || !submitBtn) return;
    form.dataset.stepsReady = "1";

    function show(step) {
      document.querySelectorAll("[data-checkout-step]").forEach((el) => {
        el.hidden = el.getAttribute("data-checkout-step") !== String(step);
      });
      nextBtn.hidden = step !== 1;
      submitBtn.hidden = step !== 2;
      if (backBtn) backBtn.hidden = step !== 2;
      /* Stepper: steps before the current one are .is-done (tick + filled
         connector), the current one is .is-current, the rest stay plain. */
      document.querySelectorAll("[data-step-tab]").forEach((tab) => {
        const n = parseInt(tab.getAttribute("data-step-tab"), 10);
        tab.classList.toggle("is-current", n === step);
        tab.classList.toggle("is-done", n < step);
      });
      document.querySelectorAll("[data-step-line]").forEach((line) => {
        line.classList.toggle("is-done", step > 1);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    nextBtn.addEventListener("click", () => {
      /* Honour the browser's own required-field validation for step 1
         before advancing — otherwise a user could skip past empty
         address fields and only get stopped at the very end. */
      const stepOne = [...document.querySelectorAll('[data-checkout-step="1"]')];
      for (const section of stepOne) {
        for (const field of section.querySelectorAll("input, select, textarea")) {
          if (!field.checkValidity()) {
            field.reportValidity();
            return;
          }
        }
      }
      show(2);
    });
    if (backBtn) backBtn.addEventListener("click", () => show(1));
    document.querySelectorAll("[data-step-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        // Only allow jumping BACK to step 1 via the tabs; advancing must
        // go through the CTA so validation still runs.
        if (tab.getAttribute("data-step-tab") === "1") show(1);
      });
    });

    show(1);
  }

  /* ---------------------------------------------------------------
     Checkout option rows (.optrow) + their pickers.

     Two groups, both [data-optgroup]: shipping TYPE (deliver / pickup)
     and shipping DATE (asap / schedule). Selecting a row that carries
     [data-opens] also opens its picker, and whatever the picker returns
     is written back into that row's [data-opt-meta] on the right.
     --------------------------------------------------------------- */
  /* Branch tree — city → area → the branches assigned to that area.
     Mirrors the BRANCHES list on branches.html, with a couple of extra
     stores per area so the picker has something to actually filter. */
  const STORE_TREE = {
    Cairo: {
      "New Cairo": ["Exception 5th Settlement — 90th St", "Exception Al Rehab — Market Mall"],
      "Nasr City": ["Exception Nasr City — Abbas El Akkad St", "Exception City Stars — Level 2"],
      Maadi: ["Exception Maadi — Road 9", "Exception Degla — Road 231"],
      Zamalek: ["Exception Zamalek — 12 26th of July St"],
      Heliopolis: ["Exception Heliopolis — Cleopatra Square", "Exception Korba — Baghdad St"],
    },
    Giza: {
      "Sheikh Zayed": ["Exception Sheikh Zayed — Americana Plaza", "Exception Arkan — Arkan Plaza"],
      Mohandessin: ["Exception Mohandessin — Gameat El Dowal St"],
      Dokki: ["Exception Dokki — Tahrir St"],
    },
    Alexandria: {
      Downtown: ["Exception Alexandria — Fouad St"],
      Smouha: ["Exception Smouha — Green Plaza"],
    },
  };
  const SCHED_SLOTS = [
    "11:00 AM – 1:00 PM",
    "12:00 PM – 2:00 PM",
    "1:00 PM – 3:00 PM",
    "3:00 PM – 5:00 PM",
    "5:00 PM – 7:00 PM",
    "7:00 PM – 9:00 PM",
  ];

  /* ---------------------------------------------------------------
     Checkout mobile bar — on phones the order summary is a long card the
     shopper has to scroll past to reach the CTA. Dock it to a fixed bar
     at the bottom instead: collapsed it shows just the total and a +,
     tapping expands the full summary, and the step CTA rides along.

     The summary and the CTAs are MOVED, not duplicated — syncSummary()
     resolves [data-summary-*] with querySelector, so a second copy would
     silently stop updating. At lg they move back to the sticky sidebar.
     --------------------------------------------------------------- */
  function initCheckoutMobileBar(scope) {
    const summary = scope.querySelector("[data-order-summary]");
    const actions = scope.querySelector("[data-checkout-actions]");
    const form = summary && summary.closest("form");
    if (!summary || !actions || !form || form.dataset.barReady) return;
    form.dataset.barReady = "1";

    // Remember exactly where each block came from so lg puts it back.
    const home = (el) => ({ parent: el.parentNode, next: el.nextSibling });
    const summaryHome = home(summary);
    const actionsHome = home(actions);

    const bar = document.createElement("div");
    bar.className = "checkout-bar";
    bar.innerHTML = `
      <div class="checkout-bar__panel" data-bar-panel></div>
      <button type="button" class="checkout-bar__head" data-bar-toggle aria-expanded="false">
        <span class="checkout-bar__label">Order Summary</span>
        <span class="checkout-bar__total" data-bar-total></span>
        <span class="checkout-bar__plus" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        </span>
      </button>
      <div class="checkout-bar__actions" data-bar-actions></div>`;
    form.appendChild(bar); // inside the form, so the submit button still submits

    const panel = bar.querySelector("[data-bar-panel]");
    const actionSlot = bar.querySelector("[data-bar-actions]");
    const toggle = bar.querySelector("[data-bar-toggle]");
    const totalOut = bar.querySelector("[data-bar-total]");
    const totalSrc = scope.querySelector("[data-summary-total]");

    /* Mirror the real total rather than adding a second [data-summary-total]:
       an observer catches every write (promo, wallet, step change) without
       syncSummary needing to know this bar exists. */
    if (totalSrc) {
      const mirror = () => (totalOut.textContent = totalSrc.textContent);
      mirror();
      new MutationObserver(mirror).observe(totalSrc, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    const mq = window.matchMedia("(max-width: 1023px)");
    let docked = false;
    let collapsedH = 0;

    /* Pad the form by the COLLAPSED height only — measuring while the panel
       is open would leave a viewport-sized gap under the page. */
    function setPad() {
      if (!mq.matches) {
        form.style.paddingBottom = "";
        return;
      }
      if (!bar.classList.contains("is-open")) collapsedH = bar.offsetHeight;
      form.style.paddingBottom = collapsedH + 16 + "px";
    }

    function apply() {
      if (mq.matches && !docked) {
        panel.appendChild(summary);
        actionSlot.appendChild(actions);
        summary.classList.add("checkout-bar__summary");
        docked = true;
      } else if (!mq.matches && docked) {
        summaryHome.parent.insertBefore(summary, summaryHome.next);
        actionsHome.parent.insertBefore(actions, actionsHome.next);
        summary.classList.remove("checkout-bar__summary");
        bar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        docked = false;
      }
      setPad();
    }

    toggle.addEventListener("click", () => {
      const open = bar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      setPad();
    });
    mq.addEventListener("change", apply);
    window.addEventListener("resize", setPad, { passive: true });
    apply();
  }

  function initCheckoutOptions(scope) {
    const groups = scope.querySelectorAll("[data-optgroup]");
    if (!groups.length) return;

    /* ---- row selection ---- */
    groups.forEach((group) => {
      if (group.dataset.optReady) return;
      group.dataset.optReady = "1";
      const rows = [...group.querySelectorAll(".optrow")];
      rows.forEach((row) => {
        row.addEventListener("click", () => {
          rows.forEach((r) => r.classList.toggle("is-selected", r === row));
          /* Pickup means the store IS the address, so the address form asks
             for something that doesn't exist for this order — hide it.
             Toggled (not removed) so flipping back to delivery restores the
             form with everything typed into it intact. */
          if (group.getAttribute("data-optgroup") === "shiptype") {
            const pickup = row.getAttribute("data-opt") === "pickup";
            const addr = document.querySelector("[data-ship-address]");
            if (addr) addr.hidden = pickup;
            /* The rush-hour note ([data-rush-note]) is owned by
               initOOSShipping, which also weighs the chosen date and the
               branch — it listens for this click itself. */
          }
          const opens = row.getAttribute("data-opens");
          if (opens) openOverlay(opens);
        });
      });
    });

    const meta = (key) => document.querySelector('[data-opt-meta="' + key + '"]');
    function setMeta(key, text) {
      const el = meta(key);
      if (!el) return;
      el.textContent = text;
      el.classList.remove("optrow__meta--prompt"); // resolved — no longer a prompt
    }

    /* ---- "Deliver to my address" mirrors the address selects below ---- */
    const addressSection = document.querySelector('[data-checkout-step="1"] .grid.grid-cols-1');
    if (addressSection && !addressSection.dataset.mirrorReady) {
      addressSection.dataset.mirrorReady = "1";
      const selects = [...addressSection.querySelectorAll("select")];
      const syncAddress = () => {
        const [, area, district] = selects.map((s) => s.options[s.selectedIndex].textContent.trim());
        const el = meta("deliver");
        if (el) el.textContent = [area, district].filter(Boolean).join(", ");
      };
      selects.forEach((s) => s.addEventListener("change", syncAddress));
      syncAddress();
    }

    /* ---- store picker ---- */
    const citySel = document.querySelector("[data-store-city]");
    const areaSel = document.querySelector("[data-store-area]");
    const storeList = document.querySelector("[data-store-list]");
    const storeConfirm = document.querySelector("[data-store-confirm]");
    if (citySel && areaSel && storeList && storeConfirm && !citySel.dataset.storeReady) {
      citySel.dataset.storeReady = "1";
      let pickedStore = null;

      // These rebuild <option>s at runtime, so the enhanced menu built by
      // initSelects() has to be told to re-read them.
      const resync = (el) => el._uiSelectRefresh && el._uiSelectRefresh();
      const fillCities = () => {
        citySel.innerHTML = Object.keys(STORE_TREE)
          .map((c) => `<option>${esc(c)}</option>`)
          .join("");
        resync(citySel);
      };
      const fillAreas = () => {
        const areas = Object.keys(STORE_TREE[citySel.value] || {});
        areaSel.innerHTML = areas.map((a) => `<option>${esc(a)}</option>`).join("");
        resync(areaSel);
      };
      const fillStores = () => {
        const list = (STORE_TREE[citySel.value] || {})[areaSel.value] || [];
        pickedStore = null;
        storeConfirm.disabled = true;
        storeList.innerHTML = list.length
          ? list
              .map(
                (s) => `
          <button type="button" class="pickrow" data-store="${esc(s)}">
            <span class="pickrow__radio"></span>
            <span class="text-sm text-primaryDark">${esc(s)}</span>
          </button>`,
              )
              .join("")
          : '<p class="py-6 text-center text-sm text-gray-500">No stores in this area yet.</p>';
      };

      fillCities();
      fillAreas();
      fillStores();
      citySel.addEventListener("change", () => {
        fillAreas();
        fillStores();
      });
      areaSel.addEventListener("change", fillStores);

      storeList.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-store]");
        if (!btn) return;
        pickedStore = btn.getAttribute("data-store");
        storeList.querySelectorAll(".pickrow").forEach((r) => r.classList.toggle("is-selected", r === btn));
        storeConfirm.disabled = false;
      });
      storeConfirm.addEventListener("click", () => {
        if (!pickedStore) return;
        setMeta("pickup", pickedStore);
        closeOverlay();
      });
    }

    /* ---- schedule picker ---- */
    const daysWrap = document.querySelector("[data-sched-days]");
    const slotsWrap = document.querySelector("[data-sched-slots]");
    const schedConfirm = document.querySelector("[data-sched-confirm]");
    if (daysWrap && slotsWrap && schedConfirm && !daysWrap.dataset.schedReady) {
      daysWrap.dataset.schedReady = "1";
      let pickedDay = null;
      let pickedSlot = null;

      // Next 7 days starting today.
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          key: String(i),
          label: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          long: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        };
      });

      const renderSlots = () => {
        pickedSlot = null;
        schedConfirm.disabled = true;
        slotsWrap.innerHTML = SCHED_SLOTS.map(
          (s) => `
          <button type="button" class="pickrow" data-slot="${esc(s)}">
            <span class="pickrow__radio"></span>
            <span class="text-sm text-primaryDark">${esc(s)}</span>
          </button>`,
        ).join("");
      };

      daysWrap.innerHTML = days
        .map(
          (d, i) => `
        <button type="button" class="pickchip${i === 0 ? " is-selected" : ""}" data-day="${d.key}" data-day-label="${esc(d.long)}">
          <span class="block text-sm font-semibold text-primaryDark">${esc(d.label)}</span>
        </button>`,
        )
        .join("");
      pickedDay = days[0];
      renderSlots();

      /* Day-strip arrows. Scrolls by ~2 chips a press and greys out at each
         end so the control reflects whether there's anything left to reach. */
      const prevBtn = document.querySelector("[data-sched-prev]");
      const nextBtn = document.querySelector("[data-sched-next]");
      if (prevBtn && nextBtn) {
        const step = () => {
          const chip = daysWrap.querySelector(".pickchip");
          return chip ? (chip.getBoundingClientRect().width + 8) * 2 : 200;
        };
        const syncNav = () => {
          const max = daysWrap.scrollWidth - daysWrap.clientWidth - 1;
          prevBtn.disabled = daysWrap.scrollLeft <= 0;
          nextBtn.disabled = max <= 0 || daysWrap.scrollLeft >= max;
        };
        prevBtn.addEventListener("click", () => daysWrap.scrollBy({ left: -step(), behavior: "smooth" }));
        nextBtn.addEventListener("click", () => daysWrap.scrollBy({ left: step(), behavior: "smooth" }));
        daysWrap.addEventListener("scroll", () => window.requestAnimationFrame(syncNav), { passive: true });
        window.addEventListener("resize", syncNav);
        syncNav();
        // Widths are 0 while the modal is still hidden, so re-check on open.
        document.querySelectorAll('[data-opt="later"]').forEach((r) => r.addEventListener("click", () => setTimeout(syncNav, 60)));
      }

      daysWrap.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-day]");
        if (!btn) return;
        daysWrap.querySelectorAll(".pickchip").forEach((c) => c.classList.toggle("is-selected", c === btn));
        pickedDay = { long: btn.getAttribute("data-day-label") };
        renderSlots();
      });
      slotsWrap.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-slot]");
        if (!btn) return;
        pickedSlot = btn.getAttribute("data-slot");
        slotsWrap.querySelectorAll(".pickrow").forEach((r) => r.classList.toggle("is-selected", r === btn));
        schedConfirm.disabled = false;
      });
      schedConfirm.addEventListener("click", () => {
        if (!pickedDay || !pickedSlot) return;
        setMeta("later", pickedDay.long + " | " + pickedSlot);
        closeOverlay();
      });
    }
  }

  function initDemoForms(scope) {
    scope.querySelectorAll("[data-newsletter]").forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        f.reset();
      }),
    );
    scope.querySelectorAll("[data-location-form]").forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const city = f.querySelector("[data-loc-city]").value;
        const area = f.querySelector("[data-loc-area]").value;
        /* Routed through commitArea so a manual pick lands in exactly the
           same state as a detected one — body[data-area], ex-area and the
           ex:area-change event. Anything inventory-scoped can then read one
           source of truth regardless of how the area was resolved. */
        if (area && city) commitArea({ area: area, city: city });
        else commitLocation(DEFAULT_LOCATION);
        closeOverlay();
        document
          .querySelectorAll("[data-locmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
      }),
    );
    scope.querySelectorAll("[data-demo-form]").forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        if (f.getAttribute("data-reset") !== "false") f.reset();

        /* The attribute's VALUE is the confirmation copy, and nothing was
           reading it — every demo form simply blanked on submit and left the
           visitor with no sign it had gone anywhere. Skipped when the form
           redirects, since the next page is the confirmation. */
        const redirect = f.getAttribute("data-redirect");
        const msg = f.getAttribute("data-demo-form");
        if (msg && !redirect) {
          const prev = f.querySelector("[data-demo-form-note]");
          if (prev) prev.remove();
          const note = document.createElement("p");
          note.className = "form-sent";
          note.setAttribute("role", "status");
          note.setAttribute("data-demo-form-note", "");
          note.textContent = msg;
          f.appendChild(note);
          clearTimeout(f._demoNoteTimer);
          f._demoNoteTimer = setTimeout(() => note.remove(), 6000);
        }

        // Mock success flow: navigate to the next page if requested.
        if (redirect) setTimeout(() => (window.location.href = redirect), 250);
      }),
    );

    // Reviews "Show more / less": reveal/hide [data-review-extra] cards.
    scope.querySelectorAll("[data-reviews-toggle]").forEach((btn) => {
      const section = btn.closest("section");
      const extras = section ? [...section.querySelectorAll("[data-review-extra]")] : [];
      const label = btn.querySelector("[data-reviews-toggle-label]");
      if (!extras.length) {
        btn.hidden = true; // nothing to reveal
        return;
      }
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        extras.forEach((e) => (e.hidden = expanded));
        btn.setAttribute("aria-expanded", String(!expanded));
        btn.classList.toggle("is-expanded", !expanded);
        if (label) label.textContent = expanded ? "Show more reviews" : "Show less";
      });
    });

    // Review sheet: star picker (click star N → fill 1..N) + submit closes the sheet.
    scope.querySelectorAll("[data-review-stars]").forEach((group) => {
      const stars = [...group.querySelectorAll("[data-review-star]")];
      const paint = (n) =>
        stars.forEach((s, i) => {
          s.classList.toggle("text-cta", i < n);
          s.classList.toggle("text-gray-300", i >= n);
        });
      stars.forEach((s) =>
        s.addEventListener("click", () => {
          group.dataset.rating = s.getAttribute("data-review-star");
          paint(Number(group.dataset.rating));
        }),
      );
    });
    scope.querySelectorAll("[data-review-form]").forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        closeOverlay();
        f.reset();
        const group = f.querySelector("[data-review-stars]");
        if (group) {
          group.dataset.rating = "";
          group.querySelectorAll("[data-review-star]").forEach((s) => {
            s.classList.remove("text-cta");
            s.classList.add("text-gray-300");
          });
        }
      }),
    );
  }

  /* ---------------------------------------------------------------
     Sticky navbar on scroll (desktop) — mirrors useWindowScroll(150)
     --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
     OUT OF STOCK → SCHEDULE

     An out-of-stock product isn't removed from the shelf: it is baked to
     order, so the card swaps its quick-add "+" for a Schedule control and
     wears a badge. Scheduling one records it, and checkout then refuses
     "Within 2 hours" — you cannot two-hour-deliver something nobody has
     baked yet — and explains why in one line instead of failing silently
     at the end of the flow.

     The record lives in localStorage because the card and the checkout are
     different pages; the demo cart has no server behind it.
     --------------------------------------------------------------- */
  const OOS_KEY = "ex-oos";
  /* Which card in an unseeded list becomes the out-of-stock one. Index 1
     (the second card) rather than the first, so lists still open on a
     normal product and the feature reads as an exception, not the rule. */
  const OOS_DEMO_INDEX = 1;

  function oosList() {
    try {
      const v = JSON.parse(localStorage.getItem(OOS_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }
  function oosSave(list) {
    try {
      localStorage.setItem(OOS_KEY, JSON.stringify(list));
    } catch (e) {
      /* private mode — the flag just won't survive the page hop */
    }
    document.body.classList.toggle("has-oos", list.length > 0);
    document.dispatchEvent(new CustomEvent("ex:oos-change", { detail: list }));
  }
  function oosAdd(name) {
    const l = oosList();
    if (l.indexOf(name) === -1) l.push(name);
    oosSave(l);
  }
  function oosRemove(name) {
    oosSave(oosList().filter((n) => n !== name));
  }

  const ICON_SCHEDULE =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  /* A card's product name, wherever the page happens to keep it. */
  function productName(widget) {
    const link = widget.closest("a[aria-label]");
    if (link) return link.getAttribute("aria-label").trim();
    const wrap = widget.closest("a") || widget.parentElement;
    const img = wrap && wrap.querySelector("img[alt]");
    if (img && img.alt) return img.alt.trim();
    const t = wrap && wrap.querySelector("h3, h4, p.line-clamp-1, .prod-name");
    return t ? t.textContent.trim() : "This item";
  }

  /* Schedule reuses the quick-add's own [data-add-btn] / [data-counter]
     pair, so adding a second one behaves exactly like any other product —
     the existing stepper handlers drive it and nothing had to be
     reimplemented. Only the button's face differs: a calendar and a verb. */
  function scheduleWidgetHTML(qty, name) {
    const on = qty > 0;
    return (
      '<button type="button" data-add-btn class="sched-btn' + (on ? " hidden" : "") + '" ' +
      'aria-label="Schedule ' + esc(name) + '">' +
      '<span class="sched-btn__ico">' + ICON_SCHEDULE + "</span>" +
      "<span>Schedule</span></button>" +
      '<span class="' + (on ? "flex" : "hidden") + ' items-center gap-0.5 bg-primary-light rounded-[8px] h-[42px] px-2 shadow-custom-5" data-counter>' +
      '<button type="button" data-dec aria-label="Remove" class="grid place-items-center size-[26px] rounded-[4px] hover:bg-black/5 transition-colors">' +
      '<img data-dec-icon src="images/icons/trash.svg" alt="" width="18" height="18" /></button>' +
      '<span data-qty class="w-[34px] text-center text-lg font-medium text-primaryDark tabular-nums">' + (on ? qty : 1) + "</span>" +
      '<button type="button" data-inc aria-label="Add" class="grid place-items-center size-[26px] rounded-[4px] bg-primary-300 text-white hover:bg-primary-400 transition-colors">' +
      '<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>' +
      "</span>"
    );
  }

  /* Turn one quick-add widget into the out-of-stock treatment. */
  function markOOS(widget) {
    if (!widget || widget.dataset.oosReady) return;
    widget.dataset.oosReady = "1";
    widget.setAttribute("data-type", "oos");
    const name = productName(widget);
    widget.setAttribute("data-oos-name", name);

    /* The badge sits on the image, opposite the wishlist heart. */
    const media = widget.parentElement;
    if (media && !media.querySelector(".oos-badge")) {
      media.classList.add("is-oos");
      const b = document.createElement("span");
      b.className = "oos-badge";
      b.innerHTML = '<span class="oos-badge__dot"></span>Out of stock';
      media.appendChild(b);
    }
    /* The "Scheduled for later" line sits at the other bottom corner of the
       image, so it explains the counter without crowding it. */
    if (media && !media.querySelector(".sched-note")) {
      const n = document.createElement("span");
      n.className = "sched-note";
      n.textContent = "Scheduled for later";
      media.appendChild(n);
    }
    widget.classList.add("sched-slot");
    const scheduled = oosList().indexOf(name) !== -1;
    widget.innerHTML = scheduleWidgetHTML(scheduled ? 1 : 0, name);
    if (media) media.classList.toggle("is-scheduled", scheduled);
  }

  /* Called after the shared stepper has moved a quantity. Records or clears
     the branch in the same breath, so the checkout rule can never disagree
     with what the card is showing. */
  function oosSync(widget) {
    if (!widget) return;
    const name = widget.getAttribute("data-oos-name");
    if (!name) return;
    const counter = widget.querySelector("[data-counter]");
    const showing = counter && !counter.classList.contains("hidden");
    const media = widget.parentElement;
    if (media) media.classList.toggle("is-scheduled", !!showing);
    if (showing) oosAdd(name);
    else oosRemove(name);
  }

  function initStock(scope) {
    scope = scope || document;
    document.body.classList.toggle("has-oos", oosList().length > 0);

    /* Cards already declared out of stock by their page. */
    scope.querySelectorAll('[data-add-widget][data-type="oos"]').forEach(markOOS);

    /* Demo seeding: every product list or carousel gets one out-of-stock
       card so the flow can be shown without hunting for the right product.
       Skipped for any list that already has one, and for a list opted out
       with data-no-oos. */
    const groups = new Map();
    scope.querySelectorAll("[data-add-widget]:not([data-oos-ready])").forEach((w) => {
      const list = w.closest("[data-no-oos]") ? null : w.closest(".carousel-track, .grid, [data-product-list]");
      if (!list) return;
      if (!groups.has(list)) groups.set(list, []);
      groups.get(list).push(w);
    });
    groups.forEach((widgets, list) => {
      if (list.querySelector('[data-add-widget][data-type="oos"]')) return;
      if (widgets.length < 3) return; // too small a row to spare one
      markOOS(widgets[Math.min(OOS_DEMO_INDEX, widgets.length - 1)]);
    });
  }

  /* ---- cash on delivery: more than one thing can rule it out ----
     A gift order hides prices from the recipient; a scheduled order is
     charged up front. Both can apply at once, so the reasons are held in a
     set — otherwise turning one off would re-enable the row while the other
     still stood. */
  const COD_BLOCKS = new Set();
  const COD_BLOCK_TEXT = {
    gift: "Not available for gift orders \u2014 pay by card or wallet instead.",
    scheduled: "Scheduled orders are paid when you place them, so cash on delivery isn't available.",
  };
  function setCodBlock(reason, on) {
    if (on) COD_BLOCKS.add(reason);
    else COD_BLOCKS.delete(reason);

    const cod = document.querySelector('input[name="payment"][value="cod"]');
    const row = cod && cod.closest(".optrow");
    if (!row) return;
    const blocked = COD_BLOCKS.size > 0;

    let note = row.querySelector("[data-cod-note]");
    if (!note) {
      note = document.createElement("span");
      note.className = "ship-note";
      note.setAttribute("data-cod-note", "");
      row.appendChild(note);
    }
    /* One reason at a time in the copy: two stacked sentences in a payment
       row is more than anyone reads. Gift leads — it is the one the buyer
       just toggled themselves. */
    const reasonShown = COD_BLOCKS.has("gift") ? "gift" : "scheduled";
    note.textContent = COD_BLOCK_TEXT[reasonShown] || "";
    note.hidden = !blocked;

    row.classList.toggle("is-disabled", blocked);
    cod.disabled = blocked;
    if (blocked && cod.checked) {
      const cc = document.querySelector('input[name="payment"][value="cc"]');
      if (cc) {
        cc.checked = true;
        cc.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  /* ---- checkout: express delivery is off the table for baked-to-order ---- */
  function initOOSShipping(scope) {
    const group = (scope || document).querySelector('[data-optgroup="shipdate"]');
    if (!group || group.dataset.oosReady) return;
    group.dataset.oosReady = "1";
    const asap = group.querySelector('[data-opt="asap"]');
    const later = group.querySelector('[data-opt="later"]');
    if (!asap || !later) return;

    /* The note lives INSIDE the express row — it explains that one option, so
       it belongs to it rather than floating under both. Appended to the row
       itself, not the title block, so it lands on its own line beneath the
       icon / title / time and spans their full width (see .optrow in
       styles.css, which wraps). Generic wording on purpose: naming the items
       would grow with every out-of-stock line in the cart. */
    const body = asap;
    let note = body.querySelector("[data-oos-note]");
    if (!note) {
      note = document.createElement("span");
      note.className = "ship-note";
      note.setAttribute("data-oos-note", "");
      note.hidden = true;
      note.textContent =
        "Your cart has items baked to order, so this isn't available. Schedule a time instead.";
      body.appendChild(note);
    }

    function sync() {
      const blocked = oosList().length > 0;
      asap.classList.toggle("is-disabled", blocked);
      asap.disabled = blocked;
      asap.setAttribute("aria-disabled", String(blocked));
      note.hidden = !blocked;
      if (!blocked) return;
      /* Move the selection rather than leaving a disabled row highlighted. */
      if (asap.classList.contains("is-selected")) {
        asap.classList.remove("is-selected");
        later.classList.add("is-selected");
      }
    }

    /* Rush-hour warning: only when the branch this order comes from is
       flagged busy AND the buyer has actually chosen the two-hour option.
       Any other combination has nothing to warn about — a scheduled order
       has a slot, and a quiet branch will make the window. */
    const dnote = document.querySelector("[data-rush-note]");
    /* DEMO: every branch answers "busy" so the note is always there to show.
       In production this reads the branch's own flag, which the backend sets
       live — flip DEMO_ALWAYS_BUSY to false and the real rule below takes
       over, showing the note only for a branch under pressure. */
    const DEMO_ALWAYS_BUSY = true;
    function branchBusy() {
      if (DEMO_ALWAYS_BUSY) return true;
      const name = document.body.dataset.branch;
      if (!name) return false;
      const b = BRANCHES.filter((x) => x.name === name)[0];
      return !!(b && b.busy);
    }
    function syncDeliveryNote() {
      if (!dnote) return;
      const pickup = !!document.querySelector('[data-optgroup="shiptype"] [data-opt="pickup"].is-selected');
      dnote.hidden = pickup || !asap.classList.contains("is-selected") || !branchBusy();
    }

    /* A scheduled order is charged when it is placed, so cash on delivery
       comes off the table — whether the buyer chose to schedule or the cart
       forced it. Read from the actual selection, not from the stock flag, so
       freely choosing "Schedule for later" behaves the same way. */
    function syncPayment() {
      setCodBlock("scheduled", later.classList.contains("is-selected"));
    }

    /* Bound on the group, so it runs after the row's own click handler in
       initCheckoutOptions has moved .is-selected. */
    group.addEventListener("click", function () {
      setTimeout(syncPayment, 0);
    });

    function syncAll() {
      sync();
      syncPayment();
      syncDeliveryNote();
    }

    group.addEventListener("click", function () {
      setTimeout(syncDeliveryNote, 0);
    });
    /* Switching to store pickup, or changing area (which re-resolves the
       branch), can both change the answer. */
    const typeGroup = document.querySelector('[data-optgroup="shiptype"]');
    if (typeGroup) typeGroup.addEventListener("click", function () { setTimeout(syncDeliveryNote, 0); });
    document.addEventListener("ex:area-change", syncDeliveryNote);

    syncAll();
    document.addEventListener("ex:oos-change", syncAll);
    /* The branch is restored from storage during boot, which can land after
       this runs — without a second pass the note would stay hidden on a busy
       branch until something else was clicked. */
    window.addEventListener("load", syncDeliveryNote);
    setTimeout(syncDeliveryNote, 0);
  }

  function initStickyNav() {
    const nav = document.querySelector("[data-navbar]");
    const floatCart = document.querySelector("[data-floating-cart]");
    if (!nav) return;
    /* Publish the category bar's height so page-level sticky elements can
       park directly under it (the cafe menu head does) without hard-coding
       a number that breaks the moment the bar's icons or padding change. */
    const publishHeight = () =>
      document.documentElement.style.setProperty(
        "--catnav-h",
        nav.offsetHeight + "px",
      );
    publishHeight();
    window.addEventListener("load", publishHeight);
    window.addEventListener("resize", publishHeight, { passive: true });
    const placeholder = document.createElement("div");
    nav.parentNode.insertBefore(placeholder, nav.nextSibling);
    // Stick the category bar once its own top reaches the viewport top
    // (i.e. once the mint header above it has scrolled away).
    let stuck = false;
    /* z-[85], NOT z-[100]: the overlay backdrop is z-90 and the drawers/
       modals are z-100. At z-100 the stuck category bar tied the drawer and
       sat ON TOP of the backdrop, so opening the cart left the nav
       undimmed. 85 keeps it above page content and the floating cart (80)
       while letting the backdrop cover it when an overlay opens. */
    const stickyCls = [
      "fixed",
      "top-0",
      "left-0",
      "right-0",
      "z-[85]",
      "animate-slideDown",
    ];
    // Measure position LIVE rather than caching an offset at init (that cached
    // value could be computed before web-fonts/images settled and left the bar
    // stuck at the very top, overlapping the header). When not stuck we watch
    // the nav itself; once stuck we watch the placeholder holding its old spot.
    function onScroll() {
      // Hard guard: at the very top the bar must sit in flow under the header,
      // never fixed (init can mis-measure before the header lays out).
      const should =
        window.scrollY > 0 &&
        (stuck ? placeholder : nav).getBoundingClientRect().top <= 0;
      if (should !== stuck) {
        stuck = should;
        placeholder.style.height = should ? nav.offsetHeight + "px" : "0px";
        stickyCls.forEach((c) => nav.classList.toggle(c, should));
        // `relative` (base state) must yield to `fixed` when stuck, since
        // both set `position` and `relative` wins on source order.
        nav.classList.toggle("relative", !should);
      }
      if (floatCart) {
        const vis = stuck && window.scrollY > 40;
        floatCart.classList.toggle("is-visible", vis);
        /* Mirror the state onto <body>. The cart is fixed into the page
           gutter, so anything laying content out against that gutter (the
           cafe menu's chip row) needs to know it is there — and it cannot
           reach the cart with a CSS selector from inside the page. */
        document.body.classList.toggle("has-floating-cart", vis);
        // 8px below the (now-stuck) category bar — measured live so it's
        // correct regardless of late web-font reflow.
        if (vis)
          floatCart.style.top = nav.getBoundingClientRect().bottom + 8 + "px";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", onScroll);
    onScroll();
  }

  /* ---------------------------------------------------------------
     Language / direction (EN ⇄ AR) — flips the document to RTL and
     persists the choice. Copy stays English in this static build, but
     the layout genuinely mirrors so RTL support is demonstrable.
     --------------------------------------------------------------- */
  function initialLang() {
    try {
      return localStorage.getItem("ex-lang") === "ar" ? "ar" : "en";
    } catch (e) {
      return "en";
    }
  }

  function applyLang(lang) {
    lang = lang === "ar" ? "ar" : "en";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    try {
      localStorage.setItem("ex-lang", lang);
    } catch (e) {
      /* storage unavailable — session-only toggle */
    }
    document.querySelectorAll("[data-lang]").forEach((b) => {
      const active = b.getAttribute("data-lang") === lang;
      b.classList.toggle("bg-cta", active);
      b.classList.toggle("text-white", active);
      b.classList.toggle("shadow-[0px_1px_2px_rgba(0,0,0,0.05)]", active);
      b.classList.toggle("bg-transparent", !active);
      b.classList.toggle("text-white/80", !active);
    });
    document.querySelectorAll("[data-logo-en]").forEach((img) => {
      const src = img.getAttribute(lang === "ar" ? "data-logo-ar" : "data-logo-en");
      if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    updateLangLabel();
  }
  window.kSetLang = applyLang;

  function currentLang() {
    return document.documentElement.getAttribute("dir") === "rtl" ? "ar" : "en";
  }

  /* The switch always advertises the language you are NOT in, so its label
     is the action. Arabic gets Noto Kufi Arabic via .is-ar; the English
     label uses the site face. Egypt is the only market, so there is no
     country dimension any more. */
  function updateLangLabel() {
    const toArabic = currentLang() !== "ar";
    document.querySelectorAll("[data-lang-toggle]").forEach((el) => {
      el.textContent = toArabic ? "تصفح بالعربية" : "Browse in English";
      el.classList.toggle("is-ar", toArabic);
      el.setAttribute("lang", toArabic ? "ar" : "en");
      el.setAttribute("dir", toArabic ? "rtl" : "ltr");
      el.setAttribute("aria-label", toArabic ? "التبديل إلى العربية" : "Switch to English");
    });
  }

  /* ---------------------------------------------------------------
     Product card — add-to-cart counter (Simple products)
     --------------------------------------------------------------- */
  // Starts equal to the actual unit count in DEMO_CART_ITEMS (1+1=2), not
  // an arbitrary seed — so it reaches exactly 0 when the drawer empties.
  let cartCount = DEMO_CART_ITEMS.reduce((n, it) => n + it.qty, 0);
  /* The branded "box of pastries" art always stays — on the header carts
     AND the sticky/floating one. Only the dark count badge changes: it
     shows the number while there are items, and a small white bag glyph
     once the cart is empty (rather than a bare "0", which reads as a
     count rather than a state). One code path covers every badge on the
     page because they all carry [data-cart-count]. */
  function setCartCount(n) {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      if (n > 0) {
        el.textContent = n;
        el.removeAttribute("aria-label");
      } else {
        el.innerHTML = ICON.bagBadge;
        el.setAttribute("aria-label", "Cart is empty");
      }
    });
  }
  function bumpCart(delta) {
    cartCount = Math.max(0, cartCount + delta);
    setCartCount(cartCount);
  }
  /* Favourites badge — same treatment as the cart's, seeded to the demo
     wishlist on my-account-favorites.html so the header agrees with that
     page. Unlike the cart there is no empty-state glyph: an empty wishlist
     has no state worth showing, so the badge just goes away. display is set
     inline rather than via [hidden] because the badge carries .grid, which
     would win over Tailwind's [hidden] rule on source order. */
  const DEMO_FAV_COUNT = 6;
  let favCount = DEMO_FAV_COUNT;
  function setFavCount(n) {
    document.querySelectorAll("[data-fav-count]").forEach((el) => {
      el.textContent = n;
      el.style.display = n > 0 ? "" : "none";
    });
  }
  function bumpFav(delta) {
    favCount = Math.max(0, favCount + delta);
    setFavCount(favCount);
  }
  function pwQty(w) {
    const q = w.querySelector("[data-qty]");
    return q ? parseInt(q.textContent, 10) || 0 : 0;
  }
  function pwSetQty(w, q) {
    const qtyEl = w.querySelector("[data-qty]");
    if (qtyEl) qtyEl.textContent = q;
    // qty 1 → trash icon; qty ≥ 2 → minus icon
    const icon = w.querySelector("[data-dec-icon]");
    if (icon)
      icon.setAttribute(
        "src",
        q <= 1 ? "images/icons/trash.svg" : "images/icons/minus-sign.svg",
      );
  }
  function pwShowCounter(w, show) {
    const add = w.querySelector("[data-add-btn]");
    const counter = w.querySelector("[data-counter]");
    if (add) add.classList.toggle("hidden", show);
    if (counter) {
      counter.classList.toggle("hidden", !show);
      counter.classList.toggle("flex", show);
      if (show) {
        counter.classList.remove("is-pop");
        void counter.offsetWidth; // reflow so the elastic pop replays
        counter.classList.add("is-pop");
      } else {
        counter.classList.remove("is-pop");
      }
    }
  }

  /* ---------------------------------------------------------------
     Global click / key delegation
     --------------------------------------------------------------- */
  function initDelegation() {
    /* Dedicated menu-close listener: closes the location + pages dropdowns
       on ANY click outside them. Kept separate from the big delegation
       below because handlers there `return` early (e.g. add-to-cart),
       which used to bypass the close and leave the cities dropdown open. */
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-locmenu]")) {
        document
          .querySelectorAll("[data-locmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
      }
    });
    document.addEventListener("click", (e) => {
      /* --- Product card add-to-cart (preventDefault stops the card link) --- */
      const favBtn = e.target.closest("[data-fav]");
      if (favBtn) {
        e.preventDefault();
        favBtn.classList.toggle("is-fav");
        bumpFav(favBtn.classList.contains("is-fav") ? 1 : -1);
        return;
      }
      const addBtn = e.target.closest("[data-add-btn]");
      if (addBtn) {
        e.preventDefault();
        const w = addBtn.closest("[data-add-widget]");
        const srcRect = addBtn.getBoundingClientRect(); // capture before hiding
        pwShowCounter(w, true);
        pwSetQty(w, 1);
        oosSync(w);
        flyToCart(srcRect, () => bumpCart(1)); // badge bumps when the dot lands
        return;
      }
      const incBtn = e.target.closest("[data-inc]");
      if (incBtn) {
        e.preventDefault();
        const w = incBtn.closest("[data-add-widget]");
        pwSetQty(w, pwQty(w) + 1);
        oosSync(w);
        bumpCart(1);
        return;
      }
      const decBtn = e.target.closest("[data-dec]");
      if (decBtn) {
        e.preventDefault();
        const w = decBtn.closest("[data-add-widget]");
        const q = pwQty(w);
        if (q <= 1) {
          pwShowCounter(w, false);
          pwSetQty(w, 0);
        } else {
          pwSetQty(w, q - 1);
        }
        oosSync(w);
        bumpCart(-1);
        return;
      }

      const langBtn = e.target.closest("[data-lang]");
      if (langBtn) {
        e.preventDefault();
        applyLang(langBtn.getAttribute("data-lang"));
        return;
      }
      const themeBtn = e.target.closest("[data-theme-set]");
      if (themeBtn) {
        e.preventDefault();
        applyTheme(themeBtn.getAttribute("data-theme-set"));
        return;
      }
      /* One-tap switch (header + mobile drawer). data-lang-cycle is the
         older alias for the same action. */
      const langCycle = e.target.closest("[data-lang-toggle], [data-lang-cycle]");
      if (langCycle) {
        e.preventDefault();
        applyLang(currentLang() === "ar" ? "en" : "ar");
        return;
      }
      // Location dropdown (desktop): toggle on the pill, close when clicking outside
      const locToggle = e.target.closest("[data-loc-toggle]");
      if (locToggle) {
        e.preventDefault();
        const wrap = locToggle.closest("[data-locmenu]");
        const wasOpen = wrap.classList.contains("is-open");
        document
          .querySelectorAll("[data-locmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
        if (!wasOpen) wrap.classList.add("is-open");
        return;
      }
      if (!e.target.closest("[data-locmenu]")) {
        document
          .querySelectorAll("[data-locmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
      }
      // Category-nav scroll arrows
      const catArrow = e.target.closest("[data-catnav-prev],[data-catnav-next]");
      if (catArrow) {
        e.preventDefault();
        const track = document.querySelector("[data-catnav-track]");
        if (track) {
          const dir = catArrow.hasAttribute("data-catnav-prev") ? -1 : 1;
          /* Just a nudge in the pressed direction — no end handling here.
             The strip is a true loop (initCatnavLoop), so there is no end to
             hit: it keeps travelling the same way and the list repeats. */
          track.scrollBy({ left: dir * 320, behavior: "smooth" });
        }
        return;
      }
      const opener = e.target.closest("[data-open]");
      if (opener) {
        e.preventDefault();
        const key = opener.getAttribute("data-open");
        openOverlay(key);
        return;
      }
      if (e.target.closest("[data-close]")) {
        closeOverlay();
        return;
      }
      if (e.target.classList.contains("overlay-backdrop")) {
        closeOverlay();
      }
    });
    document.addEventListener("keydown", (e) => {
      // The desktop gate is a dropdown, not an overlay, so openEl is null —
      // check the gate flag too or Esc would be dead while it's up.
      if (e.key === "Escape" && (openEl || document.body.classList.contains("loc-gate"))) {
        closeOverlay();
      }
    });
  }

  /* ---------------------------------------------------------------
     Public re-init hook for dynamically added markup
     --------------------------------------------------------------- */
  /* Scroll reveal: add .reveal-in to [data-reveal] elements as they enter. */
  function initReveal(scope) {
    const els = (scope || document).querySelectorAll("[data-reveal]:not(.reveal-in)");
    if (!els.length) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------
     Auto section reveal — give EVERY top-level <section> a smooth
     ease-in entrance site-wide, without hand-annotating every page.
     Sections that already choreograph their own reveals (their own
     [data-reveal] or any [data-reveal] descendant) are left alone so
     we never double-animate. Sticky descendants break inside a
     transformed ancestor, so those sections are skipped. Runs before
     initReveal so the added attributes get observed. Reduced-motion:
     no-op (content stays visible).
     --------------------------------------------------------------- */
  function initAutoReveal(scope) {
    const root = scope || document;
    const main = root.querySelector("main");
    if (!main) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    main
      .querySelectorAll(
        ":scope > section, :scope > div > section, :scope > div > div > section"
      )
      .forEach((sec) => {
        if (sec.hasAttribute("data-reveal") || sec.querySelector("[data-reveal]")) return;
        if (sec.querySelector('[class*="sticky"]')) return;
        sec.setAttribute("data-reveal", "");
      });
  }

  /* ---------------------------------------------------------------
     Tilt cards — vanilla port of React Bits <TiltedCard/> (no React/
     motion dependency). [data-tilt] elements tilt toward the cursor
     with a spring-like rAF lerp, plus a slight scale on hover.
     Optional data-tilt-amp / data-tilt-scale overrides. Pointer-fine
     devices only; reduced-motion leaves the cards static.
     --------------------------------------------------------------- */
  function initTiltCards(scope) {
    const cards = (scope || document).querySelectorAll("[data-tilt]:not([data-tilt-ready])");
    if (!cards.length) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    cards.forEach((card) => {
      card.setAttribute("data-tilt-ready", "1");
      if (reduce || !fine) return;
      const AMP = parseFloat(card.getAttribute("data-tilt-amp")) || 8;
      const SCALE = parseFloat(card.getAttribute("data-tilt-scale")) || 1.03;
      let tx = 0,
        ty = 0,
        ts = 1; // target rotateX / rotateY / scale
      let cx = 0,
        cy = 0,
        cs = 1; // current values, eased toward the targets
      let raf = 0;
      const step = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        cs += (ts - cs) * 0.12;
        card.style.transform =
          "perspective(800px) rotateX(" +
          cx.toFixed(2) +
          "deg) rotateY(" +
          cy.toFixed(2) +
          "deg) scale(" +
          cs.toFixed(3) +
          ")";
        if (Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(ts - cs) * 10 > 0.02) {
          raf = requestAnimationFrame(step);
        } else {
          raf = 0;
          if (ts === 1) {
            // settled back to rest — hand the transform back to CSS
            card.style.transform = "";
            card.classList.remove("is-tilting");
            cx = cy = 0;
            cs = 1;
          }
        }
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(step);
      };
      card.addEventListener("mouseenter", () => {
        card.classList.add("is-tilting");
        ts = SCALE;
        kick();
      });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const ox = e.clientX - r.left - r.width / 2;
        const oy = e.clientY - r.top - r.height / 2;
        tx = (oy / (r.height / 2)) * -AMP;
        ty = (ox / (r.width / 2)) * AMP;
        kick();
      });
      card.addEventListener("mouseleave", () => {
        tx = 0;
        ty = 0;
        ts = 1;
        kick();
      });
    });
  }

  /* ---------------------------------------------------------------
     Scroll-reveal text — a statement fills word-by-word from light grey
     to near-black as the block scrolls up through the viewport. Each
     word interpolates its own colour from its vertical position, so the
     fill flows top-to-bottom and both ways (re-greys on scroll up).

     Drop-in: <p data-reveal-text class="reveal-text">…</p>. The text is
     split into `.rt-word` spans once; words keep trailing spaces so the
     line breaks are unchanged. Guarded for reduced-motion / no-JS: the
     words just render solid dark.
     --------------------------------------------------------------- */
  const RT_GREY = [211, 215, 219]; // #D3D7DB — un-read
  const RT_DARK = [24, 35, 37]; // #182325 — read (primaryDark)
  function initScrollRevealText(scope) {
    const blocks = (scope || document).querySelectorAll("[data-reveal-text]");
    if (!blocks.length) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    blocks.forEach((el) => {
      if (el.dataset.rtReady) return;
      el.dataset.rtReady = "1";
      // Split into word spans, preserving the spaces so wrapping is identical.
      const words = el.textContent.split(/(\s+)/);
      el.textContent = "";
      const spans = [];
      words.forEach((chunk) => {
        if (/^\s+$/.test(chunk)) {
          el.appendChild(document.createTextNode(chunk));
        } else if (chunk) {
          const span = document.createElement("span");
          span.className = "rt-word";
          span.textContent = chunk;
          el.appendChild(span);
          spans.push(span);
        }
      });
      if (reduce) {
        spans.forEach((s) => (s.style.color = `rgb(${RT_DARK.join(",")})`));
        return;
      }
      el._rtSpans = spans;
    });

    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const paint = () => {
      const vh = window.innerHeight;
      // Words above this line read as "read" (dark); the zone below it is the
      // soft transition band, so a few words fade at once rather than snapping.
      const readLine = vh * 0.62;
      const zone = vh * 0.18;
      blocks.forEach((el) => {
        const spans = el._rtSpans;
        if (!spans) return;
        spans.forEach((s) => {
          const r = s.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          let t = (readLine + zone - mid) / (zone * 2);
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          s.style.color = `rgb(${lerp(RT_GREY[0], RT_DARK[0], t)},${lerp(
            RT_GREY[1],
            RT_DARK[1],
            t
          )},${lerp(RT_GREY[2], RT_DARK[2], t)})`;
        });
      });
    };
    if (reduce) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        paint();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", paint);
    paint();
  }

  /* ---------------------------------------------------------------
     Refer a friend — copies the referral link to the clipboard and
     briefly flips the button to "Copied". Falls back to select+execCommand
     where the async clipboard API is unavailable (file://, older browsers).
     --------------------------------------------------------------- */
  function initReferralCopy(scope) {
    (scope || document).querySelectorAll("[data-referral]").forEach((root) => {
      if (root.dataset.referralReady) return;
      root.dataset.referralReady = "1";
      const input = root.querySelector("[data-referral-link]");
      const btn = root.querySelector("[data-referral-copy]");
      const label = root.querySelector("[data-referral-label]");
      if (!input || !btn || !label) return;
      let resetTimer;
      const flip = (text) => {
        label.textContent = text;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => (label.textContent = "Copy"), 1800);
      };
      btn.addEventListener("click", async () => {
        const value = input.value;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
          } else {
            input.removeAttribute("readonly");
            input.select();
            document.execCommand("copy");
            input.setAttribute("readonly", "");
          }
          flip("Copied!");
        } catch (e) {
          // Last resort: select the text so the user can copy manually.
          input.select();
          flip("Press Ctrl+C");
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     Vision — the pinned word "Vision" scales up and blurs away as the
     tall .vision-zone scrolls past, while the statement fades in behind
     it. Progress = how far the zone has scrolled through its own height.
     --------------------------------------------------------------- */
  function initVision(scope) {
    const zones = (scope || document).querySelectorAll("[data-vision]");
    if (!zones.length) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // CSS shows the static end state
    const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
    const smooth = (a, b, t) => {
      const x = clamp((t - a) / (b - a));
      return x * x * (3 - 2 * x);
    };
    const lerpC = (a, b, t) => Math.round(a + (b - a) * t);
    const RT_GREY = [211, 215, 219]; // #D3D7DB
    const RT_DARK = [24, 35, 37]; // #182325
    zones.forEach((zone) => {
      const word = zone.querySelector("[data-vision-word]");
      const stmt = zone.querySelector("[data-vision-statement]");
      if (!word || zone.dataset.visionReady) return;
      zone.dataset.visionReady = "1";

      // Split the statement into word spans so it can fill grey→black as the
      // section scrolls (same look as the Mission block, but driven by the
      // pin's scroll progress rather than each word's vertical position —
      // the words don't move here, they're pinned).
      let spans = [];
      if (stmt) {
        const parts = stmt.textContent.split(/(\s+)/);
        stmt.textContent = "";
        parts.forEach((chunk) => {
          if (/^\s+$/.test(chunk)) stmt.appendChild(document.createTextNode(chunk));
          else if (chunk) {
            const sp = document.createElement("span");
            sp.className = "rt-word";
            sp.textContent = chunk;
            sp.style.color = `rgb(${RT_GREY.join(",")})`;
            stmt.appendChild(sp);
            spans.push(sp);
          }
        });
      }

      let ticking = false;
      const paint = () => {
        const rect = zone.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        const p = clamp(-rect.top / (travel || 1));
        // Word: sharp until ~26%, then scales up + blurs. It does NOT vanish —
        // it settles to a faint blurred backdrop (opacity 0.12) so the
        // statement reads over it.
        const out = smooth(0.26, 0.66, p);
        word.style.transform = `scale(${1 + out * 1.9})`;
        word.style.filter = `blur(${out * 20}px)`;
        word.style.opacity = String(1 - out * 0.88);
        // Statement container fades in as the word starts blurring…
        if (stmt) stmt.style.opacity = String(smooth(0.24, 0.4, p));
        // …then its words fill grey→black left-to-right across the scroll.
        const N = spans.length || 1;
        const revealStart = 0.36;
        const revealEnd = 0.94;
        spans.forEach((sp, i) => {
          const wordStart = revealStart + ((revealEnd - revealStart) * i) / N;
          const t = clamp((p - wordStart) / 0.05);
          sp.style.color = `rgb(${lerpC(RT_GREY[0], RT_DARK[0], t)},${lerpC(
            RT_GREY[1],
            RT_DARK[1],
            t
          )},${lerpC(RT_GREY[2], RT_DARK[2], t)})`;
        });
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          paint();
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      paint();
    });
  }

  /* Pinned horizontal scroll: cards translate X as the page scrolls
     vertically. JS-driven pin (fixed positioning) so it works even under
     the `overflow-x-hidden` main, where CSS position:sticky would fail. */
  function initHScroll(scope) {
    (scope || document).querySelectorAll("[data-hscroll]").forEach((section) => {
      if (section._hscroll) return;
      section._hscroll = true;
      const outer = section.querySelector(".hscroll-outer");
      const pin = section.querySelector(".hscroll-pin");
      const track = section.querySelector(".hscroll-track");
      if (!outer || !pin || !track) return;
      const reduce =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let amount = 0;
      let on = false;

      function layout() {
        amount = Math.max(0, track.scrollWidth - track.clientWidth);
        on = window.innerWidth >= 768 && !reduce && amount > 4;
        section.classList.toggle("hscroll-on", on);
        if (on) {
          outer.style.height = window.innerHeight + amount + "px";
        } else {
          outer.style.height = "";
          pin.style.position = "";
          pin.style.top = "";
          pin.style.left = "";
          pin.style.width = "";
          track.style.transform = "";
        }
        render();
      }

      function render() {
        if (!on) return;
        const rect = outer.getBoundingClientRect();
        const total = amount; // vertical scroll distance == horizontal overflow
        let p;
        if (rect.top >= 0) {
          pin.style.position = "absolute";
          pin.style.top = "0";
          p = 0;
        } else if (-rect.top >= total) {
          pin.style.position = "absolute";
          pin.style.top = total + "px";
          p = 1;
        } else {
          pin.style.position = "fixed";
          pin.style.top = "0";
          p = -rect.top / total;
        }
        pin.style.left = "0";
        pin.style.width = "100%";
        track.style.transform = "translate3d(" + (-(p * amount)).toFixed(1) + "px,0,0)";
      }

      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          render();
          ticking = false;
        });
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", layout);
      window.addEventListener("load", layout);
      setTimeout(layout, 250);
      layout();
    });
  }

  window.kBurst = promoPaperBurst;

  /* ---------------------------------------------------------------
     ORDER STATUS WIDGET (Figma 6182-34439) — one component for the
     dashboard's live order and the top of a single order page.

     Everything hangs off data-order-status on [data-order-status-widget];
     a real build just sets that attribute (and the data-* overrides for
     time/points). Statuses: preparing · on-the-way · ready-to-pick ·
     delivered · scheduled.
     --------------------------------------------------------------- */
  const ORD_STATUS = {
    preparing: {
      label: "Preparing",
      pill: "#db336c",
      accent: "#db336c",
      ico: "images/icons/preparing.webp",
      when: "Estimated Arrived At",
      /* fraction of the ring the loader draws */
      arc: 0.3,
    },
    "on-the-way": {
      label: "On It's Way",
      pill: "#182325",
      accent: "#8cbab5",
      ico: "images/icons/delivery-scooter.webp",
      when: "Estimated Arrived At",
      arc: 0.72,
    },
    "ready-to-pick": {
      label: "Ready to Pick",
      pill: "#182325",
      accent: "#8cbab5",
      ico: "images/icons/Ready%20to%20pick.webp",
      when: "Estimated Pickup At",
      arc: 0.92,
    },
    delivered: {
      label: "Delivered",
      pill: "#209b34",
      accent: "#209b34",
      ico: "images/icons/delivery.webp",
      when: "Arrived At",
      arc: 1,
      earned: true,
    },
    scheduled: {
      label: "Scheduled",
      pill: "#db336c",
      accent: "#db336c",
      ico: "images/icons/Schedule.webp",
      when: "Scheduled For",
      arc: 0.18,
    },
  };
  const ORD_R = 34; /* ring radius inside the 72px badge */

  function paintOrderStatus(el) {
    const key = el.getAttribute("data-order-status");
    const cfg = ORD_STATUS[key];
    if (!cfg) return;
    el.style.setProperty("--ord-accent", cfg.pill);

    const set = (sel, fn) => {
      const n = el.querySelector(sel);
      if (n) fn(n);
    };
    set("[data-ord-pill]", (n) => (n.textContent = cfg.label));
    set("[data-ord-when]", (n) => (n.textContent = el.getAttribute("data-when-label") || cfg.when));
    set("[data-ord-ico]", (n) => (n.src = cfg.ico));
    set("[data-ord-points-note]", (n) => {
      n.textContent = cfg.earned ? "Points Earned" : "Points on their way to you";
    });
    /* the loader arc: stroke the fraction this status is through */
    const circumference = 2 * Math.PI * ORD_R;
    set("[data-ord-arc]", (n) => {
      n.setAttribute("stroke", cfg.accent);
      n.setAttribute("stroke-dasharray", circumference.toFixed(1));
      n.setAttribute("stroke-dashoffset", (circumference * (1 - cfg.arc)).toFixed(1));
    });
  }
  function initOrderStatus(scope) {
    scope.querySelectorAll("[data-order-status-widget]").forEach((el) => {
      if (el.dataset.ordReady) return;
      el.dataset.ordReady = "1";
      paintOrderStatus(el);
      /* demo only: walk preparing -> on the way so both can be seen */
      if (el.hasAttribute("data-ord-demo") && el.getAttribute("data-order-status") === "preparing") {
        setTimeout(() => {
          el.setAttribute("data-order-status", "on-the-way");
          paintOrderStatus(el);
        }, 9000);
      }
    });
  }
  window.kOrderStatus = paintOrderStatus;

  /* ---------------------------------------------------------------
     PASSWORDLESS AUTH — mobile number + one-time code.

     Drives any [data-otp-flow]: step 1 collects the number, step 2
     the six-digit code. Shared by login and register so both behave
     identically. Demo only — no code is really sent, and any six
     digits verify; data-otp-redirect says where to land.
     --------------------------------------------------------------- */
  function initOtpAuth(scope) {
    scope.querySelectorAll("[data-otp-flow]").forEach((flow) => {
      if (flow.dataset.otpReady) return;
      flow.dataset.otpReady = "1";

      const stepPhone = flow.querySelector('[data-otp-step="phone"]');
      const stepCode = flow.querySelector('[data-otp-step="code"]');
      const phone = flow.querySelector("[data-otp-phone]");
      const boxes = [...flow.querySelectorAll("[data-otp-box]")];
      const wrap = flow.querySelector(".otp-boxes");
      const target = flow.querySelector("[data-otp-target]");
      const verifyBtn = flow.querySelector("[data-otp-verify]");
      const resendBtn = flow.querySelector("[data-otp-resend]");
      const errEl = flow.querySelector("[data-otp-error]");
      let ticker = null;

      const code = () => boxes.map((b) => b.value).join("");
      const digits = (v) => String(v || "").replace(/[^\d]/g, "");

      function show(step) {
        stepPhone.hidden = step !== "phone";
        stepCode.hidden = step !== "code";
      }
      function syncVerify() {
        const ready = code().length === boxes.length;
        verifyBtn.disabled = !ready;
        verifyBtn.classList.toggle("opacity-40", !ready);
        verifyBtn.classList.toggle("pointer-events-none", !ready);
      }
      function countdown() {
        let left = 30;
        clearInterval(ticker);
        const tick = () => {
          if (left > 0) {
            resendBtn.disabled = true;
            resendBtn.textContent = "Resend code in 0:" + String(left).padStart(2, "0");
          } else {
            resendBtn.disabled = false;
            resendBtn.textContent = "Resend code";
            clearInterval(ticker);
          }
          left--;
        };
        tick();
        ticker = setInterval(tick, 1000);
      }

      /* ---- step 1 → send ---- */
      flow.querySelector("[data-otp-send]").addEventListener("click", () => {
        const n = digits(phone.value);
        if (n.length < 8) {
          phone.focus();
          if (errEl) { errEl.textContent = "Enter your mobile number."; errEl.hidden = false; }
          return;
        }
        if (errEl) errEl.hidden = true;
        if (target) target.textContent = "+20 " + phone.value.trim();
        show("code");
        countdown();
        boxes.forEach((b) => { b.value = ""; b.classList.remove("is-filled"); });
        syncVerify();
        setTimeout(() => boxes[0] && boxes[0].focus(), 60);
      });

      /* ---- step 2 → the six boxes ---- */
      boxes.forEach((box, i) => {
        box.addEventListener("input", () => {
          box.value = digits(box.value).slice(-1);
          box.classList.toggle("is-filled", !!box.value);
          if (wrap) wrap.classList.remove("is-error");
          if (box.value && boxes[i + 1]) boxes[i + 1].focus();
          syncVerify();
        });
        box.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !box.value && boxes[i - 1]) {
            boxes[i - 1].focus();
            boxes[i - 1].value = "";
            boxes[i - 1].classList.remove("is-filled");
            syncVerify();
            e.preventDefault();
          }
          if (e.key === "ArrowLeft" && boxes[i - 1]) boxes[i - 1].focus();
          if (e.key === "ArrowRight" && boxes[i + 1]) boxes[i + 1].focus();
        });
        /* paste the whole code into any box */
        box.addEventListener("paste", (e) => {
          const text = digits((e.clipboardData || window.clipboardData).getData("text")).slice(0, boxes.length);
          if (!text) return;
          e.preventDefault();
          boxes.forEach((b, j) => {
            b.value = text[j] || "";
            b.classList.toggle("is-filled", !!b.value);
          });
          (boxes[Math.min(text.length, boxes.length - 1)] || box).focus();
          syncVerify();
        });
      });

      resendBtn.addEventListener("click", () => {
        if (resendBtn.disabled) return;
        countdown();
      });
      const back = flow.querySelector("[data-otp-back]");
      if (back)
        back.addEventListener("click", () => {
          clearInterval(ticker);
          show("phone");
          phone.focus();
        });

      verifyBtn.addEventListener("click", () => {
        if (code().length !== boxes.length) return;
        clearInterval(ticker);
        verifyBtn.textContent = "Verified ✓";
        verifyBtn.classList.add("pointer-events-none", "opacity-70");
        const to = flow.getAttribute("data-otp-redirect") || "my-account.html";
        setTimeout(() => (window.location.href = to), 700);
      });

      show("phone");
      syncVerify();
    });
  }

  /* ---------------------------------------------------------------
     PHOTO-STYLE COMPARE — presentation aid, not a shipping feature.

     The client is deciding between creative/lifestyle product shots
     and plain white-background packshots. ONE sticky toggle sits at
     the bottom-left of every page that shows product imagery, and
     flips the whole site between the two directions:

       Creative — the shots as designed, mint image beds and the
                  turquoise add-to-cart controls
       White BG — packshots on a plain white tile with a grey-2
                  hairline, so the white photography reads as one
                  continuous surface. The add-to-cart controls keep
                  their brand turquoise in both modes.

     The choice is remembered across pages, so the site can be walked
     end to end in one style and then the other.

     TO REMOVE once the decision is made: delete this block, the
     initShotCompare() call in kInit, the PHOTO-STYLE COMPARE rules in
     styles.css, the data-shot-img attributes on the cart/checkout line
     items, and the packshot thumbnails in product.html's gallery.
     --------------------------------------------------------------- */
  const SHOT_KEY = "ex-shot-mode";
  const WHITE_SHOTS = [
    "dummy-images/transparent/transparent-product-01.webp",
    "dummy-images/transparent/transparent-product-02.webp",
    "dummy-images/transparent/nt-product-03.webp",
    "dummy-images/transparent/nt-product-04.webp",
    "dummy-images/transparent/nt-product-05.webp",
  ];
  function shotMode() {
    try {
      return localStorage.getItem(SHOT_KEY) === "white" ? "white" : "creative";
    } catch (e) {
      return "creative";
    }
  }
  function setShotMode(m) {
    try {
      localStorage.setItem(SHOT_KEY, m);
    } catch (e) {}
  }
  /* Stable per-product pick, so a given card keeps the same packshot
     when its grid re-renders (tab switches) and across pages. */
  function shotHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  /* ONLY product photos — every card also carries add-to-cart glyphs
     (bag, trash, minus, plus) as <img>, and those must never be swapped.
     All five card templates wrap the photo in the same aspect-square box;
     cart/checkout/drawer line items opt in with data-shot-img. */
  const SHOT_IMG_SEL = "a.group\\/card .aspect-square > img, [data-shot-img]";
  /* Cart-drawer imagery is marked data-shot-img="ui" so it still swaps
     but doesn't, on its own, put the dock on a page with no products
     (the drawer is injected into every page, including About/Contact). */
  const SHOT_PAGE_SEL = 'a.group\\/card, [data-shot-img=""]';
  function applyShots() {
    const white = shotMode() === "white";
    document.body.classList.toggle("shot-white", white);
    document.querySelectorAll(SHOT_IMG_SEL).forEach((im) => {
      if (!im.dataset.shotCreative) {
        im.dataset.shotCreative = im.getAttribute("src") || "";
        const key = im.getAttribute("alt") || im.dataset.shotCreative;
        im.dataset.shotWhite = WHITE_SHOTS[shotHash(key) % WHITE_SHOTS.length];
      }
      const want = white ? im.dataset.shotWhite : im.dataset.shotCreative;
      if (im.getAttribute("src") !== want) im.setAttribute("src", want);
    });
    document.querySelectorAll("[data-shot-toggle] [data-shot]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-shot") === shotMode());
    });
  }
  /* A single sticky dock, bottom-left, on any page that actually shows
     products — homepage, listings, product, cart, checkout, favourites. */
  function mountShotDock() {
    if (document.querySelector("[data-shot-toggle]")) return;
    if (!document.querySelector(SHOT_PAGE_SEL)) return;
    const dock = document.createElement("div");
    dock.setAttribute("data-shot-toggle", "");
    dock.className = "shot-dock";
    dock.innerHTML =
      '<button type="button" data-shot="creative">Creative</button>' +
      '<button type="button" data-shot="white">White BG</button>';
    document.body.appendChild(dock);
  }
  let shotBooted = false;
  function initShotCompare() {
    mountShotDock();
    applyShots();
    if (shotBooted) return;
    shotBooted = true;
    document.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-shot-toggle] [data-shot]");
      if (!b) return;
      e.preventDefault();
      setShotMode(b.getAttribute("data-shot"));
      applyShots();
    });
    /* Card grids are rendered by each page's own inline script and
       re-rendered on tab switches, so watch for new cards rather than
       assuming they exist at init. Swapping src only changes an
       attribute, so this can't feed itself. */
    let t = null;
    new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        mountShotDock();
        applyShots();
      }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  window.kInit = function (scope) {
    scope = scope || document;
    scope.querySelectorAll(".carousel").forEach(initCarousel);
    initAccordions(scope);
    initTabs(scope);
    initSegmented(scope);
    initGooTabs(scope);
    initSteppers(scope);
    initSelects(scope);
    initDeliveryNote(scope);
    initPdpCallouts(scope);
    initShippingCallout(scope);
    initPromo(scope);
    initOrderNote(scope);
    initWalletToggle(scope);
    initGiftToggle(scope);
    initTierBadge(scope);
    initVouchers(scope);
    syncWalletBalance(scope);
    initDemoForms(scope);
    initCheckoutSteps(scope);
    initCheckoutMobileBar(scope);
    initCheckoutOptions(scope);
    initStock(scope);
    initOOSShipping(scope);
    initCardForm(scope);
    initCountdown(scope);
    initPosts(scope);
    initAutoReveal(scope);
    initReveal(scope);
    initTiltCards(scope);
    initScrollRevealText(scope);
    initVision(scope);
    initReferralCopy(scope);
    initHScroll(scope);
    initOtpAuth(scope);
    initOrderStatus(scope);
    initShotCompare();
  };

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  /* The current category can sit far along the scrollable track (CAKES is 9th),
     so centre it on load — otherwise the highlight is off-screen and the user
     never sees where they are. Only touches scrollLeft, so the page itself
     never scrolls. */
  /* Endless category strip.

     The old behaviour jumped back to scrollLeft 0 at the end, which reads as
     the strip snapping backwards. Instead the item list is rendered THREE
     times and the viewport is parked on the middle copy: travelling in either
     direction always has a full copy of runway ahead, and because the copies
     are pixel-identical, silently re-centring puts the first category after
     the last with nothing visible happening.

     Re-centring runs only once scrolling has come to rest — adjusting
     scrollLeft mid-animation would cancel the smooth scroll and stutter. */
  function initCatnavLoop() {
    const track = document.querySelector("[data-catnav-track]");
    if (!track) return;
    const originals = [...track.children];
    if (originals.length < 2) return;

    /* Copies are decorative duplicates: hidden from assistive tech and taken
       out of the tab order so the category list is announced once. */
    for (let copy = 0; copy < 2; copy++) {
      originals.forEach((node) => {
        const c = node.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.setAttribute("tabindex", "-1");
        c.removeAttribute("aria-current");
        track.appendChild(c);
      });
    }

    let setW = 0;
    const measure = () => {
      setW = track.scrollWidth / 3;
    };

    /* Park on the middle copy, offset so the current category is in view. */
    const home = () => {
      measure();
      if (!setW) return;
      const cur = track.querySelector(".catnav-item.is-current");
      let within = 0;
      if (cur) within = cur.offsetLeft - track.clientWidth / 2 + cur.offsetWidth / 2;
      track.scrollLeft = setW + Math.max(0, Math.min(within, setW));
    };

    const recentre = () => {
      if (!setW) return;
      const x = track.scrollLeft;
      if (x > setW * 1.75) track.scrollLeft = x - setW;
      else if (x < setW * 0.25) track.scrollLeft = x + setW;
    };

    home();
    // offsetLeft is unreliable until the icons have loaded and laid out.
    window.addEventListener("load", home, { once: true });
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);

    if ("onscrollend" in window) {
      track.addEventListener("scrollend", recentre);
    } else {
      let t;
      track.addEventListener("scroll", () => {
        clearTimeout(t);
        t = setTimeout(recentre, 140);
      });
    }
  }

  /* Drop the boot cover once the page is actually presentable: header and
     footer injected, overlays mounted, Tailwind's generated CSS applied.
     Two nested rAFs put the reveal after the next paint, so the cover
     never lifts on a frame that is still mid-layout. */
  function clearBootCover() {
    const el = document.getElementById("boot");
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.classList.add("is-done");
        setTimeout(() => el.remove(), 320);
      }),
    );
  }

  function boot() {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    if (header) header.innerHTML = headerHTML();
    if (footer) footer.innerHTML = footerHTML();

    const overlays = document.createElement("div");
    overlays.id = "site-overlays";
    overlays.innerHTML = overlaysHTML();
    document.body.appendChild(overlays);

    initDelegation();
    initStickyNav();
    initCatnavLoop();
    applyLang(initialLang());
    window.kInit(document);
    // The badge markup carries a hardcoded placeholder; sync every badge
    // (and the floating cart's empty/full icon) to the real seeded count.
    setCartCount(cartCount);
    setFavCount(favCount);
    initFooterReveal();
    applyTheme(storedTheme());
    initLocationSelects();
    initOnboarding();
    clearBootCover();

    // Footer DotField background (plain canvas script).
    if (document.querySelector("[data-dotfield]") && !document.getElementById("dotfield-script")) {
      const s = document.createElement("script");
      s.src = "dotfield.js";
      s.id = "dotfield-script";
      document.body.appendChild(s);
    }

    /* Bugger feedback widget (Mitchdesigns) — review tool, not a site
       feature. Injected here so all 33 static pages carry it from one
       place. The supplied snippet is a Next.js <Script strategy=
       "lazyOnload">; with no build step the equivalent is to append it
       after the load event so it never competes with the page's own
       assets. bottom-right is free — the floating cart sits top-right
       and the photo-style dock bottom-left. */
    if (!document.getElementById("bugger-widget")) {
      const mountBugger = () => {
        if (document.getElementById("bugger-widget")) return;
        const s = document.createElement("script");
        s.id = "bugger-widget";
        s.src = "https://feedback-widget.mitchdesigns.workers.dev/widget.js";
        s.async = true;
        s.setAttribute("data-ingest-key", "pk_8a0eaf1e691f00315550778c50dedc38");
        s.setAttribute("data-endpoint", "https://bugger-worker.mitchdesigns.workers.dev/functions/v1/ingest-feedback");
        s.setAttribute("data-position", "bottom-right");
        s.setAttribute("data-button-text", "Feedback");
        s.setAttribute("data-accent", "#4f46e5");
        document.body.appendChild(s);
      };
      if (document.readyState === "complete") mountBugger();
      else window.addEventListener("load", mountBugger);
    }
  }

  /* Footer entrance: play forward when the footer enters the viewport,
     reverse when it leaves — repeats every time (does NOT unobserve). */
  function initFooterReveal() {
    const footer = document.querySelector("#site-footer footer");
    if (!footer) return;
    const reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) footer.classList.add("footer-in");
    /* One observer, two jobs: the footer's reveal animation (skipped when
       reduced motion is preferred) and retracting the sticky WhatsApp
       button, which would otherwise cover the footer's own social row —
       WhatsApp link included. The retract runs either way, so it is
       outside the reduced-motion branch. */
    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!reduce) footer.classList.toggle("footer-in", e.isIntersecting);
          document.body.classList.toggle("footer-visible", e.isIntersecting);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    ).observe(footer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
