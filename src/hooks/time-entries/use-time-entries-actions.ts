import { useCallback } from 'react'
import type { TimeEntriesRepository } from '../../repositories/time-entries-repository'
import type { CreateTimeEntryInput, UpdateTimeEntryInput } from './types'

type UseTimeEntriesActionsOptions = {
  mode: 'employee' | 'manager'
  employmentContractId?: string
  hourlyRateCents: number
  repository: TimeEntriesRepository
  reloadEntries: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (message: string | null) => void
}

export const useTimeEntriesActions = ({
  mode,
  employmentContractId,
  hourlyRateCents,
  repository,
  reloadEntries,
  setLoading,
  setError,
}: UseTimeEntriesActionsOptions) => {
  const createEntry = useCallback(
    async (payload: CreateTimeEntryInput) => {
      if (mode !== 'employee' || !employmentContractId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.createForEmployee({
          employmentContractId,
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
    [
      employmentContractId,
      hourlyRateCents,
      mode,
      reloadEntries,
      repository,
      setError,
      setLoading,
    ],
  )

  const createEntryAndGetId = useCallback(
    async (payload: CreateTimeEntryInput) => {
      if (mode !== 'employee' || !employmentContractId) return null

      setError(null)
      setLoading(true)

      try {
        const entryId = await repository.createForEmployee({
          employmentContractId,
          input: payload,
          hourlyRateCents,
        })
        await reloadEntries()
        return entryId
      } catch (timeError) {
        setError((timeError as Error).message)
        setLoading(false)
        return null
      }
    },
    [
      employmentContractId,
      hourlyRateCents,
      mode,
      reloadEntries,
      repository,
      setError,
      setLoading,
    ],
  )

  const updateEntry = useCallback(
    async (id: string, payload: UpdateTimeEntryInput) => {
      if (mode !== 'employee' || !employmentContractId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.updateForEmployee({
          id,
          employmentContractId,
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
    [
      employmentContractId,
      hourlyRateCents,
      mode,
      reloadEntries,
      repository,
      setError,
      setLoading,
    ],
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      if (mode !== 'employee' || !employmentContractId) return false

      setError(null)
      setLoading(true)

      try {
        await repository.deleteForEmployee({
          id,
          employmentContractId,
        })
      } catch (deleteError) {
        setError((deleteError as Error).message)
        setLoading(false)
        return false
      }

      await reloadEntries()
      return true
    },
    [employmentContractId, mode, reloadEntries, repository, setError, setLoading],
  )

  return {
    createEntry,
    createEntryAndGetId,
    updateEntry,
    deleteEntry,
  }
}
