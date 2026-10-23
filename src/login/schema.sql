-- StayEase auth setup. Run once in the Supabase SQL editor.
--
-- Also change these in the dashboard (Authentication):
--   1. Email Templates → "Reset Password": include the code, e.g.  Your code: {{ .Token }}
--   2. Sign In / Providers → Email: set "Email OTP expiration" to 600 (10 min, matches the UI timer)
--      and "Email OTP length" to 6
--   3. Sign In / Providers → Email: set "Minimum password length" to 8 (matches the UI)

create type public.app_role as enum ('customer', 'staff', 'admin');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text,
  full_name  text,
  role       public.app_role not null default 'customer',
  created_at timestamptz not null default now()
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Users can read only their own profile. There is deliberately NO update policy,
-- so nobody can promote themselves to admin from the browser.
create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Create a profile automatically for every new auth user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the login form accept a username by resolving it to an email.
create function public.get_email_by_username(p_username text)
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

-- Make yourself an admin (replace the email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
