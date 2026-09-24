import { useEffect } from 'react'
import { useChatStore } from '@/entities/chat'
import { SendMessageForm } from '@/features/send-message'
import { formatPhone, phoneFromChatId } from '@/shared/lib'
import { ArrowLeftIcon, Avatar, ChatBackground, IconButton } from '@/shared/ui'
import styles from './ChatWindow.module.css'
import { MessageList } from './MessageList'

const chatSubtitle = (chatId: string) => {
  const phone = phoneFromChatId(chatId)
  return phone ? formatPhone(phone) : chatId
}

export function ChatWindow() {
  const chat = useChatStore((state) =>
    state.activeChatId ? state.chats[state.activeChatId] : undefined,
  )
  const closeChat = useChatStore((state) => state.closeChat)
  const markRead = useChatStore((state) => state.markRead)
  const chatId = chat?.id

  // Сообщения, пришедшие пока вкладка была скрыта, считаются прочитанными, когда пользователь вернулся.
  useEffect(() => {
    if (!chatId) return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') markRead(chatId)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [chatId, markRead])

  if (!chat) {
    return (
      <section className={styles.window} aria-label="Чат">
        <div className={styles.body}>
          <ChatBackground />
          <p className={styles.placeholder}>Выберите чат, чтобы начать переписку</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.window} aria-label={`Чат: ${chat.name}`}>
      <header className={styles.header}>
        <IconButton label="Назад к списку чатов" onClick={closeChat}>
          <ArrowLeftIcon size={22} />
        </IconButton>
        <Avatar seed={chat.id} name={chat.name} size={40} />
        <div className={styles.titles}>
          <h2 className={styles.name}>{chat.name}</h2>
          <span className={styles.subtitle}>{chatSubtitle(chat.id)}</span>
        </div>
      </header>
      <div className={styles.body}>
        <ChatBackground />
        <MessageList key={chat.id} chatId={chat.id} />
        <div className={styles.composer}>
          <SendMessageForm key={chat.id} chatId={chat.id} />
        </div>
      </div>
    </section>
  )
}
