import { describe, expect, it } from 'vitest'
import type { Message } from '../model/types'
import {
  confirmMessage,
  restoreMessages,
  setMessageStatus,
  upsertMessage,
  withDaySeparators,
} from './messageList'

const message = (id: string, timestamp: number, patch: Partial<Message> = {}): Message => ({
  id,
  chatId: 'c1',
  text: id,
  timestamp,
  direction: 'incoming',
  status: 'sent',
  ...patch,
})

describe('upsertMessage', () => {
  it('вставляет сообщение по времени', () => {
    const list = [message('a', 1), message('c', 3)]
    expect(upsertMessage(list, message('b', 2)).map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('не дублирует сообщение с тем же id', () => {
    const list = [message('a', 1)]
    expect(upsertMessage(list, message('a', 1))).toBe(list)
  })
})

describe('confirmMessage', () => {
  it('заменяет временный id настоящим и помечает как отправленное', () => {
    const list = [message('tmp', 1, { text: 'привет', direction: 'outgoing', status: 'sending' })]
    expect(confirmMessage(list, 'tmp', 'real')).toEqual([
      message('real', 1, { text: 'привет', direction: 'outgoing', status: 'sent' }),
    ])
  })

  it('удаляет временную копию, если уведомление пришло раньше ответа', () => {
    const list = [
      message('tmp', 1, { direction: 'outgoing', status: 'sending' }),
      message('real', 1, { direction: 'outgoing' }),
    ]
    expect(confirmMessage(list, 'tmp', 'real').map((item) => item.id)).toEqual(['real'])
  })
})

describe('setMessageStatus', () => {
  it('меняет статус только у сообщения с нужным id', () => {
    const list = [message('a', 1), message('b', 2, { status: 'sending' })]
    expect(setMessageStatus(list, 'b', 'error').map((item) => item.status)).toEqual([
      'sent',
      'error',
    ])
  })
})

describe('restoreMessages', () => {
  it('прерванную отправку показывает как ошибку, остальное не трогает', () => {
    const sent = message('a', 1)
    const failed = message('c', 3, { status: 'error' })
    const restored = restoreMessages({
      c1: [sent, message('b', 2, { status: 'sending' }), failed],
      c2: [],
    })
    expect(restored.c1.map((item) => item.status)).toEqual(['sent', 'error', 'error'])
    expect(restored.c1[0]).toBe(sent)
    expect(restored.c1[2]).toBe(failed)
    expect(restored.c2).toEqual([])
  })
})

describe('withDaySeparators', () => {
  it('ставит разделитель перед первым сообщением каждого дня', () => {
    const day1 = new Date(2026, 8, 21, 10).getTime()
    const day2 = new Date(2026, 8, 22, 10).getTime()
    const kinds = withDaySeparators([
      message('a', day1),
      message('b', day1 + 1000),
      message('c', day2),
    ]).map((item) => (item.kind === 'day' ? 'day' : item.message.id))
    expect(kinds).toEqual(['day', 'a', 'b', 'day', 'c'])
  })
})
