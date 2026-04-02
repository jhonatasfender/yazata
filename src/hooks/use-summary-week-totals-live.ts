import { useMemo } from 'react'
import { useSummaryLiveNow } from '../pages/summary-page/summary-live-hooks'
import type { TimeEntryViewRow } from '../repositories/time-entries-repository'
import { grossCentsFromElapsedMs } from '../utils/money'
import { isPersistedQuickEntryInProgress } from '../utils/is-quick-entry-in-progress'
import { parseWorkDateTimeLocalMs } from '../utils/time'
import { getEntriesWithinLastWeek } from './time-entries/get-week-totals'

export const useSummaryWeekTotalsLive = (entries: TimeEntryViewRow[]) => {
  const nowMs = useSummaryLiveNow()
  const weekEntries = useMemo(() => getEntriesWithinLastWeek(entries), [entries])

  return useMemo(() => {
    let hours = 0
    let cents = 0
    for (const entry of weekEntries) {
      if (isPersistedQuickEntryInProgress(entry)) {
        const startMs = parseWorkDateTimeLocalMs(entry.work_date, entry.start_time)
        if (startMs !== null) {
          const elapsed = Math.max(0, nowMs - startMs)
          hours += elapsed / 3_600_000
          cents += grossCentsFromElapsedMs(elapsed, entry.hourly_rate_cents_snapshot)
        } else {
          hours += entry.worked_hours
          cents += entry.gross_amount_cents
        }
      } else {
        hours += entry.worked_hours
        cents += entry.gross_amount_cents
      }
    }
    return { totalWeekHours: hours, totalWeekAmountCents: cents }
  }, [weekEntries, nowMs])
}
