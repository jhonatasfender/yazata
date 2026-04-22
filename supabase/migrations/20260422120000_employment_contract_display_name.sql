alter table public.employment_contracts
  add column if not exists employee_display_name text;

comment on column public.employment_contracts.employee_display_name is
  'Optional display name set by the manager; shown in team lists and summaries.';
