-- ============================================================
-- 2026-08-19 — Duplicate-registration guard (incremental, for the LIVE DB)
-- Paste ONLY this file into the Supabase SQL Editor, then RUN.
-- Idempotent: you can run it more than once safely.
--   https://supabase.com/dashboard/project/dmqbsziuprusrcmsujcp/sql/new
-- ============================================================

-- Hard database guarantee: a NIC cannot be used twice.
create unique index if not exists registrations_nic_unique
  on public.registrations (lower(trim(nic_number)))
  where nic_number is not null and trim(nic_number) <> '';

-- Hard database guarantee: a contact number cannot be used twice.
create unique index if not exists registrations_contact_unique
  on public.registrations (lower(trim(contact_number)))
  where contact_number is not null and trim(contact_number) <> '';

-- Rebuild the public registration entry point with friendly duplicate checks.
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

-- Confirm the guard is active.
select 'ok' as duplicate_guard;
