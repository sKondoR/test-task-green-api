import { FixSettingsButton, useInstanceSettingsStore } from '@/features/fix-instance-settings'
import { AlertIcon } from '@/shared/ui'
import styles from './InstanceSettingsBanner.module.css'

/** Предупреждает, что с текущими настройками инстанса входящие сообщения не придут. */
export function InstanceSettingsBanner() {
  const status = useInstanceSettingsStore((state) => state.status)
  const problems = useInstanceSettingsStore((state) => state.problems)

  if (status !== 'invalid' && status !== 'fixing') return null

  return (
    <div className={styles.banner} role="alert">
      <AlertIcon size={20} className={styles.icon} />
      <p className={styles.text}>
        <strong>Инстанс не настроен для получения сообщений:</strong> {problems.join('; ')}.
      </p>
      <FixSettingsButton />
    </div>
  )
}
