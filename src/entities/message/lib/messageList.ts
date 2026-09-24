import { isSameDay } from '@/shared/lib'
import type { Message, MessageStatus } from '../model/types'

/**
 * Добавляет сообщение с сохранением сортировки по времени.
 * Сообщение с уже известным id игнорируется: одно и то же сообщение приходит
 * и ответом sendMessage, и уведомлением outgoingAPIMessageReceived.
 */
export function upsertMessage(list: Message[], message: Message): Message[] {
  if (list.some((item) => item.id === message.id)) return list
  let index = list.length
  while (index > 0 && list[index - 1].timestamp > message.timestamp) index--
  return [...list.slice(0, index), message, ...list.slice(index)]
}

/**
 * Отправка подтверждена: временный id заменяется настоящим idMessage.
 * Если уведомление об этом сообщении пришло раньше ответа sendMessage,
 * временная копия просто удаляется.
 */
export function confirmMessage(list: Message[], tempId: string, idMessage: string): Message[] {
  if (list.some((item) => item.id === idMessage)) return list.filter((item) => item.id !== tempId)
  return list.map((item) =>
    item.id === tempId ? { ...item, id: idMessage, status: 'sent' as const } : item,
  )
}

export function setMessageStatus(list: Message[], id: string, status: MessageStatus): Message[] {
  return list.map((item) => (item.id === id ? { ...item, status } : item))
}

/** Отправка, прерванная перезагрузкой страницы, уже не завершится — показываем её как ошибку. */
export function restoreMessages(byChat: Record<string, Message[]>): Record<string, Message[]> {
  const restored: Record<string, Message[]> = {}
  for (const [chatId, list] of Object.entries(byChat)) {
    restored[chatId] = list.map((item) =>
      item.status === 'sending' ? { ...item, status: 'error' as const } : item,
    )
  }
  return restored
}

export type MessageListItem =
  | { kind: 'day'; key: string; timestamp: number }
  | { kind: 'message'; key: string; message: Message }

/** Вставляет разделители дней перед первым сообщением каждого дня. */
export function withDaySeparators(messages: Message[]): MessageListItem[] {
  const items: MessageListItem[] = []
  let previous: Message | undefined
  for (const message of messages) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      items.push({ kind: 'day', key: `day-${message.timestamp}`, timestamp: message.timestamp })
    }
    items.push({ kind: 'message', key: message.id, message })
    previous = message
  }
  return items
}
