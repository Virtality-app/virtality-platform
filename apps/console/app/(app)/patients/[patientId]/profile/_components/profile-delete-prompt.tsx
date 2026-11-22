'use client'
import { Trans } from 'react-i18next'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

type ProfileDeletePromptProps = {
  patientName: string
  onCancel: () => void
  onConfirm: () => void
}

/** "Delete <name>? This can't be undone." with Cancel and Confirm delete. */
const ProfileDeletePrompt = ({
  patientName,
  onCancel,
  onConfirm,
}: ProfileDeletePromptProps) => {
  const { t } = useClientT(['patients', 'common'])

  return (
    <div className='flex flex-wrap items-center gap-2.5'>
      <span className='text-[13.5px] text-zinc-700 dark:text-zinc-300'>
        <Trans
          t={t}
          ns='patients'
          i18nKey='profile.deletePrompt'
          values={{ name: patientName }}
          components={{ strong: <strong className='ph-sensitive' /> }}
        />
      </span>
      <Button type='button' variant='outline' onClick={onCancel}>
        {t('btn.cancel', { ns: 'common' })}
      </Button>
      <Button type='button' variant='destructive' onClick={onConfirm}>
        {t('profile.confirmDelete')}
      </Button>
    </div>
  )
}

export default ProfileDeletePrompt
