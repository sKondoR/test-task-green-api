import type { NotificationBody } from './types'

export type MessageDirection = 'incoming' | 'outgoing'

export interface TextMessageEvent {
  idMessage: string
  chatId: string
  text: string
  /** Unix-время в миллисекундах. */
  timestamp: number
  direction: MessageDirection
  /** Имя собеседника, если его удалось определить. */
  contactName?: string
}

const DIRECTION_BY_WEBHOOK: Record<string, MessageDirection> = {
  incomingMessageReceived: 'incoming',
  outgoingMessageReceived: 'outgoing',
  outgoingAPIMessageReceived: 'outgoing',
}

function extractText(body: NotificationBody): string | undefined {
  const data = body.messageData
  if (!data) return undefined
  if (data.typeMessage === 'textMessage') return data.textMessageData?.textMessage
  if (data.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text
  return undefined
}

/** Достаёт текстовое сообщение из уведомления; для всего остального — null. */
export function toTextMessageEvent(body: NotificationBody): TextMessageEvent | null {
  const direction = DIRECTION_BY_WEBHOOK[body.typeWebhook]
  const chatId = body.senderData?.chatId
  const text = extractText(body)
  if (!direction || !chatId || !body.idMessage || text === undefined) return null

  // В исходящих senderName — это мы сами, поэтому имя собеседника берём из chatName.
  const contactName =
    direction === 'incoming'
      ? body.senderData?.senderName || body.senderData?.chatName
      : body.senderData?.chatName

  return {
    idMessage: body.idMessage,
    chatId,
    text,
    timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
    direction,
    contactName: contactName?.trim() || undefined,
  }
}
