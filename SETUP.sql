-- ============================================================
-- Rotaract Club of SLIIT — 13th Installation Registration System
-- Supabase schema. Run this in the SQL Editor of:
--   https://supabase.com/dashboard/project/dmqbsziuprusrcmsujcp
-- Paste the whole file, run it. Safe to run once only (guard below).
-- ============================================================

-- Create the registrations table if it does not already exist.
create table if not exists public.registrations (
  id                     uuid primary key default gen_random_uuid(),
  reg_number             bigserial,
  category               text not null check (category in ('sliit_member', 'outside_sliit')),
  full_name              text not null,
  contact_number         text not null,
  nic_number             text,
  food_preference        text check (food_preference in ('veg', 'non_veg')),
  parking_inside         boolean default false,
  vehicle_number         text,
  sliit_reg_number       text,
  faculty                text,
  year                   text,
  is_rotaract_member     boolean,
  position               text check (position in ('board', 'general', 'new')),
  membership_card_status text,
  is_board_member        boolean,
  board_member_name      text,
  board_member_position  text,
  board_member_contact   text,
  mother_name            text,
  mother_nic             text,
  mother_contact         text,
  father_name            text,
  father_nic             text,
  father_contact         text,
  affiliation            text check (affiliation in (
                            'rotary',
                            'district_exec_committee',
                            'district_steering_committee',
                            'rotaract',
                            'interact',
                            'non_rotaract'
                          )),
  club_or_org_name       text,
  designation            text,
  registered_at          timestamptz default now(),
  attended               boolean default false,
  checked_in_at          timestamptz
);

-- Enable row level security (required for the anon/publishable key to work).
alter table public.registrations enable row level security;

-- Policy 1: anyone (anon) may INSERT a registration.
create policy "anon can insert registrations"
  on public.registrations
  for insert
  to anon
  with check (true);

-- Policy 2: authenticated (logged-in admin) users may SELECT all rows.
create policy "admin can select registrations"
  on public.registrations
  for select
  to authenticated
  using (true);

-- Policy 3: authenticated (logged-in admin) users may UPDATE rows (check-in).
create policy "admin can update registrations"
  on public.registrations
  for update
  to authenticated
  using (true)
  with check (true);

-- Optional but recommended: grants so the default roles can actually use these.
grant insert on table public.registrations to anon;
grant select, update on table public.registrations to authenticated;

-- Confirm it worked by fetching the row count.
select count(*) as registration_count from public.registrations;
