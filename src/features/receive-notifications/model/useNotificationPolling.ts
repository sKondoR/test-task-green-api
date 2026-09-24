import { useEffect } from 'react'
import { create } from 'zustand'
import { useSessionStore } from '@/entities/session'
import { createGreenApiClient, toTextMessageEvent } from '@/shared/api'
import { applyMessageEvent } from './applyMessageEvent'
import { runNotificationLoop, type ConnectionStatus } from './notificationLoop'

export const useConnectionStore = create<{ status: ConnectionStatus }>()(() => ({
  status: 'connecting',
}))

/** Пока компонент смонтирован и есть сессия, получает уведомления инстанса. */
export function useNotificationPolling(): void {
  const credentials = useSessionStore((state) => state.credentials)

  useEffect(() => {
    if (!credentials) return
    const controller = new AbortController()

    void runNotificationLoop({
      client: createGreenApiClient(credentials),
      signal: controller.signal,
      onNotification: (body) => {
        const event = toTextMessageEvent(body)
        if (event) applyMessageEvent(event)
      },
      onStatusChange: (status) => useConnectionStore.setState({ status }),
      onUnauthorized: () =>
        useSessionStore
          .getState()
          .logout('GREEN-API отклонил учётные данные: сессия недействительна. Войдите снова.'),
    })

    return () => controller.abort()
  }, [credentials])
}
