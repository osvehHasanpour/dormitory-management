# Dormitory App — Design System & Screen Layouts

> RTL (Persian/Farsi). Font: El Messiri (Google Fonts). All layout described right-to-left.

---
## Design Tokens

### Colors

| Token | Hex | Use |
|---|---|---|
| `primary` | `#C6A5DF` | Primary CTA, active nav item, brand mark only |
| `primary-pressed` | `#B29EC2` | Pressed state of primary button |
| `ink` | `#2E1145` | Primary headlines, button labels, nav links |
| `body` | `#2E1145` | Default paragraph text |
| `mute` | `#582281` | Metadata, timestamps, secondary captions |
| `ash` | `#B29EC2` | Placeholder text, disabled button label |
| `stone` | `#C6A5DF` | Default input border |
| `hairline` | `#C6A5DF` | 1px borders on cards, table rows, dividers |
| `canvas` | `#FFFFFF` | Base: cards, modals, top nav, form fields |
| `surface-soft` | `#faf7fd` | Main page background |
| `surface-card` | `#f3ecfa` | Secondary cards, search bar, filter chips |
| `surface-dark` | `#2E1145` | Supervisor sidebar / bottom nav background |
| `on-primary` | `#FFFFFF` | Text on primary button |
| `on-secondary` | `#2E1145` | Text on secondary button |
| `secondary-bg` | `#C6A5DF` | Secondary button fill |
| `secondary-pressed` | `#B29EC2` | Secondary button pressed |
| `on-dark` | `#FFFFFF` | Text on dark surfaces |
| `success-deep` | `#1a4731` | Approved badge text |
| `success-pale` | `#c8f0da` | Approved badge background |
| `warning` | `#7a4f00` | Pending badge text |
| `warning-pale` | `#fff3cc` | Pending badge background |
| `error` | `#8b1a1a` | Rejected badge text |
| `error-pale` | `#fde8e8` | Rejected badge background |

### Typography

Font: **Vazirmatn** — weights 400/500/600/700. Fallback: `Tahoma, Arial, sans-serif`.

```html
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

```css
body { font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; direction: rtl; }
```

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display-xl` | 48px | 700 | 1.2 | Hero headline |
| `display-lg` | 36px | 700 | 1.25 | Major section title |
| `heading-xl` | 24px | 700 | 1.3 | Page title |
| `heading-lg` | 20px | 600 | 1.35 | Card title, modal title |
| `heading-md` | 17px | 600 | 1.4 | List item heading, sub-section |
| `body-md` | 15px | 400 | 1.6 | Default paragraph, form helper |
| `body-strong` | 15px | 600 | 1.6 | Nav link, form label |
| `body-sm` | 13px | 400 | 1.5 | Metadata, timestamps |
| `body-sm-strong` | 13px | 700 | 1.5 | Table header, category label |
| `caption-md` | 12px | 500 | 1.5 | Status badge text |
| `caption-sm` | 11px | 400 | 1.4 | Smallest utility text |
| `button-md` | 14px | 700 | 1 | Primary/secondary button |
| `button-sm` | 12px | 700 | 1 | Filter chip, compact button |

### Spacing

Base unit: 8px.

| Token | Value |
|---|---|
| `xxs` | 4px |
| `xs` | 6px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `xxl` | 32px |
| `section` | 48px — vertical gap between major content blocks |

### Border Radius

| Token | Value | Use |
|---|---|---|
| `none` | 0px | Top nav, footer, structural dividers |
| `sm` | 6px | Active sidebar nav item |
| `md` | 12px | Buttons, inputs, cards — dominant radius |
| `lg` | 24px | Modal cards, large feature surfaces |
| `full` | 9999px | Status badges, chips, avatar circles, search bar |

### Elevation

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No border, no shadow | Page background |
| 1 — Hairline | 1px solid `hairline` | Cards, form inputs, table rows |
| 2 — Elevated | 8px shadow `rgba(46,17,69,0.10)` + canvas bg | Stat cards, modal |
| 3 — Modal | 40%-opacity dark scrim + 16px shadow | Confirmation dialogs |

---

## Components

### Buttons

