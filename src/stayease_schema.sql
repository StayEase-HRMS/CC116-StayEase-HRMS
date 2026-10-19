-- =====================================================================
-- StayEase HRMS - Supabase (PostgreSQL) Schema
-- Run in: Supabase Dashboard > SQL Editor
-- =====================================================================

create extension if not exists btree_gist;  -- needed for double-booking prevention

-- ---------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------
create type user_role          as enum ('customer', 'staff', 'admin');
create type room_status        as enum ('available', 'reserved', 'occupied', 'maintenance');
create type reservation_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
create type payment_status     as enum ('unpaid', 'partial', 'paid', 'refunded');
create type task_type          as enum ('cleaning', 'turnaround', 'maintenance', 'inspection');
create type task_status        as enum ('open', 'in_progress', 'done');
create type ticket_status      as enum ('open', 'in_progress', 'resolved', 'closed');

-- ---------------------------------------------------------------------
-- 2. PROFILES (extends auth.users) - Guests / Staff / Admins
-- ---------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text unique,
  phone       text,
  role        user_role not null default 'customer',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. ROOM TYPES (Standard, Deluxe, Executive Suite, Family)
-- ---------------------------------------------------------------------
create table room_types (
  id             serial primary key,
  name           text not null unique,
  description    text,
  base_price     numeric(10,2) not null check (base_price >= 0),
  max_occupancy  int not null default 2 check (max_occupancy > 0),
  thumbnail_url  text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. ROOMS
-- ---------------------------------------------------------------------
create table rooms (
  id            uuid primary key default gen_random_uuid(),
  room_number   text not null unique,              -- searchable on customer page
  name          text not null,                     -- e.g. "Ocean View Deluxe"
  room_type_id  int not null references room_types(id),
  view_title    text,                              -- e.g. "City View", "Sea View"
  description   text,
  price         numeric(10,2) not null check (price >= 0),
  floor         int,
  status        room_status not null default 'available',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_rooms_status on rooms(status);
create index idx_rooms_type   on rooms(room_type_id);

create table room_images (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references rooms(id) on delete cascade,
  image_url   text not null,
  sort_order  int not null default 0,
  is_primary  boolean not null default false
);
create index idx_room_images_room on room_images(room_id);

-- ---------------------------------------------------------------------
-- 5. AMENITIES (tags shown on room cards)
-- ---------------------------------------------------------------------
create table amenities (
  id    serial primary key,
  name  text not null unique,      -- "Wi-Fi", "Air Conditioning", "Breakfast"
  icon  text                       -- Lucide icon name
);

create table room_amenities (
  room_id     uuid not null references rooms(id) on delete cascade,
  amenity_id  int  not null references amenities(id) on delete cascade,
  primary key (room_id, amenity_id)
);

-- ---------------------------------------------------------------------
-- 6. RESERVATIONS
-- ---------------------------------------------------------------------
create table reservations (
  id              uuid primary key default gen_random_uuid(),
  reference_code  text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  guest_id        uuid not null references profiles(id) on delete restrict,
  room_id         uuid not null references rooms(id)    on delete restrict,
  check_in        date not null,
  check_out       date not null,
  num_guests      int  not null default 1 check (num_guests > 0),
  total_amount    numeric(10,2) not null default 0 check (total_amount >= 0),
  status          reservation_status not null default 'pending',
  special_requests text,
  checked_in_at   timestamptz,
  checked_out_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint chk_dates check (check_out > check_in),
  -- Prevent overlapping active bookings for the same room
  constraint no_double_booking exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending','confirmed','checked_in'))
);
create index idx_res_guest   on reservations(guest_id);
create index idx_res_room    on reservations(room_id);
create index idx_res_status  on reservations(status);
create index idx_res_checkin on reservations(check_in);

-- ---------------------------------------------------------------------
-- 7. PAYMENTS
-- ---------------------------------------------------------------------
create table payments (
  id              uuid primary key default gen_random_uuid(),
  reservation_id  uuid not null references reservations(id) on delete cascade,
  amount          numeric(10,2) not null check (amount > 0),
  method          text not null default 'cash',   -- cash | card | gcash | bank_transfer
  status          payment_status not null default 'paid',
  paid_at         timestamptz not null default now(),
  recorded_by     uuid references profiles(id)
);
create index idx_payments_res on payments(reservation_id);

-- ---------------------------------------------------------------------
-- 8. REVIEWS & RATINGS (admin "Reviews & ratings" + star filter)
-- ---------------------------------------------------------------------
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references rooms(id) on delete cascade,
  guest_id        uuid not null references profiles(id) on delete cascade,
  reservation_id  uuid references reservations(id) on delete set null,
  rating          int  not null check (rating between 1 and 5),
  comment         text,
  is_visible      boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (guest_id, reservation_id)
);
create index idx_reviews_room on reviews(room_id);

-- ---------------------------------------------------------------------
-- 9. HOUSEKEEPING / ROOM TURNAROUND TASKS (staff portal)
-- ---------------------------------------------------------------------
create table room_tasks (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references rooms(id) on delete cascade,
  task_type    task_type   not null default 'cleaning',
  status       task_status not null default 'open',
  assigned_to  uuid references profiles(id) on delete set null,
  notes        text,
  due_at       timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);
create index idx_tasks_room   on room_tasks(room_id);
create index idx_tasks_status on room_tasks(status);

-- ---------------------------------------------------------------------
-- 10. CUSTOMER SUPPORT
-- ---------------------------------------------------------------------
create table support_tickets (
  id          uuid primary key default gen_random_uuid(),
  guest_id    uuid not null references profiles(id) on delete cascade,
  subject     text not null,
  message     text not null,
  status      ticket_status not null default 'open',
  handled_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 11. HERO CAROUSEL SLIDES (customer landing page)
-- ---------------------------------------------------------------------
create table carousel_slides (
  id          serial primary key,
  image_url   text not null,
  caption     text,
  sort_order  int not null default 0,
  is_active   boolean not null default true
);

-- =====================================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================================

-- updated_at auto-touch
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_upd     before update on profiles        for each row execute function set_updated_at();
create trigger trg_rooms_upd        before update on rooms           for each row execute function set_updated_at();
create trigger trg_reservations_upd before update on reservations    for each row execute function set_updated_at();
create trigger trg_tickets_upd      before update on support_tickets for each row execute function set_updated_at();

-- Auto-create a profile when a user signs up via Supabase Auth
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Role helpers (security definer avoids RLS recursion on profiles)
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('staff','admin'));
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Keep room status in sync with reservation status
create or replace function sync_room_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'checked_in' then
    update rooms set status = 'occupied' where id = new.room_id;
  elsif new.status = 'checked_out' then
    update rooms set status = 'available' where id = new.room_id;
    insert into room_tasks (room_id, task_type) values (new.room_id, 'turnaround');
  elsif new.status in ('pending','confirmed') and new.check_in = current_date then
    update rooms set status = 'reserved' where id = new.room_id and status = 'available';
  end if;
  return new;
end $$;

create trigger trg_sync_room_status
  after insert or update of status on reservations
  for each row execute function sync_room_status();

-- =====================================================================
-- VIEWS (feed the customer catalog and admin dashboard)
-- =====================================================================

-- Customer catalog: room + type + avg rating + review count + primary image
create or replace view room_catalog with (security_invoker = true) as
select r.id, r.room_number, r.name, r.view_title, r.price, r.status, r.description,
       rt.name as room_type,
       coalesce(round(avg(rv.rating)::numeric, 1), 0) as avg_rating,
       count(rv.id) as review_count,
       (select image_url from room_images i where i.room_id = r.id
         order by is_primary desc, sort_order limit 1) as image_url,
       coalesce((select array_agg(a.name) from room_amenities ra
                 join amenities a on a.id = ra.amenity_id where ra.room_id = r.id), '{}') as amenities
from rooms r
join room_types rt on rt.id = r.room_type_id
left join reviews rv on rv.room_id = r.id and rv.is_visible
group by r.id, rt.name;

-- Admin: per-tier occupied vs available (RoomAvailabilityCard)
create or replace view room_type_availability with (security_invoker = true) as
select rt.id, rt.name, rt.description, rt.thumbnail_url,
       count(*) filter (where r.status = 'occupied')  as occupied,
       count(*) filter (where r.status = 'available') as available,
       count(r.id) as total
from room_types rt left join rooms r on r.room_type_id = rt.id
group by rt.id;

-- Admin: status breakdown (PieChart / RoomStatusOverview)
create or replace view room_status_summary with (security_invoker = true) as
select status, count(*) as total from rooms group by status;

-- Admin: today's reservations (ReservationsTable)
create or replace view todays_reservations with (security_invoker = true) as
select res.id, p.full_name as guest_name, r.room_number,
       res.check_in, res.check_out, res.status
from reservations res
join profiles p on p.id = res.guest_id
join rooms r    on r.id = res.room_id
where current_date between res.check_in and res.check_out
  and res.status <> 'cancelled';

-- Admin: KPI cards
create or replace view dashboard_metrics with (security_invoker = true) as
select
  (select count(*) from rooms)                                              as total_rooms,
  (select count(*) from rooms where status = 'occupied')                    as occupied_rooms,
  (select count(*) from rooms where status = 'available')                   as available_rooms,
  (select count(*) from reservations where check_in = current_date)         as arrivals_today,
  (select count(*) from reservations where check_out = current_date
                                       and status = 'checked_in')           as departures_today,
  (select coalesce(sum(amount),0) from payments
     where paid_at >= date_trunc('month', now()))                           as revenue_this_month;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table profiles        enable row level security;
alter table room_types      enable row level security;
alter table rooms           enable row level security;
alter table room_images     enable row level security;
alter table amenities       enable row level security;
alter table room_amenities  enable row level security;
alter table reservations    enable row level security;
alter table payments        enable row level security;
alter table reviews         enable row level security;
alter table room_tasks      enable row level security;
alter table support_tickets enable row level security;
alter table carousel_slides enable row level security;

-- Profiles
create policy "own profile read"    on profiles for select using (id = auth.uid() or is_staff());
create policy "own profile update"  on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));
create policy "admin manages profiles" on profiles for all using (is_admin());

