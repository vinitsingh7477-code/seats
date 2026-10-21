-- Core normalized SEATS schema. Inventory writes are reserved for trusted code.
create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    display_name is null or char_length(btrim(display_name)) between 1 and 100
  ),
  constraint profiles_phone_length check (
    phone is null or char_length(btrim(phone)) between 7 and 32
  )
);

create table public.airports (
  iata_code text primary key,
  name text not null,
  city text not null,
  country_code text not null,
  created_at timestamptz not null default now(),
  constraint airports_iata_code_format check (iata_code ~ '^[A-Z]{3}$'),
  constraint airports_country_code_format check (country_code ~ '^[A-Z]{2}$')
);

create table public.airlines (
  id uuid primary key default gen_random_uuid(),
  airline_code text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint airlines_code_format check (airline_code ~ '^[A-Z0-9]{2,3}$')
);

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  airline_id uuid not null references public.airlines (id) on delete restrict,
  origin_iata text not null references public.airports (iata_code) on delete restrict,
  destination_iata text not null references public.airports (iata_code) on delete restrict,
  flight_number text not null,
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  inventory_mode text not null,
  authorization_verified_at timestamptz,
  authorization_reference text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flights_inventory_mode check (inventory_mode in ('demo', 'authorized')),
  constraint flights_distinct_airports check (origin_iata <> destination_iata),
  constraint flights_arrival_after_departure check (arrival_at > departure_at),
  constraint flights_authorization_state check (
    (inventory_mode = 'demo' and authorization_verified_at is null and authorization_reference is null)
    or
    (inventory_mode = 'authorized' and authorization_verified_at is not null and nullif(btrim(authorization_reference), '') is not null)
  ),
  constraint flights_id_mode_unique unique (id, inventory_mode),
  constraint flights_airline_number_departure_unique unique (airline_id, flight_number, departure_at)
);

create table public.flight_inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null,
  inventory_mode text not null,
  source_type text not null,
  source_reference text,
  reported_seat_count integer not null,
  indicative_fare numeric(10, 2) not null,
  currency_code text not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint inventory_snapshot_flight_mode_fk foreign key (flight_id, inventory_mode)
    references public.flights (id, inventory_mode) on delete cascade,
  constraint inventory_snapshot_mode check (inventory_mode in ('demo', 'authorized')),
  constraint inventory_snapshot_source_mode check (
    (inventory_mode = 'demo' and source_type = 'demo' and source_reference is null)
    or
    (inventory_mode = 'authorized' and source_type = 'airline_feed' and nullif(btrim(source_reference), '') is not null)
  ),
  constraint inventory_snapshot_source_type check (source_type in ('demo', 'airline_feed')),
  constraint inventory_snapshot_seat_count check (reported_seat_count between 0 and 500),
  constraint inventory_snapshot_fare_nonnegative check (indicative_fare >= 0),
  constraint inventory_snapshot_currency check (currency_code ~ '^[A-Z]{3}$'),
  constraint inventory_snapshot_flight_observation_unique unique (flight_id, observed_at)
);

create table public.standby_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  flight_id uuid not null references public.flights (id) on delete restrict,
  traveler_count smallint not null,
  standby_terms_accepted boolean not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint standby_requests_traveler_count check (traveler_count between 1 and 6),
  constraint standby_requests_terms_accepted check (standby_terms_accepted),
  constraint standby_requests_status check (status in ('submitted', 'reviewing', 'withdrawn', 'declined', 'closed'))
);

create table public.standby_request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.standby_requests (id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by uuid references auth.users (id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  constraint request_history_new_status check (new_status in ('submitted', 'reviewing', 'withdrawn', 'declined', 'closed')),
  constraint request_history_previous_status check (
    previous_status is null or previous_status in ('submitted', 'reviewing', 'withdrawn', 'declined', 'closed')
  ),
  constraint request_history_note_length check (change_note is null or char_length(change_note) <= 500)
);

create index flights_route_departure_idx on public.flights (origin_iata, destination_iata, departure_at);
create index flights_airline_departure_idx on public.flights (airline_id, departure_at);
create index inventory_snapshots_latest_idx on public.flight_inventory_snapshots (flight_id, observed_at desc);
create index standby_requests_customer_created_idx on public.standby_requests (customer_id, created_at desc);
create index standby_requests_flight_status_idx on public.standby_requests (flight_id, status);
create index request_history_request_created_idx on public.standby_request_status_history (request_id, created_at);

comment on table public.flights is 'Demo rows are illustrative. Authorized rows may only be written by trusted server-side inventory ingestion after airline authorization is verified.';
comment on column public.flights.inventory_mode is 'demo rows must never be represented as live availability or confirmed seats.';
comment on table public.flight_inventory_snapshots is 'Observed or illustrative inventory snapshots; a snapshot is never a confirmed seat or ticket.';
comment on column public.flight_inventory_snapshots.reported_seat_count is 'Indicative reported count only; not a seat confirmation.';
comment on table public.standby_requests is 'Customer standby requests only. This table does not represent bookings or tickets.';
