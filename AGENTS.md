# Digital Café (کافه دیجیتال) — Agent Guide

## Project Overview

Persian-first online menu and smart ordering system for cafés. Built with Next.js 14 App Router, Tailwind CSS v3, framer-motion, GSAP, and lucide-react. Data persists via Supabase (PostgreSQL) with an automatic in-memory fallback for local development.

**Brand:** Berlin Kontor — Dark Industrial European Coffee Bar
**Vibe:** Moody, warm, intimate, textured, premium

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Routing, SSR, server actions |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS v3 | Utility-first CSS with custom config |
| Animation | framer-motion + GSAP | Page/component transitions (FM), scroll-driven micro-animations (GSAP) |
| Icons | lucide-react | Consistent vector icon system (zero emoji) |
| Storage | @supabase/supabase-js + in-memory Map fallback | Orders + menu items |
| AI | OpenAI-compatible API | Smart ordering assistant |
| Fonts | Inter, Vazirmatn, Space Grotesk (Google Fonts) + Shabnam (self-hosted) | English headings/body, Persian headings/body |

---

## Architecture Decisions

### Custom UI Primitives Over shadcn/ui
shadcn/ui v4 depends on `@base-ui/react` and Tailwind v4 syntax, which are incompatible with our Tailwind v3 setup. Custom `Button` and `Badge` primitives live in `app/components/ui/` — they're cleaner, lighter, and exactly match the Berlin Kontor palette.

### CSS Gradients as Images
Google Fonts, Unsplash, and Pixabay are blocked in Iran. All menu item "images" are CSS gradients (conic, radial, linear) with geometric overlay patterns — no external image dependencies. `MenuItemImage` handles this per-item.

### Self-Hosted Shabnam Font
Google Fonts blocked in Iran. Shabnam (Persian heading font) is downloaded from jsDelivr CDN and self-hosted in `public/fonts/shabnam/` as woff2.

### Cart State Flow
Cart `useState` lives inside `MenuGrid` component. Changes are lifted to `page.tsx` via `onCartChange` callback so `ChatModal` can access cart data for order submission.

### RTL First
All layouts designed for right-to-left (Persian) reading. LTR only for English names and price formatting.

---

## Component Tree

```
layout.tsx (RTL html, fonts, globals.css)
├── page.tsx (customer menu)
│   ├── FloatingOrbs (background decoration)
│   ├── MenuGrid (menu items + cart state)
│   │   ├── MenuItemImage (CSS gradient per item)
│   │   └── CartSheet (mobile slide-up / desktop drawer)
│   ├── ChatModal (AI assistant with ordering flow)
│   └── OrderSuccess (confetti animation)
│
├── admin/page.tsx (login form)
│
├── admin/dashboard/page.tsx → AdminDashboardClient
│   ├── AdminTable (order management)
│   ├── AdminMenuManager (menu item CRUD)
│   └── QRCodeDisplay
```

---

## Data Flow

### Menu Items
```
Static defaults (lib/menu.ts) → API GET /api/menu-items returns DB items or static fallback
Admin creates/edits → POST/PUT /api/menu-items → saved to Supabase (PostgreSQL) or in-memory
MenuGrid fetches from GET /api/menu-items on mount → falls back to defaults
```

### Orders
```
Customer adds items → cart in MenuGrid local state
Customer chats → ChatModal reads cart prop
Order confirmed → POST /api/orders → saved to Supabase (PostgreSQL) or in-memory
Admin polls GET /api/orders every 5s → updates AdminTable
Admin updates status → PUT /api/orders/[id]
Admin deletes → DELETE /api/orders/[id]
```

### Authentication
```
Admin form → server action adminLogin() → validates password from env
→ sets httpOnly cookie (4hr expiry) → redirects to /admin/dashboard
checkAdminAuth() reads cookie → protects dashboard
adminLogout() deletes cookie → redirects to /admin
```

