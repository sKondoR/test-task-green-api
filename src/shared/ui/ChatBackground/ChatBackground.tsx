import styles from './ChatBackground.module.css'

/**
 * Фон переписки в стиле MAX: три декоративных слоя под содержимым.
 * Родитель должен быть `position: relative` и `isolation: isolate`.
 */
export function ChatBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={`${styles.layer} ${styles.base}`} />
      <div className={`${styles.layer} ${styles.additional}`} />
      <div className={`${styles.layer} ${styles.pattern}`} />
    </div>
  )
}
