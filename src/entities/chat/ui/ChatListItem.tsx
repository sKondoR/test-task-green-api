import type { ReactNode } from 'react'
import { cx, formatChatListTime } from '@/shared/lib'
import { AlertIcon, Avatar, CheckIcon, ClockIcon } from '@/shared/ui'
import type { Chat, ChatPreview } from '../model/types'
import styles from './ChatListItem.module.css'

interface ChatListItemProps {
  chat: Chat
  preview?: ChatPreview
  active: boolean
  onSelect: (chatId: string) => void
  /** Кнопка действия; появляется при наведении на место времени. */
  action?: ReactNode
}

function PreviewStatus({ status }: { status: ChatPreview['status'] }) {
  if (status === 'sending') return <ClockIcon size={14} className={styles.statusMuted} />
  if (status === 'error') return <AlertIcon size={14} className={styles.statusError} />
  return <CheckIcon size={15} className={styles.statusSent} />
}

export function ChatListItem({ chat, preview, active, onSelect, action }: ChatListItemProps) {
  const time = preview?.timestamp ?? chat.createdAt

  return (
    <div className={cx(styles.row, active && styles.activeRow)}>
      <button
        type="button"
        className={cx(styles.item, active && styles.active)}
        onClick={() => onSelect(chat.id)}
        aria-current={active || undefined}
      >
        <Avatar seed={chat.id} name={chat.name} />
        <span className={styles.body}>
          <span className={styles.top}>
            <span className={styles.name}>{chat.name}</span>
            <span className={styles.meta}>
              {preview?.outgoing && <PreviewStatus status={preview.status} />}
              <time className={styles.time} dateTime={new Date(time).toISOString()}>
                {formatChatListTime(time)}
              </time>
            </span>
          </span>
          <span className={styles.bottom}>
            <span className={styles.preview}>
              {preview ? (
                <>
                  {preview.outgoing && <span className={styles.you}>Вы: </span>}
                  {preview.text}
                </>
              ) : (
                'Нет сообщений'
              )}
            </span>
            {chat.unreadCount > 0 && (
              <span className={styles.badge} aria-label={`Непрочитанных: ${chat.unreadCount}`}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </span>
        </span>
      </button>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
