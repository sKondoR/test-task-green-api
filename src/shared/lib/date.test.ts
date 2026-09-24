import { describe, expect, it } from 'vitest'
import { formatChatListTime, formatDaySeparator, formatTime } from './date'

const now = new Date(2026, 8, 24, 15, 0).getTime()

describe('formatTime', () => {
  it('использует 24-часовой формат', () => {
    expect(formatTime(new Date(2026, 8, 24, 14, 5).getTime())).toBe('14:05')
  })
})

describe('formatChatListTime', () => {
  it('сегодня показывает время', () => {
    expect(formatChatListTime(new Date(2026, 8, 24, 9, 30).getTime(), now)).toBe('09:30')
  })

  it('в другие дни показывает дату', () => {
    expect(formatChatListTime(new Date(2026, 8, 23, 9, 30).getTime(), now)).toBe('23 сент.')
  })

  it('в прошлом году добавляет год', () => {
    expect(formatChatListTime(new Date(2025, 0, 2).getTime(), now)).toMatch(/2025/)
  })
})

describe('formatDaySeparator', () => {
  it('подписывает сегодня и вчера словами', () => {
    expect(formatDaySeparator(new Date(2026, 8, 24, 1).getTime(), now)).toBe('Сегодня')
    expect(formatDaySeparator(new Date(2026, 8, 23, 23).getTime(), now)).toBe('Вчера')
  })

  it('остальные дни — числом и месяцем', () => {
    expect(formatDaySeparator(new Date(2026, 8, 21).getTime(), now)).toBe('21 сентября')
  })
})
