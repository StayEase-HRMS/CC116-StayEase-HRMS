-- =====================================================================
-- StayEase - Login back-end migration
-- Run in the Supabase SQL Editor AFTER stayease_schema.sql (+ seed data).
--
-- DO NOT run the uploaded schema.sql on this database: it tries to
-- re-create `profiles`, the role enum and `handle_new_user`, which already
-- exist here with a different shape. This file adds only what is missing:
--   * profiles.username  (for "login with username")
--   * handle_new_user()  now also saves the username from sign-up metadata
--   * get_email_by_username()  used by the login form
-- =====================================================================

-- 1. Username column ---------------------------------------------------
alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_.]{3,30}$');

-- 2. New-user trigger now stores the username too ------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'username', '')
  );
  return new;
end;
$$;
-- (trigger on_auth_user_created already exists and keeps using this function)

-- 3. Username -> email lookup for the login form -------------------------
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(p_username)
  limit 1;
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- 4. Usernames for the demo accounts from the seed data -------------------
update public.profiles p
   set username = v.username
  from (values
    ('stayease.admin.demo2026@gmail.com',  'admin'),
    ('stayease.staff.demo2026@gmail.com',  'staff'),
    ('stayease.staff2.demo2026@gmail.com', 'staff2'),
    ('stayease.guest.demo2026@gmail.com',  'guest'),
    ('stayease.guest2.demo2026@gmail.com', 'guest2'),
    ('stayease.guest3.demo2026@gmail.com', 'guest3'),
    ('stayease.guest4.demo2026@gmail.com', 'guest4'),
    ('stayease.guest5.demo2026@gmail.com', 'guest5'),
    ('stayease.guest6.demo2026@gmail.com', 'guest6'),
    ('stayease.guest7.demo2026@gmail.com', 'guest7'),
    ('stayease.guest8.demo2026@gmail.com', 'guest8'),
    ('stayease.guest9.demo2026@gmail.com', 'guest9')
  ) as v(email, username)
 where p.email = v.email;
