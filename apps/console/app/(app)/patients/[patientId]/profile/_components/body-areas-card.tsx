'use client'
import { Crosshair } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import HumanBack from '@/components/body-map/human-back'
import HumanFront from '@/components/body-map/human-front'
import { BodyAreas } from '@/types/models'
import { markedBodyAreas } from '@/lib/body-areas'
import { useClientT } from '@/i18n/use-client-t'
import ProfileSectionCard from './profile-section-card'
import MarkedBodyAreas from './marked-body-areas'

type BodyAreasCardProps = {
  bodyAreas: BodyAreas
  onChange: (bodyAreas: BodyAreas) => void
  onClear: () => void
}

// The body-map SVGs grow to 60vh on wide screens; here they keep the card's size.
const MAP = 'flex w-32.5 flex-col items-center gap-2 [&_svg]:h-auto'
const MAP_LABEL =
  'text-[11.5px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400'

/** Front and back body maps to mark painful areas, with the marked list. */
const BodyAreasCard = ({
  bodyAreas,
  onChange,
  onClear,
}: BodyAreasCardProps) => {
  const { t } = useClientT('patients')
  const hasMarks = markedBodyAreas(bodyAreas).length > 0

  return (
    <ProfileSectionCard
      icon={<Crosshair />}
      title={t('profile.bodyAreas')}
      action={
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={onClear}
          disabled={!hasMarks}
        >
          {t('profile.clearAll')}
        </Button>
      }
      contentClassName='flex flex-wrap gap-7 p-5'
    >
      <div className={MAP}>
        <span className={MAP_LABEL}>{t('profile.front')}</span>
        <HumanFront
          value={bodyAreas.front}
          onSelect={(front) => onChange({ ...bodyAreas, front })}
        />
      </div>
      <div className={MAP}>
        <span className={MAP_LABEL}>{t('profile.back')}</span>
        <HumanBack
          value={bodyAreas.back}
          onSelect={(back) => onChange({ ...bodyAreas, back })}
        />
      </div>
      <MarkedBodyAreas bodyAreas={bodyAreas} />
    </ProfileSectionCard>
  )
}

export default BodyAreasCard
