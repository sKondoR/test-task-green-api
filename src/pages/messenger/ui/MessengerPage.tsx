import { useChatStore } from '@/entities/chat'
import { useInstanceSettingsCheck } from '@/features/fix-instance-settings'
import { useNotificationPolling } from '@/features/receive-notifications'
import { ChatListPanel } from '@/widgets/chat-list-panel'
import { ChatWindow } from '@/widgets/chat-window'
import { InstanceSettingsBanner } from '@/widgets/instance-settings-banner'
import { NavRail } from '@/widgets/nav-rail'
import styles from './MessengerPage.module.css'

export function MessengerPage() {
  useNotificationPolling()
  useInstanceSettingsCheck()
  const chatOpen = useChatStore((state) => state.activeChatId !== null)

  return (
    <div className={styles.page}>
      <InstanceSettingsBanner />
      {/* На узком экране виден либо список, либо открытый чат. */}
      <div className={styles.layout} data-chat-open={chatOpen || undefined}>
        <div className={styles.rail}>
          <NavRail />
        </div>
        <div className={styles.list}>
          <ChatListPanel />
        </div>
        <main className={styles.window}>
          <ChatWindow />
        </main>
      </div>
    </div>
  )
}
