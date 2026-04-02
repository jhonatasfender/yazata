import { useMemo } from 'react'
import { useSummaryLiveNow } from '../pages/summary-page/summary-live-hooks'
import type { TimeEntryViewRow } from '../repositories/time-entries-repository'
import { isPersistedQuickEntryInProgress } from '../utils/is-quick-entry-in-progress'
import { parseWorkDateTimeLocalMs } from '../utils/time'

export type SummaryInProgressLive =
  | { state: 'idle' }
  | { state: 'running'; elapsedMs: number }
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
  return { state: 'running', elapsedMs: Math.max(0, nowMs - startMs) }
}
