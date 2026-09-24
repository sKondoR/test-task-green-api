import { beforeEach, describe, expect, it } from 'vitest'
import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import type { TextMessageEvent } from '@/shared/api'
import { applyMessageEvent } from './applyMessageEvent'

const event = (patch: Partial<TextMessageEvent> = {}): TextMessageEvent => ({
  idMessage: 'm1',
  chatId: '10000000',
  text: 'Привет',
  timestamp: 1000,
  direction: 'incoming',
  contactName: 'Даша',
  ...patch,
})

const offScreen = () => false
const onScreen = () => true

describe('applyMessageEvent', () => {
  beforeEach(() => {
    useChatStore.getState().reset()
    useMessageStore.getState().reset()
  })

  it('создаёт чат от неизвестного отправителя и считает непрочитанное', () => {
    applyMessageEvent(event(), offScreen)

    expect(useChatStore.getState().chats['10000000']).toMatchObject({
      name: 'Даша',
      unreadCount: 1,
    })
    expect(useMessageStore.getState().byChat['10000000']).toHaveLength(1)
  })

  it('не считает повторно доставленное уведомление дважды', () => {
    applyMessageEvent(event(), offScreen)
    applyMessageEvent(event(), offScreen)

    expect(useChatStore.getState().chats['10000000'].unreadCount).toBe(1)
    expect(useMessageStore.getState().byChat['10000000']).toHaveLength(1)
  })

  it('не увеличивает счётчик для открытого чата и для исходящих', () => {
    applyMessageEvent(event({ idMessage: 'a' }), onScreen)
    applyMessageEvent(event({ idMessage: 'b', direction: 'outgoing' }), offScreen)

    expect(useChatStore.getState().chats['10000000'].unreadCount).toBe(0)
  })
})
