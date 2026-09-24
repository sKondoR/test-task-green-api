import type { MessageDirection } from '@/shared/api'

export type MessageStatus = 'sending' | 'sent' | 'error'

export interface Message {
  /** idMessage из GREEN-API; у ещё не отправленного — локальный временный id. */
  id: string
  chatId: string
  text: string
  /** Unix-время в миллисекундах. */
  timestamp: number
  direction: MessageDirection
  status: MessageStatus
}
