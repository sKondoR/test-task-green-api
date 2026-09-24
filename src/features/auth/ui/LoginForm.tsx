import { useState, type FormEvent } from 'react'
import { useSessionStore } from '@/entities/session'
import { Button, TextField } from '@/shared/ui'
import { verifyCredentials } from '../model/verifyCredentials'
import styles from './LoginForm.module.css'

type FieldErrors = Partial<Record<'idInstance' | 'apiTokenInstance', string>>

function validate(idInstance: string, apiTokenInstance: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!/^\d+$/.test(idInstance)) errors.idInstance = 'idInstance состоит только из цифр'
  if (!apiTokenInstance) errors.apiTokenInstance = 'Укажите apiTokenInstance'
  return errors
}

export function LoginForm() {
  const login = useSessionStore((state) => state.login)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    const errors = validate(credentials.idInstance, credentials.apiTokenInstance)
    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const error = await verifyCredentials(credentials)
    setSubmitting(false)
    if (error) setFormError(error)
    else login(credentials)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="idInstance"
        name="idInstance"
        inputMode="numeric"
        autoComplete="username"
        placeholder="3100123456"
        value={idInstance}
        onChange={(event) => setIdInstance(event.target.value)}
        error={fieldErrors.idInstance}
        autoFocus
      />
      <TextField
        label="apiTokenInstance"
        name="apiTokenInstance"
        autoComplete="current-password"
        placeholder="Токен из консоли GREEN-API"
        value={apiTokenInstance}
        onChange={(event) => setApiTokenInstance(event.target.value)}
        error={fieldErrors.apiTokenInstance}
        secret
      />
      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" loading={submitting} className={styles.submit}>
        {submitting ? 'Проверяем…' : 'Войти'}
      </Button>
    </form>
  )
}
