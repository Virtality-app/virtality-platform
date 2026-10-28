'use client'

import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { Separator } from '@virtality/ui/components/separator'

import { ExtendedPatientSession } from '@/types/models'
import { useExercise, useUserName } from '@virtality/react-query'
import { format } from 'date-fns'
import { ChartArea, List, MoveLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import { getSessionSourceProgramDisplayName } from '@/lib/session-history'
import { useClientT } from '@/i18n/use-client-t'
import SessionStatusBadge from './session-status-badge'
import MetricSection from './session-metric-section'
import SessionExerciseMetricsTable from './session-exercise-metrics-table'
import SessionCardNotes from './session-card-notes'
import SessionCardChart from './session-card-chart'

interface SessionCardProps {
  session: ExtendedPatientSession
  patientId: string
  onBack: (value: string) => void
}

const SessionCard = ({ session, patientId, onBack }: SessionCardProps) => {
  usePageViewTracking({
    props: { route_group: 'patient', tab_view: 'patient-session' },
  })
  const { t } = useClientT(['patients', 'common'])
  const [view, setView] = useState(true)

  const { data: userName } = useUserName()
  const { data: exercises } = useExercise()

  const sessionDuration = () => {
    if (!session) return 0
    const { completedAt, createdAt } = session
    if (completedAt && createdAt) {
      const start = new Date(createdAt).getTime()
      const end = new Date(completedAt).getTime()
      return ((end - start) / 60_000).toFixed(2)
    }
    return 0
  }

  const historyDate =
    session.completedAt != null
      ? new Date(session.completedAt)
      : new Date(session.createdAt)

  const completedAtTime = () => format(historyDate, 'H:mm')

  const sourceProgramName = getSessionSourceProgramDisplayName(session)

  const handleBack = () => {
    onBack('')
  }

  return (
    <AnimatePresence mode='wait'>
      {
        <motion.div
          key={session.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='bg-vital-blue-700/40 flex flex-1 flex-col rounded-xl'
        >
          <Card className='flex-1 p-6'>
            <CardHeader>
              <CardTitle className='flex justify-between'>
                <span>{sourceProgramName}</span>
                <div className='flex flex-col gap-2'>
                  <SessionStatusBadge status={session.status} />
                  <Button
                    size='icon'
                    className='ml-auto'
                    onClick={() => {
                      setView(!view)
                    }}
                  >
                    {view ? <ChartArea /> : <List />}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {t('session.dateAtTime', {
                  date: format(historyDate, 'PPPP'),
                  time: completedAtTime(),
                })}
              </CardDescription>
            </CardHeader>
            <div className='flex flex-1 flex-col space-y-6'>
              <Separator />
              {view ? (
                <div className='space-y-6'>
                  {/* Session Info */}
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                      <div>
                        <h3 className='mb-2 font-medium'>
                          {t('session.details')}
                        </h3>
                        <div className='space-y-2 text-sm'>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              {t('session.duration')}
                            </span>
                            <span>
                              {t('session.durationMinutes', {
                                minutes: sessionDuration(),
                              })}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-muted-foreground'>
                              {t('session.therapist')}
                            </span>
                            <span>
                              {userName ?? t('session.unknownTherapist')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session metrics */}
                  <MetricSection session={session} exercises={exercises} />

                  <Separator />

                  {/* Per-exercise metrics */}
                  <SessionExerciseMetricsTable
                    session={session}
                    exercises={exercises}
                  />

                  <Separator />

                  {/* Notes Section */}
                  <SessionCardNotes session={session} patientId={patientId} />
                </div>
              ) : (
                <SessionCardChart session={session} exercises={exercises} />
              )}
            </div>
            <Button onClick={handleBack} className='w-fit'>
              <MoveLeft /> {t('btn.back', { ns: 'common' })}
            </Button>
          </Card>
        </motion.div>
      }
    </AnimatePresence>
  )
}

export default SessionCard
