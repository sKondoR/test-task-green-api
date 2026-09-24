import { useSessionStore } from '@/entities/session'
import { LoginPage } from '@/pages/login'
import { MessengerPage } from '@/pages/messenger'
import { Toaster } from '@/shared/ui'

export function App() {
  const loggedIn = useSessionStore((state) => state.credentials !== null)

  return (
    <>
      {loggedIn ? <MessengerPage /> : <LoginPage />}
      <Toaster />
    </>
  )
}
