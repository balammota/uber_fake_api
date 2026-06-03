-- Fix 500 errors: "violates row-level security policy"
-- Run this in Supabase SQL Editor if API returns database_error / RLS errors.
-- Also run if telematics portals show empty data while Supabase Table Editor has rows.

-- Option A: disable RLS (simplest for local sandbox)
alter table if exists mapistry_sites disable row level security;
alter table if exists mapistry_logs disable row level security;
alter table if exists mapistry_entries disable row level security;
alter table if exists mapistry_request_logs disable row level security;
alter table if exists srm_production disable row level security;

alter table if exists telematics_drivers disable row level security;
alter table if exists telematics_scores disable row level security;
alter table if exists telematics_events disable row level security;
alter table if exists telematics_partners disable row level security;
alter table if exists telematics_logs disable row level security;
alter table if exists telematics_webhooks disable row level security;

-- Option B: if RLS stays on, allow all operations for API keys (anon / authenticated)
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'mapistry_sites',
    'mapistry_logs',
    'mapistry_entries',
    'mapistry_request_logs',
    'srm_production',
    'telematics_drivers',
    'telematics_scores',
    'telematics_events',
    'telematics_partners',
    'telematics_logs',
    'telematics_webhooks'
  ]
  loop
    execute format('alter table if exists %I enable row level security', tbl);
    execute format('drop policy if exists "mapistry_allow_all" on %I', tbl);
    execute format(
      'create policy "mapistry_allow_all" on %I for all using (true) with check (true)',
      tbl
    );
  end loop;
end $$;
