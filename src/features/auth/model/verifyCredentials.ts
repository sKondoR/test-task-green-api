import {
  createGreenApiClient,
  GreenApiError,
  isAuthError,
  type GreenApiCredentials,
  type InstanceState,
} from '@/shared/api'

const STATE_ERRORS: Partial<Record<InstanceState, string>> = {
  notAuthorized: 'Инстанс не авторизован. Авторизуйте его в консоли GREEN-API и попробуйте снова.',
  blocked: 'Инстанс заблокирован.',
  sleepMode: 'Инстанс в спящем режиме. Попробуйте позже.',
  starting: 'Инстанс запускается. Подождите пару минут и попробуйте снова.',
  yellowCard: 'Отправка сообщений с инстанса временно ограничена.',
}

/** Проверяет учётные данные через getStateInstance. Возвращает текст ошибки или null, если всё в порядке. */
export async function verifyCredentials(credentials: GreenApiCredentials): Promise<string | null> {
  try {
    const { stateInstance } = await createGreenApiClient(credentials).getStateInstance()
    if (stateInstance === 'authorized') return null
    return STATE_ERRORS[stateInstance] ?? `Инстанс недоступен (состояние: ${stateInstance}).`
  } catch (error) {
    if (isAuthError(error)) return 'Неверный idInstance или apiTokenInstance.'
    if (error instanceof GreenApiError && error.status === null) {
      return 'Не удалось подключиться к GREEN-API. Проверьте интернет-соединение.'
    }
    if (error instanceof GreenApiError && error.status === 404) {
      return 'GREEN-API не нашёл инстанс. Проверьте idInstance.'
    }
    return 'GREEN-API вернул ошибку. Попробуйте ещё раз.'
  }
}
