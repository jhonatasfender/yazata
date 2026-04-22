import { useMemo } from 'react'
import { useSummaryLiveNow } from '../pages/summary-page/summary-live-hooks'
import type { TimeEntryViewRow } from '../repositories/time-entries-repository'
import { grossCentsFromElapsedMs } from '../utils/money'
import { isPersistedQuickEntryInProgress } from '../utils/is-quick-entry-in-progress'
import {
  quickEntryElapsedMs,
  readQuickEntryLocalStateForEntry,
} from '../utils/quick-entry-local-state'
import { isWorkDateInYearMonth } from '../utils/summary-year-month'
import { parseWorkDateTimeLocalMs } from '../utils/time'

export type SummaryEmployeeMonthRow = {
  employmentContractId: string
  email: string
  displayName: string | null
  hours: number
  amountCents: number
}

const entryHoursAndCentsLive = (entry: TimeEntryViewRow, nowMs: number) => {
  if (isPersistedQuickEntryInProgress(entry)) {
    const local = readQuickEntryLocalStateForEntry(entry.id, entry.employment_contract_id)
    if (local) {
      const elapsed = quickEntryElapsedMs(local, nowMs)
      return {
        hours: elapsed / 3_600_000,
        cents: grossCentsFromElapsedMs(elapsed, entry.hourly_rate_cents_snapshot),
      }
    }

    const startMs = parseWorkDateTimeLocalMs(entry.work_date, entry.start_time)
    if (startMs !== null) {
      const elapsed = Math.max(0, nowMs - startMs)
      return {
        hours: elapsed / 3_600_000,
        cents: grossCentsFromElapsedMs(elapsed, entry.hourly_rate_cents_snapshot),
      }
    }
  }
  return { hours: entry.worked_hours, cents: entry.gross_amount_cents }
}

export const useSummaryMonthAggregatesLive = (
  entries: TimeEntryViewRow[],
  yearMonth: string,
) => {
  const nowMs = useSummaryLiveNow()

  const monthEntries = useMemo(
    () => entries.filter((e) => isWorkDateInYearMonth(e.work_date, yearMonth)),
    [entries, yearMonth],
  )

  return useMemo(() => {
    let totalHours = 0
    let totalCents = 0
    const byContract = new Map<
      string,
      { email: string; displayName: string | null; hours: number; cents: number }
    >()

    for (const entry of monthEntries) {
      const { hours, cents } = entryHoursAndCentsLive(entry, nowMs)
      totalHours += hours
      totalCents += cents

      const cid = entry.employment_contract_id
      const email =
        entry.employee?.employee_email?.trim() || `Contrato ${cid.slice(0, 8)}…`
      const displayName = entry.employee?.employee_display_name?.trim() || null
      const cur = byContract.get(cid)
      if (cur) {
        cur.hours += hours
        cur.cents += cents
        if (!cur.displayName && displayName) cur.displayName = displayName
      } else {
        byContract.set(cid, { email, displayName, hours, cents })
      }
    }

    const employeeRows: SummaryEmployeeMonthRow[] = [...byContract.entries()]
      .map(([employmentContractId, v]) => ({
        employmentContractId,
        email: v.email,
        displayName: v.displayName,
        hours: v.hours,
        amountCents: v.cents,
      }))
      .sort((a, b) => b.amountCents - a.amountCents)

    return {
      monthEntries,
      totalHours,
      totalAmountCents: totalCents,
      employeeRows,
    }
  }, [monthEntries, nowMs])
}
