import { formatDurationBetweenTimes } from '../../../utils/time'
import type { RegisterEntry } from '../register-types'
import { formatClockTime } from './format-clock-time'

type ActiveContext = {
  activeEntryId: string | null
  activeEntryElapsedLabel: string | null
}

export const getRegisterEntryRowLabels = (entry: RegisterEntry, ctx: ActiveContext) => {
  const isActive = entry.id === ctx.activeEntryId
  const durationLabel =
    isActive && ctx.activeEntryElapsedLabel
      ? ctx.activeEntryElapsedLabel
      : formatDurationBetweenTimes(entry.start_time, entry.end_time, entry.worked_hours)
  const timeRangeLabel = isActive
    ? `${formatClockTime(entry.start_time)} - Em execucao`
    : `${formatClockTime(entry.start_time)} - ${formatClockTime(entry.end_time)}`
  return { durationLabel, timeRangeLabel }
}
