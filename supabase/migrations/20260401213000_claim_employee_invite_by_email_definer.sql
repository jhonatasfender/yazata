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
  v_updated integer := 0;
  v_jwt_sub text := coalesce((auth.jwt()->>'sub'), '');
  v_jwt_email text := lower(trim(coalesce((auth.jwt()->>'email'), '')));
  v_input_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_jwt_sub = '' or p_clerk_user_id <> v_jwt_sub then
    return 0;
  end if;

  if v_jwt_email = '' or v_input_email = '' or v_input_email <> v_jwt_email then
    return 0;
  end if;

  update public.employees
     set employee_clerk_user_id = p_clerk_user_id,
         status = 'active'
   where employee_clerk_user_id is null
     and lower(trim(coalesce(employee_email, ''))) = v_jwt_email;

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

revoke all on function public.claim_employee_invite_by_email(text, text) from public;
grant execute on function public.claim_employee_invite_by_email(text, text) to authenticated;
