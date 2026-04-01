export const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)

export const toCents = (value: string) => {
  const normalized = value.replace(',', '.').trim()
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Informe um valor/hora válido.')
  }

  return Math.round(parsed * 100)
}

export const centsToInputValue = (cents: number) => (cents / 100).toFixed(2)
