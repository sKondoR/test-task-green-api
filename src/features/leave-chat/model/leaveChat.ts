import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'

/**
 * Убирает чат из списка вместе с историей. Только локально: в WhatsApp переписка остаётся,
 * и новое сообщение от собеседника снова создаст чат.
 */
export function leaveChat(chatId: string): void {
  useChatStore.getState().removeChat(chatId)
  useMessageStore.getState().removeChat(chatId)
}
