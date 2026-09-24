import { useSessionStore } from '@/entities/session'
import { LogoutIcon } from '@/shared/ui'
import styles from './LogoutButton.module.css'

export function LogoutButton({ onDone }: { onDone?: () => void }) {
  const logout = useSessionStore((state) => state.logout)

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => {
        onDone?.()
        logout()
      }}
    >
      <LogoutIcon size={20} />
      Выйти
    </button>
  )
}