-- Public catalog data (readable by everyone, writable by staff/admin)
do $$
declare t text;
begin
  foreach t in array array['room_types','rooms','room_images','amenities','room_amenities','carousel_slides']
  loop
    execute format('create policy "public read %1$s" on %1$I for select using (true)', t);
    execute format('create policy "staff write %1$s" on %1$I for all using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

-- Reservations
create policy "guest reads own"   on reservations for select using (guest_id = auth.uid() or is_staff());
create policy "guest creates own" on reservations for insert with check (guest_id = auth.uid() or is_staff());
create policy "guest cancels own" on reservations for update using (guest_id = auth.uid() or is_staff());
create policy "admin deletes"     on reservations for delete using (is_admin());

-- Payments
create policy "guest reads own payments" on payments for select
  using (exists (select 1 from reservations r where r.id = reservation_id and r.guest_id = auth.uid()) or is_staff());
create policy "staff writes payments" on payments for all using (is_staff()) with check (is_staff());

-- Reviews
create policy "public reads visible reviews" on reviews for select using (is_visible or is_staff());
create policy "guest writes own review"      on reviews for insert with check (guest_id = auth.uid());
create policy "guest edits own review"       on reviews for update using (guest_id = auth.uid() or is_admin());
create policy "admin deletes review"         on reviews for delete using (is_admin());

-- Room tasks (staff only)
create policy "staff manage tasks" on room_tasks for all using (is_staff()) with check (is_staff());

-- Support tickets
create policy "guest reads own tickets"   on support_tickets for select using (guest_id = auth.uid() or is_staff());
create policy "guest opens ticket"        on support_tickets for insert with check (guest_id = auth.uid());
create policy "staff updates tickets"     on support_tickets for update using (is_staff());

-- =====================================================================
-- SEED DATA (optional starter rows)
-- =====================================================================
insert into room_types (name, description, base_price, max_occupancy) values
  ('Standard',        'Comfortable room with essential amenities.',       2500, 2),
  ('Deluxe',          'Spacious room with premium bedding and a view.',   4000, 3),
  ('Executive Suite', 'Separate living area with luxury furnishings.',    7500, 4),
  ('Family',          'Large room for families with multiple beds.',      6000, 6);

insert into amenities (name, icon) values
  ('Wi-Fi','wifi'), ('Air Conditioning','snowflake'), ('Breakfast','coffee'),
  ('TV','tv'), ('Mini Bar','wine'), ('Pool Access','waves');
