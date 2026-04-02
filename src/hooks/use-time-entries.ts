import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClerkSupabaseClient } from '../lib/supabase'
import {
  TimeEntriesRepository,
  type TimeEntryViewRow,
} from '../repositories/time-entries-repository'
import {
  getTotalWeekAmountCents,
  getTotalWeekHours,
} from './time-entries/get-week-totals'
import { useTimeEntriesActions } from './time-entries/use-time-entries-actions'
import { useTimeEntriesQuery } from './time-entries/use-time-entries-query'
import type { UseTimeEntriesOptions } from './time-entries/types'

export const useTimeEntries = ({
  enabled,
  mode,
  employmentContractId,
  managerProfileId,
  hourlyRateCents = 0,
}: UseTimeEntriesOptions) => {
  const { getToken } = useAuth()
  const [entries, setEntries] = useState<TimeEntryViewRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new TimeEntriesRepository(supabase), [supabase])
  const setLoadingState = useCallback((next: boolean) => setLoading(next), [])
  const setErrorState = useCallback((message: string | null) => setError(message), [])
  const setEntriesState = useCallback((next: TimeEntryViewRow[]) => setEntries(next), [])

  const loadEntries = useTimeEntriesQuery({
    enabled,
    mode,
    employmentContractId,
    managerProfileId,
    repository,
    setEntries: setEntriesState,
    setLoading: setLoadingState,
    setError: setErrorState,
  })

  const { createEntry, createEntryAndGetId, updateEntry, deleteEntry } =
    useTimeEntriesActions({
      mode,
      employmentContractId,
      hourlyRateCents,
      repository,
      reloadEntries: loadEntries,
      setLoading: setLoadingState,
      setError: setErrorState,
    })

  useEffect(() => {
    if (!enabled) return
    void loadEntries()
  }, [enabled, loadEntries])

  const totalWeekHours = useMemo(() => getTotalWeekHours(entries), [entries])
  const totalWeekAmountCents = useMemo(() => getTotalWeekAmountCents(entries), [entries])

  return {
    entries,
    loading,
    error,
    totalWeekHours,
    totalWeekAmountCents,
    createEntry,
    createEntryAndGetId,
    updateEntry,
    deleteEntry,
    reloadEntries: loadEntries,
  }
}
