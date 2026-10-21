-- =====================================================================
-- StayEase - Customer Reservation API (server side)
-- Run in Supabase SQL Editor AFTER stayease_schema.sql
--
-- Why: with the original RLS, a customer could insert/update their own
-- reservation with ANY values (e.g. status = 'checked_in', total = 0).
-- These functions force safe values, compute the price on the server,
-- and the tightened policies block direct customer writes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tighten RLS: customers can READ own rows, but only write via RPC
-- ---------------------------------------------------------------------
drop policy if exists "guest creates own" on reservations;
drop policy if exists "guest cancels own" on reservations;

create policy "staff creates reservations" on reservations
  for insert with check (is_staff());
create policy "staff updates reservations" on reservations
  for update using (is_staff());
-- (existing policies kept: "guest reads own" + "admin deletes")

-- ---------------------------------------------------------------------
-- 2. CREATE
-- ---------------------------------------------------------------------
create or replace function create_reservation(
  p_room_id          uuid,
  p_check_in         date,
  p_check_out        date,
  p_num_guests       int  default 1,
  p_special_requests text default null
) returns reservations
language plpgsql security definer set search_path = public as $$
declare
  v_room rooms;
  v_max  int;
  v_res  reservations;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to book a room' using errcode = '28000';
  end if;
  if p_check_in < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'Check-out date must be after check-in date';
  end if;
  if p_num_guests is null or p_num_guests < 1 then
    raise exception 'At least one guest is required';
  end if;

  select * into v_room from rooms where id = p_room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  select max_occupancy into v_max from room_types where id = v_room.room_type_id;
  if p_num_guests > v_max then
    raise exception 'This room allows a maximum of % guests', v_max;
  end if;

  -- The no_double_booking exclusion constraint rejects overlaps (SQLSTATE 23P01)
  insert into reservations
    (guest_id, room_id, check_in, check_out, num_guests, total_amount, status, special_requests)
  values
    (auth.uid(), p_room_id, p_check_in, p_check_out, p_num_guests,
     v_room.price * (p_check_out - p_check_in), 'pending', p_special_requests)
  returning * into v_res;

  return v_res;
end $$;

-- ---------------------------------------------------------------------
-- 3. UPDATE (dates / guests / notes) - only own pending or confirmed bookings
-- ---------------------------------------------------------------------
create or replace function update_reservation(
  p_id               uuid,
  p_check_in         date,
  p_check_out        date,
  p_num_guests       int,
  p_special_requests text default null
) returns reservations
language plpgsql security definer set search_path = public as $$
declare
  v_res   reservations;
  v_price numeric;
  v_max   int;
begin
  select * into v_res from reservations where id = p_id and guest_id = auth.uid();
  if not found then
    raise exception 'Reservation not found';
  end if;
  if v_res.status not in ('pending', 'confirmed') then
    raise exception 'Only pending or confirmed reservations can be modified';
  end if;
  if p_check_in < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'Check-out date must be after check-in date';
  end if;

  select r.price, rt.max_occupancy into v_price, v_max
    from rooms r join room_types rt on rt.id = r.room_type_id
   where r.id = v_res.room_id;
  if p_num_guests < 1 or p_num_guests > v_max then
    raise exception 'This room allows between 1 and % guests', v_max;
  end if;

  update reservations
     set check_in = p_check_in,
         check_out = p_check_out,
         num_guests = p_num_guests,
         special_requests = p_special_requests,
         total_amount = v_price * (p_check_out - p_check_in)
   where id = p_id
   returning * into v_res;

  return v_res;
end $$;

-- ---------------------------------------------------------------------
-- 4. DELETE (soft delete = cancel) - only own pending or confirmed bookings
-- ---------------------------------------------------------------------
create or replace function cancel_reservation(p_id uuid)
returns reservations
language plpgsql security definer set search_path = public as $$
declare v_res reservations;
begin
  update reservations
     set status = 'cancelled'
   where id = p_id
     and guest_id = auth.uid()
     and status in ('pending', 'confirmed')
   returning * into v_res;

  if not found then
    raise exception 'Reservation not found or can no longer be cancelled';
  end if;
  return v_res;
end $$;

-- ---------------------------------------------------------------------
-- 5. AVAILABILITY SEARCH (needs security definer: customers cannot read
--    other guests' reservations through RLS)
-- ---------------------------------------------------------------------
create or replace function get_available_rooms(p_check_in date, p_check_out date)
returns setof room_catalog
language sql stable security definer set search_path = public as $$
  select c.*
    from room_catalog c
   where c.status <> 'maintenance'
     and not exists (
       select 1 from reservations r
        where r.room_id = c.id
          and r.status in ('pending', 'confirmed', 'checked_in')
          and daterange(r.check_in, r.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
     );
$$;

-- ---------------------------------------------------------------------
-- 6. Permissions: logged-in users only
-- ---------------------------------------------------------------------
revoke execute on function create_reservation(uuid, date, date, int, text)   from public, anon;
revoke execute on function update_reservation(uuid, date, date, int, text)   from public, anon;
revoke execute on function cancel_reservation(uuid)                          from public, anon;
grant  execute on function create_reservation(uuid, date, date, int, text)   to authenticated;
grant  execute on function update_reservation(uuid, date, date, int, text)   to authenticated;
grant  execute on function cancel_reservation(uuid)                          to authenticated;
-- get_available_rooms stays callable by anon so visitors can search before logging in
grant  execute on function get_available_rooms(date, date) to anon, authenticated;
