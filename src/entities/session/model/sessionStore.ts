import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createGreenApiClient, type GreenApiClient, type GreenApiCredentials } from '@/shared/api'
import { STORAGE_PREFIX } from '@/shared/config'
import { safeLocalStorage } from '@/shared/lib'

interface SessionState {
  credentials: GreenApiCredentials | null
  /** Почему сессия завершилась без участия пользователя — показывается на экране входа. */
  logoutReason: string | null
  /** chatId аккаунта инстанса из getSettings; null, пока настройки не загружены. */
  ownChatId: string | null
  setOwnChatId: (chatId: string | null) => void
  login: (credentials: GreenApiCredentials) => void
  logout: (reason?: string) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      credentials: null,
      logoutReason: null,
      ownChatId: null,
      setOwnChatId: (ownChatId) => set({ ownChatId }),
      login: (credentials) => set({ credentials, logoutReason: null, ownChatId: null }),
      logout: (reason) => set({ credentials: null, logoutReason: reason ?? null, ownChatId: null }),
    }),
    {
      name: `${STORAGE_PREFIX}:session`,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ credentials: state.credentials }),
    },
  ),
)

/** Клиент GREEN-API для текущей сессии. */
export function getApiClient(): GreenApiClient {
  const { credentials } = useSessionStore.getState()
  if (!credentials) throw new Error('Нет активной сессии')
  return createGreenApiClient(credentials)
}
