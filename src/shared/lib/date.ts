const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const shortDateWithYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const longDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const longDateWithYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const DAY_MS = 24 * 60 * 60 * 1000

export function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

const isSameYear = (a: number, b: number) => new Date(a).getFullYear() === new Date(b).getFullYear()

/** «14:45» */
export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp)
}

/** Время в списке чатов: сегодня — «14:45», раньше — «23 сент.», в прошлые годы — с годом. */
export function formatChatListTime(timestamp: number, now = Date.now()): string {
  if (isSameDay(timestamp, now)) return formatTime(timestamp)
  return (isSameYear(timestamp, now) ? shortDateFormat : shortDateWithYearFormat).format(timestamp)
}

/** Разделитель дней в ленте: «Сегодня», «Вчера», «22 сентября». */
export function formatDaySeparator(timestamp: number, now = Date.now()): string {
  if (isSameDay(timestamp, now)) return 'Сегодня'
  if (isSameDay(timestamp, now - DAY_MS)) return 'Вчера'
  return (isSameYear(timestamp, now) ? longDateFormat : longDateWithYearFormat).format(timestamp)
}
