import { cx, formatTime } from '@/shared/lib'
import { AlertIcon, CheckIcon, ClockIcon, RetryIcon } from '@/shared/ui'
import type { Message } from '../model/types'
import styles from './MessageBubble.module.css'

interface MessageBubbleProps {
  message: Message
  onRetry?: (message: Message) => void
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <ClockIcon size={13} aria-label="Отправляется" />
  if (status === 'error') return <AlertIcon size={14} className={styles.errorIcon} />
  return <CheckIcon size={14} />
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const outgoing = message.direction === 'outgoing'
  const failed = message.status === 'error'

  return (
    <div className={cx(styles.row, outgoing ? styles.outgoing : styles.incoming)}>
      <div className={cx(styles.bubble, failed && styles.failed)}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.meta}>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {outgoing && <StatusIcon status={message.status} />}
        </span>
      </div>
      {failed && onRetry && (
        <button type="button" className={styles.retry} onClick={() => onRetry(message)}>
          <RetryIcon size={14} />
          Не отправлено. Повторить
        </button>
      )}
    </div>
  )
}
