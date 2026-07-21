# Exception Pastry — Brand Styles (from Figma)

Local styles (colors, typography, effects) extracted from the Exception Redesign Figma file. Use this to build the Tailwind theme (`tw-config.js`) and CSS variables for the redesign.

> Source: Figma → page "Website UI Design - Claude" local variables/styles.
> ⚠️ The file carries **more than one style system** (an active set plus legacy tokens from the base template). The groups most likely to be the **active Exception website** set are flagged **[ACTIVE?]** — please confirm which palette/type system is the real brand before locking tokens.

---

## 1. Typography

Font families present in the file:

| Family | Used by | Role |
|---|---|---|
| **Google Sans Flex** | `Website Text Style/*` | **[ACTIVE?]** primary web UI type |
| **DM Sans** | `English/*` | English headings/body (alt/legacy or EN pairing) |
| **Vazirmatn** | `Body Extra Extra Small/*` | **Arabic / RTL** typeface — confirms bilingual EN+AR |
| **Caveat** | `English/Handwritten/*` | Handwritten accent (decorative) |
| **Poppins** | `Tagline & Paragraph/Paragraph` | Tagline/paragraph (legacy) |

### Website text scale — "Website Text Style" (Google Sans Flex) [ACTIVE?]
| Token | Size / Weight / Line-height |
|---|---|
| Heading 2 | 48 / 600 / 1.2 |
| Heading 3 | 40 / 600 / 1.2 |
| Heading 4 | 32 / 600 / 1.2 |
| Heading 6 | 24 / 600 / 1.2 |
| Body Large | 18 / 400·500·600 / 1.4 |
| Body Medium | 16 / 400·500·600 / 1.4 |
| Body Small | 14 / 400·500 / 1.4 |
| Body Extra Small | 12 / 400·500·600 / 1.4 |
| Body Ultra Small | 10 / 400 / 1.4 |

### English text scale — "English" (DM Sans)
| Token | Size / Weight / Line-height |
|---|---|
| Display Medium | 68 / 500 |
| Heading 1 | 62 / 600 / 1.2 |
| Heading 2 | 48 / 600 / 1.2 |
| Heading 3 | 40 / 600 / 1.2 |
| Heading 4 | 32 / 600 / 1.2 |
| Heading 5 | 28 / 600 / 1.2 |
| Heading 6 | 24 / 600 / 1.2 |
| Body Large | 18 / 400·500·600·700 / 1.4 |
| Body Medium | 16 / 400·500·600·700 / 1.4 |
| Body Small | 14 / 400·500·600·700 / 1.4 |
| Body Extra Small | 12 / 400·500 / 1.4 |
| Body Ultra Small | 10 / 400·500·600 / 1.4 |
| Handwritten | Caveat 32–42 / 600 |

**Arabic:** Vazirmatn (present as "Body Extra Extra Small" 11/400). The redesign should map every English text token to a Vazirmatn equivalent for the AR/RTL variant.

---

## 2. Colors

### Warm / bakery palette — [ACTIVE?] (most likely the new Exception identity)
| Token | Hex |
|---|---|
| Primary / Off White | `#F7F2EA` |
| Primary / Mocha | `#B1714D` |
| Secondary / Beige | `#EED3B8` |
| Others / Black | `#2B2525` |

### Primary / Text
| Token | Hex |
|---|---|
| White | `#FFFFFF` |
| Black (brand) | `#000000` |
| Black (ink) | `#182325` |
| Primary Text | `#182325` |
| Secondary Text | `#787878` |
| Dark | `#141B34` |

### Turquoise / pink set (base-template theme — likely legacy)
| Token | Hex |
|---|---|
| Primary / turquoise | `#B0DED9` |
| Primary / Dark turquoise | `#8CBAB5` |
| Primary / extra light turquoise | `#E7FFFC` |
| Secondary / Pink | `#DB336C` |
| Secondary / pink (alt) | `#D22760` |

### Blue set (legacy template theme)
| Token | Hex |
|---|---|
| Primary / Dark Blue | `#26355F` |
| Primary / Extra Dark Blue | `#1C253F` |
| Primary / Blue | `#425486` |
| Secondary / medium plus blue | `#6579AC` |
| Secondary / light blue | `#D4DCF1` |
| Secondary / blue extra light | `#EDF0F4` |
| Interaction / Tertiary CTA | `#D5DAD1` |

### Accent / status
| Token | Hex |
|---|---|
| Error | `#E21316` |
| Accent / Green 2 | `#0C8C3D` |
| Success Green | `#16BB55` |
| Light Orange / Secondary Yellow | `#EF9E52` |

### Greys (two scales present)
| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| Gray 1 | `#F9FAFB` | | Grey 025 | `#FAFAFA` |
| Gray 2 | `#F3F4F6` | | Grey 05 | `#F5F5F6` |
| Gray 3 | `#DEE2E6` | | Grey 10 | `#EAEBEC` |
| Gray 4 | `#A8ABAF` | | Grey 20 | `#D6D7D9` |
| Gray Dark 5 | `#6B7280` | | Grey 30 | `#C1C3C6` |
| gray/900 | `#111827` | | Grey 40 | `#ACAFB3` |
| gray/200 | `#E5E7EB` | | Grey 50 | `#979BA0` |
| UI Grey 5 | `#F3F3F4` | | Grey 60 | `#83868E` |
| Interaction / Divider | `#E9E9EB` | | Grey 70 | `#6E727B` |

---

## 3. Effects / shadows
| Token | Value |
|---|---|
| Smooth shadow | `0 1px 2px rgba(0,0,0,0.05)` |
| Smooth card shadow | `0 2px 6px rgba(0,0,0,0.05)` |
| Shadow / base | `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10)` |

---

## 4. Suggested CSS variables (confirm active set first)

```css
:root {
  /* Brand — warm bakery (confirm) */
  --color-offwhite: #F7F2EA;
  --color-mocha:    #B1714D;
  --color-beige:    #EED3B8;
  --color-ink:      #182325;
  --color-black:    #2B2525;
  --color-white:    #FFFFFF;

  /* Text */
  --text-primary:   #182325;
  --text-secondary: #787878;

  /* Status */
  --color-error:    #E21316;
  --color-success:  #16BB55;
  --color-warning:  #EF9E52;

  /* Neutrals */
  --grey-025: #FAFAFA;  --grey-05: #F5F5F6;  --grey-10: #EAEBEC;
  --grey-20:  #D6D7D9;  --grey-30: #C1C3C6;  --grey-40: #ACAFB3;
  --grey-50:  #979BA0;  --grey-60: #83868E;  --grey-70: #6E727B;

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0,0,0,.05);
  --shadow-card: 0 2px 6px rgba(0,0,0,.05);
  --shadow-base: 0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.10);
}
```

Fonts to load: **Google Sans Flex** and/or **DM Sans** (Latin), **Vazirmatn** (Arabic), **Caveat** (accent). Confirm the active Latin family before wiring the type scale.

---

_Next: confirm which palette + Latin font are the active Exception brand so the token set can be trimmed to just the real identity._
