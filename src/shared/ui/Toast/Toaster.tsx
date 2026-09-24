import { useToastStore } from './toast'
import styles from './Toaster.module.css'

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className={styles.region} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          {toast.text}
        </div>
      ))}
    </div>
  )
}
