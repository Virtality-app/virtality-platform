import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { cancelHrefFor } from '@/lib/home-picker-return'
import { useClientT } from '@/i18n/use-client-t'

/** Cancel and Create under the new patient form. */
const PatientFormActions = ({ isPending }: { isPending: boolean }) => {
  const { t } = useClientT(['common'])
  const search = useSearchParams().toString()

  return (
    <div className='flex justify-end space-x-4'>
      <Button asChild type='button' variant='outline'>
        <Link href={cancelHrefFor(search, '/patients')}>{t('btn.cancel')}</Link>
      </Button>

      <Button
        type='submit'
        form='patient-form'
        variant='primary'
        data-tour='patient-submit'
      >
        {isPending ? <Loader2 className='animate-spin' /> : t('btn.create')}
      </Button>
    </div>
  )
}

export default PatientFormActions
