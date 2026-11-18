# Design Tokens

Saans uses a TinkerHub-inspired aesthetic: playful, community-first, bold type, lowercase section titles, numbered sections (01/02/03), warm and human tone.

## Philosophy

| Principle | Implementation |
|---|---|
| Community-first | Warm teal-green brand, human voice in copy |
| Bold type | Plus Jakarta Sans at 800 weight for headings |
| Lowercase titles | All section titles in `text-transform: lowercase` |
| Numbered sections | 01 / 02 / 03 prefix badges |
| Pattern accents | Orange (#E8734A) secondary brand for CTAs |
| No emoji clutter | Max 1 purposeful emoji per section |

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `--color-brand-primary` | `#2D7D6F` | Teal-green — primary CTA, links, active states |
| `--color-brand-primary-hover` | `#245F55` | Hover state for primary |
| `--color-brand-primary-light` | `#E8F5F0` | Accent backgrounds, selected states |
| `--color-brand-secondary` | `#E8734A` | Orange — secondary CTA, warnings |
| `--color-brand-accent` | `#F5C842` | Yellow — cost badges, highlights |
| `--color-bg-primary` | `#FAFAF8` | Page background (warm off-white) |
| `--color-bg-secondary` | `#F3F1EC` | Subtle section backgrounds |
| `--color-bg-elevated` | `#FFFFFF` | Card backgrounds |
| `--color-text-primary` | `#1A1A1A` | Main body text |
| `--color-text-secondary` | `#4A4A4A` | Secondary text, descriptions |
| `--color-text-muted` | `#7A7A7A` | Timestamps, captions, hints |

## AQI Colour Scale

Colours are WCAG AA compliant on white backgrounds. Never used alone — always paired with icon and text label.

| Category | Colour | Pattern |
|---|---|---|
| Good | `#2E7D32` | ✓ |
| Moderate | `#F57F17` | ~ |
| Sensitive | `#E65100` | ! |
| Unhealthy | `#C62828` | !! |
| Very Unhealthy | `#6A1B9A` | ‼ |
| Hazardous | `#4A0010` | ☠ |

## Typography

| Token | Value | Usage |
|---|---|---|
| `--font-heading` | Plus Jakarta Sans | Section titles, card headers, buttons |
| `--font-body` | Inter | Body copy, form labels, chat |
| `--font-mono` | JetBrains Mono | AQI values, timestamps, pollutant readings |
| `--weight-extrabold` | 800 | App name, AQI hero number |
| `--weight-bold` | 700 | Card titles, section headers |
| `--weight-semibold` | 600 | Buttons, badges |
| `--weight-medium` | 500 | Form labels, navigation |

Both Plus Jakarta Sans and Inter are loaded from Google Fonts with `preconnect` hints in `index.html`.

## Spacing Scale

8px base unit, following a 4px grid:

```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
```

## Radius Scale

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Small input borders |
| `--radius-md` | 8px | Small cards, tooltips |
| `--radius-lg` | 12px | Standard cards |
| `--radius-xl` | 16px | Elevated cards |
| `--radius-2xl` | 24px | Modals |
| `--radius-full` | 9999px | Pill buttons, badges, progress bars |

## Motion

```css
--transition-fast: 150ms ease
--transition-normal: 250ms ease
--transition-slow: 400ms ease
```

All transitions are disabled when `prefers-reduced-motion: reduce` is set.

## Component Patterns

### Section Headers (TinkerHub numbered sections)
```html
<span class="section-number">01</span>
<h2 class="section-title">dashboard</h2>
```

### Pill Buttons
Buttons use `border-radius: var(--radius-full)` and lowercase text.

### Cards
Three variants: `default` (subtle shadow), `elevated` (stronger shadow), `accent` (teal-green background).

## Inspiration

The aesthetic draws on TinkerHub's community-first brand: warm backgrounds, bold headings, lowercase titles, numbered section structure, pill-shaped buttons, and an orange-teal palette. No logos, images, text, or assets were copied.
