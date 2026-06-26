<div align="center">
  <br />
  <h1>☕ کافه دیجیتال</h1>
  <p><strong>Digital Café — MenuChat</strong></p>
  <p><em>Persian-first multi-tenant online menu &amp; smart ordering platform for cafés and restaurants</em></p>

  <p>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js%2014-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 14" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://vercel.com/">
      <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
    </a>
    <a href="https://supabase.com/">
      <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    </a>
  </p>

  <br />
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%" align="right"><strong>🏢 Multi-Tenant</strong></td>
    <td width="50%">Each café/restaurant has its own menu, orders, theme, and staff login — fully isolated</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🌐 Subdomain Routing</strong></td>
    <td width="50%">Each cafe gets its own subdomain: <code>cafe-slug.menuchat.vercel.app</code></td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>📱 Online Menu</strong></td>
    <td width="50%">Responsive per-cafe menu grid with CSS gradient visuals — no external images needed</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🤖 AI Assistant</strong></td>
    <td width="50%">Restaurant-aware smart chat — answers questions and processes orders with per-cafe context</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🛒 Cart Drawer</strong></td>
    <td width="50%">Mobile slide-up &amp; desktop sidebar with quantity controls and clear all</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🎤 Voice Input</strong></td>
    <td width="50%">Web Speech API with permission handling and error feedback</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🔧 Super Admin Panel</strong></td>
    <td width="50%">Overview stats, real-time order management, menu CRUD, restaurant CRUD — across all cafes</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>👨‍🍳 Cafe Owner Dashboard</strong></td>
    <td width="50%">Per-cafe login (bcrypt-hashed), manage own orders, menu, and theme</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🎨 Per-Cafe Theming</strong></td>
    <td width="50%">5 presets (Berlin Kontor, Minimal White, Warm Cafe, Modern European, Green Nature) + custom CSS color pickers</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🕐 Business Hours</strong></td>
    <td width="50%">Per-day time editor for all 7 days (شنبه–جمعه)</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>📷 QR Code</strong></td>
    <td width="50%">Auto-generated QR code pointing to each cafe's subdomain</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🇮🇷 Persian First</strong></td>
    <td width="50%">Full RTL support with Persian fonts (Shabnam self-hosted, Vazirmatn)</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>💾 Dual Storage</strong></td>
    <td width="50%">Supabase PostgreSQL in production with automatic in-memory fallback for local dev</td>
  </tr>
</table>

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local — at minimum set ADMIN_PASSWORD

# 3. Start development server
npm run dev
# → http://localhost:3000
```

For mobile testing on your LAN:

```bash
npm run dev:network
# Then scan the QR code on the menu page from your phone
```

### Testing Per-Cafe Subdomains Locally

Add to your `/etc/hosts`:

```
127.0.0.1  cafe-a.localhost cafe-b.localhost
```

Then visit `http://cafe-a.localhost:3000` — the middleware rewrites to `/restaurant/cafe-a`.

Alternatively, use path-based access directly:

```
http://localhost:3000/restaurant/berlin-kontor
```

---

## 🏗️ Architecture

### Multi-Tenant Model

```
Restaurant (slug, nameFa/en, themeConfig, businessHours, cafePassword...)
├── Menu Items (scoped to restaurant_id)
├── Orders (scoped to restaurant_id)
└── Menu Categories (scoped to restaurant_id)
```

### Access Points

| URL | Who | What |
|---|---|---|
| `*.menuchat.vercel.app` | Customers | Menu, cart, AI chat, order |
| `/admin` | Super admin | Global dashboard, manage all cafes |
| `/cafe/login` → `/cafe/dashboard` | Cafe owners | Their own orders, menu, theme |

### Subdomain Flow

```
Browser → cafe-slug.menuchat.vercel.app
         → middleware.ts rewrites to /restaurant/{slug}
         → RestaurantProvider reads slug from hostname
         → Server renders scoped menu with cafe's theme
```

---

## 📂 Project Structure

