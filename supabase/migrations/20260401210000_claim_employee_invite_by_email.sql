create or replace function public.claim_employee_invite_by_email(
  p_clerk_user_id text,
  p_email text
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated integer := 0;
begin
  update public.employees
     set employee_clerk_user_id = p_clerk_user_id,
         status = 'active'
   where employee_clerk_user_id is null
     and lower(trim(coalesce(employee_email, ''))) =
         lower(trim(coalesce(p_email, '')));

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

grant execute on function public.claim_employee_invite_by_email(text, text) to authenticated;
