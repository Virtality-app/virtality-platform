'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { cancelHrefFor } from '@/lib/home-picker-return'
import { useClientT } from '@/i18n/use-client-t'
import StickyActionBar from '@/app/(app)/patients/_components/sticky-action-bar'
import UnsavedChangesNote from '@/app/(app)/patients/_components/unsaved-changes-note'

type NewPatientActionBarProps = {
  formId: string
  isDirty: boolean
  isCreating: boolean
}

/** New patient footer: Cancel goes back where the form was opened from. */
const NewPatientActionBar = ({
  formId,
  isDirty,
  isCreating,
}: NewPatientActionBarProps) => {
  const { t } = useClientT('common')
  const search = useSearchParams().toString()

  return (
    <StickyActionBar status={isDirty && <UnsavedChangesNote />}>
      <Button asChild type='button' variant='outline'>
        <Link href={cancelHrefFor(search, '/patients')}>{t('btn.cancel')}</Link>
      </Button>
      <Button
        type='submit'
        form={formId}
        variant='primary'
        disabled={isCreating}
        data-tour='patient-submit'
      >
        {isCreating ? <Loader2 className='animate-spin' /> : <UserPlus />}
        {t('btn.create')}
      </Button>
    </StickyActionBar>
  )
}

export default NewPatientActionBar
