<div align="center">
  <br />
  <h1>☕ کافه دیجیتال</h1>
  <p><strong>Digital Café</strong></p>
  <p><em>Persian-first online menu &amp; smart ordering system</em></p>

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
  </p>

  <br />
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%" align="right"><strong>📱 Online Menu</strong></td>
    <td width="50%">Responsive menu grid with CSS gradient visuals — no external images needed</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🤖 AI Assistant</strong></td>
    <td width="50%">Smart chat bot answers questions and processes orders</td>
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
    <td width="50%" align="right"><strong>🔧 Admin Panel</strong></td>
    <td width="50%">Dashboard to manage orders in real-time + full menu CRUD</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>📷 QR Code</strong></td>
    <td width="50%">Auto-generated QR code for quick menu access</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🎨 Dark Industrial Theme</strong></td>
    <td width="50%">Berlin Kontor inspired — moody, warm, textured, premium</td>
  </tr>
  <tr>
    <td width="50%" align="right"><strong>🇮🇷 Persian First</strong></td>
    <td width="50%">Full RTL support with Persian fonts (Shabnam self-hosted)</td>
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

---

## 📂 Project Structure

```
app/
├── page.tsx                        # Customer menu (client component)
├── layout.tsx                      # RTL root, fonts, metadata
├── styles/globals.css              # Tailwind, design tokens, animations
├── lib/
│   ├── menu.ts                     # MenuItem type, static defaults, formatPrice
│   ├── db.ts                       # Order + menu CRUD (Supabase / in-memory)
│   └── utils.ts                    # cn() utility
├── actions/index.ts                # Server actions (admin auth)
├── components/
│   ├── MenuGrid.tsx                # Menu grid + cart state
│   ├── MenuItemImage.tsx           # CSS gradient item visuals
│   ├── CartSheet.tsx               # Cart drawer (responsive)
│   ├── ChatModal.tsx               # AI chat + ordering flow
│   ├── OrderSuccess.tsx            # Confetti overlay
│   ├── FloatingOrbs.tsx            # Animated background orbs
│   ├── QRCodeDisplay.tsx           # QR code generator
│   ├── AdminTable.tsx              # Orders table
│   ├── AdminMenuManager.tsx        # Menu CRUD form
│   └── ui/
│       ├── button.tsx              # Custom Button
│       └── badge.tsx               # Custom Badge
├── api/
│   ├── orders/route.ts             # GET list / POST create
│   ├── orders/[id]/route.ts        # PUT status / DELETE
│   ├── menu-items/route.ts         # GET list / POST save
│   ├── menu-items/[id]/route.ts    # PUT update / DELETE
│   └── ai/route.ts                 # AI chat proxy
└── admin/
    ├── page.tsx                    # Login form
    └── dashboard/
        ├── page.tsx                # Auth guard
        └── AdminDashboardClient.tsx # Tabbed dashboard
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
| **Fonts** | Inter, Vazirmatn, Space Grotesk (Google Fonts) + Shabnam (self-hosted) |
| **QR Code** | qrcode |

---

## 🔧 Admin Panel

Access the admin dashboard at `/admin`:

```
🔐 Login   → cookie-based auth (server action)
📋 Orders  → real-time table, status updates, delete
📝 Menu    → add / edit / delete menu items
   fields: nameFa, nameEn, price (toman), category
```

---

## 📡 API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/orders` | List all orders (newest first) |
| `POST` | `/api/orders` | Create an order |
| `PUT` | `/api/orders/[id]` | Update order status |
| `DELETE` | `/api/orders/[id]` | Delete an order |
| `GET` | `/api/menu-items` | List menu items |
| `POST` | `/api/menu-items` | Save full menu array |
| `PUT` | `/api/menu-items/[id]` | Update a menu item |
| `DELETE` | `/api/menu-items/[id]` | Delete a menu item |
| `POST` | `/api/ai` | Chat with AI assistant |

---

## 🌐 Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|---|
| `SUPABASE_URL` | No | — | Supabase project URL. Omit for in-memory mode |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key (server-side only) |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | Compatible provider |
| `AI_API_KEY` | No | — | Required for AI chat |
| `AI_MODEL` | No | `gpt-4o-mini` | Any OpenAI-compatible model |
| `ADMIN_PASSWORD` | **Yes** | `admin123` | Admin login password |
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

---

## 🎨 Customization

### Colors & Theme
Edit `tailwind.config.ts` and `app/styles/globals.css` to change the palette. The Berlin Kontor theme uses a warm dark industrial palette with cacao browns, leather, and beige accents.

### Fonts
All four fonts are declared in `app/layout.tsx`. Replace Google Font URLs or swap self-hosted woff2 files in `public/fonts/`.

### Menu Items
Add/edit items through the admin dashboard at `/admin/dashboard` → "مدیریت منو" tab. For custom CSS gradient backgrounds, add an entry in `app/components/MenuItemImage.tsx`.

---

## ⚠️ Notes

- Google Fonts (Inter, Vazirmatn, Space Grotesk) **will fail at build time** inside Iran. Shabnam is already self-hosted.
- Speech recognition has **limited mobile support**. The mic button is automatically disabled on unsupported browsers.
- No external image dependencies — all visuals are CSS gradients (Unsplash/Pexels are blocked in Iran).

---

<div align="center">
  <p>
    <small>
      Built with Next.js 14 · TypeScript · Tailwind CSS · framer-motion · GSAP · lucide-react
    </small>
  </p>
  <p>
    <small>
      <a href="https://github.com/anomalyco/opencode">Powered by OpenCode</a>
    </small>
  </p>
</div>
