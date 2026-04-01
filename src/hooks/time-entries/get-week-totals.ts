import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'

const isWithinLastWeek = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  return date >= sevenDaysAgo && date <= now
}

export const getTotalWeekHours = (entries: TimeEntryViewRow[]) =>
  entries
    .filter((entry) => isWithinLastWeek(entry.work_date))
    .reduce((sum, entry) => sum + entry.worked_hours, 0)

export const getTotalWeekAmountCents = (entries: TimeEntryViewRow[]) =>
  entries
    .filter((entry) => isWithinLastWeek(entry.work_date))
    .reduce((sum, entry) => sum + entry.gross_amount_cents, 0)
