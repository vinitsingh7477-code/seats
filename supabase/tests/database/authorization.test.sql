begin;

select plan(17);

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.airports'::regclass), 'airports has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.airlines'::regclass), 'airlines has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.flights'::regclass), 'flights has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.flight_inventory_snapshots'::regclass), 'inventory snapshots have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.standby_requests'::regclass), 'standby requests have RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.standby_request_status_history'::regclass), 'request history has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'private.user_roles'::regclass), 'private user roles have RLS enabled');

select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'), 'customers can update their display name column');
select ok(has_column_privilege('authenticated', 'public.profiles', 'phone', 'UPDATE'), 'customers can update their phone column');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'), 'customers cannot update profile identity');
select ok(not has_table_privilege('authenticated', 'public.flights', 'INSERT'), 'customers cannot create or alter flight inventory');
select ok(not has_table_privilege('authenticated', 'public.flight_inventory_snapshots', 'INSERT'), 'customers cannot create inventory snapshots');
select ok(not has_table_privilege('authenticated', 'public.standby_requests', 'INSERT'), 'requests must be created through the validated RPC');
select ok(not has_table_privilege('authenticated', 'public.standby_requests', 'UPDATE'), 'request changes must use the validated RPCs');
select ok(not has_table_privilege('authenticated', 'public.standby_request_status_history', 'INSERT'), 'request history is trigger-written only');
select ok(not has_table_privilege('authenticated', 'private.user_roles', 'INSERT'), 'customers cannot grant themselves roles');

select * from finish();
rollback;
