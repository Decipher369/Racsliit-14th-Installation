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

## Troubleshooting

- **`Could not find the table ... schema cache`** → Step 1 hasn't been run yet.
- **Insert returns `permission denied for table registrations`** → RLS/grants missing,
  re-run SETUP.sql.
- **Login says `Invalid login credentials`** → user not created (Step 2) or wrong email/password.
- **Camera won't start in admin QR tab** → must be served over HTTPS (Vercel/Netlify provide
  this). On `localhost` most browsers allow insecure-Origin camera access.
- **Restart the dev server after editing `.env`** — Vite only reads env at startup.
