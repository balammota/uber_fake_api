-- Telematics simulation tables (run in Supabase SQL Editor)

create table if not exists telematics_drivers (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null unique,
  driver_name text not null,
  city text not null,
  consent_status text default 'active',
  consent_given_at timestamptz default now(),
  consent_expires_at timestamptz default now() + interval '1 year',
  created_at timestamptz default now()
);

create table if not exists telematics_scores (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null references telematics_drivers(driver_id),
  score integer not null,
  percentile integer not null,
  grade text not null,
  trips_analyzed integer not null,
  miles_analyzed numeric not null,
  speed_compliance integer not null,
  smooth_braking integer not null,
  smooth_acceleration integer not null,
  phone_usage integer not null,
  night_driving_safety integer not null,
  period_days integer default 90,
  recorded_at timestamptz default now()
);

create table if not exists telematics_events (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null references telematics_drivers(driver_id),
  harsh_braking integer default 0,
  harsh_acceleration integer default 0,
  speeding integer default 0,
  phone_usage integer default 0,
  night_driving_pct numeric default 0,
  per_100_miles_braking numeric default 0,
  per_100_miles_acceleration numeric default 0,
  per_100_miles_speeding numeric default 0,
  period_days integer default 90,
  recorded_at timestamptz default now()
);

create table if not exists telematics_partners (
  id uuid default gen_random_uuid() primary key,
  partner_id text not null unique,
  partner_name text not null,
  api_calls_total integer default 0,
  api_calls_today integer default 0,
  drivers_connected integer default 0,
  revenue_usd numeric default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists telematics_logs (
  id uuid default gen_random_uuid() primary key,
  partner_id text not null,
  driver_id text,
  endpoint text not null,
  method text not null,
  status_code integer not null,
  response_time_ms integer not null,
  timestamp_ms bigint not null,
  created_at timestamptz default now()
);

create table if not exists telematics_webhooks (
  id uuid default gen_random_uuid() primary key,
  driver_id text not null,
  partner_id text not null,
  event_type text not null,
  previous_score integer,
  new_score integer,
  change integer,
  delivered boolean default false,
  created_at timestamptz default now()
);

insert into telematics_drivers (driver_id, driver_name, city, consent_status) values
  ('driver_001', 'Carlos Mendoza', 'Chicago', 'active'),
  ('driver_002', 'Sarah Johnson', 'Chicago', 'active'),
  ('driver_003', 'Miguel Torres', 'Dallas', 'active'),
  ('driver_004', 'Emily Chen', 'Chicago', 'active'),
  ('driver_005', 'James Wilson', 'Houston', 'active'),
  ('driver_006', 'Ana Garcia', 'Dallas', 'active'),
  ('driver_007', 'David Kim', 'Chicago', 'active'),
  ('driver_008', 'Maria Rodriguez', 'Houston', 'active'),
  ('driver_009', 'Robert Smith', 'Dallas', 'pending'),
  ('driver_010', 'Lisa Anderson', 'Chicago', 'revoked')
on conflict (driver_id) do nothing;

insert into telematics_scores (
  driver_id, score, percentile, grade, trips_analyzed, miles_analyzed,
  speed_compliance, smooth_braking, smooth_acceleration, phone_usage,
  night_driving_safety
) values
  ('driver_001', 82, 91, 'A', 847, 12483, 88, 79, 84, 95, 76),
  ('driver_002', 91, 97, 'A+', 1203, 18920, 95, 92, 89, 98, 88),
  ('driver_003', 67, 72, 'B', 634, 9847, 72, 65, 70, 88, 61),
  ('driver_004', 78, 85, 'B+', 921, 14230, 82, 76, 80, 91, 73),
  ('driver_005', 55, 58, 'C+', 412, 6120, 61, 52, 58, 79, 49),
  ('driver_006', 88, 94, 'A', 1089, 16340, 91, 86, 88, 96, 83),
  ('driver_007', 94, 99, 'A+', 1456, 21780, 97, 95, 93, 99, 91),
  ('driver_008', 71, 78, 'B', 756, 11230, 75, 69, 73, 87, 66),
  ('driver_009', 63, 68, 'B-', 523, 7840, 68, 61, 65, 83, 58),
  ('driver_010', 45, 42, 'D', 289, 4320, 51, 43, 47, 71, 38);

insert into telematics_events (
  driver_id, harsh_braking, harsh_acceleration, speeding, phone_usage,
  night_driving_pct, per_100_miles_braking, per_100_miles_acceleration, per_100_miles_speeding
) values
  ('driver_001', 12, 8, 5, 2, 18.5, 0.96, 0.64, 0.40),
  ('driver_002', 4, 3, 1, 0, 12.0, 0.33, 0.25, 0.08),
  ('driver_003', 28, 22, 18, 9, 24.0, 2.84, 2.23, 1.83),
  ('driver_004', 15, 11, 8, 4, 16.2, 1.05, 0.77, 0.56),
  ('driver_005', 42, 35, 31, 14, 32.0, 6.86, 5.72, 5.07),
  ('driver_006', 7, 5, 3, 1, 14.5, 0.43, 0.31, 0.18),
  ('driver_007', 2, 1, 0, 0, 10.0, 0.14, 0.07, 0.00),
  ('driver_008', 19, 14, 11, 6, 20.1, 1.69, 1.25, 0.98),
  ('driver_009', 24, 18, 15, 8, 22.0, 3.06, 2.30, 1.91),
  ('driver_010', 51, 44, 38, 19, 35.0, 11.81, 10.19, 8.80);

insert into telematics_partners (
  partner_id, partner_name, api_calls_total, api_calls_today,
  drivers_connected, revenue_usd, status
) values
  ('progressive_ins', 'Progressive Insurance', 8420, 142, 7, 12630, 'active'),
  ('root_insurance', 'Root Insurance', 3280, 67, 5, 4920, 'active')
on conflict (partner_id) do nothing;

alter table telematics_drivers disable row level security;
alter table telematics_scores disable row level security;
alter table telematics_events disable row level security;
alter table telematics_partners disable row level security;
alter table telematics_logs disable row level security;
alter table telematics_webhooks disable row level security;
