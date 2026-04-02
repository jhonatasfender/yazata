create or replace function public.current_clerk_user_id()
returns text
language sql
stable
as $$
  select coalesce(nullif(auth.jwt() ->> 'sub', ''), '');
$$;

create or replace function public.normalize_tax_id(p_tax_id text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(p_tax_id, ''), '\D', '', 'g');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  primary_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create table public.company_tax_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  tax_id text not null,
  tax_country text not null default 'BR',
  tax_type text not null default 'CNPJ',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger company_tax_profiles_set_updated_at
before update on public.company_tax_profiles
for each row execute function public.set_updated_at();

create unique index company_tax_profiles_company_tax_digits_key
  on public.company_tax_profiles (company_id, (public.normalize_tax_id(tax_id)));

create unique index company_tax_profiles_one_primary_per_company
  on public.company_tax_profiles (company_id)
  where is_primary;

create table public.manager_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create table public.employment_contracts (
  id uuid primary key default gen_random_uuid(),
  manager_profile_id uuid not null references public.manager_profiles (id) on delete cascade,
  company_tax_profile_id uuid references public.company_tax_profiles (id) on delete set null,
  employee_user_id uuid references public.users (id) on delete set null,
  employee_email text not null,
  hourly_rate_cents bigint not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'inactive')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint employment_contracts_status_user_consistency check (
    (status = 'pending' and employee_user_id is null)
    or (status in ('active', 'inactive') and employee_user_id is not null)
  )
);

create index employment_contracts_manager_profile_id_idx
  on public.employment_contracts (manager_profile_id);
create index employment_contracts_employee_user_id_idx
  on public.employment_contracts (employee_user_id)
  where employee_user_id is not null;
create index employment_contracts_company_tax_profile_id_idx
  on public.employment_contracts (company_tax_profile_id)
  where company_tax_profile_id is not null;

create unique index employment_contracts_one_pending_per_manager_email
  on public.employment_contracts (manager_profile_id, lower(btrim(employee_email)))
  where status = 'pending';

create unique index employment_contracts_one_active_per_manager_user
  on public.employment_contracts (manager_profile_id, employee_user_id)
  where status = 'active' and employee_user_id is not null;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by_contract_id uuid references public.employment_contracts (id) on delete set null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index projects_company_id_idx on public.projects (company_id);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  employment_contract_id uuid not null references public.employment_contracts (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  worked_hours numeric not null,
  hourly_rate_cents_snapshot bigint not null,
  gross_amount_cents bigint not null,
  description text,
  created_at timestamptz not null default now()
);

create index time_entries_contract_id_idx on public.time_entries (employment_contract_id);
create index time_entries_project_id_idx on public.time_entries (project_id);

create or replace function public.enforce_employment_contract_tax_company()
returns trigger
language plpgsql
as $$
declare
  v_manager_company uuid;
  v_tax_company uuid;
begin
  if new.company_tax_profile_id is null then
    return new;
  end if;

  select mp.company_id into v_manager_company
  from public.manager_profiles mp
  where mp.id = new.manager_profile_id;

  select ctp.company_id into v_tax_company
  from public.company_tax_profiles ctp
  where ctp.id = new.company_tax_profile_id;

  if v_manager_company is null or v_tax_company is null then
    raise exception 'Invalid manager profile or tax profile reference';
  end if;

  if v_manager_company <> v_tax_company then
    raise exception 'company_tax_profile must belong to the same company as the manager profile';
  end if;

  return new;
end;
$$;

create trigger employment_contracts_tax_company_check
before insert or update of company_tax_profile_id, manager_profile_id
on public.employment_contracts
for each row execute function public.enforce_employment_contract_tax_company();

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.company_tax_profiles enable row level security;
alter table public.manager_profiles enable row level security;
alter table public.employment_contracts enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;

create policy users_select_own
  on public.users for select
  using (clerk_user_id = public.current_clerk_user_id());

create policy users_insert_own
  on public.users for insert
  with check (clerk_user_id = public.current_clerk_user_id());

create policy users_update_own
  on public.users for update
  using (clerk_user_id = public.current_clerk_user_id())
  with check (clerk_user_id = public.current_clerk_user_id());

create policy companies_select_visible
  on public.companies for select
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = companies.id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      where mp.company_id = companies.id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy companies_insert_authenticated
  on public.companies for insert
  with check (public.current_clerk_user_id() <> '');

