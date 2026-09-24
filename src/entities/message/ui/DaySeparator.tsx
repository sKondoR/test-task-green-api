import { formatDaySeparator } from '@/shared/lib'
import styles from './DaySeparator.module.css'

export function DaySeparator({ timestamp }: { timestamp: number }) {
  return (
    <div className={styles.separator}>
      <span className={styles.label}>{formatDaySeparator(timestamp)}</span>
    </div>
  )
}
