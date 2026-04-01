create extension if not exists "pgcrypto";

create table if not exists public.managers (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  company_name text,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.managers(id) on delete cascade,
  employee_email text not null,
  employee_clerk_user_id text,
  hourly_rate_cents bigint not null default 0 check (hourly_rate_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  unique (manager_id, employee_email),
  unique (manager_id, employee_clerk_user_id)
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  worked_hours numeric(10, 2) not null check (worked_hours > 0),
  hourly_rate_cents_snapshot bigint not null check (hourly_rate_cents_snapshot >= 0),
  gross_amount_cents bigint not null check (gross_amount_cents >= 0),
  description text,
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create index if not exists employees_manager_id_idx on public.employees(manager_id);
create index if not exists employees_employee_clerk_user_id_idx
  on public.employees(employee_clerk_user_id);
create index if not exists employees_email_ci_idx
  on public.employees((lower(employee_email)));
create index if not exists time_entries_employee_id_idx on public.time_entries(employee_id);
create index if not exists time_entries_work_date_idx on public.time_entries(work_date desc);

alter table public.managers enable row level security;
alter table public.employees enable row level security;
alter table public.time_entries enable row level security;

drop policy if exists "managers_select_own" on public.managers;
create policy "managers_select_own"
on public.managers
for select
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "managers_insert_own" on public.managers;
create policy "managers_insert_own"
on public.managers
for insert
to authenticated
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "managers_update_own" on public.managers;
create policy "managers_update_own"
on public.managers
for update
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id)
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "employees_select_own_or_manager" on public.employees;
create policy "employees_select_own_or_manager"
on public.employees
for select
to authenticated
using (
  employee_clerk_user_id = (select auth.jwt()->>'sub')
  or exists (
    select 1
    from public.managers m
    where m.id = employees.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
);

drop policy if exists "employees_manager_insert" on public.employees;
create policy "employees_manager_insert"
on public.employees
for insert
to authenticated
with check (
  exists (
    select 1
    from public.managers m
    where m.id = employees.manager_id
      and m.clerk_user_id = (select auth.jwt()->>'sub')
  )
);

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

drop policy if exists "time_entries_select_own_or_manager" on public.time_entries;
create policy "time_entries_select_own_or_manager"
on public.time_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = time_entries.employee_id
      and (
        e.employee_clerk_user_id = (select auth.jwt()->>'sub')
        or exists (
          select 1
          from public.managers m
          where m.id = e.manager_id
            and m.clerk_user_id = (select auth.jwt()->>'sub')
        )
      )
  )
);

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
);

drop policy if exists "time_entries_employee_delete_own" on public.time_entries;
create policy "time_entries_employee_delete_own"
on public.time_entries
for delete
to authenticated
using (
  exists (
    select 1
    from public.employees e
    where e.id = time_entries.employee_id
      and e.employee_clerk_user_id = (select auth.jwt()->>'sub')
  )
);