create policy companies_update_manager
  on public.companies for update
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = companies.id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy company_tax_profiles_select_visible
  on public.company_tax_profiles for select
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = company_tax_profiles.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      where mp.company_id = company_tax_profiles.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy company_tax_profiles_insert_manager
  on public.company_tax_profiles for insert
  with check (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = company_tax_profiles.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy company_tax_profiles_update_manager
  on public.company_tax_profiles for update
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = company_tax_profiles.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy company_tax_profiles_delete_manager
  on public.company_tax_profiles for delete
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = company_tax_profiles.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy manager_profiles_select_own_or_team
  on public.manager_profiles for select
  using (
    exists (
      select 1 from public.users u
      where u.id = manager_profiles.user_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      where ec.manager_profile_id = manager_profiles.id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy manager_profiles_insert_own_user
  on public.manager_profiles for insert
  with check (
    exists (
      select 1 from public.users u
      where u.id = manager_profiles.user_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy manager_profiles_update_own
  on public.manager_profiles for update
  using (
    exists (
      select 1 from public.users u
      where u.id = manager_profiles.user_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy employment_contracts_select_as_manager_or_employee
  on public.employment_contracts for select
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.id = employment_contracts.manager_profile_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.users u
      where u.id = employment_contracts.employee_user_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy employment_contracts_insert_manager
  on public.employment_contracts for insert
  with check (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.id = employment_contracts.manager_profile_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy employment_contracts_update_manager
  on public.employment_contracts for update
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.id = employment_contracts.manager_profile_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy employment_contracts_delete_manager
  on public.employment_contracts for delete
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.id = employment_contracts.manager_profile_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_select_company_visible
  on public.projects for select
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      where mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_insert_manager
  on public.projects for insert
  with check (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_insert_active_employee
  on public.projects for insert
  with check (
    exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      where ec.status = 'active'
        and mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_update_manager
  on public.projects for update
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_update_active_employee
  on public.projects for update
  using (
    exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      where ec.status = 'active'
        and mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy projects_delete_manager
  on public.projects for delete
  using (
    exists (
      select 1
      from public.manager_profiles mp
      join public.users u on u.id = mp.user_id
      where mp.company_id = projects.company_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy time_entries_select_via_contract
  on public.time_entries for select
  using (
    exists (
      select 1
      from public.employment_contracts ec
      join public.manager_profiles mp on mp.id = ec.manager_profile_id
      join public.users mu on mu.id = mp.user_id
      where ec.id = time_entries.employment_contract_id
        and mu.clerk_user_id = public.current_clerk_user_id()
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users eu on eu.id = ec.employee_user_id
      where ec.id = time_entries.employment_contract_id
        and eu.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy time_entries_insert_employee
  on public.time_entries for insert
  with check (
    exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      where ec.id = time_entries.employment_contract_id
        and ec.status = 'active'
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy time_entries_update_employee
  on public.time_entries for update
  using (
    exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      where ec.id = time_entries.employment_contract_id
        and ec.status = 'active'
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create policy time_entries_delete_employee
  on public.time_entries for delete
  using (
    exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      where ec.id = time_entries.employment_contract_id
        and ec.status = 'active'
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );

create or replace function public.claim_employee_invite_by_email(
  p_clerk_user_id text,
  p_email text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub text;
  v_norm_email text;
  v_jwt_email text;
  v_user_id uuid;
  v_updated int := 0;
begin
  v_sub := public.current_clerk_user_id();
  if v_sub is null or v_sub = '' then
    raise exception 'Not authenticated';
  end if;

  if p_clerk_user_id is distinct from v_sub then
    raise exception 'clerk_user_id does not match session';
  end if;

  v_norm_email := lower(btrim(p_email));
  if v_norm_email = '' then
    return 0;
  end if;

  v_jwt_email := lower(btrim(coalesce(auth.jwt() ->> 'email', auth.jwt() ->> 'email_address', '')));
  if v_jwt_email <> '' and v_jwt_email is distinct from v_norm_email then
    raise exception 'Email does not match authenticated session';
  end if;

  insert into public.users (clerk_user_id, primary_email)
  values (p_clerk_user_id, v_norm_email)
  on conflict (clerk_user_id) do update
    set primary_email = coalesce(public.users.primary_email, excluded.primary_email),
        updated_at = now();

  select id into v_user_id from public.users where clerk_user_id = p_clerk_user_id;

  update public.employment_contracts ec
  set
    employee_user_id = v_user_id,
    status = 'active',
    starts_at = coalesce(ec.starts_at, now())
  where ec.employee_user_id is null
    and ec.status = 'pending'
    and lower(btrim(ec.employee_email)) = v_norm_email;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

grant execute on function public.claim_employee_invite_by_email(text, text) to authenticated;

create or replace function public.terminate_employment_contract(p_contract_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  if public.current_clerk_user_id() = '' then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.employment_contracts ec
    join public.manager_profiles mp on mp.id = ec.manager_profile_id
    join public.users u on u.id = mp.user_id
    where ec.id = p_contract_id
      and u.clerk_user_id = public.current_clerk_user_id()
  ) then
    raise exception 'Not authorized';
  end if;

  select count(*) into v_count
  from public.time_entries te
  where te.employment_contract_id = p_contract_id;

  if v_count > 0 then
    update public.employment_contracts
    set status = 'inactive', ends_at = coalesce(ends_at, now())
    where id = p_contract_id;
    return jsonb_build_object('result', 'soft_deleted');
  end if;

  delete from public.employment_contracts where id = p_contract_id;
  return jsonb_build_object('result', 'hard_deleted');
end;
$$;

grant execute on function public.terminate_employment_contract(uuid) to authenticated;
