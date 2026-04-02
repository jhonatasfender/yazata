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

export const formatWorkedTime = (workedHours: number) => {
  const totalSeconds = Math.max(0, Math.round(workedHours * 3600))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    if (minutes > 0) return `${hours}h ${minutes}m`
    return `${hours}h`
  }
  if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  return `${seconds}s`
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
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    if (minutes > 0 && seconds > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${hours}h ${minutes}m`
    if (seconds > 0) return `${hours}h ${seconds}s`
    return `${hours}h`
  }
  if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  return `${seconds}s`
}

export const formatHoursAndMinutes = (workedHours: number) => {
  const totalMinutes = Math.max(0, Math.round(workedHours * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}
