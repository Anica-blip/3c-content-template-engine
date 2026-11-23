# SETUP — 3C Content Template Engine

Names only. No secret values are written in this file.

## 1. What it is

The template builder for the 3C Control Center. Repo: `3c-content-template-engine`. Plain HTML, CSS and JavaScript, hosted on Vercel, owner sign-in only.

## 2. Addresses

| What | Address |
|---|---|
| Live app | https://3c-content-template-engine.vercel.app |
| Sign-in page | https://3c-content-template-engine.vercel.app/login.html |
| Workers | None |

## 3. External services

| Service | What for |
|---|---|
| Supabase (project **3C Control Center**, ref `uqyqpwhkzlhqxcqajhkn`) | Database and sign-in |
| Vercel | Hosting of the static files (redeploys on every commit) |
| GitHub | The repo, and the GitHub OAuth App used by Supabase's GitHub sign-in |
| Cloudflare, R2, D1, KV, Render, OpenAI, Telegram, Canva | Not used |

## 4. Supabase

| Table | Row level security | Read | Write |
|---|---|---|---|
| `content_templates` | On | Owner only | Owner only |
| `pending_content_library` | On | Owner only | Owner only |

Function used: `is_owner()` (the rules call it; the page also calls it after sign-in).
Delete in the app is an archive (`is_active` set to false), not a real delete.

## 5. Workers

None. The earlier Vercel server routes (`/api`) were removed on 23 Nov 2026. The page now calls Supabase directly (`templateapi.js`) with the owner's sign-in.

## 6. Login

- Supabase project: 3C Control Center.
- Provider: GitHub (PKCE), owner only. The GitHub OAuth App it uses is the one first opened for Supabase sign-in. **Do not delete it.**
- Session name (`storageKey`): `sb-3c-template-engine-owner-login`.
- Redirect URL to keep in Supabase (Authentication → URL Configuration): `https://3c-content-template-engine.vercel.app/**`.
- Owner check: `is_owner()` plus the GitHub name. A signed-in account that is not the owner is signed out with a notice.
- Public settings live in `config.js` (the public Supabase address and public key only).

## 7. Deploy

1. Upload the changed files in the GitHub web page of the repo (commit to main).
2. Vercel redeploys on its own. There is no build step, no `package.json`, no `vercel.json`.
3. Live check: open the app signed out; it must go to `login.html`. Signed in, the badge reads "Database Connected".
4. If a page looks stale after an upload, close the tab and open it again.

File order that matters in `index.html`: Supabase library, `config.js`, `auth.js`, `templateapi.js`, `signout.js`.

## 8. Tests

No Worker, so the five Worker checks do not apply. Done on 23 Nov 2026:

- Old server routes compared with the new `templateapi.js` on the same data: 36 checks, all matched (IDs, save and update, load, search, forward, delete).
- Signed out: every call refused, database untouched.
- Page load test: no errors.
- Chef's live test: template saved, forwarded to `pending_content_library`, and visible in the dashboard.

## 9. Open points

- `generator.html` is not behind the sign-in guard. It holds no data and uses no database. Chef to decide whether to guard it.
- Vercel environment variables `SUPABASE_URL`, `SUPABASE_KEY`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are no longer used. Chef is removing them.

## 10. Change log

| Date | Change | By |
|---|---|---|
| 23 Nov 2026 | Moved to Supabase owner sign-in and direct database calls. Added `config.js`, `templateapi.js`; replaced `auth.js`, `login.html`, `signout.js`, `index.html`. Removed `api/`, `supabase.js`, the committed `.env`, `vercel.json`, `package.json`. README and SETUP written | Champ, with Chef's go |
