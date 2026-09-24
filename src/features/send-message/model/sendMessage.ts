import { useMessageStore, type Message } from '@/entities/message'
import { getApiClient } from '@/entities/session'

let localIdCounter = 0
const createLocalId = () => `local-${Date.now()}-${++localIdCounter}`

async function deliver(chatId: string, localId: string, text: string): Promise<void> {
  const messages = useMessageStore.getState()
  try {
    const { idMessage } = await getApiClient().sendMessage(chatId, text)
    messages.confirm(chatId, localId, idMessage)
  } catch (error) {
    console.error('sendMessage failed', error)
    messages.setStatus(chatId, localId, 'error')
  }
}

/** Сообщение сразу появляется в ленте со статусом «отправляется», затем подтверждается ответом sendMessage. */
export function sendTextMessage(chatId: string, text: string): Promise<void> {
  const localId = createLocalId()
  useMessageStore.getState().upsert({
    id: localId,
    chatId,
    text,
    timestamp: Date.now(),
    direction: 'outgoing',
    status: 'sending',
  })
  return deliver(chatId, localId, text)
}

export function retryMessage(message: Message): Promise<void> {
  useMessageStore.getState().setStatus(message.chatId, message.id, 'sending')
  return deliver(message.chatId, message.id, message.text)
}
