export interface Chat {
  /** chatId WhatsApp: «79991234567@c.us» для личного чата. */
  id: string
  name: string
  unreadCount: number
  createdAt: number
}

/** Последнее сообщение для строки в списке чатов. */
export interface ChatPreview {
  text: string
  timestamp: number
  outgoing: boolean
  status?: 'sending' | 'sent' | 'error'
}
