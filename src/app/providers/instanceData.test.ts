import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import { useSessionStore } from '@/entities/session'
import { initInstanceDataSync } from './instanceData'

const login = (idInstance: string) =>
  useSessionStore.getState().login({ idInstance, apiTokenInstance: 'token' })

const chatIds = () => Object.keys(useChatStore.getState().chats)

describe('initInstanceDataSync', () => {
  let storage: Map<string, string>
  let stop: () => void

  beforeEach(() => {
    storage = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    })
    useSessionStore.getState().logout()
    stop = initInstanceDataSync()
  })

  afterEach(() => {
    stop()
    useSessionStore.getState().logout()
    vi.unstubAllGlobals()
  })

  it('держит историю каждого инстанса отдельно и не стирает её при выходе', async () => {
    login('1101')
    useChatStore.getState().ensureChat('111@c.us')
    useMessageStore.getState().upsert({
      id: 'm1',
      chatId: '111@c.us',
      text: 'привет',
      timestamp: 1,
      direction: 'incoming',
      status: 'sent',
    })

    login('2202')
    expect(chatIds()).toEqual([])
    expect(useMessageStore.getState().byChat).toEqual({})
    useChatStore.getState().ensureChat('222@c.us')

    useSessionStore.getState().logout()
    expect(chatIds()).toEqual([])
    expect(storage.get('gapi-max:1101:chats')).toContain('111@c.us')
    expect(storage.get('gapi-max:1101:messages')).toContain('привет')
    expect(storage.get('gapi-max:2202:chats')).toContain('222@c.us')
    expect(storage.get('gapi-max:2202:chats')).not.toContain('111@c.us')

    login('1101')
    await vi.waitFor(() => expect(chatIds()).toEqual(['111@c.us']))
    expect(useMessageStore.getState().byChat['111@c.us']).toHaveLength(1)
  })
})