| Component | bg | text | radius | height | padding |
|---|---|---|---|---|---|
| `button-primary` | `primary` | `on-primary` | `md` | ~40px | 8px 20px |
| `button-primary` pressed | `primary-pressed` | `on-primary` | `md` | — | — |
| `button-secondary` | `secondary-bg` | `on-secondary` | `md` | ~40px | 8px 20px |
| `button-secondary` pressed | `secondary-pressed` | `on-secondary` | `md` | — | — |
| `button-tertiary` | transparent | `primary` | `md` | — | — |
| `button-icon-circular` | `surface-card` | `ink` | `full` | 40px | — |
| `button-disabled` | `surface-card` | `ash` | `md` | — | — |

### Inputs

| Component | bg | border | radius | height |
|---|---|---|---|---|
| `text-input` | `canvas` | 1px `stone` | `md` | 44px |
| `text-input` focused | `canvas` | 2px `primary` + 3px outline `primary` | `md` | 44px |
| `search-bar` | `surface-card` | none | `full` | 44px |

### Status Badges

| Component | bg | text | radius | padding |
|---|---|---|---|---|
| `status-badge-pending` | `warning-pale` | `warning` | `full` | 4px 10px |
| `status-badge-approved` | `success-pale` | `success-deep` | `full` | 4px 10px |
| `status-badge-rejected` | `error-pale` | `error` | `full` | 4px 10px |

### Cards

| Component | bg | border | radius | padding |
|---|---|---|---|---|
| `request-card` | `canvas` | 1px `hairline` | `md` | 16px |
| `announcement-card` | `surface-soft` | 1px `hairline` | `md` | 16px |
| `dashboard-stat-card` | `canvas` | 1px `hairline` | `md` | 20px |
| `modal-card` | `canvas` | — | `lg` | 28px, shadow 0 16px 48px rgba(46,17,69,0.18) |

### Filter Chips

| Component | bg | text | radius | padding |
|---|---|---|---|---|
| `filter-chip` | `surface-card` | `ink` | `full` | 6px 14px |
| `filter-chip-active` | `primary` | `on-primary` | `full` | 6px 14px |

### Navigation

Icons source: /media/ (project root). Use <img> instead of icon components.
Naming convention: [screen-id]-[element].png  e.g. nav-home.png, nav-profile.png

**Student top-nav:** bg `canvas`, height 60px, border-bottom 1px `hairline`.

**Supervisor sidebar-nav:** bg `surface-dark`, text `on-dark`, width 240px, fixed.
Active item: bg `primary`, text `on-primary`, radius `sm`.

### Data Table

Header: bg `surface-card`, text `body`, type `body-sm-strong`.
Rows: alternating `canvas` / `surface-soft`. Cell borders: 1px `hairline`.

---

## Responsive Breakpoints

| Name | Width | Key changes |
|---|---|---|
| desktop-large | 1440px+ | Sidebar 240px fixed, 4-up stat grid |
| desktop | 1280px | Same, narrower gutters |
| tablet | 768px | Sidebar becomes overlay drawer, 2-up stat grid |
| mobile | 480px | Single-column, hamburger menu, display-xl ~32px |
| mobile-narrow | 320px | Section padding 16px, 1-up stat cards |

Collapsing: sidebar → drawer → hamburger. Modal → bottom sheet on mobile. Section spacing: 48px → 32px → 16px.

---

# Dormitory App — Screen Layouts

> RTL (Persian). Colors/tokens from `design-en.md`. Layout described right-to-left.

---

## Shared Components

### Bottom Nav Bar (Student — 4 icons)
Fixed bottom strip, background `{colors.surface-dark}`.
| Position (R→L) | Icon | Target |
|---|---|---|
| 1 (rightmost) | Exit/Door | Logout |
| 2 | Checklist+Magnifier | My Requests (tracking) |
| 3 | Person/Avatar | Profile |
| 4 (leftmost) | House | Home (main screen) |

### Bottom Nav Bar (Supervisor — 3 icons)
| Position (R→L) | Icon | Target |
|---|---|---|
| 1 | Exit/Door | Logout |
| 2 | Person/Avatar | Profile |
| 3 | House | Home (main screen) |

---

## STUDENT SCREENS

### S1 — Login
- **Top:** "Login" label (centered, `heading-xl`)
- **Center:** Illustrated dormitory building image (full-width hero)
- **Form (below image, centered):**
  - Input: نام کاربری (username)
  - Input: رمز عبور (password)
- **CTA:** Full-width primary button — "ورود"
- No bottom nav bar

---

