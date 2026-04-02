export const formatClockTime = (value: string) => {
  const parts = value.split(':')
  if (parts.length < 2) return value

  const [hours, minutes, seconds] = parts
  if (!hours || !minutes) return value

  if (!seconds || seconds === '00') {
    return `${hours}:${minutes}`
  }

  return `${hours}:${minutes}:${seconds}`
}
