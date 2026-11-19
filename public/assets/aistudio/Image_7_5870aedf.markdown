---
name: GovJob Admin
colors:
  surface: '#f9f9ff'
  surface-dim: '#d1daf4'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d9e2fc'
  on-surface: '#121b2e'
  on-surface-variant: '#44474f'
  inverse-surface: '#273044'
  inverse-on-surface: '#edf0ff'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#455f8b'
  primary: '#001b3e'
  on-primary: '#ffffff'
  primary-container: '#12305a'
  on-primary-container: '#7f99c9'
  inverse-primary: '#adc7fa'
  secondary: '#7f5700'
  on-secondary: '#ffffff'
  secondary-container: '#ffbe4c'
  on-secondary-container: '#724d00'
  tertiary: '#00210d'
  on-tertiary: '#ffffff'
  tertiary-container: '#00391b'
  on-tertiary-container: '#47ab6c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7fa'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#2c4772'
  secondary-fixed: '#ffdead'
  secondary-fixed-dim: '#fcbb49'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#93f8b1'
  tertiary-fixed-dim: '#77db96'
  on-tertiary-fixed: '#00210d'
  on-tertiary-fixed-variant: '#00522a'
  background: '#f9f9ff'
  on-background: '#121b2e'
  surface-variant: '#d9e2fc'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  metric-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system establishes an authoritative, reliable, and accessible interface built for high-stakes public sector administration and recruitment pipelines. Designed for civil service administrators, examination officers, and content managers, the aesthetic conveys institutional trust, procedural precision, and stability.

Drawing from modern public sector enterprise frameworks, the style balances structured density with visual clarity. It replaces cluttered legacy government directories with high-contrast hierarchy, clear navigational landmarks, and calm visual rhythm. Interactions are immediate, low-latency, and predictable, ensuring high efficiency during intensive data entry, candidate verification, and examination result publishing cycles.

## Colors

The palette employs deep navy as an institutional anchor paired with functional saffron accents to denote priority alerts, pending actions, and active indicators without inducing cognitive fatigue.

- **Primary (`#12305A`)**: Used for root navigation bars, primary calls to action, high-level headers, and active system states. Primary hover shifts systematically to `#1C4478`.
- **Secondary (`#F5B544`)**: Used selectively for highlight callouts, warning indicators, and critical workflow flags that require administrative intervention.
- **Tertiary & System Feedback**:
  - Success: `#18864B` for published results, verified credentials, and completed cycles.
  - Warning: `#D97706` for impending registration deadlines and unverified batches.
  - Error: `#DC2626` for rejected files, validation errors, and critical system alerts.
  - Info: `#2563EB` for ongoing updates and informational tooltips.
- **Surfaces & Borders**:
  - Page Canvas: `#F4F6FA` delivers comfortable, glare-free readability during long shifts.
  - Surface/Card: `#FFFFFF` provides clean contrast for data density.
  - Structural Borders: `#E4E7EC` demarcates table columns, input boundaries, and card headers with deliberate precision.
- **Typography Tokens**:
  - Main Body Text: `#172033` ensures strict WCAG AAA contrast against white cards.
  - Muted/Secondary Text: `#667085` denotes metadata, timestamps, and column labels.

## Typography

Inter serves as the sole typeface, utilizing tabular figures and alternate glyphs to handle high-density tabular data, administrative lists, and numeric roll calls. 

- **Hierarchy Structure**: Section headers and screen titles use semi-bold and bold weights with subtle negative tracking to balance optical weight.
- **Data & Tables**: Numerical datasets, application registration IDs, roll numbers, and dates must be rendered using `font-feature-settings: 'tnum' 1, 'cv05' 1` for consistent column alignment.
- **Labels & Badges**: Small-scale text uses heightened letter spacing and medium-to-semibold weights to preserve legibility at 11px and 12px.

## Layout & Spacing

The layout philosophy implements a structured, desktop-first responsive grid optimized for enterprise dashboards:

