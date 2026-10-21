# Supabase migrations and authorization

## Files

- `20261022000100_core_schema.sql` creates the normalized profile, airport, airline, flight, inventory snapshot, standby request, and status history tables with constraints and indexes.
- `20261022000200_rls_auth_and_request_rpcs.sql` creates signup profile handling, a private role table, append-only status history, and validated customer/admin request RPCs.
- `20261022000300_rls_policies_and_demo_seed.sql` enables RLS, grants only required client privileges, creates row policies, and seeds an explicitly demo-only IDR–DEL example.
- `20261022000400_admin_authorization_rpc.sql` exposes a current-user-only admin check for the protected dashboard.

The private `user_roles` table is not exposed to the Data API. `anon` and `authenticated` have no direct table privileges on it. Only trusted service-role code and database migrations can assign roles; no admin user or role-assignment endpoint is created here. Never ship a service-role/secret key to the browser.

Customer profile updates have column-level grants for `display_name` and `phone`, plus an own-profile RLS policy. Flights and inventory snapshots are read-only to client roles. Demo flights have `inventory_mode = 'demo'`, while authorized rows require server-supplied authorization metadata. Inventory snapshots must match their flight's mode and are indicative observations, never confirmed seats. Customer standby requests are created and withdrawn through security-definer RPCs that validate `auth.uid()`, party size, terms, eligible authorized flight state, ownership, and status transition. Status history is trigger-written and client append/update/delete is not granted. No schema contains booking or ticket records.

## Local workflow

`../config.toml` is local-only and contains no remote project reference or secrets. With the Supabase CLI and a Docker-compatible runtime installed, start the local stack and apply migrations locally:

```sh
supabase start
supabase migration up
supabase test db
```

The migration seed inserts only airports and one fictional airline, schedule, and snapshot clearly marked demo. `supabase test db` runs the pgTAP grant and RLS checks in `../tests/database/authorization.test.sql`. No local or remote database was changed while preparing these files.

## Hosted projects

Review and test every migration locally, inspect the migration status, and confirm the target project with its owner before applying remotely. Only an authorized operator should link a real project and deliberately run `supabase db push`. Do not run a remote reset. This repository does not link a project or apply migrations automatically.
