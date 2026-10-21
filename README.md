# SEATS — flexible travel, clearly explained

SEATS is an early-stage standby travel concept for people whose plans can move. The current experience demonstrates one route, Indore (IDR) to Delhi (DEL), using local illustrative timetable examples. It has no airline-authorized inventory, availability feed, price offer, booking or ticket operation. A standby request record is not a confirmed seat.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL. Route discovery and the conversational assistant work without external credentials. Searches filter only the bundled demonstration schedules. Recent searches are saved in the current browser; account request records require a configured Supabase project and a signed-in user.

## Supabase configuration

Copy `.env.example` to `.env.local`, then use the URL and **publishable** key from a Supabase project you are authorized to use:

```text
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The browser uses a publishable key and relies on PostgreSQL grants and row-level security. Never put a service-role key, provider secret or other private key in a `VITE_` variable or committed file. Missing or placeholder values leave the demo route available and display an account setup state. A syntactically valid URL and key do not prove that the project is reachable; the application checks Supabase Auth session loading at runtime.

## Database migrations

The version-controlled migrations are in `supabase/migrations/`. To run them against a local database, install the Supabase CLI and a Docker-compatible runtime, then start the local stack and apply migrations:

```sh
supabase start
supabase migration up
supabase test db
```

The seed rows for IDR, DEL, one fictional carrier, a sample flight and its inventory snapshot are explicitly classified as `demo`. Migration `20261022000500_remove_demo_sample_fare.sql` clears the fabricated sample fare and makes the fare field optional for future authorized data. Do not present demo schedule rows or the seed's illustrative count as live availability. No migration is applied to a remote project automatically.

Before a hosted migration, an authorized operator should review `supabase/migrations/README.md`, confirm the intended project, and inspect the pending migration list. Only then may the operator deliberately link and apply the migrations with the Supabase CLI. This workspace has not been connected to or migrated against a remote database.

## Authentication, customer and admin access

Registration, sign-in, sign-out and session recovery use Supabase Auth when configured. The customer page separates browser-local saved searches from account records read under RLS and includes request status history when authorized data exists. The application does not currently submit new requests from the customer interface.

The `#/admin` page stays locked unless an authenticated database RPC confirms a trusted admin role. Admin request and history queries still rely on RLS. Admin role assignment is reserved for trusted server-side operations; this project does not create a privileged identity or role-assignment endpoint. A hidden navigation item is not used as authorization.

## Travel assistant

The assistant runs as a deterministic local demonstration. It extracts supported route, date and flexibility details and presents the bundled timetable examples. The interface discloses that no model or airline service was queried. A future AI provider must run through trusted server-side code, such as an authorized Edge Function; its API key must not ship to the browser. Assistant output cannot create a request, change inventory or confirm a booking.

## Routes and verification

- `/` — product overview, IDR–DEL demonstration search, standby guidance and local assistant.
- `#/dashboard` — browser-local saved searches and authenticated account request history.
- `#/admin` — database-authorized, read-only operations view.

Run the available checks with the repository scripts:

```sh
npm test
npm run lint
npm run build
npm run test:e2e
```

The Playwright command uses Vite preview at `http://127.0.0.1:4173`; install the matching Playwright browser in the local development environment if one is not already present. Database authorization tests require the local Supabase stack. Vitest covers the demo disclosure, search and auth validation, and access-control assumptions.

For a Vercel preview, use `npm run build` and `dist` as the output directory. Configure only authorized public Supabase values in the deployment environment. No AI provider is configured.

## Project layout

```text
src/
  components/       Shared navigation, search, demo schedule cards and footer
  data/             Clearly identified local schedule examples
  features/auth/    Supabase Auth session and account UI
  features/assistant/ Deterministic assistant provider and interface
  pages/            Landing, customer dashboard and protected admin view
  schemas/          Zod input validation
  services/         Supabase access, local schedule search and dashboard reads
  tests/            Vitest and Testing Library specs
supabase/
  config.toml       Local Supabase CLI configuration
  migrations/       Version-controlled PostgreSQL schema, RLS, RPCs and demo seed
  tests/database/   Database authorization checks
e2e/                Playwright browser specs
```
