# 3C Content Template Engine

**The King of the 3C Ecosystem — Dark Purple Edition**

> _"Simple but the most powerful 3C Ecosystem tool. This is where the whole 3c Control Center dashboard logic was born."_  
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

---

## 🚀 Features

- **Dark Purple UI** — cohesive dark theme matching the full 3C ecosystem
- **9 Platform Support** — Instagram, Facebook, LinkedIn, Twitter/X, YouTube, TikTok, Telegram, Pinterest, WhatsApp Business
- **Template Builder Workflow** — Step 1: Select → Step 2: Create → Step 3: Review
- **Brand Voice System** — Anica / Aurion / Caelum character voices
- **Smart Template ID** — auto-generated IDs based on platform + voice + media + audience
- **Hashtag Manager** — add, limit-check, and suggest hashtags per platform
- **Custom Labels & Audiences** — personalise your content categories
- **Save / Load / Export** — localStorage persistence + JSON export
- **Forward to Dashboard** — sends templates to the 3C Control Center Template Library
- **Character Count** — live per-platform limits with warning states
- **No build step** — pure HTML + CSS + JS, open in browser

---

## 📁 Project Structure

```
3c-content-template-engine/
├── index.html        — Full app (all logic, UI, and workflow)
├── style.css         — Dark Purple theme override layer
├── script.js         — Extended platform engine (modular, for future AI integration)
├── platforms.json    — Platform configuration reference
└── README.md         — This file
```

---

## 🛠️ Getting Started

1. **Clone this repository**
   ```
   git clone https://github.com/Anica-blip/3c-content-template-engine.git
   ```

2. **Open `index.html` in your browser**  
   No build step. No npm. No config. Just open it.

3. **Start templating**
   - Select your platform, character, audience, and media type
   - Fill in title, description, hashtags, keywords, CTA
   - Save locally or forward to your dashboard

---

## 💡 Usage Guide

### Creating a Template
1. **Step 1 — Select:** Choose platform, character voice (Anica/Aurion/Caelum), target audience, media type, and template type
2. **Step 2 — Create:** Fill in title, description, hashtags, keywords, CTA. Character limit shown live per platform
3. **Step 3 — Review:** Preview the generated template, save to library, or forward to dashboard

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

## 🔧 Architecture Notes

- All logic lives in `index.html` — the `script.js` file is the modular engine for future AI-layer integration (Jan AI connection, Supabase sync, etc.)
- `style.css` uses CSS variable overrides + class targeting to theme without touching the inline styles — making it easy to swap themes without breaking logic
- Template IDs follow the pattern: `{platform}-{voice}-{media}-{audience}-{type}-{number}`
- The `3c-custom-labels` and `3c-custom-audiences` keys in localStorage persist your personal taxonomy across sessions

---

## 🚧 Future Roadmap

- [ ] Jan AI integration — AI-assisted content generation per template
- [ ] Supabase sync — cloud template library
- [ ] Multi-user support
- [ ] Analytics + performance tracking per template
- [ ] Real-time collaboration

---

## 📞 See Also

- [3C Control Center Dashboard](https://github.com/Anica-blip)
- [3c-quiz — Quiz Platform](https://github.com/Anica-blip/3c-quiz)
- [3c-quiz-admin — Quiz Admin Editor](https://github.com/Anica-blip/3c-quiz-admin)
- [3C Public Library](https://3c-public-library.org)

---

## License

MIT — fork it, remix it, build on it. Just keep the credits. 🧪👨‍🍳
