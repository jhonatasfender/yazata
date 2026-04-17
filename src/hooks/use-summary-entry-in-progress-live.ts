import { useMemo } from 'react'
import { useSummaryLiveNow } from '../pages/summary-page/summary-live-hooks'
import type { TimeEntryViewRow } from '../repositories/time-entries-repository'
import { isPersistedQuickEntryInProgress } from '../utils/is-quick-entry-in-progress'
import {
  quickEntryElapsedMs,
  quickEntryPaused,
  readQuickEntryLocalStateForEntry,
} from '../utils/quick-entry-local-state'
import { parseWorkDateTimeLocalMs } from '../utils/time'

export type SummaryInProgressLive =
  | { state: 'idle' }
  | { state: 'running'; elapsedMs: number }
  | { state: 'paused'; elapsedMs: number }
  | { state: 'running-no-parse' }

export const useSummaryEntryInProgressLive = (
  entry: TimeEntryViewRow,
): SummaryInProgressLive => {
  const nowMs = useSummaryLiveNow()
  const inProgress = isPersistedQuickEntryInProgress(entry)
  const startMs = useMemo(() => {
    if (!inProgress) return null
    return parseWorkDateTimeLocalMs(entry.work_date, entry.start_time)
  }, [inProgress, entry.work_date, entry.start_time])

  if (!inProgress) return { state: 'idle' }
  if (startMs === null) return { state: 'running-no-parse' }

  const local = readQuickEntryLocalStateForEntry(entry.id, entry.employment_contract_id)
  if (local) {
    const elapsedMs = quickEntryElapsedMs(local, nowMs)
    return quickEntryPaused(local)
      ? { state: 'paused', elapsedMs }
      : { state: 'running', elapsedMs }
  }

  return { state: 'running', elapsedMs: Math.max(0, nowMs - startMs) }
}
