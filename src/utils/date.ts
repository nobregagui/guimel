export function formatDate(value: string | Date, locale = 'pt-BR'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale).format(date)
}