---

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/orders` | List all orders (newest first) |
| POST | `/api/orders` | Create order (items, table, phone) |
| PUT | `/api/orders/[id]` | Update order status |
| DELETE | `/api/orders/[id]` | Delete order |
| GET | `/api/menu-items` | List menu items (DB → static fallback) |
| POST | `/api/menu-items` | Save full menu items array |
| PUT | `/api/menu-items/[id]` | Update single menu item |
| DELETE | `/api/menu-items/[id]` | Delete menu item |
| POST | `/api/ai` | Chat with AI assistant |

---

## Design Tokens

### Colors
```css
--bg-base:        #0C0A09   (page background)
--bg-surface:     #1C1917   (cards, panels)
--bg-elevated:    #292524   (hover, active)
--border-subtle:  #3D352D   (borders)
--text-primary:   #EDE4D8   (body text)
--text-secondary: #C4A88A   (accents)
--text-muted:     #8B7355   (secondary text)
--danger:         #9F391B
--success:        #5A7A5A
```

### Typography
| Role | English Font | Persian Font |
|---|---|---|
| Headings | Space Grotesk (google) | Shabnam (self-hosted) |
| Body | Inter (google) | Vazirmatn (google) |
| Numbers | Inter | Inter |

### Motion
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — custom ease-out-expo
- **Entrances:** 0.4s via framer-motion
- **Micro-interactions:** 0.2s
- **GSAP scroll:** ScrollTrigger with scrub
- **Reduced motion:** `prefers-reduced-motion` respected globally

---

## Key Patterns

### Adding a New Component
1. Create in `app/components/` with `"use client"` only if needed
2. Use Tailwind utility classes with Berlin Kontor palette tokens (`bg-[#1C1917]`, `text-[#C4A88A]`, etc.)
3. Import lucide-react for icons; never use emoji
4. Use framer-motion for entrance/exit animations
5. Use useGSAP hook for scroll-driven animations (import from `@gsap/react`)

### Adding a New Menu Item
1. In admin dashboard → "مدیریت منو" tab → "افزودن آیتم"
2. Provide slug (unique id), Persian name, English name, price, category
3. For a custom gradient background, add an entry in `MenuItemImage.tsx` `GRADIENTS` record

### Error Handling
- API routes return `{ error: "message" }` with appropriate status codes
- Client components show Persian error messages via state
- Server actions return error objects (form state pattern)

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|---|
| `SUPABASE_URL` | No | — | Supabase project URL. Omit for in-memory mode |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key (server-side only) |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | OpenAI or compatible |
| `AI_API_KEY` | No | — | Required for AI chat to work |
| `AI_MODEL` | No | `gpt-4o-mini` | Any OpenAI-compatible model |
| `ADMIN_PASSWORD` | Yes | `admin123` | Admin panel password |
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | Used for QR code generation |

---

## Development Commands

```bash
npm run dev           # Development server (localhost:3000)
npm run dev:network   # Accessible on LAN (0.0.0.0)
npm run build         # Production build
npm run start         # Production server
```

---

## File Structure

```
├── app/
│   ├── page.tsx                    # Customer menu page (client)
│   ├── layout.tsx                  # RTL root layout + fonts
│   ├── styles/globals.css          # Tailwind + design tokens + animations
│   ├── lib/
│   │   ├── menu.ts                 # MenuItem type + static defaults + formatPrice
│   │   ├── db.ts                   # Order + menu CRUD (KV → in-memory)
│   │   └── utils.ts                # cn() utility
│   ├── actions/index.ts            # Server actions (adminLogin, adminLogout, checkAdminAuth)
│   ├── components/
│   │   ├── MenuGrid.tsx            # Item grid + cart local state + cart bar
│   │   ├── MenuItemImage.tsx       # CSS gradient image per item
│   │   ├── CartSheet.tsx           # Cart drawer (mobile/desktop responsive)
│   │   ├── ChatModal.tsx           # AI chat + ordering flow + voice input
│   │   ├── OrderSuccess.tsx        # Confetti success overlay
│   │   ├── FloatingOrbs.tsx        # Background animated orbs
│   │   ├── QRCodeDisplay.tsx       # QR code component
│   │   ├── AdminTable.tsx          # Orders table (dashboard)
│   │   ├── AdminMenuManager.tsx    # Menu CRUD (dashboard)
│   │   └── ui/
│   │       ├── button.tsx          # Custom Button primitive
│   │       └── badge.tsx           # Custom Badge primitive
│   ├── api/
│   │   ├── orders/route.ts         # GET list / POST create
│   │   ├── orders/[id]/route.ts    # PUT status / DELETE
│   │   ├── menu-items/route.ts     # GET list / POST save
│   │   ├── menu-items/[id]/route.ts # PUT update / DELETE
│   │   └── ai/route.ts             # AI chat proxy
│   └── admin/
│       ├── page.tsx                # Login page
│       └── dashboard/
│           ├── page.tsx            # Server wrapper (auth check)
│           └── AdminDashboardClient.tsx  # Tabbed dashboard client
├── public/fonts/shabnam/           # Self-hosted Shabnam (woff2)
├── AGENTS.md
├── DESIGN.md
├── README.md
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── postcss.config.js
├── package.json
└── .env.local.example
```

---

## Gotchas

- **Google Fonts blocked in Iran:** Inter, Vazirmatn, Space Grotesk load from Google Fonts CDN and will **fail at build time** inside Iran. For full offline use, self-host all fonts. Shabnam is already self-hosted.
- **SpeechRecognition limited on mobile:** `webkitSpeechRecognition` has inconsistent support on iOS Safari and Android Chrome. The mic button is disabled on unsupported browsers. `getUserMedia` is called before recognition to surface permission prompts.
- **No external images:** Unsplash/Pexels blocked in Iran. All visuals use CSS gradients.
- **shadcn v4 incompatible:** Tailwind v3 + shadcn v4 don't work together. Custom primitives in `components/ui/` replace shadcn.
- **Cart state is local:** Cart lives in `MenuGrid` and is lifted to `page.tsx`. It does not persist across page refreshes.
- **In-memory store is volatile:** Without Supabase, orders and menu changes are lost on server restart.
