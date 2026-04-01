export const toHours = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startTotal = startHour * 60 + startMinute
  const endTotal = endHour * 60 + endMinute

  if (endTotal <= startTotal) {
    throw new Error('Horário final precisa ser maior que o inicial.')
  }

  return Number(((endTotal - startTotal) / 60).toFixed(2))
}

export const today = () => new Date().toISOString().slice(0, 10)
