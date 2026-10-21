-- The browser may ask the database whether its current user has the trusted admin role.
-- The role table itself remains private and writable only by service-role code/migrations.
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;
