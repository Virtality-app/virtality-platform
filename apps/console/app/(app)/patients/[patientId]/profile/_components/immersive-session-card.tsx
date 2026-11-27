'use client'

import { Badge } from '@virtality/ui/components/badge'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { Separator } from '@virtality/ui/components/separator'
import { format } from 'date-fns'
import { MoveLeft } from 'lucide-react'
import { motion } from 'motion/react'
import type { SessionImmersiveVideo } from '@virtality/db'
import type { ExtendedPatientSession } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'
import { useDateFnsLocale } from '@/hooks/use-date-fns-locale'
import { getClinicalHistorySessionDate } from '@/lib/session-history'
import { getSessionDurationMinutes } from '@/lib/session-metrics'
import SessionStatusBadge from './session-status-badge'
import SessionActivityIcon from './session-activity-icon'
import ImmersiveSessionDetails from './immersive-session-details'
import { useImmersiveSessionCatalogVideo } from './use-immersive-session-catalog-video'

interface ImmersiveSessionCardProps {
  session: ExtendedPatientSession
  video: SessionImmersiveVideo
  onBack: (value: string) => void
}

/**
 * The detail card for an Immersive Session. It has no chart, metrics,
 * exercise table or notes: one video, how long it ran and how it ended.
 */
const ImmersiveSessionCard = ({
  session,
  video,
  onBack,
}: ImmersiveSessionCardProps) => {
  const { t } = useClientT(['patients', 'common'])
  const locale = useDateFnsLocale()
  const { thumbnailUrl, inCatalog } = useImmersiveSessionCatalogVideo(
    video.immersiveVideoId,
  )
  const date =
    getClinicalHistorySessionDate(session) ?? new Date(session.createdAt)

  return (
    <motion.div
      key={session.id}
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className='flex flex-1 flex-col rounded-xl'
    >
      <Card className='flex-1 p-6'>
        <CardHeader>
          <CardTitle className='flex flex-wrap items-start justify-between gap-3'>
            <span className='flex flex-wrap items-center gap-2'>
              <SessionActivityIcon activity={video.activity} />
              <span>{video.videoTitle}</span>
              <Badge variant='secondary' className='font-normal'>
                {t('session.immersive.badge')}
              </Badge>
              {inCatalog ? null : (
                <Badge variant='outline' className='font-normal'>
                  {t('session.immersive.notInCatalog')}
                </Badge>
              )}
            </span>
            <SessionStatusBadge status={session.status} />
          </CardTitle>
          <CardDescription>
            {t('session.dateAtTime', {
              date: format(date, 'PPPP', { locale }),
              time: format(date, 'H:mm'),
            })}
          </CardDescription>
        </CardHeader>
        <div className='flex flex-1 flex-col space-y-6'>
          <Separator />
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <ImmersiveSessionDetails
              video={video}
              durationMin={getSessionDurationMinutes(session)}
            />
            {thumbnailUrl ? (
              // Catalog thumbnails are CDN URLs outside the Next image host list.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt=''
                className='aspect-video w-full max-w-sm rounded-lg border object-cover md:justify-self-end'
              />
            ) : null}
          </div>
        </div>
        <Button onClick={() => onBack('')} className='w-fit'>
          <MoveLeft /> {t('btn.back', { ns: 'common' })}
        </Button>
      </Card>
    </motion.div>
  )
}

export default ImmersiveSessionCard
