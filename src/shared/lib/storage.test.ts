import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { instanceScopedStorage, safeLocalStorage, setInstanceScope } from './storage'

const createMemoryStorage = () => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

describe('instanceScopedStorage', () => {
  let storage: ReturnType<typeof createMemoryStorage>

  beforeEach(() => {
    storage = createMemoryStorage()
    vi.stubGlobal('localStorage', storage)
  })

  afterEach(() => {
    setInstanceScope(null)
    vi.unstubAllGlobals()
  })

  it('пишет под ключом конкретного инстанса', () => {
    setInstanceScope('1101')
    instanceScopedStorage.setItem('chats', 'A')
    expect([...storage.data]).toEqual([['gapi-max:1101:chats', 'A']])
    expect(instanceScopedStorage.getItem('chats')).toBe('A')
  })

  it('не смешивает данные разных инстансов', () => {
    setInstanceScope('1101')
    instanceScopedStorage.setItem('chats', 'A')
    setInstanceScope('2202')
    expect(instanceScopedStorage.getItem('chats')).toBeNull()
    instanceScopedStorage.setItem('chats', 'B')
    instanceScopedStorage.removeItem('chats')
    expect([...storage.data]).toEqual([['gapi-max:1101:chats', 'A']])
  })

  it('без выбранного инстанса ничего не читает, не пишет и не удаляет', () => {
    setInstanceScope('1101')
    instanceScopedStorage.setItem('chats', 'A')
    setInstanceScope(null)

    expect(instanceScopedStorage.getItem('chats')).toBeNull()
    instanceScopedStorage.setItem('chats', '{}')
    instanceScopedStorage.removeItem('chats')
    expect([...storage.data]).toEqual([['gapi-max:1101:chats', 'A']])
  })
})

describe('safeLocalStorage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('работает без localStorage', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(safeLocalStorage.getItem('key')).toBeNull()
    expect(() => safeLocalStorage.setItem('key', 'value')).not.toThrow()
    expect(() => safeLocalStorage.removeItem('key')).not.toThrow()
  })

  it('проглатывает ошибки хранилища', () => {
    const fail = () => {
      throw new Error('QuotaExceededError')
    }
    vi.stubGlobal('localStorage', { getItem: fail, setItem: fail, removeItem: fail })
    expect(safeLocalStorage.getItem('key')).toBeNull()
    expect(() => safeLocalStorage.setItem('key', 'value')).not.toThrow()
    expect(() => safeLocalStorage.removeItem('key')).not.toThrow()
  })
})
