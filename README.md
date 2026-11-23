# 🧩 3C Content Template Engine

> ⚖️ This repository is protected under a binding [Legal Disclaimer](./LEGAL_DISCLAIMER.md) that governs all use, cloning, and forking from the date of inception. Please read before use.

> A private template builder for the 3C Control Center. Live at https://3c-content-template-engine.vercel.app (owner sign-in only).

---

**⚠️ Intellectual Property Notice**
This repository is open source under the MIT License — the code skeleton is free to clone and adapt.
The 3C Thread To Success™ brand, including its name, structure, characters (Caelum, Aurion, Jan, Casey, Anica), persona system (Falcon, Panther, Wolf, Lion), philosophy, and overall ecosystem identity remains the intellectual property of the creator and is **not** included in this license.
Commercial use of the brand or replication of the ecosystem identity is not permitted without permission.

---

## 🎭 The 3C Ecosystem

This project is part of a larger system built around five core identities:

**Aurion** → Engagement & Experience — 3C Mascot, community voice, diamond-energy guide
**Caelum** → Structure & Direction — Chief Advisor, PR Manager, Brand Integrity Officer
**Jan** → Clarity & Support — Writing & Editorial Support, Lifeline Mentor & Anchor
**Casey** → Story & Play — Creative Director, Lifeline Playmaker & Ace Maven
**Anica (Founder)** → Authority & Vision — Systems Strategist, Project Architect, the Chef

Together, they create a balanced environment for growth, learning, and progression.

---

## 🧩 What Is the 3C Content Template Engine?

The template builder used alongside the 3C Control Center dashboard. Instead of writing every post from scratch, a template holds the structure, brand voice, platform and details. You fill in what changes and everything else stays consistent. Only the owner can sign in and use it.

What is inside:

- **Template builder** — three steps: Select, Create, Review.
- **Smart template ID** — built from theme, audience, media, template type, character and voice, with an automatic number.
- **Brand voices** — Anica, Caelum and Aurion character voices, plus voice style.
- **Hashtag manager** — add, limit-check and suggest hashtags per platform, with live character counts.
- **Save, load, search, delete** — templates are saved to the database; delete archives a template.
- **Forward to the Template Library** — sends a template to the dashboard's `pending_content_library`.
- **Platform generator** (`generator.html`) — platform details and limits; it does not use the database.

---

## ⚙️ How It Is Built

| Part | What it uses |
|------|--------------|
| Front end | Plain HTML, CSS and JavaScript (no build step) |
| Database | Supabase project **3C Control Center** — tables `content_templates` and `pending_content_library` |
| Files (R2) | None |
| Workers | None |
| Hosting | Vercel (static files) |
| Admin access | GitHub sign-in through Supabase, owner only |

Details of every connection are in [SETUP.md](SETUP.md).

---

## 🔐 Security and Privacy

- Only the owner can read or write the two tables. The database itself enforces this; the page cannot bypass it.
- Sign-in is GitHub through Supabase. After sign-in the page asks the database whether the account is the owner. Any other account is signed out with a notice.
- The page holds only the public Supabase address and the public key. No secret keys are in this repository or in the hosting settings.
- There are no server routes. The page talks to the database directly, using the owner's own sign-in.

---

## 📖 Documentation

- [SETUP.md](SETUP.md) — every external connection, login, deploy steps, tests and change log
- [LEGAL_DISCLAIMER.md](LEGAL_DISCLAIMER.md)

---

## 🎨 Credits

*Designed and Built with ❤️ by Claude (Anthropic) × Chef Anica · 3C Thread To Success™ Cooking Lab* 🧪👨‍🍳

*"Think Smarter, Not Harder — Zero Shortcuts"*

---

## 👤 Creator

**Anica-blip ("Chef")**
Founder of 3C Thread To Success™ ("Cooking Lab")
Independent Creator | Community Builder

---

## 🧠 Philosophy

*"Think it. Do it. Own it."*

This project was built from vision, persistence, and a commitment to creating meaningful and structured experiences — even with minimal resources. It exists so that every post starts from a proven structure instead of a blank page.