```
app/
├── page.tsx                        # Customer menu entry
├── layout.tsx                      # RTL root, fonts, metadata
├── middleware.ts                   # Subdomain → /restaurant/{slug} rewrite
├── styles/globals.css              # Tailwind, design tokens, animations
├── lib/
│   ├── auth.ts                     # hashPassword, verifyPassword, stripSensitive
│   ├── menu.ts                     # MenuItem type, per-slug defaults, formatPrice
│   ├── db.ts                       # Multi-tenant CRUD (Supabase / in-memory)
│   ├── utils.ts                    # cn() utility
│   ├── restaurant-context.tsx      # RestaurantProvider + useRestaurant hook
│   ├── supabase.ts                 # Supabase client factory
│   └── agent/
│       ├── index.ts                # Re-exports
│       ├── kit.ts                  # buildAgentKit, buildSystemPrompt (per-cafe context)
│       └── sanitize.ts             # Input sanitization for AI
├── actions/
│   ├── index.ts                    # Server actions (admin auth)
│   └── cafe-auth.ts                # Cafe login/logout/session (bcrypt-verified)
├── components/
│   ├── MenuGrid.tsx                # Menu grid + cart (restaurant-scoped)
│   ├── MenuItemImage.tsx           # CSS gradient item visuals
│   ├── CartSheet.tsx               # Cart drawer (responsive)
│   ├── ChatModal.tsx               # Restaurant-aware AI chat + ordering
│   ├── OrderSuccess.tsx            # Confetti overlay
│   ├── FloatingOrbs.tsx            # Animated background orbs
│   ├── QRCodeDisplay.tsx           # QR code generator
│   ├── AdminTable.tsx              # Orders table (restaurant-scoped)
│   ├── AdminMenuManager.tsx        # Menu CRUD (restaurant-scoped)
│   ├── RestaurantManager.tsx       # Multi-restaurant CRUD
│   ├── ThemeCustomizer.tsx         # 5 presets + custom CSS color pickers
│   ├── BusinessHoursEditor.tsx     # Per-day time editor
│   └── ui/
│       ├── button.tsx              # Custom Button
│       └── badge.tsx               # Custom Badge
├── api/
│   ├── restaurants/route.ts        # GET list / POST create
│   ├── restaurants/[slug]/route.ts # GET / PUT restaurant (scoped)
│   ├── orders/route.ts             # GET list / POST create (scoped)
│   ├── orders/[id]/route.ts        # PUT status / DELETE (scoped)
│   ├── menu-items/route.ts         # GET list / POST save (scoped)
│   ├── menu-items/[id]/route.ts    # PUT update / DELETE (scoped)
│   ├── ai/route.ts                 # Restaurant-aware AI chat proxy
│   └── cafe/session/route.ts       # Cafe session verification
├── restaurant/
│   └── [slug]/
│       ├── page.tsx                # Server component
│       └── CustomerMenuPage.tsx    # Client component with theme
├── admin/
│   ├── page.tsx                    # Login form
│   └── dashboard/
│       ├── page.tsx                # Auth guard
│       └── AdminDashboardClient.tsx # Tabbed dashboard with overview
└── cafe/
    ├── login/page.tsx              # Cafe owner login form
    └── dashboard/page.tsx          # Cafe owner dashboard
```

---

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v3 |
| **Animation** | framer-motion + GSAP with ScrollTrigger |
| **Icons** | lucide-react |
| **Storage** | @supabase/supabase-js (PostgreSQL) — auto fallback to in-memory |
| **AI** | OpenAI-compatible API |
| **Auth** | bcryptjs (cafe passwords) + httpOnly cookies |
| **Fonts** | Inter, Vazirmatn, Space Grotesk (Google Fonts) + Shabnam (self-hosted) |
| **QR Code** | qrcode |

---

## 🔧 Admin Panel

Access the super admin dashboard at `/admin`:

```
🔐 Login       → cookie-based auth (server action, env password)
📊 Overview    → stats (total restaurants, today's orders, revenue), cafe list with links
📋 Orders      → real-time table, status updates, delete (per-cafe)
📝 Menu        → add / edit / delete menu items (per-cafe)
🏪 Restaurants → create / edit cafes (slug, names, desc, phone, address, password, hours, theme, active)
```

## 👨‍🍳 Cafe Owner Dashboard

Access at `/cafe/login` — each cafe has its own password (set by super admin, bcrypt-hashed):

```
🔐 Login       → form with slug + password
📋 Orders      → their cafe's orders in real-time
📝 Menu        → their cafe's menu items
🎨 Theme       → customize their cafe's colors (5 presets + custom)
```

