import { useMemo } from 'react'
import { ChatListItem, useChatStore, type Chat, type ChatPreview } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import { NewChatButton } from '@/features/create-chat'
import { LeaveChatButton } from '@/features/leave-chat'
import { useConnectionStore } from '@/features/receive-notifications'
import styles from './ChatListPanel.module.css'

interface ChatRow {
  chat: Chat
  preview?: ChatPreview
}

export function ChatListPanel() {
  const chats = useChatStore((state) => state.chats)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const openChat = useChatStore((state) => state.openChat)
  const messagesByChat = useMessageStore((state) => state.byChat)
  const connection = useConnectionStore((state) => state.status)

  const rows = useMemo<ChatRow[]>(() => {
    const all = Object.values(chats).map((chat) => {
      const messages = messagesByChat[chat.id]
      const last = messages?.[messages.length - 1]
      const preview: ChatPreview | undefined = last && {
        text: last.text,
        timestamp: last.timestamp,
        outgoing: last.direction === 'outgoing',
        status: last.status,
      }
      return { chat, preview }
    })
    const lastActivity = ({ chat, preview }: ChatRow) => preview?.timestamp ?? chat.createdAt
    return all.sort((a, b) => lastActivity(b) - lastActivity(a))
  }, [chats, messagesByChat])

  return (
    <section className={styles.panel} aria-label="Чаты">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Чаты</h1>
          <NewChatButton />
        </div>
        {connection === 'reconnecting' && (
          <p className={styles.connection} role="status">
            Соединение…
          </p>
        )}
      </header>

      <div className={styles.list}>
        {rows.map(({ chat, preview }) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            preview={preview}
            active={chat.id === activeChatId}
            onSelect={openChat}
            action={<LeaveChatButton chatId={chat.id} />}
          />
        ))}
        {rows.length === 0 && (
          <p className={styles.empty}>
            Чатов пока нет.
            <br />
            Нажмите «+», чтобы написать по номеру телефона.
          </p>
        )}
      </div>
    </section>
  )
}
