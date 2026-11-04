# Dispatchly Frontend

React 18 + Vite 5 + TypeScript SPA for Dispatchly: user dashboard (deliveries,
WhatsApp, templates, automations, billing), Dispatchly AI pages, and the
super-admin console (`/admin/**`).

## Tech stack

- React 18, React Router 7, Vite 5, TypeScript
- TanStack Query, Tailwind CSS, Radix UI, lucide-react, sonner
- Vitest + Testing Library (jsdom)

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io) (`corepack enable` or `npm i -g pnpm`)
- The Dispatchly API running — see [`../api/README.md`](../api/README.md)
  (default `http://localhost:3000`)

## Setup

```bash
cd fe
pnpm install
cp .env.example .env    # VITE_API_URL — see below
pnpm dev                # http://localhost:5173
```

Open http://localhost:5173. Register/login, or use an account from your local
API database. Routes under `/admin` require a user whose DB role is
`SUPER_ADMIN` (the API enforces this server-side).

## Environment variables

Only **one** variable is read by the app today (`import.meta.env.VITE_API_URL`).
Vite inlines `VITE_*` vars at **build time** — changing them requires a rebuild.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the Dispatchly API, **no trailing slash**, e.g. `http://localhost:3000` locally or `https://<your-api>.fly.dev` in production. Every API call (auth, deliveries, WhatsApp, credits, admin, AI) is built from this value; if it is wrong/missing, requests go to `undefined/...` and pages show loading/error states. In production set it in your host's env settings (Netlify: Site settings → Environment variables) before building. |

Copy [`.env.example`](.env.example) to `.env` for local dev:

```dotenv
VITE_API_URL=http://localhost:3000
```

Notes:

- Keep the API's `FRONTEND_LINK` (backend env) equal to this app's origin
  (`http://localhost:5173` locally) or email-confirmation links will break.
- Auth tokens (`accessToken`, `refreshToken`, `userId`, `userRole`) are stored
  in `localStorage` by the app at login — there is no env var for them.
- Secrets must never be put in `VITE_*` vars: anything `VITE_*` is shipped to
  the browser.

## Scripts

```bash
pnpm dev          # Vite dev server (http://localhost:5173, HMR)
pnpm build        # tsc -b && vite build  -> dist/
pnpm preview      # serve the production build locally
pnpm typecheck    # tsc --noEmit -p tsconfig.app.json
pnpm lint         # eslint
pnpm test         # vitest run (src/**/*.test.{ts,tsx})
pnpm test:watch   # vitest watch
```

## Deployment (Netlify)

Config is in [`netlify.toml`](netlify.toml): build command `pnpm build`,
publish dir `dist`, and an SPA fallback redirect (`/* → /index.html`, 200) so
client-side routes work on refresh.

1. Connect the `fe/` directory as the Netlify site (or run `netlify deploy`).
2. Set `VITE_API_URL` to the deployed API origin in Netlify env settings.
3. Deploy — remember `VITE_*` changes need a fresh build to take effect.

For any other static host: run `pnpm build`, serve `dist/`, and add the same
SPA fallback (all unknown paths → `index.html`).

## Project layout

```
src/
  App.tsx            routes (user app, /ai/**, /admin/**)
  main.tsx           entry
  lib/               API clients (admin-api, ai-api, authenticated-fetch, …)
  components/        ui/, layout/ (DashboardLayout, AdminLayout, Topbar), shared
  pages/             dashboard, deliveries, whatsapp, billing, ai/, admin/, …
  providers/         QueryProvider, …
vite.config.ts       '@' alias -> ./src
vitest.config.ts     jsdom, src/test/setup.ts
```

## Troubleshooting

- **Blank page / every request fails:** `VITE_API_URL` is missing or points at
  the wrong origin — check `.env` / Netlify env, then rebuild.
- **401 / bounced to `/login`:** API is reachable but tokens expired; the app
  auto-refreshes once, then clears storage. Check the API is running and that
  its `FRONTEND_LINK`/CORS origin matches this app.
- **`/admin` redirects to `/dashboard`:** your user's role is not
  `SUPER_ADMIN` in the database (frontend gate mirrors the API guard).