### S2 — Home / Dashboard
- **Top:** Full-width illustrated banner image (colorful dormitory illustration)
- **Section — خدمات (Services):** 3-column icon grid
  | Icon | Label |
  |---|---|
  | Supplies box | درخواست لوازم اتاق |
  | Vacuum/mop | درخواست نظافت |
  | Toolbox | گزارش خرابی |
- **Section — فرهنگی (Cultural):** 2-row icon grid (3 + 2)
  | Icon | Label |
  |---|---|
  | Megaphone | اطلاعیه‌ها |
  | Stall | درخواست غرفه |
  | Classroom | ثبت نام کلاس |
  | Idea/handshake | ایده‌ها و پیشنهادات |
  | Suggestion box | پیشنهادات و شکایات |
- **Bottom:** 4-icon nav bar (S-nav)

---

### S3 — Damage Report Form (گزارش خرابی)
- **Top:** Back arrow (right), notification dot (center-top)
- **Title:** "گزارش خرابی" (`heading-xl`, centered)
- **Subtitle:** "ثبت درخواست خرابی" (`heading-md`)
- **Form fields (each row has icon on right, label+placeholder on left):**
  1. Building icon → انتخاب بلوک / (dropdown)
  2. Door icon → انتخاب اتاق: (text input)
  3. Checklist icon → دسته‌بندی خرابی (dropdown)
  4. Notes icon → توضیحات تکمیلی (textarea)
  5. Camera icon → افزودن عکس خرابی / "افزودن عکس جدید" (upload)
- **CTA:** Full-width primary button — "ثبت درخواست خرابی"
- **Bottom:** 4-icon nav bar (S-nav)

---

### S4 — Cleaning Request Form (درخواست نظافت)
- **Top:** Back arrow (right)
- **Title:** "ثبت جزئیات درخواست نظافت" (`heading-xl`, centered)
- **Section header:** "درخواست نظافت" with hairline divider
- **Form fields (dropdowns unless noted):**
  1. انتخاب بلوک (default: همه بلوک‌ها)
  2. انتخاب طبقه (default: همه طبقه‌ها)
  3. انتخاب لاین (default: همه لاین‌ها)
  4. انتخاب فضا (dropdown: انتخاب فضای مورد نظر)
  5. توضیحات تکمیلی (اختیاری) — textarea
- **CTA:** Full-width primary button — "ارسال درخواست نظافت"
- **Bottom:** 4-icon nav bar (S-nav, with labels: صفحه اصلی / پیگیری درخواست / پشتیبانی / خروج)

---

### S5 — Supplies Request Form (درخواست لوازم اتاق)
- **Top:** Back arrow (right)
- **Title:** "ثبت جزئیات درخواست لوازم" (`heading-xl`, centered)
- **Section header:** "درخواست لوازم اتاق" with hairline divider
- **Form fields:**
  1. انتخاب بلوک (dropdown, default: همه بلوک‌ها)
  2. شماره اتاق (text input placeholder: شماره اتاق را وارد کنید)
  3. لیست اقلام (dropdown: انتخاب اقلام مورد نظر)
  4. توضیحات تکمیلی (اختیاری) — textarea
- **CTA:** Full-width primary button — "ارسال درخواست لوازم"
- **Bottom:** 4-icon nav bar (S-nav)

---

### S6 — Class Registration List (ثبت نام در کلاس)
- **Top:** Back arrow (right), camera dot (center-top)
- **Title:** "ثبت نام در کلاس" (`heading-xl`, centered)
- **Tab bar (3 tabs):** فعال | ثبت‌نام شده | پایان یافته
- **Section header:** "کلاس‌های قابل ثبت‌نام"
- **Class cards (repeated):** Each card contains:
  - Title (`heading-md`, right-aligned)
  - Instructor name (`body-sm`)
  - Date (`body-sm`)
  - Capacity: X/Y (`body-sm-strong`)
  - Star rating + count
  - Status badge (right, green: "در حال ثبت‌نام" / orange: "تکمیل ظرفیت")
  - CTA button (left): "ثبتنام" (primary) or disabled
- **Bottom:** 4-icon nav bar (S-nav)

### S6b — Ended Classes Tab (پایان یافته)
- Same layout as S6 but cards show:
  - Status badge: "پایان یافته" (grey)
  - Left button: "امتیازدهی" (primary, if not yet rated) or "امتیاز: X/5" (secondary)

---

