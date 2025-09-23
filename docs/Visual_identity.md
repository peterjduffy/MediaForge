# MediaForge – Visual Identity

## Core idea
Fast, on-brand illustrations for blogs, social, marketing pages – with a positive, design-led tone.

## Typeface
- **Manrope (Variable)** – single family for everything
  - Headlines: 700–800
  - Buttons/nav: 600
  - Body: 400–500
- Import (no tracking changes needed): `https://fonts.googleapis.com/css2?family=Manrope:wdth,wght@100..125,200..800&display=swap`

## Color palette
### Brand pink
- `--mf-pink-50:  #FFE6F1`
- `--mf-pink-100: #FFC0DC`
- `--mf-pink-200: #FF9CC9`
- `--mf-pink-300: #FF78B5`
- `--mf-pink-400: #FF59A3`
- `--mf-pink-500: #FF1F8B` ← **Primary**
- `--mf-pink-600: #E11C7C`
- `--mf-pink-700: #D91676`
- `--mf-pink-800: #B11266`
- `--mf-pink-900: #8A0E50`

### Neutrals
- `--mf-bg:       #FFFFFF`  // page background
- `--mf-surface:  #F7F9FC`  // subtle panels
- `--mf-card:     #FFFFFF`  // cards
- `--mf-text:     #0E0E0E`  // primary text
- `--mf-muted:    #48566A`  // secondary text
- `--mf-border:   #E6E9EE`  // dividers, strokes
- `--mf-shadow:   rgba(15,23,42,.08)` // soft card shadow
- `--mf-ring:     rgba(255,31,139,.22)` // focus state

### Status (optional)
- Success `#16A34A`
- Warning `#F59E0B`
- Danger  `#EF4444`
- Info    `#0EA5E9`

### Usage quick guide
- Use `mf-pink-500` for primary CTAs and highlights. Hover can go to `-600`, active to `-700`.
- Keep long text near-black `--mf-text` on white. Reserve pink for accents, not paragraphs.
- Panels: white `--mf-card` with `--mf-border` stroke and soft `--mf-shadow`.
- Focus: use `--mf-ring` box-shadow for accessible focus indication.
- Gradients: `linear-gradient(135deg, var(--mf-pink-500), var(--mf-pink-700))` for primary buttons.

## Radius & spacing
- Radius: **16px** for cards, **12px** for inner elements, **999px** for pills/buttons.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32 px.

## Tone of voice
- Positive and direct. Prefer “brand-aligned” over “compliant.” Emphasize speed and team efficiency.

**Guide Suggestions**
- **Logo Usage**: Always keep prominence with primary color, ample padding, and clarity.
