export const toHours = (startTime: string, endTime: string) => {
  const [startHour, startMinute, startSecond] = startTime.split(':').map(Number)
  const [endHour, endMinute, endSecond] = endTime.split(':').map(Number)

  const startTotalSeconds =
    startHour * 3600 + startMinute * 60 + (Number.isNaN(startSecond) ? 0 : startSecond)
  const endTotalSeconds =
    endHour * 3600 + endMinute * 60 + (Number.isNaN(endSecond) ? 0 : endSecond)

  if (endTotalSeconds <= startTotalSeconds) {
    throw new Error('Horário final precisa ser maior que o inicial.')
  }

  return Number(((endTotalSeconds - startTotalSeconds) / 3600).toFixed(4))
}

export const today = () => new Date().toISOString().slice(0, 10)

export const formatWorkDate = (workDate: string) => {
  const parts = workDate.split('-')
  if (parts.length !== 3) return workDate

  const [year, month, day] = parts
  if (!year || !month || !day) return workDate

  return `${day}/${month}/${year.slice(-2)}`
}

/** Human-readable duration from a whole-second total (d/h/m; optional s). */
export const formatDurationFromTotalSeconds = (
  totalSeconds: number,
  options: { includeSeconds: boolean; zeroLabel: string },
): string => {
  const s = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(s / 86_400)
  let rest = s % 86_400
  const hours = Math.floor(rest / 3600)
  rest %= 3600
  const minutes = Math.floor(rest / 60)
  const seconds = rest % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (options.includeSeconds && seconds > 0) parts.push(`${seconds}s`)

  if (parts.length > 0) return parts.join(' ')
  if (seconds > 0) return `${seconds}s`
  return options.zeroLabel
}

export const formatWorkedTime = (workedHours: number) => {
  const totalSeconds = Math.max(0, Math.round(workedHours * 3600))
  return formatDurationFromTotalSeconds(totalSeconds, {
    includeSeconds: true,
    zeroLabel: '0s',
  })
}

export const timeStringToTotalSeconds = (value: string): number | null => {
  const parts = value.trim().split(':')
  if (parts.length < 2 || parts.length > 3) return null

  const [hoursRaw, minutesRaw, secondsRaw] = parts
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)
  const seconds = secondsRaw !== undefined && secondsRaw !== '' ? Number(secondsRaw) : 0

  if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) return null
  return hours * 3600 + minutes * 60 + seconds
}

export const formatDurationBetweenTimes = (
  startTime: string,
  endTime: string,
  fallbackWorkedHours: number,
) => {
  const startSeconds = timeStringToTotalSeconds(startTime)
  const endSeconds = timeStringToTotalSeconds(endTime)

  if (startSeconds === null || endSeconds === null || endSeconds <= startSeconds) {
    return formatWorkedTime(fallbackWorkedHours)
  }

  const totalSeconds = endSeconds - startSeconds
  return formatDurationFromTotalSeconds(totalSeconds, {
    includeSeconds: true,
    zeroLabel: '0s',
  })
}

export const formatHoursAndMinutes = (workedHours: number) => {
  const totalSeconds = Math.max(0, Math.round(workedHours * 3600))
  return formatDurationFromTotalSeconds(totalSeconds, {
    includeSeconds: false,
    zeroLabel: '0m',
  })
}

export const parseWorkDateTimeLocalMs = (
  workDate: string,
  time: string,
): number | null => {
  const date = workDate.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const parts = time.trim().split(':')
  if (parts.length < 2 || parts.length > 3) return null

  const hours = Number(parts[0])
  const minutes = Number(parts[1])
  const seconds = parts.length === 3 && parts[2] !== '' ? Number(parts[2]) : 0
  if ([hours, minutes, seconds].some((n) => Number.isNaN(n))) return null

  const iso = `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const ms = new Date(iso).getTime()
  return Number.isNaN(ms) ? null : ms
}

export const formatElapsedClock = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