---

## 📡 API Reference

All endpoints accept `restaurant_id` for scoping:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/restaurants` | List all restaurants (without passwords) |
| `POST` | `/api/restaurants` | Create a restaurant (password auto-hashed) |
| `GET` | `/api/restaurants/[slug]` | Get restaurant + menu + orders (password stripped) |
| `PUT` | `/api/restaurants/[slug]` | Update restaurant (password re-hashed if changed) |
| `GET` | `/api/orders?restaurant_id=` | List orders (scoped, newest first) |
| `POST` | `/api/orders` | Create order (with `restaurant_id`) |
| `PUT` | `/api/orders/[id]` | Update order status (scoped) |
| `DELETE` | `/api/orders/[id]` | Delete order (scoped) |
| `GET` | `/api/menu-items?restaurant_id=&slug=` | List menu items (DB → static fallback) |
| `POST` | `/api/menu-items` | Save menu items (scoped) |
| `PUT` | `/api/menu-items/[id]` | Update a menu item |
| `DELETE` | `/api/menu-items/[id]` | Delete a menu item |
| `POST` | `/api/ai` | Chat with restaurant-aware AI assistant |
| `GET` | `/api/cafe/session` | Verify cafe session cookie |

---

## 🌐 Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SUPABASE_URL` | No | — | Supabase project URL. Omit for in-memory mode |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key (server-side only) |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | Compatible provider |
| `AI_API_KEY` | No | — | Required for AI chat |
| `AI_MODEL` | No | `gpt-4o-mini` | Any OpenAI-compatible model |
| `ADMIN_PASSWORD` | **Yes** | `admin123` | Super admin login password |
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | QR code base URL |

---

## 🚢 Deploy to Vercel

```bash
# 1. Push your repo to GitHub
# 2. Import to Vercel → https://vercel.com/new
# 3. Connect your Supabase project (or skip for in-memory mode)
# 4. Set environment variables in Vercel dashboard
# 5. Deploy!
```

Required environment variables for production:

```
SUPABASE_URL=         ← from Supabase project settings
SUPABASE_SERVICE_ROLE_KEY= ← from Supabase project settings
ADMIN_PASSWORD=       ← your chosen password
AI_API_KEY=           ← optional, for AI chat
NEXT_PUBLIC_BASE_URL= ← https://your-app.vercel.app
```

Before deploying, create the database tables by running `sql/schema.sql` in the Supabase SQL Editor.

Subdomains `*.menuchat.vercel.app` automatically resolve to your Vercel deployment — no additional DNS config needed.

---

## 🎨 Customization

### Per-Cafe Theming
Each cafe has a `themeConfig` with CSS variables. 5 built-in presets or full custom via color pickers in the cafe/owner dashboards. The theme is applied to `<html>` via `applyTheme()`.

### Adding a New Cafe
1. Super admin → "رستوران‌ها" tab → "افزودن رستوران"
2. Set slug, names, description, phone, address, password, hours, theme
3. Cafe appears at `{slug}.menuchat.vercel.app` immediately

### Cafe Owner Access
1. Visit `/cafe/login`
2. Enter the cafe slug and the password set by super admin
3. Manage orders, menu, and theme for that cafe only

### Fonts
All fonts are declared in `app/layout.tsx`. Replace Google Font URLs or swap self-hosted woff2 files in `public/fonts/`.

---

## ⚠️ Notes

- Google Fonts (Inter, Vazirmatn, Space Grotesk) **will fail at build time** inside Iran. Shabnam is already self-hosted.
- Speech recognition has **limited mobile support**. The mic button is automatically disabled on unsupported browsers.
- No external image dependencies — all visuals are CSS gradients (Unsplash/Pexels are blocked in Iran).
- In-memory store is **volatile** — without Supabase, all data resets on server restart.
- Cafe passwords are hashed with **bcrypt** (10 salt rounds). The default password for new cafes with no password set is `cafe123`.

---

<div align="center">
  <p>
    <small>
      Built with Next.js 14 · TypeScript · Tailwind CSS · framer-motion · GSAP · lucide-react · Supabase · bcryptjs
    </small>
  </p>
  <p>
    <small>
      <a href="https://github.com/anomalyco/opencode">Powered by OpenCode</a>
    </small>
  </p>
</div>
