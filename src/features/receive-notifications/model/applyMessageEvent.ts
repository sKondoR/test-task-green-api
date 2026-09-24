import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import type { TextMessageEvent } from '@/shared/api'

/** Пользователь сейчас видит этот чат: он открыт и вкладка на экране. */
function isChatOnScreen(chatId: string): boolean {
  const visible = typeof document === 'undefined' || document.visibilityState === 'visible'
  return visible && useChatStore.getState().activeChatId === chatId
}

/**
 * Кладёт сообщение из уведомления в стор: создаёт чат, если его ещё нет,
 * и увеличивает счётчик непрочитанных, если входящее пришло не в тот чат, что на экране.
 */
export function applyMessageEvent(event: TextMessageEvent, isOnScreen = isChatOnScreen): void {
  useChatStore.getState().ensureChat(event.chatId, event.contactName)

  const before = useMessageStore.getState().byChat[event.chatId]
  useMessageStore.getState().upsert({
    id: event.idMessage,
    chatId: event.chatId,
    text: event.text,
    timestamp: event.timestamp,
    direction: event.direction,
    status: 'sent',
  })
  const added = useMessageStore.getState().byChat[event.chatId] !== before

  if (added && event.direction === 'incoming' && !isOnScreen(event.chatId)) {
    useChatStore.getState().incrementUnread(event.chatId)
  }
}
