import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '@/shared/config'
import { IconButton, SendIcon } from '@/shared/ui'
import { sendTextMessage } from '../model/sendMessage'
import styles from './SendMessageForm.module.css'

const MAX_TEXTAREA_HEIGHT = 160
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 300

export function SendMessageForm({ chatId }: { chatId: string }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0

  // Поле растёт вместе с текстом до MAX_TEXTAREA_HEIGHT, дальше появляется прокрутка.
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [text])

  const submit = () => {
    if (!canSend) return
    void sendTextMessage(chatId, text.trim())
    setText('')
    textareaRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.pill}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          rows={1}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Сообщение"
          aria-label="Сообщение"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {text.length >= COUNTER_THRESHOLD && (
          <span className={styles.counter}>{MAX_MESSAGE_LENGTH - text.length}</span>
        )}
        {canSend && (
          <IconButton type="submit" label="Отправить" variant="accent" className={styles.send}>
            <SendIcon size={18} />
          </IconButton>
        )}
      </div>
    </form>
  )
}
