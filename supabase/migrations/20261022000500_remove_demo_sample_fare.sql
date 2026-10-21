-- Keep the demo schema compatible with future authorized fares while removing
-- the invented sample amount from every illustrative inventory snapshot.
alter table public.flight_inventory_snapshots
  alter column indicative_fare drop not null;

update public.flight_inventory_snapshots
set indicative_fare = null
where inventory_mode = 'demo'
  and source_type = 'demo';

comment on column public.flight_inventory_snapshots.indicative_fare is
  'Optional indicative fare supplied only by an authorized, verified source. Demo snapshots must not contain a fabricated price.';
