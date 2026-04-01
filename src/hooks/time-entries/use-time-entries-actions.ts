import { useCallback } from 'react'
import type { TimeEntriesRepository } from '../../repositories/time-entries-repository'
import type { CreateTimeEntryInput, UpdateTimeEntryInput } from './types'

type UseTimeEntriesActionsOptions = {
  mode: 'employee' | 'manager'
  employeeId?: string
  hourlyRateCents: number
  repository: TimeEntriesRepository
  reloadEntries: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (message: string | null) => void
}

export const useTimeEntriesActions = ({
  mode,
  employeeId,
  hourlyRateCents,
  repository,
  reloadEntries,
  setLoading,
  setError,
}: UseTimeEntriesActionsOptions) => {
  const createEntry = useCallback(
    async (payload: CreateTimeEntryInput) => {
      if (mode !== 'employee' || !employeeId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.createForEmployee({
          employeeId,
          input: payload,
          hourlyRateCents,
        })
      } catch (timeError) {
        setError((timeError as Error).message)
        setLoading(false)
        return false
      }

      await reloadEntries()
      return true
    },
    [employeeId, hourlyRateCents, mode, reloadEntries, repository, setError, setLoading],
  )

  const updateEntry = useCallback(
    async (id: string, payload: UpdateTimeEntryInput) => {
      if (mode !== 'employee' || !employeeId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.updateForEmployee({
          id,
          employeeId,
          input: payload,
          hourlyRateCents,
        })
      } catch (timeError) {
        setError((timeError as Error).message)
        setLoading(false)
        return false
      }

      await reloadEntries()
      return true
    },
    [employeeId, hourlyRateCents, mode, reloadEntries, repository, setError, setLoading],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      if (mode !== 'employee' || !employeeId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.deleteForEmployee({
          id,
          employeeId,
        })
      } catch (deleteError) {
        setError((deleteError as Error).message)
        setLoading(false)
        return false
      }

      await reloadEntries()
      return true
    },
    [employeeId, mode, reloadEntries, repository, setError, setLoading],
  )

  return {
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
