/*
 * tw-config.js — Tailwind Play CDN configuration.
 *
 * This is a faithful port of the original project's `tailwind.config.ts`.
 * It is loaded immediately AFTER the Tailwind Play CDN <script> on every page,
 * so the exact same utility classes (custom colors, radii, shadows, font sizes,
 * animations) that the Next.js app used are available in the static build.
 *
 * Note on RTL: the original used the `tailwindcss-rtl` plugin. Modern Tailwind
 * ships logical-property utilities natively (ms-*, me-*, ps-*, pe-*, start-*,
 * end-*, text-start/end, rounded-s/e, border-s/e) plus the `rtl:`/`ltr:`
 * variants, so no plugin is required to keep those classes working.
 */
tailwind.config = {
  theme: {
    screens: {
      xs: "414px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    container: {
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        Caveat: ["var(--font-caveat)", "cursive"],
        DM_Sans: ["var(--font-sans)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      animation: {
        customBounce: "customBounce 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        slideDown: "slideDown 0.35s ease-out forwards",
      },
      keyframes: {
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        customBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10%)" },
        },
      },
      /* -----------------------------------------------------------------
         EXCEPTION brand palette — EXACT values from "Exception Styles.pdf"
         (source of truth). Token NAMES are unchanged from the base template
         so no page markup needs editing; only the VALUES map to brand hexes.
           Primary:   Text/Black #182325 · Dark turquoise #8CBAB5 ·
                      turquoise #B0DED9 · extra light turquoise #E7FFFC ·
                      Secondary Text #6F7276 · White #FFFFFF
           Secondary: Pink #DB336C · Beige #EED3B8 · Rose #E4BCB5 ·
                      light pink #F8DFE2 · Medium green #D5EBE6 ·
                      Light Green #E2F7F2
           Accent:    Error #D83434 · Success #209B34
           Gray:      Dark9 #111928 · Dark8 #1F2A37 · Dark7 #374151 ·
                      Dark6 #4B5563 · Dark5 #6B7280 · Gray4 #A8ABAF ·
                      Gray3 #DEE2E6 · Gray2 #F3F4F6 · Gray1 #F9FAFB ·
                      gray.5 #FDFEFF
         Scale steps not named in the PDF are interpolated between named
         anchors; every anchor value below is verbatim from the guide.
         ----------------------------------------------------------------- */
      colors: {
        success: "#209B34",
        lightBlue: "#E7FFFC",
        primaryDark: "#182325",
        primaryExtraDark: "#111928",
        cardbadgecolor: "#DB336C",
        bordercolor: "#374151",
        black900: "#18232590",
        cta: { DEFAULT: "#DB336C", hover: "#C22A5D", light: "#F8DFE2" },
        primary: {
          DEFAULT: "#8CBAB5",
          light: "#E7FFFC",
          hover: "#7BA9A4",
          50: "#F2FBFA",
          100: "#E7FFFC",
          200: "#B0DED9",
          300: "#8CBAB5",
          400: "#6FA39D",
          500: "#559089",
          600: "#8CBAB5",
          700: "#4E7A75",
          800: "#3A5C58",
          900: "#182325",
        },
        accent: {
          error: "#D83434",
          green: "#209B34",
          yellow: "#DB336C",
          50: "#FDECF1",
          100: "#F8DFE2",
          200: "#F3C2CD",
          300: "#EC9DB0",
          400: "#E56A8C",
          500: "#DF4E75",
          600: "#DB336C",
          700: "#C22A5D",
          800: "#A3234D",
          900: "#7D1A3B",
        },
        green: {
          100: "#E2F7F2",
          200: "#D5EBE6",
          300: "#A9D9CE",
          400: "#7DC7B6",
          500: "#52B59E",
          600: "#209B34",
          700: "#1B8730",
          800: "#166D28",
          900: "#0F4A1B",
        },
        gray: {
          100: "#F9FAFB",
          200: "#F3F4F6",
          300: "#DEE2E6",
          400: "#A8ABAF",
          500: "#6B7280",
          550: "#4B5563",
          600: "#374151",
          700: "#6F7276",
        },
        neutral: {
          black: "#182325",
          white: "#FFFFFF",
          beige: "#EED3B8",
          cream: "#FDFEFF",
          divider: "#DEE2E6",
          outline: "#A8ABAF",
          disabled: "#C6C6C6",
          secondary: "#6F7276",
          "support-bg": "#182325",
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#DEE2E6",
          300: "#D6D7D9",
          400: "#A8ABAF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2A37",
          900: "#111928",
        },
        border: { light: "#DEE2E6" },
        textSecondary: "#182325",
        customGray: "#EAEBEC",
        customGrayMedium: "#A8ABAF",
        ctaBackground: "#F3F4F6",
        dividerText: "#DEE2E6",
        interaction: {
          primary: "#8CBAB5",
          tertiary: "#E7FFFC",
          "tertiary-hover": "#D5EBE6",
          base: "#E7FFFC",
          divider: "#DEE2E6",
          outline: "#A8ABAF",
          disabled: "#C6C6C6",
          "secondary-text": "#6F7276",
        },
        backgroundLocationBar: "#E2F7F2",
        primaryColor: "#182325",
        primaryText: "#6F7276",
        secondaryText: "#6F7276",
        blackText: "#182325",
        primaryLight: "#E7FFFC",
        offWhite: "#E7FFFC",
        beige: {
          50: "#FCF7F1",
          100: "#F9EFE4",
          200: "#EED3B8",
          300: "#E9C9A9",
          400: "#E4BCB5",
          500: "#EED3B820",
          600: "#E2B48F",
          700: "#D9A57C",
          800: "#CE9265",
          900: "#B87A4C",
        },
      },
      boxShadow: {
        "cart-utility-box": "0px 0px 2px 1px #00000014",
        custom2: "0px 2px 3px rgba(84, 34, 5, 0.2)",
        custom3: "0px 0px 8px rgba(0, 0, 0, 0.16)",
        custom4: "0px 0px 6px rgba(0, 0, 0, 0.1)",
        "custom-5": "0px 2px 6px 0px #00000014",
        "cart-overview": "0px -2px 12px 0px #AB7C5F1F",
        "cart-btn": "0px 5px 10px 0px #37B7A44D",
        defaultSwitcher:
          "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        "location-btn": "0px 1px 2px rgba(0, 0, 0, 0.05)",
        "search-btn": "0px 1px 2px rgba(0, 0, 0, 0.05)",
        /* Checkout header: a very soft lift off the page rather than a
           hard edge — two stacked layers so the falloff stays smooth
           instead of ending in a visible line. */
        header: "0px 1px 2px rgba(0, 0, 0, 0.03), 0px 6px 16px rgba(0, 0, 0, 0.05)",
      },
      scale: { flip: "-1" },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "3xl": "32px",
        "2xl": "22px",
        full: "9999px",
        custom: "10px",
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["14px", "20px"],
        base: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
        "3xl": ["30px", "36px"],
        "4xl": ["44px", "52px"],
        "5xl": ["48px", "58px"],
        "6xl": ["60px", "64px"],
      },
    },
  },
};
