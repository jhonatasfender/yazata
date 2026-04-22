export type EmployeeLabelFields = {
  employee_email: string
  employee_display_name?: string | null
}

export const employeeDisplayLabel = (
  employee: EmployeeLabelFields | null | undefined,
): string => {
  if (!employee) return '—'
  const name = employee.employee_display_name?.trim()
  if (name) return name
  const email = employee.employee_email.trim()
  if (email) return email
  return '—'
}
