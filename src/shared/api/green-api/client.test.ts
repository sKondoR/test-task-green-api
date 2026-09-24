import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGreenApiClient, GreenApiError } from './client'

const fetchMock = vi.fn<typeof fetch>()
const client = createGreenApiClient({ idInstance: '1101', apiTokenInstance: 'token' })

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls.at(-1)!
  return { url: String(url), init }
}

describe('createGreenApiClient', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('собирает адрес метода из idInstance и токена и разбирает JSON', async () => {
    fetchMock.mockResolvedValue(new Response('{"stateInstance":"authorized"}'))
    expect(await client.getStateInstance()).toEqual({ stateInstance: 'authorized' })
    expect(lastRequest().url).toMatch(/\/waInstance1101\/getStateInstance\/token$/)
  })

  it('передаёт номер в checkWhatsapp числом', async () => {
    fetchMock.mockResolvedValue(new Response('{"existsWhatsapp":true}'))
    await client.checkWhatsapp('79991234567')
    const { url, init } = lastRequest()
    expect(url).toMatch(/\/checkWhatsapp\/token$/)
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ phoneNumber: 79991234567 })
  })

  it('пустой ответ receiveNotification превращает в null', async () => {
    fetchMock.mockResolvedValue(new Response(''))
    expect(await client.receiveNotification(20)).toBeNull()
    expect(lastRequest().url).toMatch(/\/receiveNotification\/token\?receiveTimeout=20$/)
  })

  it('удаляет уведомление по receiptId методом DELETE', async () => {
    fetchMock.mockResolvedValue(new Response('{"result":true}'))
    await client.deleteNotification(42)
    const { url, init } = lastRequest()
    expect(url).toMatch(/\/deleteNotification\/token\/42$/)
    expect(init?.method).toBe('DELETE')
  })

  it('на ответ с ошибкой бросает GreenApiError со статусом', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 401 }))
    await expect(client.getSettings()).rejects.toMatchObject({
      name: 'GreenApiError',
      status: 401,
    })
  })

  it('если сервер недоступен, бросает GreenApiError без статуса', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const error = await client.getSettings().catch((reason: unknown) => reason)
    expect(error).toBeInstanceOf(GreenApiError)
    expect((error as GreenApiError).status).toBeNull()
  })

  it('отмену запроса пробрасывает как есть', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError')
    fetchMock.mockRejectedValue(abort)
    await expect(client.receiveNotification(20, new AbortController().signal)).rejects.toBe(abort)
  })
})
