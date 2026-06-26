# Digital Café (کافه دیجیتال) — Agent Guide

## Project Overview

Persian-first multi-tenant online menu and smart ordering platform for cafés and restaurants. Built with Next.js 14 App Router, Tailwind CSS v3, framer-motion, GSAP, and lucide-react. Data persists via Supabase (PostgreSQL) with an automatic in-memory fallback for local development. Supports multiple restaurants with per-restaurant theming, menus, and orders.

**Brand:** Berlin Kontor — Dark Industrial European Coffee Bar (default)
**Vibe:** Moody, warm, intimate, textured, premium (per-restaurant theming via CSS variables)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Routing, SSR, server actions |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS v3 | Utility-first CSS with custom config + CSS variables for theming |
| Animation | framer-motion + GSAP | Page/component transitions (FM), scroll-driven micro-animations (GSAP) |
| Icons | lucide-react | Consistent vector icon system (zero emoji) |
| Storage | @supabase/supabase-js + in-memory Map fallback | Multi-tenant: restaurants, orders, menu items, categories |
| AI | OpenAI-compatible API + agent kit | Smart ordering assistant per restaurant |
| Auth | bcryptjs + httpOnly cookies | Cafe owner password hashing and verification |
| Fonts | Inter, Vazirmatn, Space Grotesk (Google Fonts) + Shabnam (self-hosted) | English headings/body, Persian headings/body |

---

## Multi-Tenant Architecture

### Data Model
- **Restaurants** — Each restaurant has its own slug, name (fa/en), theme config, business hours
- **Menu Items** — Scoped to restaurant_id; fallback to static defaults per slug
- **Orders** — Scoped to restaurant_id; include table, phone, customer name, order type
- **Menu Categories** — Scoped to restaurant_id with sort ordering

### API Scoping
All endpoints accept `restaurant_id` query param or body field:
- `GET /api/menu-items?restaurant_id=xxx` — menu for a specific restaurant
- `GET /api/orders?restaurant_id=xxx` — orders for a specific restaurant
- `POST /api/orders` with `restaurant_id` — create order for a restaurant
- `POST /api/ai` with `restaurant_slug` — context-aware AI chat per restaurant

### Frontend Restaurant Context
`RestaurantProvider` (in `lib/restaurant-context.tsx`) wraps the customer page. It:
- Reads restaurant slug from URL path
- Fetches restaurant info from `/api/restaurants/[slug]`
- Applies per-restaurant theme CSS variables to `<html>`
- Passes restaurant context to MenuGrid, ChatModal, etc.

### Admin Dashboard
Dashboard shows a restaurant switcher when multiple restaurants exist. Orders, menu, and restaurant management tabs are all scoped to the selected restaurant.

---

## Component Tree

```
middleware.ts (subdomain → /restaurant/{slug} rewrite)

layout.tsx (RTL html, fonts, globals.css with CSS variable theming)
│
├── restaurant/[slug]/page.tsx → CustomerMenuPage (per-cafe menu)
│   ├── FloatingOrbs (background decoration)
│   ├── MenuGrid (menu items + cart state, scoped to restaurant)
│   │   ├── MenuItemImage (CSS gradient per item)
│   │   └── CartSheet (mobile slide-up / desktop drawer)
│   ├── ChatModal (AI assistant with ordering flow, scoped to restaurant)
│   └── OrderSuccess (confetti animation)
│
├── page.tsx (default customer menu — wrapped in RestaurantProvider)
│
├── admin/page.tsx (login form)
│
├── admin/dashboard/page.tsx → AdminDashboardClient
│   ├── AdminTable (order management, scoped to restaurant)
│   ├── AdminMenuManager (menu item CRUD, scoped to restaurant)
│   ├── RestaurantManager (multi-restaurant CRUD with ThemeCustomizer + BusinessHoursEditor)
│   └── QRCodeDisplay
│
├── cafe/login/page.tsx (per-cafe login form)
│
└── cafe/dashboard/page.tsx (per-cafe orders, menu, theme management)
```

---

## Data Flow

### Restaurants
```
Static default (lib/db.ts ensureDefaultRestaurant) → API GET /api/restaurants
Admin creates → POST /api/restaurants → saved to DB or in-memory
Customer accesses → URL slug → GET /api/restaurants/[slug] → applies theme
```

### Menu Items
```
Static defaults (lib/menu.ts, per-slug) → API GET /api/menu-items returns DB items or fallback
Admin creates/edits → POST/PUT /api/menu-items with restaurant_id → scoped save
MenuGrid fetches with restaurant_id param → falls back to slug-based defaults
```

