import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMessageStore } from '@/entities/message'
import { retryMessage, sendTextMessage } from './sendMessage'

const sendMessage = vi.hoisted(() => vi.fn())

vi.mock('@/entities/session', () => ({
  getApiClient: () => ({ sendMessage }),
}))

const chatId = '79991234567@c.us'
const chatMessages = () => useMessageStore.getState().byChat[chatId] ?? []

describe('sendTextMessage', () => {
  beforeEach(() => {
    sendMessage.mockReset()
    useMessageStore.getState().reset()
  })

  it('сразу показывает сообщение как отправляемое, затем подтверждает его', async () => {
    sendMessage.mockResolvedValue({ idMessage: 'BAE5' })

    const pending = sendTextMessage(chatId, 'привет')
    expect(chatMessages()).toMatchObject([
      { text: 'привет', direction: 'outgoing', status: 'sending' },
    ])

    await pending
    expect(sendMessage).toHaveBeenCalledWith(chatId, 'привет')
    expect(chatMessages()).toMatchObject([{ id: 'BAE5', text: 'привет', status: 'sent' }])
  })

  it('при ошибке помечает сообщение и не теряет его', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMessage.mockRejectedValue(new Error('network'))

    await sendTextMessage(chatId, 'привет')
    expect(chatMessages()).toMatchObject([{ text: 'привет', status: 'error' }])
  })

  it('повторная отправка возвращает статус «отправляется» и подтверждает то же сообщение', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMessage.mockRejectedValueOnce(new Error('network'))
    await sendTextMessage(chatId, 'привет')
    const [failed] = chatMessages()

    sendMessage.mockResolvedValueOnce({ idMessage: 'BAE5' })
    const pending = retryMessage(failed)
    expect(chatMessages()).toMatchObject([{ id: failed.id, status: 'sending' }])

    await pending
    expect(chatMessages()).toMatchObject([{ id: 'BAE5', status: 'sent' }])
  })
})
