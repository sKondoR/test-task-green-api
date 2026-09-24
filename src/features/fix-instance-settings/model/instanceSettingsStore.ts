import { useEffect } from 'react'
import { create } from 'zustand'
import { getApiClient, useSessionStore } from '@/entities/session'
import { GreenApiError, type InstanceSettings } from '@/shared/api'
import { showToast } from '@/shared/ui'
import { findSettingsProblems, REQUIRED_SETTINGS } from './settingsRequirements'

type SettingsStatus = 'unknown' | 'checking' | 'ok' | 'invalid' | 'fixing'

/** Пауза перед повтором, если GREEN-API ответил 429 (лимит частоты запросов к методу). */
const RATE_LIMIT_RETRY_DELAY_MS = 2000

async function fetchSettings(): Promise<InstanceSettings> {
  try {
    return await getApiClient().getSettings()
  } catch (error) {
    if (!(error instanceof GreenApiError && error.status === 429)) throw error
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY_MS))
    return getApiClient().getSettings()
  }
}

interface InstanceSettingsState {
  status: SettingsStatus
  problems: string[]
  check: () => Promise<void>
  fix: () => Promise<void>
}

export const useInstanceSettingsStore = create<InstanceSettingsState>()((set, get) => ({
  status: 'unknown',
  problems: [],

  check: async () => {
    // Повторный вызов во время проверки (например, двойной эффект в StrictMode) упёрся бы в лимит GREEN-API.
    if (get().status === 'checking') return
    set({ status: 'checking' })
    try {
      const problems = findSettingsProblems(await fetchSettings())
      set({ status: problems.length ? 'invalid' : 'ok', problems })
    } catch (error) {
      // Проверка вспомогательная: если она не удалась, интерфейс работает как обычно.
      console.error('getSettings failed', error)
      set({ status: 'unknown', problems: [] })
    }
  },

  fix: async () => {
    set({ status: 'fixing' })
    try {
      await getApiClient().setSettings(REQUIRED_SETTINGS)
      set({ status: 'ok', problems: [] })
      showToast('Настройки сохранены. Они применятся в течение нескольких минут.')
    } catch (error) {
      console.error('setSettings failed', error)
      set({ status: 'invalid' })
      showToast('Не удалось изменить настройки. Попробуйте ещё раз.')
    }
  },
}))

/** Проверяет настройки инстанса при каждом входе. */
export function useInstanceSettingsCheck(): void {
  const idInstance = useSessionStore((state) => state.credentials?.idInstance)

  useEffect(() => {
    if (idInstance) void useInstanceSettingsStore.getState().check()
  }, [idInstance])
}
