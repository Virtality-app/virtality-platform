'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'

export function DeleteFromHeadsetButton({
  disabled,
  onDelete,
}: {
  disabled: boolean
  onDelete: () => void
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon-sm'
      disabled={disabled}
      aria-label='Delete from headset'
      onClick={onDelete}
    >
      <Trash2 />
    </Button>
  )
}
