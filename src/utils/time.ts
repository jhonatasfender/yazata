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
