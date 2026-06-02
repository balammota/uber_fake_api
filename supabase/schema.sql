-- Run this in Supabase: SQL Editor → New query → Paste → Run

create table if not exists mapistry_sites (
  id text primary key,
  name text not null,
  state text,
  site_address text,
  site_city text,
  site_zip text,
  region text,
  created_at timestamptz default now()
);

create table if not exists mapistry_logs (
  id text not null,
  site_id text not null references mapistry_sites(id) on delete cascade,
  name text not null,
  category text,
  instructions text,
  fields jsonb default '[]'::jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  primary key (site_id, id)
);

create table if not exists mapistry_entries (
  id text primary key,
  site_id text not null,
  log_id text not null,
  log_date text not null,
  is_complete boolean default true,
  created_by text,
  updated_by text,
  created_at timestamptz,
  updated_at timestamptz,
  field_values jsonb default '{}'::jsonb,
  foreign key (site_id, log_id) references mapistry_logs(site_id, id) on delete cascade
);

create index if not exists mapistry_entries_site_log_idx
  on mapistry_entries(site_id, log_id);

create index if not exists mapistry_entries_log_date_idx
  on mapistry_entries(log_date);

create table if not exists mapistry_request_logs (
  id text primary key,
  timestamp_ms bigint not null,
  method text not null,
  endpoint text not null,
  status int not null,
  api_key text,
  duration int default 0,
  created_at timestamptz default now()
);

create index if not exists mapistry_request_logs_ts_idx
  on mapistry_request_logs(timestamp_ms desc);

-- Raw production data from SRM plants (before Mapistry upload)
create table if not exists srm_production (
  id uuid primary key default gen_random_uuid(),
  site_id text not null references mapistry_sites(id) on delete cascade,
  site_name text not null,
  cement_produced_tons numeric(10, 2) not null,
  fuel_consumed_liters numeric(12, 2) not null,
  electricity_kwh numeric(12, 2) not null,
  date date not null default current_date,
  shift text not null check (shift in ('day', 'night', 'afternoon')),
  operator_notes text,
  uploaded_to_mapistry boolean not null default false,
  uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists srm_production_site_idx on srm_production(site_id);
create index if not exists srm_production_date_idx on srm_production(date desc);
create index if not exists srm_production_upload_idx on srm_production(uploaded_to_mapistry);

-- Sandbox access (publishable/anon key + server API)
-- Run supabase/fix-rls.sql if you still get RLS errors after creating tables.
alter table mapistry_sites enable row level security;
alter table mapistry_logs enable row level security;
alter table mapistry_entries enable row level security;
alter table mapistry_request_logs enable row level security;
alter table srm_production enable row level security;

drop policy if exists "mapistry_allow_all" on mapistry_sites;
drop policy if exists "mapistry_allow_all" on mapistry_logs;
drop policy if exists "mapistry_allow_all" on mapistry_entries;
drop policy if exists "mapistry_allow_all" on mapistry_request_logs;
drop policy if exists "mapistry_allow_all" on srm_production;

create policy "mapistry_allow_all" on mapistry_sites for all using (true) with check (true);
create policy "mapistry_allow_all" on mapistry_logs for all using (true) with check (true);
create policy "mapistry_allow_all" on mapistry_entries for all using (true) with check (true);
create policy "mapistry_allow_all" on mapistry_request_logs for all using (true) with check (true);
create policy "mapistry_allow_all" on srm_production for all using (true) with check (true);
