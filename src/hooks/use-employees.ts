import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClerkSupabaseClient } from '../lib/supabase'
import {
  EmployeesRepository,
  type ManagedEmployee,
  type TerminateEmployeeResult,
} from '../repositories/employees-repository'

type UseEmployeesOptions = {
  enabled: boolean
  managerId?: string
}

type InviteEmployeeInput = {
  email: string
  hourlyRateCents: number
  employeeDisplayName?: string
}

export const useEmployees = ({ enabled, managerId }: UseEmployeesOptions) => {
  const { getToken } = useAuth()
  const [employees, setEmployees] = useState<ManagedEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new EmployeesRepository(supabase), [supabase])

  const loadEmployees = useCallback(async () => {
    if (!enabled || !managerId) return

    setLoading(true)
    setError(null)
    try {
      const employeeRows = await repository.listByManager(managerId)
      setEmployees(employeeRows)
      setLoading(false)
    } catch (loadError) {
      setError((loadError as Error).message)
      setLoading(false)
    }
  }, [enabled, managerId, repository])

  const inviteEmployee = useCallback(
    async ({ email, hourlyRateCents, employeeDisplayName }: InviteEmployeeInput) => {
      if (!managerId) return false

      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail) {
        setError('Informe um e-mail válido.')
        return false
      }

      setError(null)
      setLoading(true)
      try {
        await repository.invite({
          managerProfileId: managerId,
          email: normalizedEmail,
          hourlyRateCents,
          employeeDisplayName: employeeDisplayName ?? null,
        })
        await loadEmployees()
        return true
      } catch (inviteError) {
        setError((inviteError as Error).message)
        setLoading(false)
        return false
      }
    },
    [loadEmployees, managerId, repository],
  )

  const updateHourlyRate = useCallback(
    async (
      contractId: string,
      hourlyRateCents: number,
      employeeDisplayName?: string | null,
    ) => {
      if (!managerId) return false

      setError(null)
      setLoading(true)
      try {
        await repository.updateHourlyRate({
          contractId,
          managerProfileId: managerId,
          hourlyRateCents,
          employeeDisplayName,
        })
        await loadEmployees()
        return true
      } catch (updateError) {
        setError((updateError as Error).message)
        setLoading(false)
        return false
      }
    },
    [loadEmployees, managerId, repository],
  )

  const terminateEmployee = useCallback(
    async (contractId: string): Promise<TerminateEmployeeResult | null> => {
      if (!managerId) return null

      setError(null)
      setLoading(true)
      try {
        const result = await repository.terminateEmployee({ contractId })
        await loadEmployees()
        return result
      } catch (terminateError) {
        setError((terminateError as Error).message)
        setLoading(false)
        return null
      }
    },
    [loadEmployees, managerId, repository],
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
    terminateEmployee,
    reloadEmployees: loadEmployees,
  }
}
