import { useCallback } from 'react'
import type {
  TimeEntriesRepository,
  TimeEntryViewRow,
} from '../../repositories/time-entries-repository'

type UseTimeEntriesQueryOptions = {
  enabled: boolean
  mode: 'employee' | 'manager'
  employmentContractId?: string
  managerProfileId?: string
  repository: TimeEntriesRepository
  setEntries: (entries: TimeEntryViewRow[]) => void
  setLoading: (loading: boolean) => void
  setError: (message: string | null) => void
}

export const useTimeEntriesQuery = ({
  enabled,
  mode,
  employmentContractId,
  managerProfileId,
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
          ? await repository.listByManagerProfile(managerProfileId ?? '')
          : await repository.listByEmploymentContract(employmentContractId ?? '')

      setEntries(rows)
      setLoading(false)
    } catch (queryError) {
      setError((queryError as Error).message)
      setLoading(false)
    }
  }, [
    employmentContractId,
    enabled,
    managerProfileId,
    mode,
    repository,
    setEntries,
    setError,
    setLoading,
  ])
