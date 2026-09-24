import { describe, expect, it } from 'vitest'
import { formatPhone, normalizePhone, phoneFromChatId, toChatId } from './phone'

describe('normalizePhone', () => {
  it('принимает российские номера в разных записях', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567')
    expect(normalizePhone('89991234567')).toBe('79991234567')
    expect(normalizePhone('9991234567')).toBe('79991234567')
  })

  it('принимает номера других стран', () => {
    expect(normalizePhone('+375 29 123 45 67')).toBe('375291234567')
    expect(normalizePhone('+1 555 123 4567')).toBe('15551234567')
  })

  it('отклоняет то, что не похоже на номер', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('12345')).toBeNull()
    expect(normalizePhone('1234567890123456')).toBeNull()
  })
})

describe('formatPhone', () => {
  it('форматирует российские номера, остальные оставляет цифрами', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67')
    expect(formatPhone('375291234567')).toBe('+375291234567')
  })
})

describe('chatId', () => {
  it('переводит номер в chatId и обратно', () => {
    expect(toChatId('79991234567')).toBe('79991234567@c.us')
    expect(phoneFromChatId('79991234567@c.us')).toBe('79991234567')
    expect(phoneFromChatId('120363000000000000@g.us')).toBeNull()
  })
})
