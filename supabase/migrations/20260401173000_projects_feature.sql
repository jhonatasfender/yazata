create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.managers(id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  is_active boolean not null default true,
  created_by_employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists projects_manager_name_ci_unique_idx
  on public.projects (manager_id, lower(name));
create index if not exists projects_manager_active_idx
  on public.projects (manager_id, is_active, created_at desc);

alter table public.projects enable row level security;

drop policy if exists "projects_select_workspace_members" on public.projects;
create policy "projects_select_workspace_members"
on public.projects
for select
to authenticated
using (
  exists (
    select 1
    from public.managers m
    where m.id = projects.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or exists (
    select 1
    from public.employees e
    where e.manager_id = projects.manager_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
      and e.status = 'active'
  )
);

drop policy if exists "projects_insert_workspace_members" on public.projects;
create policy "projects_insert_workspace_members"
on public.projects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.managers m
    where m.id = projects.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or exists (
    select 1
    from public.employees e
    where e.id = projects.created_by_employee_id
      and e.manager_id = projects.manager_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
      and e.status = 'active'
  )
);

drop policy if exists "projects_update_workspace_members" on public.projects;
create policy "projects_update_workspace_members"
on public.projects
for update
to authenticated
using (
  exists (
    select 1
    from public.managers m
    where m.id = projects.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or exists (
    select 1
    from public.employees e
    where e.manager_id = projects.manager_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
      and e.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.managers m
    where m.id = projects.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
  or exists (
    select 1
    from public.employees e
    where e.manager_id = projects.manager_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
      and e.status = 'active'
  )
);

alter table public.time_entries
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists time_entries_project_id_idx
  on public.time_entries(project_id);

drop policy if exists "time_entries_employee_insert_own" on public.time_entries;
create policy "time_entries_employee_insert_own"
on public.time_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.employees e
    where e.id = time_entries.employee_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
  )
  and (
    time_entries.project_id is null
    or exists (
      select 1
      from public.projects p
      join public.employees e on e.id = time_entries.employee_id
      where p.id = time_entries.project_id
        and p.manager_id = e.manager_id
    )
  )
);

drop policy if exists "time_entries_employee_update_own" on public.time_entries;
create policy "time_entries_employee_update_own"
on public.time_entries
for update
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = time_entries.employee_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
  )
)
with check (
  exists (
    select 1
    from public.employees e
    where e.id = time_entries.employee_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
  )
  and (
    time_entries.project_id is null
    or exists (
      select 1
      from public.projects p
      join public.employees e on e.id = time_entries.employee_id
      where p.id = time_entries.project_id
        and p.manager_id = e.manager_id
    )
  )
);
