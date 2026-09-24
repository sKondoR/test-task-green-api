import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '@/shared/lib'
import styles from './Popover.module.css'

export interface PopoverTriggerProps {
  'aria-expanded': boolean
  'aria-controls': string
  'aria-haspopup': 'menu' | 'dialog'
  onClick: () => void
}

interface PopoverProps {
  renderTrigger: (props: PopoverTriggerProps) => ReactNode
  children: (close: () => void) => ReactNode
  placement?: 'bottom-end' | 'top-start'
  role?: 'menu' | 'dialog'
  className?: string
}

/** Всплывающая панель у кнопки; закрывается по клику снаружи и по Escape. */
export function Popover({
  renderTrigger,
  children,
  placement = 'bottom-end',
  role = 'menu',
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={styles.root}>
      {renderTrigger({
        'aria-expanded': open,
        'aria-controls': panelId,
        'aria-haspopup': role,
        onClick: () => setOpen((value) => !value),
      })}
      {open && (
        <div id={panelId} role={role} className={cx(styles.panel, styles[placement], className)}>
          {children(close)}
        </div>
      )}
    </div>
  )
}
