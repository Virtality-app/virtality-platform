'use client'

import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

export function LibraryCellCancelButton({
  disabled,
  onCancel,
}: {
  disabled: boolean
  onCancel: () => void
}) {
  const { t } = useClientT('common')

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      disabled={disabled}
      onClick={onCancel}
    >
      {t('btn.cancel')}
    </Button>
  )
}
