---
name: Digital Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fcf8f8'
  on-tertiary: '#313030'
  tertiary-container: '#dfdcdb'
  on-tertiary-container: '#616060'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 120px
    fontWeight: '900'
    lineHeight: 100px
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 80px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 24px
  stack-unit: 8px
---

## Brand & Style

This design system is built on a foundation of **Neo-Brutalism and Minimalism**, characterized by high-contrast aesthetics and a reductionist philosophy. It is designed for elite professionals, creative studios, and high-end technical products that require an authoritative, "expert-mode" interface.

The visual narrative relies on extreme values: pure blacks and stark whites, punctuated by a hyper-vibrant green that signals activity and "online" status. The emotional response is one of precision, confidence, and modern sophistication. Information is presented with raw honesty—heavy borders, monospaced-style cues, and massive typographic scale—eliminating all unnecessary decoration to focus on the power of the content itself.

## Colors

The palette is strictly functional and high-contrast to ensure maximum legibility and impact within a dark environment.

*   **Surface:** The primary canvas is a true deep black (`#000000`), creating an infinite depth effect that allows content to pop.
*   **Primary (Accent):** A vibrant Matrix-style green (`#00FF41`) is used sparingly for status indicators, active states, and primary calls to action.
*   **Foreground:** Pure white (`#FFFFFF`) is used for primary text and iconography to maintain a stark, editorial feel.
*   **Secondary Surface:** A dark charcoal (`#1A1A1A`) is used for subtle container differentiation, such as input fields or hover states, ensuring the UI doesn't feel entirely flat while avoiding traditional drop shadows.

## Typography

Typography is the central design element. The system utilizes **Hanken Grotesk** across all levels to maintain a cohesive, Swiss-inspired modernist look.

The scale is aggressive. Display sizes use extreme weights (ExtraBold/Black) and tight letter spacing to create a graphic, almost architectural impact. For body text, the weight drops to Regular to ensure readability against the black background. All labels and auxiliary metadata should be set in uppercase with increased letter spacing to provide a clear structural contrast to the fluid body copy and massive headlines.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. Large desktop screens use a maximum container width of 1440px centered in the viewport, while smaller screens utilize a fluid 12-column grid.

Spacing is generous and structural. We employ a strict 8px spacing system (`stack-unit`). Large-scale sections should be separated by significant vertical "breathing room" (often 128px or 160px) to reinforce the minimalist aesthetic. Alignment should be rigorous; elements should snap to the grid edges to create a sense of brutalist order. On mobile, margins reduce to 24px, and typography scales down significantly to ensure the "bold" look doesn't overwhelm the smaller viewport.

## Elevation & Depth

This design system rejects traditional shadows. Depth is achieved through **Tonal Layering and Borders**:

1.  **Level 0 (Base):** Pure `#000000` background.
2.  **Level 1 (Containers):** Outlined with a thin (1px) border of `#333333` or `#FFFFFF` (low opacity).
3.  **Active States:** High-contrast borders or solid fills of the Primary Green (`#00FF41`).

Interaction is signaled not by lifting an element toward the user (z-axis), but by color inversion or border weight changes. This maintains the "flat" brutalist integrity while providing clear affordances.

## Shapes

The shape language is primarily **Soft (0.25rem)**. While the style is brutalist, the subtle rounding on buttons and tags prevents the UI from feeling hostile, adding a touch of contemporary professional polish. 

Large containers and the main viewport frame should remain sharp (0px), while interactive components like buttons, chips, and input fields use the subtle 4px radius.

## Components

### Buttons
Primary buttons are outlined in White or Green with no fill. On hover, they invert to a solid fill with Black text. Use `label-caps` for button text.

### Chips / Tags
Small, pill-like containers with 1px borders. For "Available" or "Live" statuses, a 6px solid green circle is placed to the left of the text.

### Input Fields
Strictly rectangular with a 1px border. The label sits above the field in `label-caps`. The focus state changes the border color to Primary Green.

### Lists
Separated by thin, full-width horizontal rules (`#333333`). Hovering over a list item should trigger a subtle background shift to `#1A1A1A`.

### Cards
Cards are defined by their borders rather than their background color. Use a 1px border and generous internal padding (32px or more) to keep the content feeling premium and airy.