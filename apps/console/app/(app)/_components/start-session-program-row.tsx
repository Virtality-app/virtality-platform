'use client'

import { useState } from 'react'
import { Badge } from '@virtality/ui/components/badge'
import { useClientT } from '@/i18n/use-client-t'
import { withReturnTo } from '@/lib/home-picker-return'
import RetireProgramDialog from '@/components/dialogs/retire-program-dialog'
import type { HomeDashboardData } from './use-home-dashboard-data'
import StartSessionOption from './start-session-option'
import StartSessionRowMenu from './start-session-row-menu'
import type { StartSessionPicker } from './use-start-session-picker'

/** A program in the picker, with its Edit / Delete menu. */
const StartSessionProgramRow = ({
  program,
  picker,
}: {
  program: HomeDashboardData['programs'][number]
  picker: StartSessionPicker
}) => {
  const { t } = useClientT('home')
  const [retireOpen, setRetireOpen] = useState(false)
  const selected = picker.selection.programId === program.id

  return (
    <div className='group/row relative'>
      <StartSessionOption
        selected={selected}
        onSelect={() => picker.selectProgram(program.id)}
        className='pr-9'
      >
        <div className='min-w-0 flex-1'>
          <div className='truncate'>{program.name}</div>
          <small className='text-muted-foreground block text-xs'>
            {t('startSession.exercises', { count: program.exercises.length })}
          </small>
        </div>
        {program.id === picker.lastProgramId ? (
          <Badge
            variant='outline'
            className='border-vital-blue-100 bg-vital-blue-50 text-vital-blue-700 dark:border-vital-blue-500/20 dark:bg-vital-blue-500/10 dark:text-vital-blue-300'
          >
            {t('startSession.lastUsed')}
          </Badge>
        ) : null}
      </StartSessionOption>
      <StartSessionRowMenu
        label={program.name}
        editHref={withReturnTo(`/programs/${program.id}/edit`, picker.returnTo)}
        selected={selected}
        onDelete={() => setRetireOpen(true)}
      />
      <RetireProgramDialog
        programId={program.id}
        open={retireOpen}
        onOpenChange={setRetireOpen}
        onRetired={picker.programRetired}
      />
    </div>
  )
}

export default StartSessionProgramRow
