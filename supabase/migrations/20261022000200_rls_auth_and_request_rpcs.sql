-- Profile lifecycle and timestamps.
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

create trigger flights_touch_updated_at
before update on public.flights
for each row execute function private.touch_updated_at();

create trigger standby_requests_touch_updated_at
before update on public.standby_requests
for each row execute function private.touch_updated_at();

create or replace function private.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 100), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_profile_created
after insert on auth.users
for each row execute function private.create_profile_for_new_auth_user();

-- Only trusted server-side code can assign roles. This schema is not exposed through PostgREST.
create table private.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null,
  primary key (user_id, role),
  constraint user_roles_allowed_role check (role in ('admin', 'support'))
);

alter table private.user_roles enable row level security;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;
revoke all on table private.user_roles from public, anon, authenticated;
grant select, insert, update, delete on table private.user_roles to service_role;
create policy user_roles_service_role_only on private.user_roles
  for all to service_role using (true) with check (true);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- Append-only request history is written only by this trigger.
create or replace function private.record_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_note text;
begin
  if tg_op = 'INSERT' then
    v_note := 'Standby request submitted. This is not a booking or ticket.';
    insert into public.standby_request_status_history
      (request_id, previous_status, new_status, changed_by, change_note)
    values (new.id, null, new.status, auth.uid(), v_note);
    return new;
  end if;

  if old.status is distinct from new.status then
    v_note := nullif(left(coalesce(current_setting('seats.request_status_note', true), ''), 500), '');
    insert into public.standby_request_status_history
      (request_id, previous_status, new_status, changed_by, change_note)
    values (new.id, old.status, new.status, auth.uid(), v_note);
  end if;
  return new;
end;
$$;

create trigger standby_request_initial_history
after insert on public.standby_requests
for each row execute function private.record_request_status_change();

create trigger standby_request_status_history_append
after update of status on public.standby_requests
for each row execute function private.record_request_status_change();

-- Admin identities are provisioned by trusted server-side code only; no client RPC grants roles.
create or replace function public.submit_standby_request(
  p_flight_id uuid,
  p_traveler_count integer,
  p_standby_terms_accepted boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication is required.';
  end if;
  if p_flight_id is null or p_traveler_count is null or p_traveler_count not between 1 and 6 then
    raise exception using errcode = '22023', message = 'A valid flight and traveler count from 1 to 6 are required.';
  end if;
  if p_standby_terms_accepted is distinct from true then
    raise exception using errcode = '22023', message = 'Standby terms must be accepted.';
  end if;
  if not exists (
    select 1 from public.flights f
    where f.id = p_flight_id
      and f.inventory_mode = 'authorized'
      and f.authorization_verified_at is not null
      and f.is_active
      and f.departure_at > now()
  ) then
    raise exception using errcode = '22023', message = 'This flight is not an eligible airline-authorized standby option.';
  end if;

  insert into public.standby_requests (customer_id, flight_id, traveler_count, standby_terms_accepted)
  values (v_user_id, p_flight_id, p_traveler_count::smallint, true)
  returning id into v_request_id;
  return v_request_id;
end;
$$;

create or replace function public.withdraw_standby_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication is required.';
  end if;
  perform set_config('seats.request_status_note', 'Withdrawn by the customer.', true);
  update public.standby_requests
  set status = 'withdrawn'
  where id = p_request_id
    and customer_id = v_user_id
    and status in ('submitted', 'reviewing');
  if not found then
    raise exception using errcode = 'P0002', message = 'The request was not found or can no longer be withdrawn.';
  end if;
end;
$$;

create or replace function public.admin_transition_standby_request(
  p_request_id uuid,
  p_next_status text,
  p_change_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status text;
  v_note text := nullif(left(btrim(coalesce(p_change_note, '')), 500), '');
begin
  if not private.is_admin() then
    raise exception using errcode = '42501', message = 'Trusted administrator role is required.';
  end if;
  if p_next_status not in ('reviewing', 'declined', 'closed') then
    raise exception using errcode = '22023', message = 'Unsupported request status.';
  end if;

  select status into v_current_status
  from public.standby_requests
  where id = p_request_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Standby request not found.';
  end if;
  if not (
    (v_current_status = 'submitted' and p_next_status in ('reviewing', 'declined', 'closed'))
    or (v_current_status = 'reviewing' and p_next_status in ('declined', 'closed'))
  ) then
    raise exception using errcode = '22023', message = 'Unsupported standby request status transition.';
  end if;

  perform set_config('seats.request_status_note', coalesce(v_note, ''), true);
  update public.standby_requests
  set status = p_next_status
  where id = p_request_id;
end;
$$;

revoke all on function public.submit_standby_request(uuid, integer, boolean) from public, anon;
revoke all on function public.withdraw_standby_request(uuid) from public, anon;
revoke all on function public.admin_transition_standby_request(uuid, text, text) from public, anon;
grant execute on function public.submit_standby_request(uuid, integer, boolean) to authenticated;
grant execute on function public.withdraw_standby_request(uuid) to authenticated;
grant execute on function public.admin_transition_standby_request(uuid, text, text) to authenticated;
