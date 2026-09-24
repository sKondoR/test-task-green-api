import { useState } from 'react'
import { IconButton, PlusIcon } from '@/shared/ui'
import { NewChatDialog } from './NewChatDialog'

export function NewChatButton() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <IconButton label="Новый чат" variant="accent" onClick={() => setDialogOpen(true)}>
        <PlusIcon size={22} />
      </IconButton>
      {dialogOpen && <NewChatDialog onClose={() => setDialogOpen(false)} />}
    </>
  )
}
