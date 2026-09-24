import { useSessionStore } from '@/entities/session'
import { LogoutButton } from '@/features/logout'
import { Popover, SettingsIcon } from '@/shared/ui'
import styles from './NavRail.module.css'

export function NavRail() {
  const credentials = useSessionStore((state) => state.credentials)

  return (
    <nav className={styles.rail} aria-label="Разделы">
      <div className={styles.spacer} />

      <Popover
        role="dialog"
        placement="top-start"
        className={styles.settingsPanel}
        renderTrigger={(triggerProps) => (
          <button type="button" className={styles.item} {...triggerProps}>
            <SettingsIcon size={26} />
            <span className={styles.label}>Настройки</span>
          </button>
        )}
      >
        {(close) => (
          <>
            <div className={styles.account}>
              <span className={styles.accountTitle}>Инстанс GREEN-API</span>
              <span className={styles.accountValue}>{credentials?.idInstance}</span>
            </div>
            <LogoutButton onDone={close} />
          </>
        )}
      </Popover>
    </nav>
  )
}
