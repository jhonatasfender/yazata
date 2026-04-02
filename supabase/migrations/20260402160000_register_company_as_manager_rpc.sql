create or replace function public.register_company_as_manager(
  p_legal_name text,
  p_trade_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clerk text;
  v_user_id uuid;
  v_company_id uuid;
  v_mp_id uuid;
  t_legal text;
  t_trade text;
begin
  t_legal := trim(coalesce(p_legal_name, ''));
  if length(t_legal) < 2 then
    raise exception 'Legal name is required';
  end if;

  t_trade := nullif(trim(coalesce(p_trade_name, '')), '');

  v_clerk := coalesce(
    nullif(trim(auth.jwt() ->> 'sub'), ''),
    nullif(trim(auth.jwt() ->> 'user_id'), '')
  );

  if v_clerk is null or length(v_clerk) = 0 then
    raise exception 'Missing subject in JWT';
  end if;

  select u.id into v_user_id
  from public.users u
  where u.clerk_user_id = v_clerk
  limit 1;

  if v_user_id is null then
    raise exception 'User row not found for this session';
  end if;

  insert into public.companies (legal_name, trade_name)
  values (t_legal, t_trade)
  returning id into v_company_id;

  insert into public.manager_profiles (user_id, company_id, settings_json)
  values (v_user_id, v_company_id, '{}'::jsonb)
  returning id into v_mp_id;

  return jsonb_build_object(
    'company_id', v_company_id,
    'manager_profile_id', v_mp_id
  );
end;
$$;

revoke all on function public.register_company_as_manager(text, text) from public;
grant execute on function public.register_company_as_manager(text, text) to authenticated;
