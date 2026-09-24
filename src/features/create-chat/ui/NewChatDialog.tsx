import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, TextField } from '@/shared/ui'
import { createChatByPhone } from '../model/createChatByPhone'
import styles from './NewChatDialog.module.css'

interface NewChatDialogProps {
  onClose: () => void
}

/** Модальное окно: номер телефона получателя → новый чат. */
export function NewChatDialog({ onClose }: NewChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [submitting, setSubmitting] = useState(false)

  // Без close() в cleanup: в StrictMode он порождает асинхронное событие close, и onClose
  // размонтирует только что открытое окно. Удалённый из DOM <dialog> закрывается сам.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const result = await createChatByPhone(phone)
    setSubmitting(false)
    if (result) setError(result)
    else onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="new-chat-title"
      onClose={onClose}
      onClick={(event) => {
        // Клик по подложке: целью события будет сам <dialog>, а не его содержимое.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 id="new-chat-title" className={styles.title}>
          Новый чат
        </h2>
        <TextField
          label="Номер телефона"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 999 123-45-67"
          hint="Номер, на который зарегистрирован WhatsApp"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
            setError(undefined)
          }}
          error={error}
          autoFocus
        />
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={submitting} disabled={!phone.trim()}>
            Создать чат
          </Button>
        </div>
      </form>
    </dialog>
  )
}
