# 3C Content Template Engine

**The King of the 3C Ecosystem — Dark Purple Edition**

> _"Simple but the most powerful 3C Ecosystem tool. This is where the whole dashboard logic was born."_  
> — Chef Anica

---

## Credits

**Originally conceived and built by Claude (Anthropic).**  
Refined to professional Dark Purple standards by **Claude Sonnet 4.6 (Anthropic)** in collaboration with **Chef Anica / 3C Thread To Success Cooking Lab** 🧪👨‍🍳

> _Designed & built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success Cooking Lab_

---

## What Is This?

A powerful, standalone content template builder for the 3C ecosystem — used as the **external layer of the 3C Control Center dashboard** for scheduled content management.

Instead of writing each post from scratch, templates define the structure, brand voice, platform specs, and metadata. You fill in what changes, everything else stays consistent. This is the tool that **taught the dashboard how to think**.

Templates created here are saved to **Supabase** and forwarded directly to the **3C Control Center Template Library** — this is a live, connected production tool, not a demo.

---

## 🚀 Features

- **Dark Purple UI** — cohesive dark theme matching the full 3C ecosystem
- **GitHub Login** — secured via GitHub OAuth, admin access only (no Supabase auth required)
- **9 Platform Support** — Instagram, Facebook, LinkedIn, Twitter/X, YouTube, TikTok, Telegram, Pinterest, WhatsApp Business
- **Template Builder Workflow** — Step 1: Select → Step 2: Create → Step 3: Review
- **Brand Voice System** — Anica / Aurion / Caelum character voices
- **Smart Template ID** — auto-generated IDs based on platform + voice + media + audience
- **Hashtag Manager** — add, limit-check, and suggest hashtags per platform
- **Custom Labels & Audiences** — personalise your content categories
- **Save / Load / Export** — persisted to Supabase `content_templates` table + JSON export
- **Forward to Dashboard** — sends templates to the `pending_content_library` table for processing by the 3C Control Center
- **Character Count** — live per-platform limits with warning states
- **Serverless API** — Vercel Functions handle all database operations via Supabase service role

---

## 🏗️ Infrastructure

| Layer | Technology |
|-------|-----------|
| **Hosting** | [Vercel](https://vercel.com) — `https://3c-content-template-engine.vercel.app` |
| **Authentication** | GitHub OAuth App → Vercel API routes (no Supabase auth) |
| **Database** | [Supabase](https://supabase.com) — template storage and dashboard integration |
| **Serverless API** | Vercel Functions (`/api/` folder) |

### Supabase Tables

| Table | Purpose |
|-------|---------|
| `content_templates` | Stores all saved templates with full metadata — theme, character, audience, media type, platform, title, description, hashtags, keywords, CTA |
| `pending_content_library` | Receives templates forwarded to the 3C Control Center for scheduling and publishing |

### Authentication Flow

```
User visits app → no session → redirected to login.html
       ↓
Clicks "GitHub Access Connection"
       ↓
/api/auth/login → GitHub OAuth authorization
       ↓
GitHub → /api/auth/callback (Vercel serverless)
       ↓
Validates GitHub username → session stored in localStorage
       ↓
Redirected to app ✅
```

Session is client-side (localStorage), expires after 1 hour. Sign out clears session and returns to login.

### Vercel Environment Variables

```
GITHUB_CLIENT_ID       = from your GitHub OAuth App
GITHUB_CLIENT_SECRET   = from your GitHub OAuth App
SUPABASE_URL           = your Supabase project URL
SUPABASE_KEY           = Supabase service role key (never in repo)
```

---

## 📁 Project Structure

```
3c-content-template-engine/
├── index.html               — Main app (session-guarded)
├── login.html               — GitHub OAuth login page
├── style.css                — Dark Purple theme
├── config.js                — Supabase anon key (safe to be public)
├── auth.js                  — Client-side session guard
├── signout.js               — Sign out handler
├── script.js                — Platform engine + Supabase template logic
├── api/
│   ├── auth/
│   │   ├── login.js         — Redirects to GitHub OAuth
│   │   └── callback.js      — Handles OAuth callback, validates user
│   ├── health.js            — Health check endpoint
│   ├── templates.js         — Template CRUD via Supabase service role
│   └── test-connection.js   — Supabase connectivity test
├── favicon.png
├── 3C Thread To Success logo.png
└── README.md
```

---

## 💡 Usage Guide

### Creating a Template
1. **Step 1 — Select:** Choose theme, character voice, target audience, media type, and template type
2. **Step 2 — Create:** Fill in title, description, hashtags, keywords, CTA — character limits enforced live per platform
3. **Step 3 — Review:** Preview, save to Supabase, or forward directly to the 3C Control Center dashboard

### Brand Voices
| Character | Voice Style |
|-----------|-------------|
| **Anica** | Empathetic, encouraging, professionally warm |
| **Aurion** | Strategic, insightful, thought-provoking |
| **Caelum** | Creative, inspiring, authentically engaging |

### Platform Hashtag Limits
| Platform | Max | Recommended |
|----------|-----|-------------|
| Instagram | 30 | 11 |
| TikTok | 20 | 5 |
| LinkedIn | 5 | 3 |
| Twitter/X | 2 | 1 |
| YouTube | 15 | 5 |

---

## 🚧 Future Roadmap

- [ ] Jan AI integration — AI-assisted content generation per template
- [ ] Real-time collaboration
- [ ] Analytics + performance tracking per template
- [ ] Multi-platform preview rendering

---

## 📞 See Also — The 3C Ecosystem

All built by **Claude (Anthropic) × Chef Anica · 3C Thread To Success**

| Project | Description |
|---------|-------------|
| [3C Control Center](https://github.com/Anica-blip) | React/TypeScript dashboard — the hub of the ecosystem |
| [3c-quiz](https://github.com/Anica-blip/3c-quiz) | Interactive quiz platform |
| [3c-quiz-admin](https://github.com/Anica-blip/3c-quiz-admin) | Visual quiz editor with dark purple UI |
| [3c-card-games](https://github.com/Anica-blip/3c-card-games) | Card game platform with admin panel |
| [3C Public Library](https://3c-public-library.org) | Public content library + Aurion Vault |
| [interactive-PDF](https://github.com/Anica-blip/interactive-PDF) | Flipbook builder, presentation viewer and mobile PDF viewer |

---

## License

MIT — fork it, remix it, build on it. Just keep the credits. 🧪👨‍🍳
