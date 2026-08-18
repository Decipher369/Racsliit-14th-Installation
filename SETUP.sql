-- ============================================================
-- Rotaract Club of SLIIT — 14th Installation Registration System
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

-- ------------------------------------------------------------
-- Duplicate-registration guard (added 2026-08-19).
-- Hard guarantees that a NIC/contact can only be used once.
-- ------------------------------------------------------------
create unique index if not exists registrations_nic_unique
  on public.registrations (lower(trim(nic_number)))
  where nic_number is not null and trim(nic_number) <> '';

create unique index if not exists registrations_contact_unique
  on public.registrations (lower(trim(contact_number)))
  where contact_number is not null and trim(contact_number) <> '';

-- Public registration entry point. Checks for duplicates first and returns the row.
drop function if exists public.register_guest(jsonb);

create function public.register_guest(payload jsonb)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nic     text := nullif(trim(coalesce(payload->>'nic_number','')), '');
  v_contact text := nullif(trim(coalesce(payload->>'contact_number','')), '');
  dup       public.registrations%rowtype;
  row       public.registrations;
begin
  if v_nic is not null then
    select * into dup
      from public.registrations
      where lower(trim(coalesce(nic_number,''))) = lower(v_nic)
      limit 1;
    if found then
      raise exception 'DUPLICATE_NIC: This NIC is already registered.';
    end if;
  end if;

  if v_contact is not null then
    select * into dup
      from public.registrations
      where lower(trim(coalesce(contact_number,''))) = lower(v_contact)
      limit 1;
    if found then
      raise exception 'DUPLICATE_CONTACT: This contact number is already registered.';
    end if;
  end if;

  insert into public.registrations (
    category, full_name, contact_number, nic_number, food_preference,
    parking_inside, vehicle_number, sliit_reg_number, faculty, year,
    is_rotaract_member, position, membership_card_status, is_board_member,
    board_member_name, board_member_position, board_member_contact,
    mother_name, mother_nic, mother_contact,
    father_name, father_nic, father_contact,
    affiliation, club_or_org_name, designation
  ) values (
    payload->>'category', payload->>'full_name',
    payload->>'contact_number', payload->>'nic_number',
    payload->>'food_preference',
    coalesce((payload->>'parking_inside')::boolean, false),
    nullif(payload->>'vehicle_number',''),
    nullif(payload->>'sliit_reg_number',''),
    nullif(payload->>'faculty',''),
    nullif(payload->>'year',''),
    (payload->>'is_rotaract_member')::boolean,
    nullif(payload->>'position',''),
    nullif(payload->>'membership_card_status',''),
    (payload->>'is_board_member')::boolean,
    nullif(payload->>'board_member_name',''),
    nullif(payload->>'board_member_position',''),
    nullif(payload->>'board_member_contact',''),
    nullif(payload->>'mother_name',''),
    nullif(payload->>'mother_nic',''),
    nullif(payload->>'mother_contact',''),
    nullif(payload->>'father_name',''),
    nullif(payload->>'father_nic',''),
    nullif(payload->>'father_contact',''),
    nullif(payload->>'affiliation',''),
    nullif(payload->>'club_or_org_name',''),
    nullif(payload->>'designation','')
  )
  returning * into row;

  return row;
end;
$$;

grant execute on function public.register_guest(jsonb) to anon, authenticated;

-- Confirm it worked by fetching the row count.
select count(*) as registration_count from public.registrations;
