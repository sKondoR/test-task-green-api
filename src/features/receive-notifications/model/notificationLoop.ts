import { isAbortError, isAuthError, type GreenApiClient, type NotificationBody } from '@/shared/api'
import {
  RECEIVE_TIMEOUT_SECONDS,
  RECONNECT_INITIAL_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
} from '@/shared/config'

export type ConnectionStatus = 'connecting' | 'online' | 'reconnecting'

interface NotificationLoopOptions {
  client: Pick<GreenApiClient, 'receiveNotification' | 'deleteNotification'>
  signal: AbortSignal
  onNotification: (body: NotificationBody) => void
  onStatusChange: (status: ConnectionStatus) => void
  onUnauthorized: () => void
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(done, ms)
    signal.addEventListener('abort', done, { once: true })
    function done() {
      clearTimeout(timer)
      signal.removeEventListener('abort', done)
      resolve()
    }
  })

/**
 * Последовательно забирает уведомления из очереди инстанса: receiveNotification → обработка →
 * deleteNotification. Удаляется каждое уведомление, даже неинтересное или с ошибкой обработки, —
 * иначе оно останется первым в очереди и заблокирует остальные.
 * Работает, пока не отменён signal или сервер не отклонил учётные данные.
 */
export async function runNotificationLoop({
  client,
  signal,
  onNotification,
  onStatusChange,
  onUnauthorized,
}: NotificationLoopOptions): Promise<void> {
  let retryDelay = RECONNECT_INITIAL_DELAY_MS
  let status: ConnectionStatus = 'connecting'
  const setStatus = (next: ConnectionStatus) => {
    if (next === status) return
    status = next
    onStatusChange(next)
  }
  onStatusChange(status)

  while (!signal.aborted) {
    try {
      const notification = await client.receiveNotification(RECEIVE_TIMEOUT_SECONDS, signal)
      setStatus('online')
      retryDelay = RECONNECT_INITIAL_DELAY_MS
      if (!notification) continue

      try {
        onNotification(notification.body)
      } catch (error) {
        // Без тела уведомления: в нём текст переписки и данные собеседника.
        console.error(
          'Failed to handle notification',
          { receiptId: notification.receiptId, typeWebhook: notification.body.typeWebhook },
          error,
        )
      }
      await client.deleteNotification(notification.receiptId, signal)
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return
      if (isAuthError(error)) {
        onUnauthorized()
        return
      }
      setStatus('reconnecting')
      await sleep(retryDelay, signal)
      retryDelay = Math.min(retryDelay * 2, RECONNECT_MAX_DELAY_MS)
    }
  }
}
