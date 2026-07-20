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
  const SUPPORT_MENU = [
    { title: "About Us", url: "/about" },
    { title: "Media Center", url: "/blogs" },
    { title: "FAQs", url: "/faqs" },
    { title: "Branches", url: "/branches" },
    { title: "Export", url: "/export" },
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
    { label: "MAKE YOUR CAKE", icon: "Categories%20icons/make%20your%20cake.webp", url: "/shop/make-your-cake" },
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
      links: [
        { title: "About Us", url: "/about" },
        { title: "Branches", url: "/branches" },
        { title: "Export", url: "/export" },
        { title: "Blogs", url: "/blogs" },
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
      "/branches": "branches.html",
      "/export": "export.html",
      "/faqs": "faqs.html",
      "/contact-us": "contact-us.html",
      "/privacy-policy": "privacy-policy.html",
      "/terms-conditions": "terms-conditions.html",
      "/return-policy": "return-policy.html",
      "/blogs": "blogs.html",
      "/shop": "shop.html",
      "/cart": "cart.html",
      "/checkout": "checkout.html",
      "/thank-you": "thank-you.html",
      "/login": "login.html",
      "/register": "register.html",
      "/forget-password": "forget-password.html",
      "/reset-password": "reset-password.html",
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
     Language switcher (EN active, visual only in static build)
     --------------------------------------------------------------- */
  function languageSwitcher(mobile) {
    const wrap = mobile
      ? "bg-[#EAEBEC]"
      : "bg-[#FFFFFF33]";
    const w = mobile ? "122px" : "98px";
    const h = mobile ? "29px" : "25px";
    return `
      <div class="inline-flex relative">
        <div class="flex flex-row items-center gap-1 ${wrap} p-[2px_3px] rounded-[5px]" style="width:${w};height:${h}">
          <button type="button" data-lang="en" class="flex justify-center items-center transition-all duration-200 bg-cta shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[3px] text-white text-xs font-semibold" style="width:${mobile ? "60px" : "48px"};height:${mobile ? "25px" : "20px"}">EN</button>
          <button type="button" data-lang="ar" class="flex justify-center items-center transition-all duration-200 bg-transparent rounded-[4px] text-white/80 text-xs font-semibold" style="width:${mobile ? "52px" : "40px"};height:${mobile ? "25px" : "20px"}">ع</button>
        </div>
      </div>`;
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

    /* flag + language (click toggles EN⇄AR, wired via data-lang-cycle) */
    const langSelector = `
      <button type="button" data-lang-cycle aria-label="Language" class="flex items-center gap-1.5 text-primaryDark shrink-0">
        <img src="images/icons/egypt-flag-icon.svg" alt="Egypt" width="27" height="18" class="rounded-[2px] shrink-0" />
        <span data-lang-label class="text-sm font-medium">En</span>
        <img src="images/icons/chevron-arrow-down.svg" alt="" width="14" height="14" class="shrink-0" />
      </button>`;

    /* Pages dropdown (secondary pages) — Figma "Pages Menu" component */
    const pagesLinks = SUPPORT_MENU.map(
      (i) => `<li><a href="${pageHref(i.url)}" class="block whitespace-nowrap text-primaryDark text-base hover:text-cta transition-colors">${esc(i.title)}</a></li>`,
    ).join("");
    const pagesMenu = `
      <div class="relative shrink-0" data-pagesmenu>
        <button type="button" data-pages-toggle aria-label="Menu" class="pages-toggle grid place-items-center rounded-[4px] size-[34px] text-primaryDark border border-primaryDark shadow-custom-5 transition-colors">
          <span class="pages-ico-menu"><img src="images/icons/menu-icon.svg" alt="" width="18" height="18" /></span>
          <span class="pages-ico-close hdr-ico">${ICON.close2}</span>
        </button>
        <div class="pages-panel absolute top-full start-0 mt-2 bg-white rounded-[8px] p-4 shadow-custom3 z-[60] min-w-[168px]">
          <ul class="flex flex-col gap-3">${pagesLinks}</ul>
        </div>
      </div>`;

    const desktop = `
      <div class="hidden md:block">
        ${
          checkout
            ? `<div class="relative z-40 bg-[linear-gradient(180deg,#E7FFFC_0%,rgba(255,255,255,0)_100%)] border-t-[4px] lg:!border-t-[10px] border-primaryDark py-[22px]">
                 <div class="mx-auto flex max-w-[1392px] items-center justify-center relative px-4 2xl:px-0">
                   <a href="index.html" aria-label="Exception home">${logoMark(true, 44)}</a>
                   <div class="absolute end-4 2xl:end-0">${langSelector}</div>
                 </div>
               </div>`
            : `<div class="relative z-40 bg-primary-200">
                 <div class="mx-auto flex items-center justify-between gap-4 max-w-[1512px] px-6 lg:px-[60px] py-[20px]">
                   <!-- Left: pages menu + Go To location -->
                   <div class="flex flex-1 items-center gap-2 min-w-0">
                     ${pagesMenu}
                     <div class="relative min-w-0" data-locmenu>
                       <button type="button" data-loc-toggle class="relative flex items-center gap-1.5 bg-[#E7FFFC]/80 rounded-[5px] px-2.5 h-[34px] text-primaryDark min-w-0">
                         <span class="absolute -top-2 start-2 -rotate-[4deg] bg-cta text-white text-[11px] leading-none px-1.5 py-0.5 rounded-[4px]">Go To</span>
                         <span class="shrink-0"><img src="images/icons/delivery.webp" alt="" class="w-6 h-6 object-contain" /></span>
                         <span class="text-xs whitespace-nowrap truncate"><span class="font-normal">Street 9</span> <span class="font-semibold">| Maadi, Cairo</span></span>
                       </button>
                       <div class="loc-panel absolute top-full start-0 mt-2 bg-white rounded-[12px] p-4 shadow-custom3 z-[60] w-[320px] text-start">
                         <p class="font-semibold text-primaryDark text-sm mb-3">Choose your delivery location</p>
                         <form data-location-form class="flex flex-col gap-3">
                           <label class="flex items-center gap-3">
                             <span class="label w-12 shrink-0">City</span>
                             <select class="placeholder-select flex-1 min-w-0 border border-gray-300 rounded-lg px-3 h-11 text-sm text-primaryDark"><option>Cairo</option><option>Giza</option><option>Alexandria</option></select>
                           </label>
                           <label class="flex items-center gap-3">
                             <span class="label w-12 shrink-0">Area</span>
                             <select class="placeholder-select flex-1 min-w-0 border border-gray-300 rounded-lg px-3 h-11 text-sm text-primaryDark"><option>Maadi</option><option>New Cairo</option><option>Nasr City</option><option>Zamalek</option></select>
                           </label>
                           <button type="submit" class="btn btn--primary btn--md mt-1 w-full justify-center">Confirm location</button>
                         </form>
                       </div>
                     </div>
                   </div>
                   <!-- Center: logo -->
                   <a href="index.html" aria-label="Exception home" class="shrink-0">${logoMark(true, 52)}</a>
                   <!-- Right: language · search · account · phone + cart -->
                   <div class="flex flex-1 items-center justify-end gap-4 min-w-0 dir-ltr">
                     <div class="flex items-center gap-3.5 px-1.5">
                       ${langSelector}
                       <span class="w-px h-[26px] bg-primaryDark/25"></span>
                       <button type="button" data-open="search" aria-label="Search" class="grid place-items-center shrink-0 hover:opacity-70 transition-opacity"><img src="images/icons/search-icon.svg" alt="" width="18" height="18" /></button>
                       <span class="w-px h-[26px] bg-primaryDark/25"></span>
                       <a href="login.html" aria-label="Account" class="grid place-items-center shrink-0 hover:opacity-70 transition-opacity"><img src="images/icons/user-icon.svg" alt="Account" width="18" height="18" /></a>
                       <span class="w-px h-[26px] bg-primaryDark/25"></span>
                       <a href="tel:16689" class="flex items-center gap-1 text-cta shrink-0"><img src="images/icons/phone-icon.svg" alt="" width="18" height="18" /><span class="text-sm font-bold">16689</span></a>
                     </div>
                     <button type="button" data-open="cart" aria-label="Cart" class="relative grid place-items-center shrink-0"><img src="images/icons/cart-box.webp" alt="" class="w-11 h-11 object-contain" /><span class="absolute -top-1 -end-1 grid place-items-center bg-primaryDark text-white text-[11px] font-semibold rounded-full size-[22px]" data-cart-count>4</span></button>
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
              : `<button type="button" data-open="cart" class="relative grid place-items-center size-[42px]" aria-label="Cart"><img src="images/icons/cart-box.webp" alt="" class="w-full h-full object-contain" /><span class="absolute -top-1 -end-1 grid place-items-center bg-primaryDark text-white text-[9px] font-bold rounded-full w-4 h-4" data-cart-count>4</span></button>`
          }
        </div>
      </div>
      ${
        checkout
          ? ""
          : `<div class="md:hidden block bg-backgroundLocationBar px-4 py-2">
               <div class="mx-auto max-w-7xl bg-white shadow-custom-5 rounded-full px-[22px] py-1">
                 <button type="button" data-open="location" class="flex items-center gap-1 justify-between py-[10px] w-full text-primaryDark">
                   <span class="flex items-center gap-[5px]">
                     <span class="shrink-0"><img src="images/icons/delivery.webp" alt="" class="w-6 h-6 object-contain" /></span>
                     <span class="flex items-center gap-1">
                       <span class="font-normal text-[10px] leading-[140%]">Go To</span>
                       <span class="font-semibold text-[12px] leading-[140%]">Street 9 | Maadi, Cairo</span>
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
        <a href="${pageHref(c.url)}" class="catnav-item flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-[10px] shrink-0 hover:bg-primary-50 transition-colors${isCurrent ? " is-current" : ""}"${isCurrent ? ' aria-current="page"' : ""}>
          <img src="images/icons/${c.icon}" alt="" width="40" height="40" class="size-10 shrink-0" />
          <span class="text-primaryDark whitespace-nowrap ${c.big ? "text-xs font-medium" : "text-[11px] font-semibold"}">${esc(c.label)}</span>
        </a>`;
    }).join("");

    const categoryNav = checkout
      ? ""
      : `<div data-navbar class="w-full bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.08)] relative z-30">
           <div class="relative mx-auto max-w-[1512px]">
             <div data-catnav-track class="flex items-center gap-5 px-[60px] py-2 overflow-x-auto no-scrollbar scroll-smooth">
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
      return `<footer class="bg-neutral-support-bg py-6">
        <div class="mx-auto max-w-[1392px] px-4 text-center text-bordercolor text-[10px]">© Exception ${YEAR} — All copyrights reserved</div>
      </footer>`;
    }

    // Plain white social marks (Figma shows bare icons, no circles).
    const socials = SOCIALS.map(
      (s) =>
        `<li><a href="${s.href}" aria-label="Visit our ${s.title} page" class="text-white transition-opacity hover:opacity-70"><svg viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">${s.svg}</svg></a></li>`,
    ).join("");

    const panelLink = (title, url) =>
      `<li><a href="${pageHref(url)}" class="text-base leading-[1.4] text-primaryDark transition-colors hover:text-primary-700 hover:underline">${esc(title)}</a></li>`;

    const shopLinks = FOOTER_COLUMNS[0].links;
    const shopCol = (links) =>
      `<ul class="flex flex-col gap-2">${links.map((l) => panelLink(l.title, l.url)).join("")}</ul>`;

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
          <div class="footer-anim flex min-w-0 flex-1 flex-col gap-10 rounded-[20px] bg-primary-light px-8 py-10 md:flex-row md:justify-between md:gap-6" style="--footer-delay: 0.1s">
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
              <ul class="flex flex-col gap-2">
                ${FOOTER_COLUMNS[1].links.map((l) => panelLink(l.title, l.url)).join("")}
              </ul>
            </div>
            <div class="hidden w-px self-stretch bg-primaryDark/10 md:block"></div>
            <!-- Support (links + contact rows) -->
            <div class="flex flex-col gap-4 md:pe-2">
              <p class="text-[18px] font-semibold leading-[1.4] text-primaryDark">Support</p>
              <ul class="flex flex-col gap-2 text-primaryDark">
                ${panelLink("FAQs", "/faqs")}
                ${panelLink("Contact Us", "/contact-us")}
                <li><a href="tel:16689" class="flex items-center gap-2 text-base leading-[1.4] transition-colors hover:text-primary-700 dir-ltr">${ICON.phone}16689</a></li>
                <li><a href="mailto:export@exception-group.com" class="flex items-center gap-2 text-base leading-[1.4] transition-colors hover:text-primary-700 dir-ltr">${mailIcon}export@exception-group.com</a></li>
                ${panelLink("Privacy Policy", "/privacy-policy")}
                ${panelLink("Terms & Conditions", "/terms-conditions")}
              </ul>
            </div>
          </div>

          <!-- Newsletter panel -->
          <div class="footer-anim flex w-full flex-col justify-center gap-10 rounded-[20px] bg-[#8CBAB5] px-8 py-10 lg:w-[406px] lg:shrink-0 lg:gap-[60px]" style="--footer-delay: 0.2s">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-[5px] text-white">
                <p class="text-[24px] font-semibold leading-[1.2]">Join Our Newsletter</p>
                <p class="text-base leading-[1.4]">Enjoy exclusive offers and updates</p>
              </div>
              <form data-newsletter class="flex w-full items-center justify-between gap-2 rounded-[12px] border border-[#F5F5F6] bg-white py-2 pl-4 pr-2 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                <input type="email" required placeholder="Enter your Email Address" class="min-w-0 flex-1 bg-transparent text-[14px] text-[#2C3340] outline-none placeholder:text-[#2C3340]/70" aria-label="Email address" />
                <button type="submit" aria-label="Subscribe" class="grid shrink-0 place-items-center rounded-[8px] bg-primaryDark p-[10px] transition-colors hover:bg-black"><img src="images/icons/sent.svg" alt="" class="h-[26px] w-[26px]" /></button>
              </form>
            </div>
            <ul class="flex items-center justify-end gap-4">${socials}</ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="footer-anim flex flex-col-reverse items-center gap-4 md:flex-row md:justify-between" style="--footer-delay: 0.3s">
          <span class="text-[10px] leading-[1.4] text-white dir-ltr">© Exception ${YEAR} - All Copyrights Reserved</span>
          <img src="images/payments.png" alt="payment methods" width="172" height="24" class="object-contain" />
          <span class="text-[10px] leading-[1.4] text-white"><a href="https://www.mitchdesigns.com" target="_blank" rel="noopener noreferrer" class="hover:underline">Designed &amp; Developed By Mitchdesigns</a></span>
        </div>
      </div>
    </footer>`;
  }

  const YEAR = 2025; // static build stamp (Date.now avoided for determinism)

  /* ---------------------------------------------------------------
     Overlays: backdrop, cart drawer, mobile menu, search, location
     --------------------------------------------------------------- */
  function overlaysHTML() {
    const menuSecondaryLinks = SUPPORT_MENU.map(
      (i) =>
        `<li><a href="${pageHref(i.url)}" class="text-primaryDark text-[26px] font-medium leading-none hover:text-cta transition-colors">${esc(i.title)}</a></li>`,
    ).join("");

    const demoCartItems = [
      { name: "Chocolate Fudge Cake", price: 650, qty: 1, img: "images/dummy-images/new-product.png", variants: [["Size", "1 Kg"]] },
      { name: "Assorted Baklava Box", price: 420, qty: 1, img: "images/menudeafult.webp", variants: [["Weight", "500 g"]] },
    ];
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
      <div class="flex gap-3 py-4 border-b border-neutral-100">
        <img src="${it.img}" alt="${esc(it.name)}" class="w-[72px] h-[72px] rounded-lg object-cover bg-primary-light" />
        <div class="flex-1">
          <p class="font-medium text-textSecondary text-sm">${esc(it.name)}</p>
          ${vtags(it.variants)}
          <p class="mt-1 font-semibold text-primaryDark text-sm">EGP ${it.price}</p>
          <div class="counter counter--sm mt-2" data-stepper data-removable>
            <button type="button" data-step="-1" class="counter__btn" aria-label="Decrease quantity"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
            <span data-qty class="counter__qty">${it.qty}</span>
            <button type="button" data-step="1" class="counter__btn counter__inc" aria-label="Increase quantity"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
          </div>
        </div>
      </div>`,
      )
      .join("");

    return `
    <div data-backdrop class="overlay-backdrop"></div>

    <!-- Cart drawer -->
    <aside data-drawer="cart" class="side-drawer side-drawer--right" aria-label="Shopping cart">
      <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h2 class="font-semibold text-textSecondary text-lg">Your Cart</h2>
        <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
      </div>
      <div class="flex-1 overflow-y-auto px-5">${cartRows}</div>
      <div class="px-5 py-4 border-t border-neutral-100 shadow-cart-overview">
        <div class="flex justify-between mb-3"><span class="text-neutral-600 text-sm">Subtotal</span><span class="font-semibold text-primaryDark">EGP 1,070</span></div>
        <a href="checkout.html" class="btn btn--primary btn--md w-full justify-center">Checkout</a>
        <a href="cart.html" class="block w-full text-center mt-2 text-primaryDark font-medium py-2 text-sm">View full cart</a>
      </div>
    </aside>

    <!-- Menu drawer: secondary pages (white panel, opens from the menu button) -->
    <aside data-drawer="menu" class="side-drawer side-drawer--left bg-white" aria-label="Menu">
      <div class="px-6 pt-6">
        <button type="button" data-close aria-label="Close menu" class="grid place-items-center bg-white rounded-[14px] text-primaryDark shadow-custom-5 border border-gray-200 size-[52px]">${ICON.close2}</button>
      </div>
      <nav class="flex-1 overflow-y-auto px-6 pt-8">
        <ul class="flex flex-col gap-7">
          ${menuSecondaryLinks}
        </ul>
      </nav>
      <div class="px-6 py-6 border-t border-gray-200 flex items-center gap-3">
        <a href="login.html" class="btn btn--black btn--md flex-1 justify-center">Sign in</a>
        ${languageSwitcher(true)}
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

    <!-- Location bottom sheet -->
    <div data-sheet="location" class="bottom-sheet">
      <div class="mx-auto w-10 h-1 rounded-full bg-neutral-200 mb-4 md:hidden"></div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-textSecondary text-lg">Choose Your Location</h2>
        <button type="button" data-close class="grid place-items-center w-8 h-8 rounded-full hover:bg-neutral-100 text-textSecondary">${ICON.close}</button>
      </div>
      <form data-location-form class="flex flex-col gap-3">
        <label class="block">
          <span class="label">City</span>
          <select class="placeholder-select w-full border border-neutral-200 rounded-lg px-3 h-12 mt-1 text-textSecondary">
            <option>Cairo</option><option>Giza</option><option>Alexandria</option>
          </select>
        </label>
        <label class="block">
          <span class="label">Area</span>
          <select class="placeholder-select w-full border border-neutral-200 rounded-lg px-3 h-12 mt-1 text-textSecondary">
            <option>New Cairo</option><option>Nasr City</option><option>Maadi</option><option>Zamalek</option>
          </select>
        </label>
        <button type="submit" class="btn btn--primary btn--md mt-2 w-full justify-center">Confirm location</button>
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
        <button type="submit" class="btn btn--primary btn--md w-full justify-center">Submit review</button>
      </form>
    </div>

    <!-- Floating cart — sticks directly under the category bar once scrolled.
         The dark box is masked (.cart-knockout) so the badge is subtracted
         from it; the badge itself is a sibling on top (unmasked). -->
    <button type="button" data-open="cart" data-floating-cart aria-label="Cart" class="floating-cart fixed top-[100px] z-[80] size-[56px]">
      <img src="images/icons/cart-box.webp" alt="" class="w-full h-full object-contain drop-shadow-md" />
      <span class="absolute -bottom-1 -end-1 grid place-items-center bg-primaryDark text-white text-[11px] font-semibold rounded-full size-[22px]" data-cart-count>4</span>
    </button>`;
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
    document
      .querySelectorAll(".side-drawer.is-open, .modal-shell.is-open, .bottom-sheet.is-open")
      .forEach((el) => el.classList.remove("is-open"));
    const backdrop = document.querySelector("[data-backdrop]");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    openEl = null;
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
      const btns = seg.querySelectorAll(".tab-btn");
      const activeBtn = () => seg.querySelector(".tab-btn.is-active") || btns[0];
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
  function calloutHTML(variant, icon, title, sub) {
    return `
      <div class="callout callout--${variant}">
        <span class="callout__icon"><img src="images/icons/${icon}.webp" alt="" /></span>
        <span class="callout__body">
          <span class="callout__title">${title}</span>
          <span class="callout__sub">${sub}</span>
        </span>
      </div>`;
  }
  function pdpCalloutsHTML(o) {
    o = o || {};
    const place = o.place || DELIVERY_PLACE;
    const eta = o.eta || DELIVERY_ETA;
    return [
      calloutHTML("baked", "baked-fresh", "Freshly Baked", "Fresh from the oven to you"),
      calloutHTML(
        "delivery",
        "delivery",
        "Fast Delivery",
        `Within ${esc(eta)} to ${esc(place)} <button type="button" data-open="location" class="callout__edit">Edit</button>`
      ),
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
  function promoPaperBurst(x, y) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    canvas.className = "promo-fx";
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

    const papers = Array.from({ length: PAPER_COUNT }, (_, i) => {
      // Start across the actual field, then drift up and out in a slow arc.
      const launchX = x + (Math.random() - 0.5) * 190;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 2.3 + Math.random() * 2.5; // slow — the reference floats
      return {
        x: launchX,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.7,
        shape: PAPER_SHAPES[i % PAPER_SHAPES.length],
        // Sized off the reference: a ribbon reads ~15% of the field's width
        // there. At 32–58px they came out about half that and looked timid.
        len: 44 + Math.random() * 30,
        amp: 9 + Math.random() * 7, // ribbon wave depth
        s: 7 + Math.random() * 3, // square / ring size
        lw: 5 + Math.random() * 1.8, // ribbon stroke weight
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05, // slow tumble, not a flutter
        color: FX_COLORS[i % FX_COLORS.length],
        life: 1,
        decay: 0.0045 + Math.random() * 0.003, // ~2.5–3.7s on screen
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

  /* Reflect the applied/removed discount in the page's order summary.
     No-ops on any page that doesn't have one. */
  function promoSyncSummary(discount) {
    const row = document.querySelector("[data-summary-discount-row]");
    const amountEl = document.querySelector("[data-summary-discount]");
    const totalEl = document.querySelector("[data-summary-total]");
    const subtotalEl = document.querySelector("[data-summary-subtotal]");
    const deliveryEl = document.querySelector("[data-summary-delivery]");
    if (!totalEl || !subtotalEl) return;
    if (row) row.hidden = discount <= 0;
    if (amountEl) amountEl.textContent = "− " + egp(discount);
    const total = parseEGP(subtotalEl.textContent) + (deliveryEl ? parseEGP(deliveryEl.textContent) : 0) - discount;
    totalEl.textContent = egp(Math.max(0, total));
  }

  function initPromo(scope) {
    scope.querySelectorAll("[data-promo]").forEach((promo) => {
      if (promo.dataset.promoReady) return;
      promo.dataset.promoReady = "1";
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
      st.querySelectorAll("[data-step]").forEach((b) => {
        b.addEventListener("click", () => {
          const delta = parseInt(b.getAttribute("data-step"), 10);
          let v = parseInt(qtyEl.textContent, 10) || 1;
          v = Math.max(1, v + delta);
          qtyEl.textContent = v;
          syncDec();
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
        // Mock success flow: navigate to the next page if requested.
        const redirect = f.getAttribute("data-redirect");
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
  function initStickyNav() {
    const nav = document.querySelector("[data-navbar]");
    const floatCart = document.querySelector("[data-floating-cart]");
    if (!nav) return;
    const placeholder = document.createElement("div");
    nav.parentNode.insertBefore(placeholder, nav.nextSibling);
    // Stick the category bar once its own top reaches the viewport top
    // (i.e. once the mint header above it has scrolled away).
    let stuck = false;
    const stickyCls = [
      "fixed",
      "top-0",
      "left-0",
      "right-0",
      "z-[100]",
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
    document.querySelectorAll("[data-lang-label]").forEach((el) => {
      el.textContent = lang === "ar" ? "ع" : "En";
    });
  }
  window.kSetLang = applyLang;

  function currentLang() {
    return document.documentElement.getAttribute("dir") === "rtl" ? "ar" : "en";
  }

  /* ---------------------------------------------------------------
     Product card — add-to-cart counter (Simple products)
     --------------------------------------------------------------- */
  let cartCount = 4; // demo starting count (matches the seeded badges)
  function setCartCount(n) {
    document
      .querySelectorAll("[data-cart-count]")
      .forEach((el) => (el.textContent = n));
  }
  function bumpCart(delta) {
    cartCount = Math.max(0, cartCount + delta);
    setCartCount(cartCount);
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
      if (!e.target.closest("[data-pagesmenu]")) {
        document
          .querySelectorAll("[data-pagesmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
      }
    });
    document.addEventListener("click", (e) => {
      /* --- Product card add-to-cart (preventDefault stops the card link) --- */
      const favBtn = e.target.closest("[data-fav]");
      if (favBtn) {
        e.preventDefault();
        favBtn.classList.toggle("is-fav");
        return;
      }
      const addBtn = e.target.closest("[data-add-btn]");
      if (addBtn) {
        e.preventDefault();
        const w = addBtn.closest("[data-add-widget]");
        const srcRect = addBtn.getBoundingClientRect(); // capture before hiding
        pwShowCounter(w, true);
        pwSetQty(w, 1);
        flyToCart(srcRect, () => bumpCart(1)); // badge bumps when the dot lands
        return;
      }
      const incBtn = e.target.closest("[data-inc]");
      if (incBtn) {
        e.preventDefault();
        const w = incBtn.closest("[data-add-widget]");
        pwSetQty(w, pwQty(w) + 1);
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
        bumpCart(-1);
        return;
      }

      const langBtn = e.target.closest("[data-lang]");
      if (langBtn) {
        e.preventDefault();
        applyLang(langBtn.getAttribute("data-lang"));
        return;
      }
      const langCycle = e.target.closest("[data-lang-cycle]");
      if (langCycle) {
        e.preventDefault();
        applyLang(currentLang() === "ar" ? "en" : "ar");
        return;
      }
      // Pages dropdown: toggle on the button, close when clicking elsewhere
      const pagesToggle = e.target.closest("[data-pages-toggle]");
      if (pagesToggle) {
        e.preventDefault();
        const wrap = pagesToggle.closest("[data-pagesmenu]");
        const wasOpen = wrap.classList.contains("is-open");
        document
          .querySelectorAll("[data-pagesmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
        if (!wasOpen) wrap.classList.add("is-open");
        return;
      }
      if (!e.target.closest("[data-pagesmenu]")) {
        document
          .querySelectorAll("[data-pagesmenu].is-open")
          .forEach((w) => w.classList.remove("is-open"));
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
          track.scrollBy({ left: dir * 320, behavior: "smooth" });
        }
        return;
      }
      const opener = e.target.closest("[data-open]");
      if (opener) {
        e.preventDefault();
        openOverlay(opener.getAttribute("data-open"));
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
      if (e.key === "Escape" && openEl) closeOverlay();
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

  window.kInit = function (scope) {
    scope = scope || document;
    scope.querySelectorAll(".carousel").forEach(initCarousel);
    initAccordions(scope);
    initTabs(scope);
    initSegmented(scope);
    initGooTabs(scope);
    initSteppers(scope);
    initDeliveryNote(scope);
    initPdpCallouts(scope);
    initPromo(scope);
    initDemoForms(scope);
    initCountdown(scope);
    initReveal(scope);
    initHScroll(scope);
  };

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  /* The current category can sit far along the scrollable track (CAKES is 9th),
     so centre it on load — otherwise the highlight is off-screen and the user
     never sees where they are. Only touches scrollLeft, so the page itself
     never scrolls. */
  function initCatnavCurrent() {
    const track = document.querySelector("[data-catnav-track]");
    const current = track && track.querySelector(".catnav-item.is-current");
    if (!track || !current) return;
    const center = current.offsetLeft - track.clientWidth / 2 + current.offsetWidth / 2;
    const target = Math.max(0, Math.min(center, track.scrollWidth - track.clientWidth));
    // Wait for the icons to lay out, else offsetLeft is measured too early.
    const place = () => (track.scrollLeft = target);
    place();
    window.addEventListener("load", place, { once: true });
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
    initCatnavCurrent();
    applyLang(initialLang());
    window.kInit(document);
    initFooterReveal();

    // Footer DotField background (plain canvas script).
    if (document.querySelector("[data-dotfield]") && !document.getElementById("dotfield-script")) {
      const s = document.createElement("script");
      s.src = "dotfield.js";
      s.id = "dotfield-script";
      document.body.appendChild(s);
    }
  }

  /* Footer entrance: play forward when the footer enters the viewport,
     reverse when it leaves — repeats every time (does NOT unobserve). */
  function initFooterReveal() {
    const footer = document.querySelector("#site-footer footer");
    if (!footer) return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      footer.classList.add("footer-in");
      return;
    }
    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => footer.classList.toggle("footer-in", e.isIntersecting));
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
