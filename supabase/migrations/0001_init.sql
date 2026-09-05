create extension if not exists pgcrypto;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  full_name text,
  email text,
  city text,
  enquiry_count integer not null default 0 check (enquiry_count >= 0),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  tags text[] not null default '{}',
  notes text
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  car_slug text not null,
  pickup_date date not null,
  return_date date not null check (return_date >= pickup_date),
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  source text not null default 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create table public.events (
  id bigint generated always as identity primary key,
  session_id text not null,
  name text not null check (name in ('page_view', 'whatsapp_click', 'call_click', 'fleet_card_view', 'enquiry_started', 'enquiry_submitted')),
  path text,
  car_slug text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

-- Only a one-way hash is stored. Raw visitor IP addresses never enter the database.
create table public.enquiry_rate_limits (
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index customers_phone_idx on public.customers(phone);
create index enquiries_customer_id_idx on public.enquiries(customer_id);
create index enquiries_created_at_idx on public.enquiries(created_at desc);
create index events_name_idx on public.events(name);
create index events_created_at_idx on public.events(created_at desc);
create index enquiry_rate_limits_lookup_idx on public.enquiry_rate_limits(ip_hash, created_at desc);

alter table public.customers enable row level security;
alter table public.enquiries enable row level security;
alter table public.events enable row level security;
alter table public.enquiry_rate_limits enable row level security;

-- No public policies are intentionally defined. The browser anon role has no access.
revoke all on public.customers, public.enquiries, public.events, public.enquiry_rate_limits from anon, authenticated;
revoke all on sequence public.events_id_seq from anon, authenticated;

create or replace function public.record_enquiry(
  p_phone text,
  p_full_name text,
  p_car_slug text,
  p_pickup_date date,
  p_return_date date,
  p_message text default null,
  p_source text default 'website',
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_ip_hash text default null,
  p_session_id text default null
) returns table(customer_id uuid, enquiry_id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_enquiry_id uuid;
begin
  -- Serialize submissions from the same IP hash so concurrent taps cannot evade the cap.
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));
  if (select count(*) from public.enquiry_rate_limits where ip_hash = p_ip_hash and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'RATE_LIMITED';
  end if;

  insert into public.enquiry_rate_limits (ip_hash) values (p_ip_hash);

  insert into public.customers (phone, full_name, city, enquiry_count)
  values (p_phone, p_full_name, 'Ramanathapuram', 1)
  on conflict (phone) do update
    set full_name = excluded.full_name,
        last_seen_at = now(),
        enquiry_count = public.customers.enquiry_count + 1
  returning id into v_customer_id;

  insert into public.enquiries (
    customer_id, car_slug, pickup_date, return_date, message, source,
    utm_source, utm_medium, utm_campaign
  ) values (
    v_customer_id, p_car_slug, p_pickup_date, p_return_date, nullif(p_message, ''), p_source,
    nullif(p_utm_source, ''), nullif(p_utm_medium, ''), nullif(p_utm_campaign, '')
  ) returning id into v_enquiry_id;

  insert into public.events (session_id, name, path, car_slug, utm_source, utm_medium, utm_campaign)
  values (p_session_id, 'enquiry_submitted', '/', p_car_slug, nullif(p_utm_source, ''), nullif(p_utm_medium, ''), nullif(p_utm_campaign, ''));

  return query select v_customer_id, v_enquiry_id;
end;
$$;

revoke all on function public.record_enquiry(text, text, text, date, date, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.record_enquiry(text, text, text, date, date, text, text, text, text, text, text, text) to service_role;
