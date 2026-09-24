import { describe, expect, it } from 'vitest'
import { toTextMessageEvent } from './textMessageEvent'
import type { NotificationBody } from './types'

const incoming: NotificationBody = {
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1_758_700_000,
  idMessage: 'm1',
  senderData: { chatId: '10000000', sender: '10000000', senderName: 'Даша', chatName: 'Даша' },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
}

describe('toTextMessageEvent', () => {
  it('разбирает входящее текстовое сообщение', () => {
    expect(toTextMessageEvent(incoming)).toEqual({
      idMessage: 'm1',
      chatId: '10000000',
      text: 'Привет',
      timestamp: 1_758_700_000_000,
      direction: 'incoming',
      contactName: 'Даша',
    })
  })

  it('разбирает extendedTextMessage', () => {
    const event = toTextMessageEvent({
      ...incoming,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'ссылка' },
      },
    })
    expect(event?.text).toBe('ссылка')
  })

  it('для исходящих берёт имя собеседника из chatName, а не senderName', () => {
    const event = toTextMessageEvent({
      ...incoming,
      typeWebhook: 'outgoingAPIMessageReceived',
      senderData: { chatId: '10000000', senderName: 'Я', chatName: 'Даша' },
    })
    expect(event).toMatchObject({ direction: 'outgoing', contactName: 'Даша' })
  })

  it('игнорирует нетекстовые сообщения и служебные уведомления', () => {
    expect(
      toTextMessageEvent({ ...incoming, messageData: { typeMessage: 'imageMessage' } }),
    ).toBeNull()
    expect(toTextMessageEvent({ typeWebhook: 'stateInstanceChanged' })).toBeNull()
    expect(toTextMessageEvent({ ...incoming, typeWebhook: 'outgoingMessageStatus' })).toBeNull()
  })
})
