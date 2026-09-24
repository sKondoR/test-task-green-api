import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChatStore } from '@/entities/chat'
import { GreenApiError } from '@/shared/api'
import { createChatByPhone } from './createChatByPhone'

const api = vi.hoisted(() => ({ checkWhatsapp: vi.fn(), getContactInfo: vi.fn() }))

vi.mock('@/entities/session', () => ({ getApiClient: () => api }))

const chatId = '79991234567@c.us'
/** Даёт завершиться фоновой загрузке имени контакта. */
const flushBackground = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('createChatByPhone', () => {
  beforeEach(() => {
    api.checkWhatsapp.mockReset()
    api.getContactInfo.mockReset()
    useChatStore.getState().reset()
  })

  it('отклоняет то, что не похоже на номер, не обращаясь к API', async () => {
    expect(await createChatByPhone('abc')).toMatch(/международном формате/)
    expect(api.checkWhatsapp).not.toHaveBeenCalled()
  })

  it('не создаёт чат для номера без WhatsApp', async () => {
    api.checkWhatsapp.mockResolvedValue({ existsWhatsapp: false })
    expect(await createChatByPhone('+7 999 123-45-67')).toBe(
      'Этот номер не зарегистрирован в WhatsApp',
    )
    expect(useChatStore.getState().chats).toEqual({})
  })

  it('создаёт и открывает чат, затем подставляет имя из телефонной книги', async () => {
    api.checkWhatsapp.mockResolvedValue({ existsWhatsapp: true })
    api.getContactInfo.mockResolvedValue({ contactName: 'Анна', name: 'Anna W' })

    expect(await createChatByPhone('+7 999 123-45-67')).toBeNull()
    expect(api.checkWhatsapp).toHaveBeenCalledWith('79991234567')
    expect(useChatStore.getState().activeChatId).toBe(chatId)

    await flushBackground()
    expect(useChatStore.getState().chats[chatId].name).toBe('Анна')
  })

  it('без имени в телефонной книге берёт имя из профиля', async () => {
    api.checkWhatsapp.mockResolvedValue({ existsWhatsapp: true })
    api.getContactInfo.mockResolvedValue({ contactName: ' ', name: 'Anna W' })

    await createChatByPhone('79991234567')
    await flushBackground()
    expect(useChatStore.getState().chats[chatId].name).toBe('Anna W')
  })

  it('если имя не получить, оставляет номер', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    api.checkWhatsapp.mockResolvedValue({ existsWhatsapp: true })
    api.getContactInfo.mockRejectedValue(new GreenApiError('fail', 500))

    expect(await createChatByPhone('79991234567')).toBeNull()
    await flushBackground()
    expect(useChatStore.getState().chats[chatId].name).toBe('+7 999 123-45-67')
  })

  it.each([
    [null, 'Не удалось подключиться к GREEN-API. Проверьте интернет-соединение.'],
    [429, 'Слишком много проверок номеров. Попробуйте позже.'],
    [466, 'Слишком много проверок номеров. Попробуйте позже.'],
    [500, 'Не удалось проверить номер. Попробуйте ещё раз.'],
  ])('на ошибку checkWhatsapp со статусом %s объясняет причину', async (status, expected) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    api.checkWhatsapp.mockRejectedValue(new GreenApiError('fail', status))

    expect(await createChatByPhone('79991234567')).toBe(expected)
    expect(useChatStore.getState().chats).toEqual({})
  })
})