### S7 — Class Rating (امتیازدهی)
- **Top:** Back arrow (right, purple), camera dot (center)
- **Title:** "امتیازدهی" (`heading-xl`, centered)
- **Tab bar (2 tabs):** ثبت امتیاز | نظر
- **Rating card:**
  - Class name (right-aligned, `heading-md`)
  - Star icon bookmark (top-right of card)
  - Label: "امتیاز شما (1 تا 5)" — 5-star interactive selector
  - Label: "نظر شما" — textarea (placeholder: نظر خود را بنویسید...)
  - CTA button (centered): "ثبت امتیاز" (primary)
- **Bottom:** 4-icon nav bar (S-nav)

---

### S8 — Stall Request Form (درخواست غرفه دانشجویی)
- **Top:** Back arrow (right)
- **Title:** "درخواست غرفه دانشجویی" (`heading-xl`, centered)
- **Section header:** "ثبت جزئیات غرفه"
- **Form fields (each with icon on right):**
  1. عنوان (text input)
  2. Clothing icon → دسته بندی محصولات (dropdown)
  3. Table icon → تعداد میز (dropdown)
  4. Notes icon → توضیحات تکمیلی (اختیاری) (textarea)
- **CTA:** Full-width disabled primary button — "ثبت درخواست"
- **Bottom:** 4-icon nav bar (S-nav)

---

### S9 — Announcements List (لیست اطلاعیه‌ها)
- **Top:** Camera dot (center-top), decorative corner marks
- **Title:** "لیست اطلاعیه‌ها" (`heading-xl`, centered)
- **Announcement items (accordion-style, repeated):**
  - Collapsed row: Icon (right) | Title | Date | Chevron ˅/˄ (left)
  - Subtitle preview text
  - Expanded row: shows full card with:
    - Title (`heading-md`)
    - Date (`body-sm`)
    - Full body text (`body-md`)
- **Bottom:** 4-icon nav bar (S-nav)

---

### S10 — Ideas & Complaints Menu (ایده‌ها و پیشنهادات)
- **Top:** Back arrow (chevron left)
- **Prompt text:** "لطفاً یکی از گزینه‌های زیر را انتخاب کنید"
- **Two large option cards (stacked):**
  1. Illustrated circle image (light bulb) | "ثبت ایده جدید" (`heading-md`) | description text | chevron (left)
  2. Illustrated circle image (megaphone) | "ثبت شکایت جدید" (`heading-md`) | description text | chevron (left)
- **Bottom:** 4-icon nav bar (S-nav)

---

### S11 — New Complaint Form (ثبت شکایت جدید)
- **Top:** Back arrow (right)
- **Title:** "ثبت شکایت جدید" (`heading-xl`, centered)
- **Hero image:** Megaphone illustration (centered, circular)
- **Tagline:** "ما همیشه آماده شنیدن صدای شما هستیم." (`body-md`, centered)
- **Form fields:**
  1. دسته‌بندی موضوع (dropdown)
  2. عنوان شکایت (text input)
  3. شرح کامل موضوع (textarea, tall)
- **CTA:** Full-width primary button — "ثبت"
- **Bottom:** 4-icon nav bar (S-nav)

---

### S12 — New Idea Form (ثبت ایده جدید)
- **Top:** Back arrow (right)
- **Title:** "ثبت ایده جدید" (`heading-xl`, centered)
- **Hero image:** Lightbulb illustration (centered, circular)
- **Tagline:** "ما منتظر ایده‌ها و نظرات سازنده شما هستیم." (`body-md`, centered)
- **Form fields:**
  1. دسته‌بندی موضوع (dropdown)
  2. عنوان ایده (text input)
  3. شرح کامل موضوع (textarea, tall)
- **CTA:** Full-width primary button — "ثبت"
- **Bottom:** 4-icon nav bar (S-nav)

---

### S13 — View Ideas Feed (مشاهده ایده‌ها)
- **Top:** Back arrow (right), camera dot (center), decorative corner marks
- **Title:** "مشاهده ایده ها" (`heading-xl`, centered)
- **Idea cards (accordion, repeated):**
  - Collapsed: Title (right) | Short description | Chevron (left) | 👍 count | 👎 count
  - Expanded: Full description text + like/dislike counts
- **Bottom:** 4-icon nav bar (S-nav)

---

