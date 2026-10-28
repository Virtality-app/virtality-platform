'use client'

import { Button } from '@virtality/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@virtality/ui/components/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { Copy, Ellipsis, NotebookPen } from 'lucide-react'
import { format } from 'date-fns'
import TranslatedColumnHeader from '@/app/(app)/patients/_components/translated-column-header'
import TranslatedText from '@/app/(app)/patients/_components/translated-text'
import i18next from '@/i18n/i18next'
import { useClientT } from '@/i18n/use-client-t'
import type { SessionListRowModel } from '@/lib/session-list-row'
import SessionStatusBadge from './session-status-badge'
import { cn } from '@/lib/utils'
import SessionProgressDelta from './session-progress-delta'

const NUMERIC_CELL_CLASS = 'text-right tabular-nums'

const formatPct = (value: number | null) =>
  value == null ? '—' : `${value.toFixed(1)}%`

export const sessionsColumns: ColumnDef<SessionListRowModel>[] = [
  {
    id: 'date',
    accessorFn: (row) => row.date?.getTime() ?? 0,
    header: ({ column }) => (
      <TranslatedColumnHeader column={column} labelKey='sessionsTable.date' />
    ),
    cell: ({ row }) => {
      const { date } = row.original
      if (!date) return '—'
      return (
        <div className='whitespace-nowrap'>
          {format(date, 'PP')}
          <span className='text-muted-foreground ml-2 text-xs'>
            {format(date, 'H:mm')}
          </span>
        </div>
      )
    },
  },
  {
    id: 'program',
    accessorFn: (row) => row.programName,
    header: () => <TranslatedText labelKey='sessionsTable.program' />,
    cell: ({ row }) => (
      <span className='text-sm'>{row.original.programName}</span>
    ),
    enableSorting: false,
  },
  {
    id: 'status',
    accessorFn: (row) => row.session.status,
    header: () => <TranslatedText labelKey='sessionsTable.status' />,
    cell: ({ row }) => {
      const { status } = row.original.session
      return (
        <SessionStatusBadge
          status={status}
          className='font-normal'
          fallback='—'
        />
      )
    },
    enableSorting: false,
  },
  {
    id: 'duration',
    accessorFn: (row) => row.durationMin ?? -1,
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='sessionsTable.duration'
        className='justify-end'
      />
    ),
    cell: ({ row }) => {
      const min = row.original.durationMin
      return (
        <div className={NUMERIC_CELL_CLASS}>
          {min == null ? (
            '—'
          ) : (
            <TranslatedText
              labelKey='sessionsTable.durationMin'
              values={{ minutes: min.toFixed(1) }}
            />
          )}
        </div>
      )
    },
  },
  {
    id: 'exercises',
    accessorFn: (row) => row.exercisesDone,
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='sessionsTable.exercises'
        className='text-right'
      />
    ),
    cell: ({ row }) => {
      const { exercisesDone, exercisesPlanned } = row.original
      return (
        <div
          className={cn(
            NUMERIC_CELL_CLASS,
            exercisesPlanned > 0 &&
              exercisesDone < exercisesPlanned &&
              'text-amber-700 dark:text-amber-300',
          )}
        >
          {exercisesDone}/{exercisesPlanned}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'avgProgress',
    accessorFn: (row) => row.avgProgressPct ?? -1,
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='sessionsTable.averageProgress'
        className='justify-end'
      />
    ),
    cell: ({ row }) => {
      const { avgProgressPct, progressDeltaPct } = row.original
      return (
        <div
          className={cn(
            NUMERIC_CELL_CLASS,
            'flex items-center justify-end gap-1.5',
          )}
        >
          <span>{formatPct(avgProgressPct)}</span>
          <SessionProgressDelta deltaPct={progressDeltaPct} />
        </div>
      )
    },
  },
  {
    id: 'bestRep',
    accessorFn: (row) => row.bestRepPct ?? -1,
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='sessionsTable.bestRepetition'
        className='text-right'
      />
    ),
    cell: ({ row }) => (
      <div className={NUMERIC_CELL_CLASS}>
        {formatPct(row.original.bestRepPct)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'notes',
    accessorFn: (row) => row.hasNotes,
    header: () => (
      <span className='sr-only'>
        <TranslatedText labelKey='sessionsTable.notes' />
      </span>
    ),
    cell: ({ row }) =>
      row.original.hasNotes ? (
        <NotebookPen
          className='text-muted-foreground size-4'
          aria-label={i18next.t('sessionsTable.hasNotes', { ns: 'patients' })}
        />
      ) : null,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    enableHiding: false,
    enableSorting: false,
    cell: function ActionCell({ row }) {
      const { t } = useClientT('patients')
      const copyId = () => {
        navigator.clipboard.writeText(row.original.id)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button id='actions' size='icon' variant='ghost' className='size-6'>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent id='actions'>
            <DropdownMenuItem onClick={copyId}>
              <Copy />
              {t('sessionsTable.copyId')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
