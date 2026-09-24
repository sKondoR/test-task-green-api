import type {
  CheckWhatsappResponse,
  ContactInfoResponse,
  GreenApiCredentials,
  InstanceSettings,
  Notification,
  SendMessageResponse,
  SetSettingsResponse,
  StateInstanceResponse,
} from './types'

/** Базовый адрес GREEN-API, задаётся в .env (VITE_GREEN_API_URL). */
const VITE_GREEN_API_URL = (
  import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com'
).replace(/\/+$/, '')

export class GreenApiError extends Error {
  /** HTTP-статус ответа; null — запрос не дошёл до сервера. */
  readonly status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

export const isAuthError = (error: unknown): boolean =>
  error instanceof GreenApiError && (error.status === 401 || error.status === 403)

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError'

const jsonBody = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export function createGreenApiClient({ idInstance, apiTokenInstance }: GreenApiCredentials) {
  const base = `${VITE_GREEN_API_URL}/waInstance${idInstance}`
  const url = (method: string, suffix = '') => `${base}/${method}/${apiTokenInstance}${suffix}`

  async function request<T>(input: string, init?: RequestInit): Promise<T> {
    let response: Response
    try {
      response = await fetch(input, init)
    } catch (error) {
      if (isAbortError(error)) throw error
      throw new GreenApiError('Не удалось связаться с сервером GREEN-API', null)
    }
    if (!response.ok) {
      throw new GreenApiError(`GREEN-API ответил ${response.status}`, response.status)
    }
    const text = await response.text()
    return (text ? JSON.parse(text) : null) as T
  }

  return {
    getStateInstance: () => request<StateInstanceResponse>(url('getStateInstance')),

    getSettings: () => request<InstanceSettings>(url('getSettings')),

    setSettings: (settings: Partial<InstanceSettings>) =>
      request<SetSettingsResponse>(url('setSettings'), jsonBody(settings)),

    /** phoneNumber — номер в международном формате, только цифры. */
    checkWhatsapp: (phoneNumber: string) =>
      request<CheckWhatsappResponse>(
        url('checkWhatsapp'),
        jsonBody({ phoneNumber: Number(phoneNumber) }),
      ),

    getContactInfo: (chatId: string) =>
      request<ContactInfoResponse>(url('getContactInfo'), jsonBody({ chatId })),

    sendMessage: (chatId: string, message: string) =>
      request<SendMessageResponse>(url('sendMessage'), jsonBody({ chatId, message })),

    /** Возвращает null, если за receiveTimeout новых уведомлений не пришло. */
    receiveNotification: (receiveTimeoutSeconds: number, signal?: AbortSignal) =>
      request<Notification | null>(
        url('receiveNotification', `?receiveTimeout=${receiveTimeoutSeconds}`),
        { signal },
      ),

    deleteNotification: (receiptId: number, signal?: AbortSignal) =>
      request<{ result: boolean }>(url('deleteNotification', `/${receiptId}`), {
        method: 'DELETE',
        signal,
      }),
  }
}

export type GreenApiClient = ReturnType<typeof createGreenApiClient>
