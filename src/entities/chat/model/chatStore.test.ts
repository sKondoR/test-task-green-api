import { describe, expect, it } from 'vitest'
import { ensureChat } from './chatStore'

describe('ensureChat', () => {
  it('создаёт чат с именем или, если его нет, с заглушкой', () => {
    expect(ensureChat({}, '1', 'Даша', 10)['1']).toEqual({
      id: '1',
      name: 'Даша',
      unreadCount: 0,
      createdAt: 10,
    })
    expect(ensureChat({}, '1', undefined, 10)['1'].name).toBe('1')
    expect(ensureChat({}, '79991234567@c.us', undefined, 10)['79991234567@c.us'].name).toBe(
      '+7 999 123-45-67',
    )
  })

  it('переименовывает чат-заглушку, когда приходит настоящее имя', () => {
    const chats = ensureChat({}, '1', undefined, 10)
    expect(ensureChat(chats, '1', 'Даша', 20)['1'].name).toBe('Даша')

    const byPhone = ensureChat({}, '79991234567@c.us', undefined, 10)
    expect(ensureChat(byPhone, '79991234567@c.us', 'Даша', 20)['79991234567@c.us'].name).toBe(
      'Даша',
    )
  })

  it('переименовывает старую заглушку, равную chatId', () => {
    const legacy = {
      '79991234567@c.us': {
        id: '79991234567@c.us',
        name: '79991234567@c.us',
        unreadCount: 0,
        createdAt: 10,
      },
    }
    expect(ensureChat(legacy, '79991234567@c.us', 'Даша', 20)['79991234567@c.us'].name).toBe('Даша')
  })

  it('не трогает уже названный чат', () => {
    const chats = ensureChat({}, '1', 'Даша', 10)
    expect(ensureChat(chats, '1', 'Дарья', 20)).toBe(chats)
  })
})
