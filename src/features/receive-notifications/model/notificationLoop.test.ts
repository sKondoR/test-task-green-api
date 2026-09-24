import { describe, expect, it, vi } from 'vitest'
import { GreenApiError, type Notification } from '@/shared/api'
import { runNotificationLoop } from './notificationLoop'

const notification = (receiptId: number): Notification => ({
  receiptId,
  body: { typeWebhook: 'incomingMessageReceived' },
})

/** Клиент, который по очереди отдаёт заданные ответы, а затем отменяет цикл. */
function createClient(responses: Array<Notification | null | Error>, controller: AbortController) {
  let call = 0
  return {
    receiveNotification: vi.fn(async () => {
      const response = responses[call++]
      if (call >= responses.length) controller.abort()
      if (response instanceof Error) throw response
      return response ?? null
    }),
    deleteNotification: vi.fn<(receiptId: number) => Promise<{ result: boolean }>>(async () => ({
      result: true,
    })),
  }
}

describe('runNotificationLoop', () => {
  it('удаляет каждое уведомление, даже если обработка упала', async () => {
    const controller = new AbortController()
    const client = createClient([notification(1), notification(2)], controller)
    const onNotification = vi.fn(() => {
      throw new Error('boom')
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await runNotificationLoop({
      client,
      signal: controller.signal,
      onNotification,
      onStatusChange: () => {},
      onUnauthorized: () => {},
    })

    expect(onNotification).toHaveBeenCalledTimes(2)
    expect(client.deleteNotification.mock.calls.map(([id]) => id)).toEqual([1, 2])
  })

  it('останавливается и сообщает о 401', async () => {
    const controller = new AbortController()
    const client = createClient([new GreenApiError('401', 401), null], controller)
    const onUnauthorized = vi.fn()

    await runNotificationLoop({
      client,
      signal: controller.signal,
      onNotification: () => {},
      onStatusChange: () => {},
      onUnauthorized,
    })

    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(client.receiveNotification).toHaveBeenCalledOnce()
  })

  it('при сетевой ошибке переходит в reconnecting и повторяет запрос', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const client = createClient([new GreenApiError('network', null), null], controller)
    const statuses: string[] = []

    const loop = runNotificationLoop({
      client,
      signal: controller.signal,
      onNotification: () => {},
      onStatusChange: (status) => statuses.push(status),
      onUnauthorized: () => {},
    })
    await vi.runAllTimersAsync()
    await loop
    vi.useRealTimers()

    expect(statuses).toEqual(['connecting', 'reconnecting', 'online'])
    expect(client.receiveNotification).toHaveBeenCalledTimes(2)
  })

  it('пустой ответ по таймауту ничего не удаляет и ждёт дальше', async () => {
    const controller = new AbortController()
    const client = createClient([null, null, notification(7)], controller)
    const onNotification = vi.fn()

    await runNotificationLoop({
      client,
      signal: controller.signal,
      onNotification,
      onStatusChange: () => {},
      onUnauthorized: () => {},
    })

    expect(client.receiveNotification).toHaveBeenCalledTimes(3)
    expect(onNotification).toHaveBeenCalledOnce()
    expect(client.deleteNotification.mock.calls.map(([id]) => id)).toEqual([7])
  })

  it('если не удалось удалить уведомление, переподключается и продолжает', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const client = createClient([notification(1), notification(1)], controller)
    client.deleteNotification.mockRejectedValueOnce(new GreenApiError('network', null))
    const statuses: string[] = []

    const loop = runNotificationLoop({
      client,
      signal: controller.signal,
      onNotification: () => {},
      onStatusChange: (status) => statuses.push(status),
      onUnauthorized: () => {},
    })
    await vi.runAllTimersAsync()
    await loop
    vi.useRealTimers()

    expect(statuses).toEqual(['connecting', 'online', 'reconnecting', 'online'])
    expect(client.deleteNotification).toHaveBeenCalledTimes(2)
  })

  it('удваивает паузу между попытками до 30 секунд и сбрасывает её после успеха', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const networkError = new GreenApiError('network', null)
    const receiveNotification = vi.fn(async () => {
      throw networkError
    })
    const loop = runNotificationLoop({
      client: { receiveNotification, deleteNotification: vi.fn() },
      signal: controller.signal,
      onNotification: () => {},
      onStatusChange: () => {},
      onUnauthorized: () => {},
    })

    /** Проверяет, что следующая попытка случится ровно через delay мс. */
    const expectNextAttemptAfter = async (delay: number) => {
      const calls = receiveNotification.mock.calls.length
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(receiveNotification).toHaveBeenCalledTimes(calls)
      await vi.advanceTimersByTimeAsync(1)
      expect(receiveNotification).toHaveBeenCalledTimes(calls + 1)
    }

    await vi.advanceTimersByTimeAsync(0)
    for (const delay of [1000, 2000, 4000, 8000, 16000, 30000, 30000]) {
      await expectNextAttemptAfter(delay)
    }

    // Успешный пустой ответ: следующий запрос уходит сразу, и после его ошибки
    // пауза снова начинается с 1 секунды.
    receiveNotification.mockImplementationOnce(async () => null as never)
    const calls = receiveNotification.mock.calls.length
    await vi.advanceTimersByTimeAsync(30000)
    expect(receiveNotification).toHaveBeenCalledTimes(calls + 2)
    await expectNextAttemptAfter(1000)

    controller.abort()
    await loop
    vi.useRealTimers()
  })

  it('при отмене во время паузы перед повтором завершается сразу', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const receiveNotification = vi.fn(async () => {
      throw new GreenApiError('network', null)
    })
    const loop = runNotificationLoop({
      client: { receiveNotification, deleteNotification: vi.fn() },
      signal: controller.signal,
      onNotification: () => {},
      onStatusChange: () => {},
      onUnauthorized: () => {},
    })
    await vi.advanceTimersByTimeAsync(0)

    controller.abort()
    await loop
    expect(vi.getTimerCount()).toBe(0)
    expect(receiveNotification).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