### S14 — Profile (پروفایل)
- **Top:** Back arrow (right), decorative corner marks
- **Avatar:** Circular avatar image (center-top) with camera icon overlay (bottom-right of avatar)
- **Info rows (each has icon on right, label + value):**
  1. Person icon → نام و نام خانوادگی
  2. ID card icon → شماره دانشجویی
  3. Block icon → بلوک (value: الف)
  4. Door icon → اتاق
- **Bottom:** 4-icon nav bar (S-nav, active: profile/person icon)

---

### S15 — My Requests (درخواست‌های من)
- **Top:** Back arrow (right), camera dot (center)
- **Title:** "درخواست‌های من" (`heading-xl`, centered)
- **Tab bar (3 tabs):** نظافت | لوازم اتاق | گزارش خرابی (active tab underlined)
- **Section header:** "گزارش خرابی‌ها" (or relevant type)
- **Request cards (repeated):**
  - Title (`heading-md`, right)
  - Location: Block X – Room Y (`body-sm`, with building icon)
  - Date (`body-sm`, with calendar icon)
  - Status badge (right): "در حال بررسی" (yellow) / "رد شده" (red) / "انجام شده" (green)
  - Button (left): "مشاهده پیگیری" (secondary)
- **Bottom:** 4-icon nav bar (S-nav)

---

### S16 — Request Detail / Tracking (جزئیات درخواست)
- **Modal/overlay card** over dimmed S15 background
- **Card header (dark purple):** Title (right) | Clock icon (left)
- **Detail rows (icon + label + value):**
  - Location icon → مکان: Block X – Room Y
  - Calendar icon → تاریخ ثبت
  - Notes icon → توضیحات (full text)
  - (If rejected) ✗ دلیل رد — red highlighted box with rejection reason
  - Status icon → وضعیت فعلی (status badge)
- **Progress stepper (horizontal, 3 steps, RTL):**
  - Step 1: "در حال بررسی" (clock icon, green filled = current or done)
  - Step 2: "تایید/رد" (✓ or ✗ icon, red if rejected)
  - Step 3: "انجام شده" (✓ icon, grey if not reached)
  - Each step shows its date below
- **CTA:** Full-width secondary button — "بستن"
- **Bottom:** 4-icon nav bar (S-nav)

---

## SUPERVISOR SCREENS

### P1 — Login (Supervisor)
- Identical layout to S1 but different hero illustration (greyscale/darker palette building)
- Fields and CTA same as S1

---

### P2 — Home / Dashboard (Supervisor)
- **Top:** Full-width illustrated banner image
- **2×2 icon grid (center card, white rounded):**
  | Position | Icon | Label |
  |---|---|---|
  | Top-right | Checklist+Magnifier | داشبورد درخواست‌ها |
  | Top-left | Megaphone | اطلاعیه‌ها |
  | Bottom-right | Classroom | مدیریت کلاس‌ها |
  | Bottom-left | Suggestion box | ایده‌ها و شکایات |
- **Bottom:** 3-icon nav bar (P-nav)

---

### P3 — Announcements Management (اطلاعیه‌های خوابگاه)
- **Breadcrumb top:** "مدیریت اطلاعیه‌ها" (pill chip, centered)
- **Title:** "اطلاعیه‌های خوابگاه" (`heading-xl`, centered)
- **Subtitle:** "مدیریت و ارسال اطلاعیه‌های جدید" (`body-sm`)
- **Announcement list cards (repeated, compact):**
  - Title (right, `heading-md`) | Date+time (left, `caption-md`)
  - Body preview text (`body-sm`)
- **CTA (bottom, above nav):** Full-width primary button — "+ ثبت اطلاعیه جدید"
- **Bottom:** 3-icon nav bar (P-nav)

---

### P4 — New Announcement Form (ثبت اطلاعیه جدید)
- **Top:** Forward arrow → (right, to go back)
- **Title:** "ثبت اطلاعیه جدید" (`heading-xl`, centered)
- **Subtitle:** "لطفاً موضوع و متن اطلاعیه را وارد کنید" (`body-sm`)
- **Form fields:**
  1.  موضوع اطلاعیه (اجباری) — label in red, text input (placeholder: مثال: تعمیرات آب گرم)
  2.  متن اطلاعیه (اجباری) — label in red, textarea (tall, resizable)
- **CTA:** Full-width primary button — "↑ ارسال اطلاعیه"
- **Bottom:** 3-icon nav bar (P-nav)

