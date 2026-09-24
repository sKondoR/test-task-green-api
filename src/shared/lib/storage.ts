import { STORAGE_PREFIX } from '@/shared/config'

export interface KeyValueStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/**
 * localStorage может быть недоступен (приватный режим, запрет cookies, тесты в node),
 * поэтому любые ошибки проглатываются, а приложение продолжает работать без сохранения.
 */
export const safeLocalStorage: KeyValueStorage = {
  getItem: (key) => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value)
    } catch {
      // сохранение необязательно
    }
  },
  removeItem: (key) => {
    try {
      globalThis.localStorage?.removeItem(key)
    } catch {
      // сохранение необязательно
    }
  },
}

let instanceScope: string | null = null

/** Выбирает инстанс, под ключами которого хранятся чаты и сообщения; null — ничего не читать и не писать. */
export function setInstanceScope(idInstance: string | null): void {
  instanceScope = idInstance
}

/**
 * Хранилище для данных конкретного инстанса: ключ `gapi-max:{idInstance}:{name}`.
 * Пока инстанс не выбран, чтение возвращает null, а запись игнорируется —
 * поэтому сброс состояния при выходе не затирает сохранённую историю.
 */
export const instanceScopedStorage: KeyValueStorage = {
  getItem: (name) =>
    instanceScope ? safeLocalStorage.getItem(`${STORAGE_PREFIX}:${instanceScope}:${name}`) : null,
  setItem: (name, value) => {
    if (instanceScope) safeLocalStorage.setItem(`${STORAGE_PREFIX}:${instanceScope}:${name}`, value)
  },
  removeItem: (name) => {
    if (instanceScope) safeLocalStorage.removeItem(`${STORAGE_PREFIX}:${instanceScope}:${name}`)
  },
}
