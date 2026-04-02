create or replace function public.current_clerk_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(
      trim(
        coalesce(
          nullif(trim(auth.jwt() ->> 'sub'), ''),
          nullif(trim(auth.jwt() ->> 'user_id'), '')
        )
      ),
      ''
    ),
    ''
  );
$$;
