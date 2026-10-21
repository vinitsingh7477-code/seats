-- Enable row-level security on every table in this client-facing schema and on the private role table.
alter table public.profiles enable row level security;
alter table public.airports enable row level security;
alter table public.airlines enable row level security;
alter table public.flights enable row level security;
alter table public.flight_inventory_snapshots enable row level security;
alter table public.standby_requests enable row level security;
alter table public.standby_request_status_history enable row level security;

-- API grants are intentionally narrow; RLS then scopes rows to the caller.
revoke all on table public.profiles, public.airports, public.airlines, public.flights,
  public.flight_inventory_snapshots, public.standby_requests,
  public.standby_request_status_history from public, anon, authenticated;

grant select on table public.airports, public.airlines, public.flights,
  public.flight_inventory_snapshots to anon, authenticated;
grant select on table public.profiles, public.standby_requests,
  public.standby_request_status_history to authenticated;
grant update (display_name, phone) on table public.profiles to authenticated;

create policy airports_public_read on public.airports
  for select to anon, authenticated using (true);
create policy airlines_public_read on public.airlines
  for select to anon, authenticated using (true);
create policy flights_demo_or_authorized_read on public.flights
  for select to anon, authenticated using (
    inventory_mode = 'demo'
    or (
      auth.uid() is not null
      and inventory_mode = 'authorized'
      and authorization_verified_at is not null
      and is_active
    )
  );
create policy inventory_snapshots_demo_or_authorized_read on public.flight_inventory_snapshots
  for select to anon, authenticated using (
    inventory_mode = 'demo'
    or (
      auth.uid() is not null
      and inventory_mode = 'authorized'
      and exists (
        select 1 from public.flights f
        where f.id = flight_id
          and f.inventory_mode = 'authorized'
          and f.authorization_verified_at is not null
          and f.is_active
      )
    )
  );
create policy profiles_read_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy standby_requests_read_own_or_admin on public.standby_requests
  for select to authenticated using (customer_id = auth.uid() or private.is_admin());
create policy standby_request_history_read_own_or_admin on public.standby_request_status_history
  for select to authenticated using (
    exists (
      select 1 from public.standby_requests r
      where r.id = request_id
        and (r.customer_id = auth.uid() or private.is_admin())
    )
  );

-- No client INSERT/UPDATE/DELETE policy exists for airlines, flights, or inventory snapshots.
-- Requests are created/changed only via the validated security-definer RPCs in the previous migration.
-- The seed contains one fictional airline/flight/snapshot; it is never an authorized offer.
insert into public.airports (iata_code, name, city, country_code)
values
  ('IDR', 'Devi Ahilya Bai Holkar Airport', 'Indore', 'IN'),
  ('DEL', 'Indira Gandhi International Airport', 'Delhi', 'IN')
on conflict (iata_code) do nothing;

insert into public.airlines (id, airline_code, display_name)
values ('00000000-0000-4000-8000-000000000001', 'SD', 'SEATS Demo Airline')
on conflict (id) do nothing;

insert into public.flights (
  id, airline_id, origin_iata, destination_iata, flight_number,
  departure_at, arrival_at, inventory_mode, authorization_verified_at,
  authorization_reference, is_active
)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'IDR', 'DEL', 'SD-DEMO-001',
  date_trunc('day', now()) + interval '1 day 08 hours 10 minutes',
  date_trunc('day', now()) + interval '1 day 09 hours 45 minutes',
  'demo', null, null, true
)
on conflict (id) do nothing;

insert into public.flight_inventory_snapshots (
  id, flight_id, inventory_mode, source_type, source_reference,
  reported_seat_count, indicative_fare, currency_code, observed_at
)
values (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000002',
  'demo', 'demo', null, 3, 2499.00, 'INR', now()
)
on conflict (id) do nothing;
