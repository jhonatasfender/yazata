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
    const normalizedEmail = email?.trim() ?? null

    try {
      const supabaseToken = await getToken({ template: 'supabase' })
      let jwtEmailClaim: string | null = null
      let jwtEmailAddressClaim: string | null = null

      if (supabaseToken) {
        try {
          const payloadPart = supabaseToken.split('.')[1]
          if (payloadPart) {
            const payloadJson = JSON.parse(atob(payloadPart)) as Record<string, unknown>
            jwtEmailClaim =
              typeof payloadJson.email === 'string'
                ? payloadJson.email.toLowerCase()
                : null
            jwtEmailAddressClaim =
              typeof payloadJson.email_address === 'string'
                ? payloadJson.email_address.toLowerCase()
                : null
          }
        } catch {
          // Ignore invalid token payload parse.
        }
      }

      const candidateEmails = Array.from(
        new Set(
          [
            normalizedEmail,
            jwtEmailClaim,
            jwtEmailAddressClaim,
            ...(user.emailAddresses ?? []).map((item) =>
              item.emailAddress.toLowerCase().trim(),
            ),
          ].filter((item): item is string => Boolean(item)),
        ),
      )

      for (const candidateEmail of candidateEmails) {
        const claimedRows = await repository.claimEmployeeInvite({
          clerkUserId,
          email: candidateEmail,
        })

        if (claimedRows > 0) break
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
  }, [enabled, getToken, repository, user])

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
