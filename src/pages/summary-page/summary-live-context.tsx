import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { isPersistedQuickEntryInProgress } from '../../utils/is-quick-entry-in-progress'
import { SummaryLiveContext } from './summary-live-context-shared'
import { summaryLiveReducer, type SummaryLiveState } from './summary-live-reducer'

export type { SummaryLiveAction, SummaryLiveState } from './summary-live-reducer'

const createInitialSummaryLiveState = (): SummaryLiveState => ({ nowMs: Date.now() })

export const SummaryLiveProvider = ({
  entries,
  children,
}: {
  entries: TimeEntryViewRow[]
  children: ReactNode
}) => {
  const [state, dispatch] = useReducer(
    summaryLiveReducer,
    undefined,
    createInitialSummaryLiveState,
  )

  const hasInProgress = useMemo(
    () => entries.some(isPersistedQuickEntryInProgress),
    [entries],
  )

  useEffect(() => {
    if (!hasInProgress) return
    dispatch({ type: 'SYNC', nowMs: Date.now() })
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)
    return () => window.clearInterval(id)
  }, [hasInProgress])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return (
    <SummaryLiveContext.Provider value={value}>{children}</SummaryLiveContext.Provider>
  )
}
