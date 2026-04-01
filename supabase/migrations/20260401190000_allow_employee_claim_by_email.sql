drop policy if exists "employees_manager_update" on public.employees;
create policy "employees_manager_update"
on public.employees
for update
to authenticated
using (
  exists (
    select 1
    from public.managers m
    where m.id = employees.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or employee_clerk_user_id = (select auth.jwt()->>'sub')
  or (
    employee_clerk_user_id is null
    and lower(employee_email) = lower(coalesce((select auth.jwt()->>'email'), ''))
  )
)
with check (
  exists (
    select 1
    from public.managers m
    where m.id = employees.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or employee_clerk_user_id = (select auth.jwt()->>'sub')
);
