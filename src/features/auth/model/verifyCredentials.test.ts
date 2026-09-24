import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GreenApiError, type InstanceState } from '@/shared/api'
import { verifyCredentials } from './verifyCredentials'

const getStateInstance = vi.hoisted(() => vi.fn())

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  createGreenApiClient: () => ({ getStateInstance }),
}))

const credentials = { idInstance: '1101', apiTokenInstance: 'token' }

const respondWithState = (stateInstance: InstanceState | string) =>
  getStateInstance.mockResolvedValue({ stateInstance })

describe('verifyCredentials', () => {
  beforeEach(() => {
    getStateInstance.mockReset()
  })

  it('авторизованный инстанс пропускает', async () => {
    respondWithState('authorized')
    expect(await verifyCredentials(credentials)).toBeNull()
  })

  it('для неавторизованного инстанса просит авторизовать его в консоли', async () => {
    respondWithState('notAuthorized')
    expect(await verifyCredentials(credentials)).toMatch(/не авторизован/)
  })

  it('для неизвестного состояния называет его', async () => {
    respondWithState('somethingNew')
    expect(await verifyCredentials(credentials)).toBe(
      'Инстанс недоступен (состояние: somethingNew).',
    )
  })

  it.each([
    [401, 'Неверный idInstance или apiTokenInstance.'],
    [403, 'Неверный idInstance или apiTokenInstance.'],
    [404, 'GREEN-API не нашёл инстанс. Проверьте idInstance.'],
    [null, 'Не удалось подключиться к GREEN-API. Проверьте интернет-соединение.'],
    [500, 'GREEN-API вернул ошибку. Попробуйте ещё раз.'],
  ])('на ошибку со статусом %s объясняет причину', async (status, expected) => {
    getStateInstance.mockRejectedValue(new GreenApiError('fail', status))
    expect(await verifyCredentials(credentials)).toBe(expected)
  })
})