### Orders
```
Customer adds items → cart in MenuGrid local state
Customer chats → ChatModal reads cart prop, sends restaurant_slug to AI
Order confirmed → POST /api/orders with restaurant_id → saved scoped to restaurant
Admin polls GET /api/orders with restaurant_id every 5s → updates AdminTable
```

### Authentication
```
Admin form → server action adminLogin() → validates password from env
→ sets httpOnly cookie (4hr expiry) → redirects to /admin/dashboard
checkAdminAuth() reads cookie → protects dashboard
adminLogout() deletes cookie → redirects to /admin
```

```
Cafe login form → server action cafeLogin() → fetches restaurant by slug
→ bcrypt.compare(password, restaurant.cafePassword) → sets httpOnly cookie
→ redirects to /cafe/dashboard
getCafeSession() reads cookie → returns slug for session verification
cafeLogout() deletes cookie → redirects to /cafe/login
```

---

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/restaurants` | List all restaurants |
| POST | `/api/restaurants` | Create a restaurant |
| GET | `/api/restaurants/[slug]` | Get restaurant + menu items + orders |
| PUT | `/api/restaurants/[slug]` | Update restaurant info/theme |
| GET | `/api/orders?restaurant_id=` | List orders (scoped) |
| POST | `/api/orders` | Create order (with restaurant_id) |
| PUT | `/api/orders/[id]` | Update order status (with restaurant_id) |
| DELETE | `/api/orders/[id]` | Delete order (with restaurant_id) |
| GET | `/api/menu-items?restaurant_id=&slug=` | List menu items (DB → static fallback) |
| POST | `/api/menu-items` | Save menu items (with restaurant_id) |
| PUT | `/api/menu-items/[id]` | Update single menu item |
| DELETE | `/api/menu-items/[id]` | Delete menu item |
| POST | `/api/ai` | Chat with AI assistant (with restaurant_slug) |

---

## AI Agent System

### Agent Kit (`lib/agent/`)
- **kit.ts** — `buildAgentKit(restaurant, menuItems)` builds context (name, hours, menu). `buildSystemPrompt(kit)` generates a Persian system prompt with restaurant personality.
- **sanitize.ts** — Input sanitization: `sanitizeMessage`, `sanitizePhone`, `sanitizeTableNumber`, `sanitizeOrderNotes` prevent XSS and injection.
- **index.ts** — Re-exports everything.

### AI Chat Flow
1. `POST /api/ai` receives `{ messages, restaurant_slug }`
2. Server fetches restaurant + menu items for context
3. `buildAgentKit()` creates full context (menu, hours, name)
4. `buildSystemPrompt()` generates Persian system prompt with restaurant personality
5. Without API key: returns a helpful self-service message with menu info
6. With API key: sends to OpenAI-compatible API with sanitized messages

---

## Design Tokens (Default Theme — Berlin Kontor)

### Colors (CSS Variables, overridable per restaurant)
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

### Per-Restaurant Theming
Each restaurant has a `themeConfig` JSONB field in the database. When loaded, its values override the CSS variables on `<html>`. Default values are used if a variable is not specified.

### Typography
| Role | English Font | Persian Font |
|---|---|---|
| Headings | Space Grotesk (google) | Shabnam (self-hosted) |
| Body | Inter (google) | Vazirmatn (google) |
| Numbers | Inter | Inter |

---

## Key Patterns

### Adding a New Component
1. Create in `app/components/` with `"use client"` only if needed
2. Use CSS variable colors: `style={{ backgroundColor: "var(--bg-surface)" }}`
3. Import lucide-react for icons; never use emoji
4. Use framer-motion for entrance/exit animations

### Adding a New Menu Item
1. In admin dashboard → "مدیریت منو" tab → "افزودن آیتم"
2. Provide slug (unique id), Persian name, English name, price, category
3. Items are saved scoped to the selected restaurant

### Adding a New Restaurant
1. In admin dashboard → "رستوران‌ها" tab → "افزودن رستوران"
2. Provide slug, Persian name, English name, description, phone
3. Restaurant appears in the rest of the UI immediately

### Extending the Agent
1. Update `lib/agent/kit.ts` to add more context to the system prompt
2. Update `sanitize.ts` if new input types need sanitization
3. The AI route auto-loads restaurant context

### Error Handling
- API routes return `{ error: "message" }` with appropriate status codes
- Client components show Persian error messages via state
- Server actions return error objects (form state pattern)

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
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
├── middleware.ts                   # Subdomain → /restaurant/{slug} rewrite
├── app/
│   ├── page.tsx                    # Customer menu page (wrapped in RestaurantProvider)
│   ├── layout.tsx                  # RTL root layout + fonts
│   ├── styles/globals.css          # Tailwind + CSS variable theming + animations
│   ├── lib/
│   │   ├── auth.ts                 # hashPassword, verifyPassword, stripSensitive (bcrypt)
│   │   ├── db.ts                   # Multi-tenant CRUD (restaurants, orders, menu items)
│   │   ├── menu.ts                 # MenuItem type + per-slug static defaults + formatPrice
│   │   ├── restaurant-context.tsx  # RestaurantProvider + useRestaurant hook
│   │   ├── supabase.ts             # Supabase client factory
│   │   ├── utils.ts                # cn() utility
│   │   └── agent/
│   │       ├── index.ts            # Agent re-exports
│   │       ├── kit.ts              # buildAgentKit, buildSystemPrompt
│   │       └── sanitize.ts         # Input sanitization utilities
│   ├── actions/
│   │   ├── index.ts                # Server actions (adminLogin, adminLogout, checkAdminAuth)
│   │   └── cafe-auth.ts            # Cafe login/logout/session (bcrypt-verified)
│   ├── components/
│   │   ├── MenuGrid.tsx            # Item grid + cart (restaurant-scoped)
│   │   ├── MenuItemImage.tsx       # CSS gradient image per item
│   │   ├── CartSheet.tsx           # Cart drawer (mobile/desktop responsive)
│   │   ├── ChatModal.tsx           # AI chat + ordering flow + voice input (restaurant-aware)
│   │   ├── OrderSuccess.tsx        # Confetti success overlay
│   │   ├── FloatingOrbs.tsx        # Background animated orbs
│   │   ├── QRCodeDisplay.tsx       # QR code component
│   │   ├── AdminTable.tsx          # Orders table (restaurant-scoped)
│   │   ├── AdminMenuManager.tsx    # Menu CRUD (restaurant-scoped)
│   │   ├── RestaurantManager.tsx   # Multi-restaurant CRUD
│   │   ├── ThemeCustomizer.tsx     # 5 presets + custom CSS color pickers
│   │   ├── BusinessHoursEditor.tsx # Per-day time editor
│   │   └── ui/
│   │       ├── button.tsx          # Custom Button primitive
│   │       └── badge.tsx           # Custom Badge primitive
│   ├── restaurant/
│   │   └── [slug]/
│   │       ├── page.tsx            # Server component for customer menu
│   │       └── CustomerMenuPage.tsx # Client component with per-cafe theme
│   ├── api/
│   │   ├── restaurants/route.ts    # GET list / POST create
│   │   ├── restaurants/[slug]/route.ts  # GET / PUT restaurant
│   │   ├── orders/route.ts         # GET list / POST create (scoped)
│   │   ├── orders/[id]/route.ts    # PUT status / DELETE (scoped)
│   │   ├── menu-items/route.ts     # GET list / POST save (scoped)
│   │   ├── menu-items/[id]/route.ts # PUT update / DELETE (scoped)
│   │   ├── ai/route.ts             # AI chat proxy (restaurant-aware)
│   │   └── cafe/session/route.ts   # Cafe session verification
│   ├── admin/
│   │   ├── page.tsx                # Login page
│   │   └── dashboard/
│   │       ├── page.tsx            # Server wrapper (auth check)
│   │       └── AdminDashboardClient.tsx  # Tabbed dashboard with restaurant mgmt
│   └── cafe/
│       ├── login/page.tsx          # Cafe owner login form
│       └── dashboard/page.tsx      # Cafe owner management dashboard
├── public/fonts/shabnam/           # Self-hosted Shabnam (woff2)
├── sql/schema.sql                  # Full multi-tenant schema
├── AGENTS.md
├── ARCHITECTURE.md
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
- **In-memory store is volatile:** Without Supabase, restaurants, orders, and menu changes are lost on server restart.
- **CSS variable theming:** Each restaurant's `themeConfig` overrides CSS variables on the `<html>` element via `applyTheme()`. This means components use `var(--bg-surface)` etc. instead of hardcoded Tailwind classes like `bg-[#1C1917]`. For colors outside the standard palette, use Tailwind classes directly.
- **Multi-tenant scoping:** All database operations require `restaurant_id` to scope data correctly. The admin dashboard picks the restaurant context.
- **bcrypt hashing:** Cafe passwords are automatically hashed with bcrypt (10 rounds) in `createRestaurant()` and `updateRestaurant()`. The `cafeLogin` action uses `verifyPassword()` to compare. Plaintext comparison is never used.
- **cafe_password stripped from API:** All GET/POST/PUT responses from `/api/restaurants` strip the `cafePassword` field via `stripSensitive()`. The edit form in RestaurantManager shows an empty password field — leaving it empty preserves the existing hash.
- **Subdomain routing:** `middleware.ts` rewrites `*.menuchat.vercel.app` subdomains to `/restaurant/{slug}`. For local testing without DNS, use path-based access: `localhost:3000/restaurant/{slug}`.
