import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { instanceScopedStorage } from '@/shared/lib'
import {
  confirmMessage,
  restoreMessages,
  setMessageStatus,
  upsertMessage,
} from '../lib/messageList'
import type { Message, MessageStatus } from './types'

type MessagesByChat = Record<string, Message[]>

interface MessageState {
  byChat: MessagesByChat
  upsert: (message: Message) => void
  confirm: (chatId: string, tempId: string, idMessage: string) => void
  setStatus: (chatId: string, id: string, status: MessageStatus) => void
  removeChat: (chatId: string) => void
  reset: () => void
}

const updateChatMessages = (
  byChat: MessagesByChat,
  chatId: string,
  update: (list: Message[]) => Message[],
): MessagesByChat => {
  const current = byChat[chatId] ?? []
  const next = update(current)
  return next === current ? byChat : { ...byChat, [chatId]: next }
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      byChat: {},
      upsert: (message) =>
        set((state) => ({
          byChat: updateChatMessages(state.byChat, message.chatId, (list) =>
            upsertMessage(list, message),
          ),
        })),
      confirm: (chatId, tempId, idMessage) =>
        set((state) => ({
          byChat: updateChatMessages(state.byChat, chatId, (list) =>
            confirmMessage(list, tempId, idMessage),
          ),
        })),
      setStatus: (chatId, id, status) =>
        set((state) => ({
          byChat: updateChatMessages(state.byChat, chatId, (list) =>
            setMessageStatus(list, id, status),
          ),
        })),
      removeChat: (chatId) =>
        set((state) => {
          const byChat = { ...state.byChat }
          delete byChat[chatId]
          return { byChat }
        }),
      reset: () => set({ byChat: {} }),
    }),
    {
      name: 'messages',
      storage: createJSONStorage(() => instanceScopedStorage),
      partialize: (state) => ({ byChat: state.byChat }),
      merge: (persisted, current) => ({
        ...current,
        byChat: restoreMessages((persisted as Partial<MessageState> | undefined)?.byChat ?? {}),
      }),
      skipHydration: true,
    },
  ),
)

const EMPTY: Message[] = []

/** Сообщения чата; для чата без сообщений — один и тот же пустой массив, чтобы не было лишних рендеров. */
export const useChatMessages = (chatId: string): Message[] =>
  useMessageStore((state) => state.byChat[chatId] ?? EMPTY)
