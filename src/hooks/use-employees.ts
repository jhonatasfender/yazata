import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClerkSupabaseClient, type EmployeeRow } from '../lib/supabase'

type UseEmployeesOptions = {
  enabled: boolean
  managerId?: string
}

type InviteEmployeeInput = {
  email: string
  hourlyRateCents: number
}

export const useEmployees = ({ enabled, managerId }: UseEmployeesOptions) => {
  const { getToken } = useAuth()
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])

  const loadEmployees = useCallback(async () => {
    if (!enabled || !managerId) return

    setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('employees')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      setLoading(false)
      return
    }

    setEmployees((data ?? []) as EmployeeRow[])
    setLoading(false)
  }, [enabled, managerId, supabase])

  const inviteEmployee = useCallback(
    async ({ email, hourlyRateCents }: InviteEmployeeInput) => {
      if (!managerId) return false

      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail) {
        setError('Informe um e-mail válido.')
        return false
      }

      setError(null)
      setLoading(true)

      const { error: insertError } = await supabase.from('employees').upsert(
        {
          manager_id: managerId,
          employee_email: normalizedEmail,
          employee_clerk_user_id: null,
          hourly_rate_cents: hourlyRateCents,
          status: 'pending',
        },
        {
          onConflict: 'manager_id,employee_email',
        },
      )

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return false
      }

      await loadEmployees()
      return true
    },
    [loadEmployees, managerId, supabase],
  )

  const updateHourlyRate = useCallback(
    async (employeeId: string, hourlyRateCents: number) => {
      if (!managerId) return false

      setError(null)
      setLoading(true)

      const { error: updateError } = await supabase
        .from('employees')
        .update({
          hourly_rate_cents: hourlyRateCents,
        })
        .eq('id', employeeId)
        .eq('manager_id', managerId)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return false
      }

      await loadEmployees()
      return true
    },
    [loadEmployees, managerId, supabase],
  )

  useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  return {
    employees,
    loading,
    error,
    inviteEmployee,
    updateHourlyRate,
    reloadEmployees: loadEmployees,
  }
}
