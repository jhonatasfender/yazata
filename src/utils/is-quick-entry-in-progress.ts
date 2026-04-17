import {
  QUICK_ENTRY_IN_PROGRESS_DESCRIPTION,
  QUICK_ENTRY_MIN_FINALIZE_MS,
} from '../constants/quick-entry'
import { timeStringToTotalSeconds } from './time'

/** Segundos máximos entre início e fim no placeholder enquanto o registro rápido não foi salvo (margem acima do mínimo de cronômetro). */
const QUICK_ENTRY_PLACEHOLDER_MAX_DELTA_SECONDS = Math.ceil(
  (QUICK_ENTRY_MIN_FINALIZE_MS + 60_000) / 1000,
)

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
  if (deltaSeconds > QUICK_ENTRY_PLACEHOLDER_MAX_DELTA_SECONDS) return false

  const maxWorkedForPlaceholder = QUICK_ENTRY_PLACEHOLDER_MAX_DELTA_SECONDS / 3600
  if (entry.worked_hours > maxWorkedForPlaceholder) return false

  return true
}
