import { Button } from '@/shared/ui'
import { useInstanceSettingsStore } from '../model/instanceSettingsStore'

export function FixSettingsButton() {
  const status = useInstanceSettingsStore((state) => state.status)
  const fix = useInstanceSettingsStore((state) => state.fix)

  return (
    <Button loading={status === 'fixing'} onClick={() => void fix()}>
      Исправить
    </Button>
  )
}
