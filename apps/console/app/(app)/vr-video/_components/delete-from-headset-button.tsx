'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import { DeleteFromHeadsetDialog } from './delete-from-headset-dialog'

export function DeleteFromHeadsetButton({
  disabled,
  onDelete,
}: {
  disabled: boolean
  onDelete: () => void
}) {
  const { t } = useClientT('vr-video')
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        className='text-destructive hover:text-destructive hover:bg-destructive/10'
        disabled={disabled}
        aria-label={t('cell.deleteFromHeadset')}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 />
      </Button>
      <DeleteFromHeadsetDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete()
        }}
      />
    </>
  )
}
