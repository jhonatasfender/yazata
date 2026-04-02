create or replace function public.user_owns_manager_profile(p_manager_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.manager_profiles mp
    join public.users u on u.id = mp.user_id
    where mp.id = p_manager_profile_id
      and u.clerk_user_id = public.current_clerk_user_id()
  );
$$;

create or replace function public.user_manages_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.manager_profiles mp
    join public.users u on u.id = mp.user_id
    where mp.company_id = p_company_id
      and u.clerk_user_id = public.current_clerk_user_id()
  );
$$;

create or replace function public.user_has_employment_in_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employment_contracts ec
    join public.users u on u.id = ec.employee_user_id
    join public.manager_profiles mp on mp.id = ec.manager_profile_id
    where mp.company_id = p_company_id
      and u.clerk_user_id = public.current_clerk_user_id()
  );
$$;

create or replace function public.user_is_active_employee_of_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employment_contracts ec
    join public.users u on u.id = ec.employee_user_id
    join public.manager_profiles mp on mp.id = ec.manager_profile_id
    where mp.company_id = p_company_id
      and ec.status = 'active'
      and u.clerk_user_id = public.current_clerk_user_id()
  );
$$;

create or replace function public.user_is_employee_under_manager_profile(p_manager_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employment_contracts ec
    join public.users u on u.id = ec.employee_user_id
    where ec.manager_profile_id = p_manager_profile_id
      and u.clerk_user_id = public.current_clerk_user_id()
  );
$$;

grant execute on function public.user_owns_manager_profile(uuid) to authenticated;
grant execute on function public.user_manages_company(uuid) to authenticated;
grant execute on function public.user_has_employment_in_company(uuid) to authenticated;
grant execute on function public.user_is_active_employee_of_company(uuid) to authenticated;
grant execute on function public.user_is_employee_under_manager_profile(uuid) to authenticated;

drop policy if exists companies_select_visible on public.companies;
drop policy if exists companies_update_manager on public.companies;

create policy companies_select_visible
  on public.companies for select
  using (
    public.user_manages_company(companies.id)
    or public.user_has_employment_in_company(companies.id)
  );

create policy companies_update_manager
  on public.companies for update
  using (public.user_manages_company(companies.id));

drop policy if exists company_tax_profiles_select_visible on public.company_tax_profiles;
drop policy if exists company_tax_profiles_insert_manager on public.company_tax_profiles;
drop policy if exists company_tax_profiles_update_manager on public.company_tax_profiles;
drop policy if exists company_tax_profiles_delete_manager on public.company_tax_profiles;

create policy company_tax_profiles_select_visible
  on public.company_tax_profiles for select
  using (
    public.user_manages_company(company_tax_profiles.company_id)
    or public.user_has_employment_in_company(company_tax_profiles.company_id)
  );

create policy company_tax_profiles_insert_manager
  on public.company_tax_profiles for insert
  with check (public.user_manages_company(company_tax_profiles.company_id));

create policy company_tax_profiles_update_manager
  on public.company_tax_profiles for update
  using (public.user_manages_company(company_tax_profiles.company_id));

create policy company_tax_profiles_delete_manager
  on public.company_tax_profiles for delete
  using (public.user_manages_company(company_tax_profiles.company_id));

drop policy if exists manager_profiles_select_own_or_team on public.manager_profiles;

create policy manager_profiles_select_own_or_team
  on public.manager_profiles for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = manager_profiles.user_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
    or public.user_is_employee_under_manager_profile(manager_profiles.id)
  );

drop policy if exists employment_contracts_select_as_manager_or_employee on public.employment_contracts;
drop policy if exists employment_contracts_insert_manager on public.employment_contracts;
drop policy if exists employment_contracts_update_manager on public.employment_contracts;
drop policy if exists employment_contracts_delete_manager on public.employment_contracts;

create policy employment_contracts_select_as_manager_or_employee
  on public.employment_contracts for select
  using (
    public.user_owns_manager_profile(employment_contracts.manager_profile_id)
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
    public.user_owns_manager_profile(employment_contracts.manager_profile_id)
  );

create policy employment_contracts_update_manager
  on public.employment_contracts for update
  using (
    public.user_owns_manager_profile(employment_contracts.manager_profile_id)
  );

create policy employment_contracts_delete_manager
  on public.employment_contracts for delete
  using (
    public.user_owns_manager_profile(employment_contracts.manager_profile_id)
  );

drop policy if exists projects_select_company_visible on public.projects;
drop policy if exists projects_insert_manager on public.projects;
drop policy if exists projects_insert_active_employee on public.projects;
drop policy if exists projects_update_manager on public.projects;
drop policy if exists projects_update_active_employee on public.projects;
drop policy if exists projects_delete_manager on public.projects;

create policy projects_select_company_visible
  on public.projects for select
  using (
    public.user_manages_company(projects.company_id)
    or public.user_has_employment_in_company(projects.company_id)
  );

create policy projects_insert_manager
  on public.projects for insert
  with check (public.user_manages_company(projects.company_id));

create policy projects_insert_active_employee
  on public.projects for insert
  with check (public.user_is_active_employee_of_company(projects.company_id));

create policy projects_update_manager
  on public.projects for update
  using (public.user_manages_company(projects.company_id));

create policy projects_update_active_employee
  on public.projects for update
  using (public.user_is_active_employee_of_company(projects.company_id));

create policy projects_delete_manager
  on public.projects for delete
  using (public.user_manages_company(projects.company_id));

drop policy if exists time_entries_select_via_contract on public.time_entries;

create policy time_entries_select_via_contract
  on public.time_entries for select
  using (
    public.user_owns_manager_profile(
      (
        select ec.manager_profile_id
        from public.employment_contracts ec
        where ec.id = time_entries.employment_contract_id
      )
    )
    or exists (
      select 1
      from public.employment_contracts ec
      join public.users u on u.id = ec.employee_user_id
      where ec.id = time_entries.employment_contract_id
        and u.clerk_user_id = public.current_clerk_user_id()
    )
  );
