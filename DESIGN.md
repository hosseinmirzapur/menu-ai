# DESIGN.md — کافه دیجیتال (Digital Café)

## Brand Identity

```
Name:        کافه دیجیتال (Digital Café)
Vibe:        Berlin Kontor — Dark Industrial European Coffee Bar
Mood:        Moody, warm, intimate, textured, premium
Inspiration: Dark-academia coffeehouses, Berlin espresso bars, leather-bound notebooks
```

## Color Palette

| Token           | Hex       | Usage                         |
|-----------------|-----------|-------------------------------|
| `bg-base`       | `#0C0A09` | Page background (almost black)|
| `bg-surface`    | `#1C1917` | Cards, panels, containers     |
| `bg-elevated`   | `#292524` | Hover states, active elements |
| `border-subtle` | `#3D352D` | Borders, dividers (dark cacao)|
| `text-primary`  | `#EDE4D8` | Primary body text (warm white) |
| `text-secondary`| `#C4A88A` | Secondary text (warm beige)    |
| `text-muted`    | `#8B7355` | Muted text (leather brown)     |
| `accent`        | `#C4A88A` | Interactive accents, badges    |
| `accent-hover`  | `#D4B896` | Hover state for accent         |
| `danger`        | `#9F391B` | Destructive actions            |
| `success`       | `#5A7A5A` | Success states                 |

## Typography

| Role       | English         | Persian          |
|------------|-----------------|------------------|
| Headings   | Space Grotesk   | Shabnam          |
| Body       | Inter           | Vazirmatn        |
| Numbers    | Inter           | Inter            |

### Type Scale

| Level   | Size/Weight          | Usage                  |
|---------|----------------------|------------------------|
| Hero    | 3.5rem / Bold        | Page hero title        |
| H1      | 2.25rem / Bold       | Section headings       |
| H2      | 1.5rem / Semibold    | Card titles            |
| H3      | 1.125rem / Semibold  | Item names             |
| Body    | 0.938rem / Normal    | Paragraphs, content    |
| Small   | 0.813rem / Normal    | Secondary text         |
| Tiny    | 0.75rem / Normal     | Labels, metadata       |

### Line Heights
- Headings: 1.15
- Body: 1.65

## Spacing System

Based on a 4px unit:
```
space-1:  4px
space-2:  8px
space-3:  12px
space-4:  16px
space-5:  20px
space-6:  24px
space-8:  32px
space-10: 40px
space-12: 48px
space-16: 64px
```

## Layout

- Max-width containers: 1280px (menu), 720px (admin login)
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop for menu items
- Section padding: 48px vertical, 16px horizontal (mobile); 64px / 24px (desktop)
- Cards: rounded-xl (12px), consistent padding

## Design Principles

1. **Dark warmth**: Backgrounds are dark but never cold — warm undertones throughout.
2. **Typographic hierarchy**: Strong contrast between headings and body. English geometric (Space Grotesk) meets Persian grace (Shabnam).
3. **Texture over flat**: Use CSS gradients, subtle noise, and layered surfaces to create depth without images.
4. **Motion with purpose**: Page transitions via framer-motion, scroll-driven micro-animations via GSAP (useGSAP hook). Nothing decorative — every animation serves hierarchy or feedback.
5. **RTL first**: All layouts designed for right-to-left reading. LTR only for code/numbers.
6. **Dark UI patterns**: Inputs are filled dark, borders are subtle, active states glow gently with warm accent.

## Glass & Surface Effects

- `bg-surface` base with a subtle warm border (`border-subtle`)
- Active/interactive elements get `bg-elevated` on hover
- Accent elements glow: `box-shadow: 0 0 20px rgba(196, 168, 138, 0.15)`
- No pure white anywhere — the lightest color is `#EDE4D8`

## Component Architecture

- **shadcn/ui** as the component foundation (Button, Card, Dialog, Badge, Input, Table)
- Custom wrappers where specific café theme is needed
- SVG images replaced with CSS gradient-based image components
- All new components use `"use client"` only when necessary

## Motion Guidelines

- **framer-motion**: Page entrance, card stagger, dialog overlay, cart badge bounce
- **GSAP (useGSAP)**: Scroll-triggered reveals, parallax hero texture, number counters
- **Duration**: Entrances 0.4s, micro-interactions 0.2s, GSAP scroll 0.6s
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` — custom ease-out-expo style
- **Reduced motion**: Always respect `prefers-reduced-motion`

## Image Strategy

No external images. Every visual is created with CSS gradients and geometric shapes:
- Menu item "images" → gradient rectangles with overlaid pattern/texture
- Hero → dark ambient gradient with floating geometric accents
- Category dividers → blurred gradient strips
- Decorative elements → CSS pseudo-elements, conic gradients, radial blooms
