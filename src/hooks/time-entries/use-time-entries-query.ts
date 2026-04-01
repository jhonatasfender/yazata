import { useCallback } from 'react'
import type {
  TimeEntriesRepository,
  TimeEntryViewRow,
} from '../../repositories/time-entries-repository'

type UseTimeEntriesQueryOptions = {
  enabled: boolean
  mode: 'employee' | 'manager'
  employeeId?: string
  managerId?: string
  repository: TimeEntriesRepository
  setEntries: (entries: TimeEntryViewRow[]) => void
  setLoading: (loading: boolean) => void
  setError: (message: string | null) => void
}

export const useTimeEntriesQuery = ({
  enabled,
  mode,
  employeeId,
  managerId,
  repository,
  setEntries,
  setLoading,
  setError,
}: UseTimeEntriesQueryOptions) =>
  useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const rows =
        mode === 'manager'
          ? await repository.listByManager(managerId ?? '')
          : await repository.listByEmployee(employeeId ?? '')

      setEntries(rows)
      setLoading(false)
    } catch (queryError) {
      setError((queryError as Error).message)
      setLoading(false)
    }
  }, [employeeId, enabled, managerId, mode, repository, setEntries, setError, setLoading])
