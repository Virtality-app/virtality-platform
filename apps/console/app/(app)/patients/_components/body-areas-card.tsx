'use client'
import { Crosshair } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import HumanBack from '@/components/body-map/human-back'
import HumanFront from '@/components/body-map/human-front'
import { BodyAreas } from '@/types/models'
import { markedBodyAreas, unmarkBodyArea } from '@/lib/body-areas'
import { useClientT } from '@/i18n/use-client-t'
import ProfileSectionCard from './profile-section-card'
import MarkedBodyAreas from './marked-body-areas'
import BodyMapPanel from './body-map-panel'

type BodyAreasCardProps = {
  bodyAreas: BodyAreas
  onChange: (bodyAreas: BodyAreas) => void
  onClear: () => void
}

/**
 * Front and back body maps to mark painful areas, with the marked list.
 * Phones and tablets: the two maps share the card's width, list below.
 * Wide desktop: the list moves to a third column beside the maps.
 */
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
      contentClassName='grid grid-cols-2 gap-x-6 gap-y-6 p-5 xl:grid-cols-[repeat(2,minmax(0,15rem))_minmax(0,1fr)]'
    >
      <BodyMapPanel label={t('profile.front')}>
        <HumanFront
          value={bodyAreas.front}
          onSelect={(front) => onChange({ ...bodyAreas, front })}
        />
      </BodyMapPanel>
      <BodyMapPanel label={t('profile.back')}>
        <HumanBack
          value={bodyAreas.back}
          onSelect={(back) => onChange({ ...bodyAreas, back })}
        />
      </BodyMapPanel>
      <MarkedBodyAreas
        bodyAreas={bodyAreas}
        onUnmark={(area) => onChange(unmarkBodyArea(bodyAreas, area))}
        className='col-span-2 xl:col-span-1'
      />
    </ProfileSectionCard>
  )
}

export default BodyAreasCard
