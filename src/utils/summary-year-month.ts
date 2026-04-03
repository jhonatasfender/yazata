export const getCurrentYearMonthLocal = (): string => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export const isWorkDateInYearMonth = (workDate: string, yearMonth: string): boolean =>
  workDate.length >= 7 && workDate.slice(0, 7) === yearMonth

export const formatYearMonthLabel = (yearMonth: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth.trim())
  if (!match) return yearMonth
  const y = Number(match[1])
  const m = Number(match[2])
  if (!y || m < 1 || m > 12) return yearMonth
  const d = new Date(y, m - 1, 1)
  const raw = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    d,
  )
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
