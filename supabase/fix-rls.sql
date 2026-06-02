-- Fix 500 errors: "violates row-level security policy"
-- Run this in Supabase SQL Editor if API returns database_error / RLS errors.

-- Option A: disable RLS (simplest for local sandbox)
alter table if exists mapistry_sites disable row level security;
alter table if exists mapistry_logs disable row level security;
alter table if exists mapistry_entries disable row level security;
alter table if exists mapistry_request_logs disable row level security;
alter table if exists srm_production disable row level security;

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
    'srm_production'
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
