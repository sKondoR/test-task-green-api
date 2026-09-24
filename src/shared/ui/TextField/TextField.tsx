import { useId, useState, type InputHTMLAttributes } from 'react'
import { EyeIcon, EyeOffIcon } from '../icons'
import styles from './TextField.module.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string
  /** Скрытый ввод с кнопкой «показать». */
  secret?: boolean
}

export function TextField({ label, hint, error, secret = false, type, ...props }: TextFieldProps) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control} data-invalid={Boolean(error) || undefined}>
        <input
          id={id}
          className={styles.input}
          type={secret && !revealed ? 'password' : (type ?? 'text')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {secret && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Скрыть' : 'Показать'}
            title={revealed ? 'Скрыть' : 'Показать'}
          >
            {revealed ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
