create or replace function public.set_my_employee_display_name(p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub text;
  v_user_id uuid;
  v_new text;
  v_updated int;
begin
  v_sub := public.current_clerk_user_id();
  if v_sub is null or v_sub = '' then
    raise exception 'É necessário estar autenticado.';
  end if;

  select u.id
  into v_user_id
  from public.users u
  where u.clerk_user_id = v_sub;

  if v_user_id is null then
    raise exception 'Usuário não encontrado.';
  end if;

  v_new := nullif(btrim(p_display_name), '');
  if v_new is not null and char_length(v_new) > 120 then
    raise exception 'O nome pode ter no máximo 120 caracteres.';
  end if;

  update public.employment_contracts ec
  set employee_display_name = v_new
  where ec.id = (
    select e.id
    from public.employment_contracts e
    where e.employee_user_id = v_user_id
      and e.status = 'active'
    order by e.starts_at desc nulls last, e.created_at desc
    limit 1
  );

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Nenhum contrato de trabalho ativo encontrado.';
  end if;
end;
$$;

revoke all on function public.set_my_employee_display_name(text) from public;
grant execute on function public.set_my_employee_display_name(text) to authenticated;

select pg_notify('pgrst', 'reload schema');
