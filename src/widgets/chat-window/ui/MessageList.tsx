import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DaySeparator, MessageBubble, useChatMessages, withDaySeparators } from '@/entities/message'
import { retryMessage } from '@/features/send-message'
import { ChevronDownIcon } from '@/shared/ui'
import styles from './MessageList.module.css'

/** Ближе этого к низу считаем, что пользователь «внизу» и новые сообщения нужно докручивать. */
const STICK_TO_BOTTOM_PX = 120
const SHOW_SCROLL_BUTTON_PX = 300

const scrollToBottom = (container: HTMLElement | null, behavior: ScrollBehavior) =>
  container?.scrollTo({ top: container.scrollHeight, behavior })

/** Лента сообщений одного чата. Монтируется заново при смене чата (key = chatId). */
export function MessageList({ chatId }: { chatId: string }) {
  const messages = useChatMessages(chatId)
  const items = useMemo(() => withDaySeparators(messages), [messages])
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const lastMessage = messages.at(-1)

  // При открытии чата сразу показываем последние сообщения.
  useLayoutEffect(() => {
    scrollToBottom(scrollRef.current, 'instant')
  }, [])

  // Новое сообщение докручиваем, если пользователь был внизу или сам его отправил.
  useLayoutEffect(() => {
    if (!lastMessage) return
    if (stickToBottomRef.current || lastMessage.status === 'sending') {
      scrollToBottom(scrollRef.current, 'smooth')
    }
  }, [lastMessage])

  const handleScroll = () => {
    const container = scrollRef.current
    if (!container) return
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight
    stickToBottomRef.current = distance < STICK_TO_BOTTOM_PX
    setShowScrollButton(distance > SHOW_SCROLL_BUTTON_PX)
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={scrollRef}
        className={styles.scroll}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Сообщения"
      >
        <div className={styles.column}>
          {items.length === 0 && <p className={styles.empty}>Сообщений пока нет</p>}
          {items.map((item) =>
            item.kind === 'day' ? (
              <DaySeparator key={item.key} timestamp={item.timestamp} />
            ) : (
              <MessageBubble key={item.key} message={item.message} onRetry={retryMessage} />
            ),
          )}
        </div>
      </div>
      {showScrollButton && (
        <button
          type="button"
          className={styles.scrollButton}
          onClick={() => scrollToBottom(scrollRef.current, 'smooth')}
          aria-label="К последним сообщениям"
          title="К последним сообщениям"
        >
          <ChevronDownIcon size={22} />
        </button>
      )}
    </div>
  )
}
