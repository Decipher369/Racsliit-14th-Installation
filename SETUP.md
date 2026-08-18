# Supabase Setup — Rotaract Club of SLIIT Installation Registration

Project URL: https://dmqbsziuprusrcmsujcp.supabase.co
Project ref: dmqbsziuprusrcmsujcp (use this in the dashboard URL)

Everything below is done in the Supabase web dashboard at
https://supabase.com/dashboard/project/dmqbsziuprusrcmsujcp

---

## Status (verified 2026-08-18)

| Item | State |
|------|-------|
| Project reachable | OK |
| Auth health | OK (HTTP 200) |
| `registrations` table + RLS policies | EXISTS |
| `register_guest()` function | EXISTS — secure public registration entry point |
| `.env` anon key | Legacy JWT (role `anon`) — works through RLS |
| Admin login user | NOT created yet (Step 4 below) |

> **2026-08-18 resolution:** public form submissions now go through a
> `security definer` function `register_guest(jsonb)` instead of a raw
> `insert().select()`. Direct table writes/reads with the anon key were blocked
> by RLS because anon has no SELECT policy (inserting works, but reading the row
> back — which `insert().select()` requires — does not). The function inserts and
> returns the row while the table itself stays unreadable by the public.

---

## What the app needs (what each piece is for)

1. **`registrations` table** — the only table the app writes/reads.
   The public form INSERTs rows; the admin dashboard SELECTs them and UPDATEs
   the `attended` / `checked_in_at` columns for check-in.
2. **RLS policies** — without these, the publishable key (anon) can do nothing.
   Three policies: anon may INSERT, authenticated may SELECT, authenticated may UPDATE.
3. **Admin auth user** — a single shared email+password the committee logs in with.
   Same key is used; the dashboard guard around `/admin` checks `getSession()`.
4. **Publishable key** — already wired into `.env`, no action needed.

---

## Step 1 — Create the table + policies

1. Open the dashboard, go to **SQL Editor** (`/sql/new`).
2. Paste the entire contents of `SETUP.sql`.
3. Click **RUN**.
4. Expected result: `Success. No rows returned` (the final `select count(*)` returns 0).

Verify in the dashboard sidebar: **Table Editor** → `registrations` should now be listed
with all columns.

## Step 2 — Create the admin login

1. Sidebar **Authentication** → **Users** (**Add user** button, top-right).
2. Choose "Create new user".
3. Email: the shared committee email you want to use for check-in day.
4. Password: set a strong one. (No confirmation email required; the app just signs in.)
5. Create. Once visible in the list, the admin login will work.

## Step 3 — Confirm the publishable key is set locally

`.env` already contains:
```
VITE_SUPABASE_URL=https://dmqbsziuprusrcmsujcp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (legacy anon-key JWT; role=anon)
```
> Use the legacy anon-key JWT (role `anon`), not the newer `sb_publishable_…`
> format — the legacy key is the one that passes the RLS path in this project.
> This file is gitignored — it will NOT be committed. On Vercel/Netlify configure
> the same two variables in the project's Environment Variables.

## Step 4 — Local test

From the project directory:
```
npm run dev
```
Open http://localhost:5173/register — submit a test registration, then log into
/admin/login with the user you created in Step 2 and confirm the row appears.

---

## Deploy to Cloudflare Pages (current host)

Live: https://racsliit-14th-installation.pages.dev (Cloudflare Pages, free tier).

Because Vite inlines `import.meta.env.VITE_*` at BUILD time, the two Supabase
values are baked into the JS bundle locally — Cloudflare just serves the static
`dist/` directory, so no env vars are configured on Cloudflare itself.

Steps to redeploy after a code change:

```
# 1. build with the real values from .env (baked into dist/)
set -a && . ./.env && set +a && npm run build

# 2. upload dist/ (needs wrangler installed + logged in once: `wrangler login`)
wrangler pages deploy dist --project-name=racsliit-14th-installation --branch=main
```

Deep links work because `public/_redirects` (copied into `dist/` by Vite) rewrites
`/*` to `/index.html` with status 200.

> Veracity note: the `<title>` still says "13th Installation" (checked in the
> served HTML 2026-08-18) — worth correcting to "14th" before it goes live-wide.

---

## Deploy to Vercel (alternative — NOT currently used)

The same project is also Vercel-ready:

- `vercel.json` adds an SPA rewrite so `/register`, `/admin`, and `/admin/login`
  survive a hard refresh (they would otherwise 404 on Vercel's static hosting).
- Framework is auto-detected: Build = `vite build`, Output dir = `dist`.

One-time prerequisites on Vercel:
1. Make sure the deploying account has an ACTIVE plan. The team
   `Shagash's projects` was suspended pending billing the last time we tried
   (Vercel returned `402 Your account has been suspended`). Either add a valid
   payment method at
   https://vercel.com/teams/shagash-s-projects/settings/billing
   or log in with a scope that is not suspended.
2. Add the two build-time environment variables to the Vercel project
   (Settings → Environment Variables), with values copied from local `.env`:

   ```
   VITE_SUPABASE_URL=https://dmqbsziuprusrcmsujcp.supabase.co
   VITE_SUPABASE_ANON_KEY=<the legacy anon JWT from .env>
   ```
   > These are baked in at build time by Vite (`import.meta.env.VITE_*`), so
   > they MUST exist before the production build runs.

From the project root (once the account is active):

```
vercel link --yes --project racsliit-14th-installation
# create the two VITE_* vars (production) if not added in the dashboard:
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel deploy --prod
```

---

## Troubleshooting

- **`Could not find the table ... schema cache`** → Step 1 hasn't been run yet.
- **Insert returns `permission denied for table registrations`** → RLS/grants missing,
  re-run SETUP.sql.
- **Login says `Invalid login credentials`** → user not created (Step 2) or wrong email/password.
- **Camera won't start in admin QR tab** → must be served over HTTPS (Vercel/Netlify provide
  this). On `localhost` most browsers allow insecure-Origin camera access.
- **Restart the dev server after editing `.env`** — Vite only reads env at startup.