---

### P5 — Requests Dashboard (داشبورد درخواست‌ها)
- **Breadcrumb top:** "داشبورد درخواست‌ها" (pill) + forward arrow →
- **Title:** "درخواست‌های خوابگاه" (`heading-xl`, centered)
- **Tab bar (3 tabs):** نظافت | لوازم اتاق | گزارش خرابی (active tab = filled dark pill)
- **Request list cards (repeated, compact):**
  - Title (right, `heading-md`)
  - Location: Block X – Room Y (with building icon)
  - Status badge (left): "در انتظار" (yellow) / "در حال بررسی" (purple) / "تکمیل شده" (green)
- **Bottom:** 3-icon nav bar (P-nav)

---

### P6 — Request Detail / Status Change (جزئیات درخواست — Supervisor)
- **Breadcrumb top:** "داشبورد درخواست‌ها" (pill) + forward arrow →
- **Scrollable content:**
  - (Partial visible card above — indicates list context)
  - **Detail card:**
    - Icon (top-right) | Title (e.g., "تمیز کردن سرویس بهداشتی") (`heading-md`)
    -  مکان: Block X – Floor Y
    -  تاریخ درخواست
    -  دسته‌بندی
    - **جزئیات:** full description text (`body-md`)
    - **توضیحات تکمیلی (در صورت وجود):** textarea (editable by supervisor)
    - **تغییر وضعیت درخواست:** dropdown (options: در حال بررسی / تکمیل شده / رد شده)
    - When dropdown open, options shown as inline list (blue highlight on selected)
    - Link button: "✗ مشاهده گزارش کامل"
- **Bottom:** 3-icon nav bar (P-nav)

---

### P7 — Classes Management (مدیریت کلاس‌ها)
- **Top:** Back arrow (right), camera dot (center)
- **Title:** "مدیریت کلاس‌ها" (`heading-xl`, centered)
- **Tab bar (2 tabs):** کلاس‌های فعال | همه کلاس‌ها
- **Section header:** "کلاس‌های فعال"
- **Class cards (repeated, detailed):**
  - Title (right, `heading-md`)
  -  Instructor name
  -  Category
  -  Date range (start → end)
  -  Capacity: X/Y
  -  Location
  - Status badge (right): "فعال (X ظرفیت باقیمانده)" (green) / "تکمیل ظرفیت" (yellow)
  - Action buttons (left-aligned): "ویرایش " (secondary) | "لغو " (red-outlined)
- **FAB / CTA (above nav):** "+ ثبت کلاس جدید" (primary, right-aligned)
- **Bottom:** 3-icon nav bar (P-nav)

---

### P8 — New Class Form (ثبت کلاس جدید)
- **Top:** Camera dot (center) | Forward arrow → (right)
- **Title:** "ثبت کلاس جدید" (`heading-xl`, centered)
- **Tab bar (2 tabs):** اطلاعات کلاس (active) | ثبت
- **Form card (dark purple header "فرم ثبت کلاس" + person icon):**
  - عنوان کلاس (اجباری) — text input
  - نام مدرس (اجباری) — text input
  - دسته‌بندی (اجباری) — text input
  - تاریخ شروع (اجباری) — date picker
  - تاریخ پایان (اجباری) — date picker
  - ظرفیت (اجباری) — number input
  - مکان برگزاری — text input (optional)
  - توضیحات و سرفصل‌ها — textarea
- **Bottom:** 3-icon nav bar (P-nav)

---

### P9 — Ideas & Complaints (ایده‌ها و شکایات — Supervisor)
- **Breadcrumb top:** "مدیریت ایده‌ها و شکایات" (pill) + forward arrow →
- **Title:** "ایده‌ها و شکایات" (`heading-xl`, centered)
- **Subtitle:** "مشاهده و پاسخگویی" (`body-sm`)
- **Tab bar (3 tabs):** همه (active) | ایده‌ها | شکایات
- **Item cards (repeated):**
  - Type badge (right): "ایده" (teal/light) or "شکایت" (salmon/light)
  - Title (`heading-md`, right)
  -  Student name |  Block–Room |  Date |  Category
  - Preview text (`body-sm`)
  - Status badge (bottom-left): "در انتظار پاسخ" (yellow) / "پاسخ داده شده" (green) / "در حال بررسی" (purple)
- **Bottom:** 3-icon nav bar (P-nav)
