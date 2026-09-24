import { useChatStore } from '@/entities/chat'
import { getApiClient } from '@/entities/session'
import { GreenApiError } from '@/shared/api'
import { normalizePhone, toChatId } from '@/shared/lib'

/** Подставляет имя собеседника из WhatsApp; без имени чат остаётся с номером. */
async function loadContactName(chatId: string): Promise<void> {
  try {
    const { contactName, name } = await getApiClient().getContactInfo(chatId)
    const resolved = contactName?.trim() || name?.trim()
    if (resolved) useChatStore.getState().ensureChat(chatId, resolved)
  } catch (error) {
    console.warn('getContactInfo failed', error)
  }
}

/**
 * Проверяет номер через checkWhatsapp, создаёт чат и открывает его.
 * Возвращает текст ошибки или null, если чат открыт.
 */
export async function createChatByPhone(input: string): Promise<string | null> {
  const phone = normalizePhone(input)
  if (!phone) return 'Введите номер в международном формате, например +7 999 123-45-67'

  try {
    const { existsWhatsapp } = await getApiClient().checkWhatsapp(phone)
    if (!existsWhatsapp) return 'Этот номер не зарегистрирован в WhatsApp'

    const chatId = toChatId(phone)
    const chats = useChatStore.getState()
    chats.ensureChat(chatId)
    chats.openChat(chatId)
    void loadContactName(chatId)
    return null
  } catch (error) {
    console.error('checkWhatsapp failed', error)
    if (error instanceof GreenApiError && error.status === null) {
      return 'Не удалось подключиться к GREEN-API. Проверьте интернет-соединение.'
    }
    // 466 — исчерпан лимит проверок номеров для инстанса.
    if (error instanceof GreenApiError && (error.status === 429 || error.status === 466)) {
      return 'Слишком много проверок номеров. Попробуйте позже.'
    }
    return 'Не удалось проверить номер. Попробуйте ещё раз.'
  }
}
