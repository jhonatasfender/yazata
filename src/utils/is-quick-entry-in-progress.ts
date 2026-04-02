import { QUICK_ENTRY_IN_PROGRESS_DESCRIPTION } from '../constants/quick-entry'
import { timeStringToTotalSeconds } from './time'

type EntrySlice = {
  description: string | null
  worked_hours: number
  start_time: string
  end_time: string
}

export const isPersistedQuickEntryInProgress = (entry: EntrySlice): boolean => {
  if (entry.description?.trim() !== QUICK_ENTRY_IN_PROGRESS_DESCRIPTION) return false

  const start = timeStringToTotalSeconds(entry.start_time)
  const end = timeStringToTotalSeconds(entry.end_time)
  if (start === null || end === null || end <= start) return false

  const deltaSeconds = end - start
  if (deltaSeconds > 120) return false

  const maxWorkedForPlaceholder = 120 / 3600
  if (entry.worked_hours > maxWorkedForPlaceholder) return false

  return true
}
