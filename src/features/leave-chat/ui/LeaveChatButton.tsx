import { LeaveIcon } from '@/shared/ui'
import { leaveChat } from '../model/leaveChat'
import styles from './LeaveChatButton.module.css'

export function LeaveChatButton({ chatId }: { chatId: string }) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Покинуть чат"
      title="Покинуть чат"
      onClick={() => leaveChat(chatId)}
    >
      <LeaveIcon size={20} />
    </button>
  )
}