- **Desktop (1200px and above)**: 12-column responsive layout with `2rem` outer page margins and `1.5rem` gutters. Persistent left-hand navigation rail with a fixed width of 260px.
- **Tablet (768px – 1199px)**: 8-column layout with `1.5rem` margins and `1rem` gutters. The navigation rail collapses into an icon-only dock or off-canvas drawer.
- **Mobile (below 768px)**: 4-column layout with `1rem` margins and `0.75rem` gutters. Cards and nested data tables reflow to single-column stacked structures with horizontal scroll anchors for multi-column data.
- **Rhythm**: Component spacing strictly adheres to an 8px grid (with 4px and 2px steps reserved for dense status badges, inputs, and tabular rows).

## Elevation & Depth

To preserve institutional authority and maximize high-volume data legibility, depth is achieved through structural hairline borders and disciplined, flat tonal separation rather than dynamic shadows.

- **Level 0 (Canvas)**: `#F4F6FA` flat surface.
- **Level 1 (Cards, KPI blocks, Data Tables)**: `#FFFFFF` background bound by a crisp 1px border in `#E4E7EC`. A very subtle baseline shadow provides spatial grounding: `box-shadow: 0 1px 2px 0 rgba(18, 48, 90, 0.05)`.
- **Level 2 (Dropdowns, Popovers, Filter Menus)**: `#FFFFFF` floating surface with a 1px border `#E4E7EC` and an ambient shadow: `box-shadow: 0 4px 6px -1px rgba(18, 48, 90, 0.08), 0 2px 4px -2px rgba(18, 48, 90, 0.04)`.
- **Level 3 (Modal Dialogs, Administrative Overlays)**: `#FFFFFF` with `box-shadow: 0 10px 15px -3px rgba(18, 48, 90, 0.12), 0 4px 6px -4px rgba(18, 48, 90, 0.06)` combined with a 40% `#12305A` backdrop tint.

## Shapes

The design system uses a restrained corner radius (Scale 1: Soft) to reflect procedural discipline and standard enterprise conventions.

- **Inputs, Buttons, and Badges**: `0.25rem` (`4px`) roundedness to maintain crisp geometry.
- **Cards, Panels, and Containers**: `0.375rem` to `0.5rem` (`6px` to `8px`) max corner radius for structural stability.
- **Interactive Badges / Chips**: Micro-radii of `0.25rem` (`4px`) ensure high visual distinction from free-floating pill tags, preserving an authoritative government software feel.

## Components

### Buttons
- **Primary**: Solid `#12305A` background, `#FFFFFF` text, `4px` border radius, padding `0.5rem 1rem`. Hover state: `#1C4478`. Active: `#0D2240`.
- **Secondary / Outline**: `#FFFFFF` background, `1px solid #E4E7EC` border, `#172033` text. Hover state: `#F4F6FA`.
- **Accent (Action/Urgent)**: `#F5B544` background, `#172033` text. Hover state: `#E5A330`.
- **Destructive**: `#DC2626` background, `#FFFFFF` text. Hover state: `#B91C1C`.

### Data Tables & Status Badges
- **Tables**: Clean `#FFFFFF` container with a `1px solid #E4E7EC` perimeter border. Header row uses `#F4F6FA` with `12px` uppercase bold `#667085` typography. Cell padding is compact (`0.625rem 1rem`) with subtle row dividers.
- **Badges**:
  - *Admit Card / Active*: `#18864B` text on `#ECFDF3` background with `#A6F4C5` border.
  - *Pending / Scrutiny*: `#D97706` text on `#FFFBEB` background with `#FDE68A` border.
  - *Result Announced*: `#12305A` text on `#EFF4FB` background with `#C7D7EE` border.
  - *Rejected / Cancelled*: `#DC2626` text on `#FEF2F2` background with `#FECACA` border.

### Input Fields & Controls
- **Inputs & Selects**: Height `38px`, background `#FFFFFF`, border `1px solid #E4E7EC`, radius `4px`. Focused state: border `#12305A` with a 2px outer focus ring in `rgba(18, 48, 90, 0.15)`.
- **Checkboxes & Radios**: Square / circular with `1.5px solid #667085` border, snapping to `#12305A` fill with a sharp white checkmark or center pip when checked.

### KPI Cards
- Metrics cards feature a top 3px accent line (using `#12305A`, `#F5B544`, or `#18864B` to indicate portal channel status: Vacancies, Applications Received, Verification Pending, Results Live). Metrics use `28px` bold numerical type with `12px` trend metadata directly beneath.