'use client'

import Link from 'next/link'
import { Plus, Zap } from 'lucide-react'
import { Badge } from '@virtality/ui/components/badge'
import { useClientT } from '@/i18n/use-client-t'
import type { HomeDashboardData } from './use-home-dashboard-data'
import { QUICK_START_PROGRAM_ID } from '@/lib/home-session-picker'
import { withReturnTo } from '@/lib/home-picker-return'
import StartSessionStep from './start-session-step'
import StartSessionOption from './start-session-option'
import type { StartSessionPicker } from './use-start-session-picker'

const StartSessionProgramStep = ({
  programs,
  picker,
}: {
  programs: HomeDashboardData['programs']
  picker: StartSessionPicker
}) => {
  const { t } = useClientT('home')
  const { selection, selectProgram, lastProgramId, returnTo } = picker

  // The last used program leads; the rest keep library order (most recently
  // edited). Quick Start sits under the list so it never scrolls away.
  const lastUsed = programs.find((program) => program.id === lastProgramId)
  const rows = [
    ...(lastUsed ? [lastUsed] : []),
    ...programs.filter((program) => program.id !== lastProgramId),
  ]

  return (
    <StartSessionStep
      number={2}
      label={t('startSession.program')}
      tourTarget='session-program'
      done={Boolean(selection.programId)}
      footer={
        <>
          <StartSessionOption
            selected={selection.programId === QUICK_START_PROGRAM_ID}
            onSelect={() => selectProgram(QUICK_START_PROGRAM_ID)}
          >
            <div className='min-w-0 flex-1'>
              <div>{t('startSession.quickStart')}</div>
              <small className='text-muted-foreground block text-xs'>
                {t('startSession.quickStartHint')}
              </small>
            </div>
            <Zap className='text-muted-foreground size-4' />
          </StartSessionOption>
          <Link
            href={withReturnTo('/programs/new', returnTo)}
            className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-[13px]'
          >
            <Plus className='size-4' /> {t('startSession.newProgram')}
          </Link>
        </>
      }
    >
      {programs.length === 0 ? (
        <p className='text-muted-foreground text-[13px]'>
          {t('startSession.noPrograms')}
        </p>
      ) : null}
      {rows.map((program) => (
        <StartSessionOption
          key={program.id}
          selected={selection.programId === program.id}
          onSelect={() => selectProgram(program.id)}
        >
          <div className='min-w-0 flex-1'>
            <div className='truncate'>{program.name}</div>
            <small className='text-muted-foreground block text-xs'>
              {t('startSession.exercises', { count: program.exercises.length })}
            </small>
          </div>
          {program.id === lastProgramId ? (
            <Badge
              variant='outline'
              className='border-vital-blue-100 bg-vital-blue-50 text-vital-blue-700 dark:border-vital-blue-500/20 dark:bg-vital-blue-500/10 dark:text-vital-blue-300'
            >
              {t('startSession.lastUsed')}
            </Badge>
          ) : null}
        </StartSessionOption>
      ))}
    </StartSessionStep>
  )
}

export default StartSessionProgramStep
