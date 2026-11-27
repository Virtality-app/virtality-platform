'use client'

import type { SessionImmersiveVideo } from '@virtality/db'
import { useUserName } from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'
import SessionActivityIcon from './session-activity-icon'
import ImmersiveSessionWatched from './immersive-session-watched'
import DetailRow from './session-detail-row'

/** Session Details for an Immersive Session: no exercises, one video. */
const ImmersiveSessionDetails = ({
  video,
  durationMin,
}: {
  video: SessionImmersiveVideo
  durationMin: number | null
}) => {
  const { t } = useClientT('patients')
  const { data: userName } = useUserName()

  return (
    <div>
      <h3 className='mb-2 font-medium'>{t('session.details')}</h3>
      <div className='space-y-2 text-sm'>
        <DetailRow label={t('session.duration')}>
          {durationMin == null
            ? '—'
            : t('session.durationMinutes', { minutes: durationMin.toFixed(1) })}
        </DetailRow>
        <DetailRow label={t('session.immersive.videoWatched')}>
          <ImmersiveSessionWatched video={video} />
        </DetailRow>
        <DetailRow label={t('session.immersive.activity')}>
          <span className='inline-flex items-center gap-1.5'>
            <SessionActivityIcon activity={video.activity} />
            {t(`session.immersive.activities.${video.activity}`)}
          </span>
        </DetailRow>
        <DetailRow label={t('session.immersive.ended')}>
          {video.endReason
            ? t(`session.immersive.endReason.${video.endReason}`)
            : '—'}
        </DetailRow>
        <DetailRow label={t('session.therapist')}>
          <span className='ph-sensitive'>
            {userName ?? t('session.unknownTherapist')}
          </span>
        </DetailRow>
      </div>
    </div>
  )
}

export default ImmersiveSessionDetails
