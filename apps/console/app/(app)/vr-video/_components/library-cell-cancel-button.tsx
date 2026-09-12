'use client'

import { X } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'

export function LibraryCellCancelButton({
  disabled,
  onCancel,
}: {
  disabled: boolean
  onCancel: () => void
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon-sm'
      disabled={disabled}
      aria-label='Cancel'
      onClick={onCancel}
    >
      <X />
    </Button>
  )
}
