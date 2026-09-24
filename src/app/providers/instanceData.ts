import { useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import { useSessionStore } from '@/entities/session'
import { setInstanceScope } from '@/shared/lib'

/**
 * Держит чаты и сообщения в памяти синхронно с текущей сессией:
 * при входе загружает историю этого инстанса, при выходе очищает память,
 * не трогая сохранённую историю (запись в хранилище в этот момент отключена).
 */
export function initInstanceDataSync(): () => void {
  let currentInstance: string | null | undefined

  const apply = (idInstance: string | null) => {
    if (idInstance === currentInstance) return
    currentInstance = idInstance

    setInstanceScope(null)
    useChatStore.getState().reset()
    useMessageStore.getState().reset()

    if (idInstance) {
      setInstanceScope(idInstance)
      void useChatStore.persist.rehydrate()
      void useMessageStore.persist.rehydrate()
    }
  }

  apply(useSessionStore.getState().credentials?.idInstance ?? null)
  return useSessionStore.subscribe((state) => apply(state.credentials?.idInstance ?? null))
}
