'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import { cancelHrefFor } from '@/lib/home-picker-return'

/** Back to the home dashboard, shown only when it sent the clinician here. */
const BackToDashboard = () => {
  const { t } = useClientT(['devices'])
  const search = useSearchParams().toString()
  const href = cancelHrefFor(search, '')
  if (!href) return null

  return (
    <div className='px-4 pt-4'>
      <Button asChild variant='outline'>
        <Link href={href}>
          <ArrowLeft />
          {t('backToDashboard')}
        </Link>
      </Button>
    </div>
  )
}

export default BackToDashboard
