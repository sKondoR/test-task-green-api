import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { formatPhone, instanceScopedStorage, phoneFromChatId } from '@/shared/lib'
import type { Chat } from './types'

type ChatMap = Record<string, Chat>

/** Название чата, пока имя собеседника неизвестно: номер телефона или сам chatId. */
function placeholderName(id: string): string {
  const phone = phoneFromChatId(id)
  return phone ? formatPhone(phone) : id
}

/**
 * Создаёт чат, если его нет. Пока имя собеседника неизвестно, чат называется заглушкой,
 * а когда настоящее имя становится известно, чат переименовывается.
 */
export function ensureChat(
  chats: ChatMap,
  id: string,
  name: string | undefined,
  now: number,
): ChatMap {
  const existing = chats[id]
  const placeholder = placeholderName(id)
  if (!existing) {
    return { ...chats, [id]: { id, name: name || placeholder, unreadCount: 0, createdAt: now } }
  }
  // Старые сохранённые чаты могли получить заглушкой сам chatId.
  const isPlaceholder = existing.name === placeholder || existing.name === id
  if (name && isPlaceholder && name !== existing.name)
    return { ...chats, [id]: { ...existing, name } }
  return chats
}

interface ChatState {
  chats: ChatMap
  activeChatId: string | null
  ensureChat: (id: string, name?: string) => void
  openChat: (id: string) => void
  closeChat: () => void
  incrementUnread: (id: string) => void
  markRead: (id: string) => void
  removeChat: (id: string) => void
  reset: () => void
}

const updateChat = (chats: ChatMap, id: string, patch: (chat: Chat) => Partial<Chat>): ChatMap =>
  chats[id] ? { ...chats, [id]: { ...chats[id], ...patch(chats[id]) } } : chats

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: {},
      activeChatId: null,
      ensureChat: (id, name) =>
        set((state) => ({ chats: ensureChat(state.chats, id, name, Date.now()) })),
      openChat: (id) =>
        set((state) => ({
          activeChatId: id,
          chats: updateChat(state.chats, id, () => ({ unreadCount: 0 })),
        })),
      closeChat: () => set({ activeChatId: null }),
      incrementUnread: (id) =>
        set((state) => ({
          chats: updateChat(state.chats, id, (chat) => ({ unreadCount: chat.unreadCount + 1 })),
        })),
      markRead: (id) =>
        set((state) => ({ chats: updateChat(state.chats, id, () => ({ unreadCount: 0 })) })),
      removeChat: (id) =>
        set((state) => {
          const chats = { ...state.chats }
          delete chats[id]
          return { chats, activeChatId: state.activeChatId === id ? null : state.activeChatId }
        }),
      reset: () => set({ chats: {}, activeChatId: null }),
    }),
    {
      name: 'chats',
      storage: createJSONStorage(() => instanceScopedStorage),
      partialize: (state) => ({ chats: state.chats }),
      // Данные читаются только после выбора инстанса (см. app/providers/instanceData).
      skipHydration: true,
    },
  ),
)
