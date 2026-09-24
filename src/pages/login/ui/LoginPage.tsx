import { useSessionStore } from '@/entities/session'
import { LoginForm } from '@/features/auth'
import { GREEN_API_CONSOLE_URL } from '@/shared/config'
import { ChatBackground } from '@/shared/ui'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const logoutReason = useSessionStore((state) => state.logoutReason)

  return (
    <main className={styles.page}>
      <ChatBackground />
      <div className={styles.card}>
        <h1 className={styles.title}>Вход в WhatsApp Chat</h1>
        <p className={styles.subtitle}>
          Введите данные инстанса GREEN-API, чтобы отправлять и получать сообщения в WhatsApp.
        </p>
        {logoutReason && (
          <p className={styles.notice} role="alert">
            {logoutReason}
          </p>
        )}
        <LoginForm />
        <p className={styles.help}>
          idInstance и apiTokenInstance указаны в<br />
          <a href={GREEN_API_CONSOLE_URL} target="_blank" rel="noreferrer">
            консоли GREEN-API
          </a>{' '}
          на странице инстанса.
        </p>
      </div>
    </main>
  )
}
