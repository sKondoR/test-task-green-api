/**
 * Приводит введённый номер к международному виду из одних цифр, как его ждёт GREEN-API.
 * Российские «8…» и «9…» (10 цифр) дополняются кодом 7. Возвращает null, если номер не похож на телефон.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith('9')) digits = `7${digits}`
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null
}

/** «79991234567» → «+7 999 123-45-67»; номера других стран — «+» и цифры. */
export function formatPhone(digits: string): string {
  const ru = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits)
  if (ru) return `+7 ${ru[1]} ${ru[2]}-${ru[3]}-${ru[4]}`
  return `+${digits}`
}

/** chatId личного чата WhatsApp: «79991234567@c.us». */
export const toChatId = (phone: string): string => `${phone}@c.us`

/** Номер из chatId личного чата или null для групп и прочих chatId. */
export function phoneFromChatId(chatId: string): string | null {
  return /^(\d+)@c\.us$/.exec(chatId)?.[1] ?? null
}
