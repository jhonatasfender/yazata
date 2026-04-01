import { useAuth, useUser } from '@clerk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createClerkSupabaseClient,
  type EmployeeRow,
  type ManagerRow,
} from '../lib/supabase'
import { WorkspaceRepository } from '../repositories/workspace-repository'

type WorkspaceContextState = {
  loading: boolean
  error: string | null
  manager: ManagerRow | null
  employee: EmployeeRow | null
  refresh: () => Promise<void>
}

export const useWorkspaceContext = (enabled: boolean): WorkspaceContextState => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new WorkspaceRepository(supabase), [supabase])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manager, setManager] = useState<ManagerRow | null>(null)
  const [employee, setEmployee] = useState<EmployeeRow | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !user) return

    setLoading(true)
    setError(null)

    const clerkUserId = user.id
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null

    try {
      if (email) {
        await repository.claimEmployeeInvite({ clerkUserId, email })
      }

      const employeeData = await repository.findEmployeeByClerkUserId(clerkUserId)
      const managerData = await repository.findManagerByClerkUserId(clerkUserId)

      let managedEmployeesCount = 0
      if (managerData) {
        managedEmployeesCount = await repository.countManagedEmployees(managerData.id)
      }

      const isActiveManager =
        Boolean(managerData) &&
        (managedEmployeesCount > 0 || Boolean(managerData?.company_name))

      const managerToApply = isActiveManager ? managerData : null
      setManager(managerToApply)
      setEmployee(employeeData)
      setLoading(false)
    } catch (loadError) {
      setError((loadError as Error).message)
      setLoading(false)
    }
  }, [enabled, repository, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    loading,
    error,
    manager,
    employee,
    refresh,
  }
}
