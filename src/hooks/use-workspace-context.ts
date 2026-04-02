import { useAuth, useUser } from '@clerk/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  createClerkSupabaseClient,
  type EmployeeRow,
  type ManagerRow,
} from '../lib/supabase'
import { WorkspaceRepository } from '../repositories/workspace-repository'

const SELECTED_MANAGER_PROFILE_KEY = 'tracker.selected-manager-profile-id'
const ACTIVE_WORKSPACE_CONTEXT_KEY = 'tracker.active-workspace-context'

export type ActiveWorkspaceContext = 'employee' | 'manager'

type WorkspaceContextState = {
  loading: boolean
  error: string | null
  manager: ManagerRow | null
  managers: ManagerRow[]
  selectedManagerProfileId: string | null
  setSelectedManagerProfileId: (id: string) => void
  employee: EmployeeRow | null
  activeWorkspaceContext: ActiveWorkspaceContext
  setActiveWorkspaceContext: (context: ActiveWorkspaceContext) => void
  refresh: () => Promise<void>
}

export const useWorkspaceContext = (enabled: boolean): WorkspaceContextState => {
  const { getToken } = useAuth()
  const { user, isLoaded: userLoaded } = useUser()
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new WorkspaceRepository(supabase), [supabase])

  const [loading, setLoading] = useState(() => Boolean(enabled))
  const [error, setError] = useState<string | null>(null)
  const [managers, setManagers] = useState<ManagerRow[]>([])
  const [selectedManagerProfileId, setSelectedManagerProfileIdState] = useState<
    string | null
  >(null)
  const [employee, setEmployee] = useState<EmployeeRow | null>(null)
  const [activeWorkspaceContext, setActiveWorkspaceContextState] =
    useState<ActiveWorkspaceContext>('employee')

  const setSelectedManagerProfileId = useCallback((id: string) => {
    setSelectedManagerProfileIdState(id)
    window.localStorage.setItem(SELECTED_MANAGER_PROFILE_KEY, id)
  }, [])

  const setActiveWorkspaceContext = useCallback((context: ActiveWorkspaceContext) => {
    setActiveWorkspaceContextState(context)
    window.localStorage.setItem(ACTIVE_WORKSPACE_CONTEXT_KEY, context)
  }, [])

  const userRef = useRef(user)

  useLayoutEffect(() => {
    userRef.current = user
  }, [user])

  const refresh = useCallback(async () => {
    if (!enabled) return
    const currentUser = userRef.current
    if (!currentUser) return

    setLoading(true)
    setError(null)

    const clerkUserId = currentUser.id
    const email = currentUser.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null
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
          void 0
        }
      }

      const candidateEmails = Array.from(
        new Set(
          [
            normalizedEmail,
            jwtEmailClaim,
            jwtEmailAddressClaim,
            ...(currentUser.emailAddresses ?? []).map((item) =>
              item.emailAddress.toLowerCase().trim(),
            ),
          ].filter((item): item is string => Boolean(item)),
        ),
      )

      await repository.ensureUserRow({
        clerkUserId,
        primaryEmail: normalizedEmail,
      })

      for (const candidateEmail of candidateEmails) {
        const claimedRows = await repository.claimEmployeeInvite({
          clerkUserId,
          email: candidateEmail,
        })

        if (claimedRows > 0) break
      }

      const employeeData = await repository.findEmployeeByClerkUserId(clerkUserId)
      const managersList = await repository.listManagerProfilesByClerkUserId(clerkUserId)

      setManagers(managersList)
      setEmployee(employeeData)

      const storedId = window.localStorage.getItem(SELECTED_MANAGER_PROFILE_KEY)
      const storedValid =
        storedId && managersList.some((entry) => entry.id === storedId) ? storedId : null
      const nextSelected = storedValid ?? managersList[0]?.id ?? null

      if (nextSelected) {
        window.localStorage.setItem(SELECTED_MANAGER_PROFILE_KEY, nextSelected)
        setSelectedManagerProfileIdState(nextSelected)
      } else {
        window.localStorage.removeItem(SELECTED_MANAGER_PROFILE_KEY)
        setSelectedManagerProfileIdState(null)
      }

      const storedContext = window.localStorage.getItem(ACTIVE_WORKSPACE_CONTEXT_KEY)
      let nextContext: ActiveWorkspaceContext = 'employee'

      if (!employeeData && managersList.length > 0) {
        nextContext = 'manager'
      } else if (employeeData && managersList.length === 0) {
        nextContext = 'employee'
      } else if (employeeData && managersList.length > 0) {
        if (storedContext === 'manager' || storedContext === 'employee') {
          nextContext = storedContext
        } else {
          nextContext = 'employee'
        }
      }

      window.localStorage.setItem(ACTIVE_WORKSPACE_CONTEXT_KEY, nextContext)
      setActiveWorkspaceContextState(nextContext)

      setLoading(false)
    } catch (loadError) {
      setError((loadError as Error).message)
      setLoading(false)
    }
  }, [enabled, getToken, repository])

  const clerkUserIdForEffect = user?.id ?? null

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setManagers([])
      setSelectedManagerProfileIdState(null)
      setEmployee(null)
      setActiveWorkspaceContextState('employee')
      return
    }

    if (!userLoaded) {
      setLoading(true)
      return
    }

    if (!clerkUserIdForEffect) {
      setLoading(false)
      setManagers([])
      setSelectedManagerProfileIdState(null)
      setEmployee(null)
      setActiveWorkspaceContextState('employee')
      return
    }

    void refresh()
  }, [enabled, refresh, clerkUserIdForEffect, userLoaded])

  const manager = useMemo(() => {
    if (managers.length === 0) return null
    const id = selectedManagerProfileId ?? managers[0].id
    return managers.find((entry) => entry.id === id) ?? managers[0]
  }, [managers, selectedManagerProfileId])

  return {
    loading,
    error,
    manager,
    managers,
    selectedManagerProfileId,
    setSelectedManagerProfileId,
    employee,
    activeWorkspaceContext,
    setActiveWorkspaceContext,
    refresh,
  }
}
