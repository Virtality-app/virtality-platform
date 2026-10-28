'use client'

import { Button } from '@virtality/ui/components/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@virtality/ui/components/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { Copy, Ellipsis, Pencil, Trash2 } from 'lucide-react'
import TranslatedColumnHeader from './translated-column-header'
import TranslatedText from './translated-text'
import { format } from 'date-fns'
import { PatientListItem } from '@/types/models'
import DeleteConfirmDialog from '@/components/dialogs/delete-confirm-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useDeletePatient,
  useORPC,
  getQueryClient,
} from '@virtality/react-query'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import { Trans } from 'react-i18next'
import i18next from '@/i18n/i18next'
import { useClientT } from '@/i18n/use-client-t'

export const columns: ColumnDef<PatientListItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={i18next.t('columns.selectAll', { ns: 'patients' })}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        id='select'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={i18next.t('columns.selectRow', { ns: 'patients' })}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: '#',
    cell: ({ cell }) => <div>{cell.row.index + 1}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='columns.name'
        className='capitalize'
      />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='columns.email'
        className='capitalize'
      />
    ),
  },
  {
    accessorKey: 'activeProgramName',
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='columns.activeProgram'
        className='capitalize'
      />
    ),
    cell: ({ row }) => {
      const name: string | null = row.getValue('activeProgramName')
      return <div>{name ?? '—'}</div>
    },
  },
  {
    accessorKey: 'totalSessions',
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='columns.totalSessions'
        className='capitalize'
      />
    ),
  },
  {
    accessorKey: 'lastSessionAt',
    header: ({ column }) => (
      <TranslatedColumnHeader
        column={column}
        labelKey='columns.lastSession'
        className='capitalize'
      />
    ),
    cell: ({ row }) => {
      const date: Date | null = row.getValue('lastSessionAt')
      if (!date)
        return (
          <div>
            <TranslatedText labelKey='columns.noSessionsYet' />
          </div>
        )
      return <div>{format(date, 'PPP')}</div>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function ActionCell({ row }) {
      const queryClient = getQueryClient()
      const orpc = useORPC()
      const router = useRouter()
      const { t } = useClientT('patients')
      const patient = row.original

      const [open, setOpen] = useState(false)

      const { mutate: deletePatient } = useDeletePatient({
        onSuccess: () => {
          trackAnalyticsEvent('patient_deleted', {})
          return queryClient.invalidateQueries({
            queryKey: orpc.patient.list.key(),
          })
        },
      })

      const copyId = () => {
        navigator.clipboard.writeText(patient.id)
      }

      const editHandler = () => {
        router.push(`/patients/${patient.id}/profile`)
      }

      const handleConfirmDelete = () => {
        deletePatient({ id: patient.id })
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id='actions'
                size='icon'
                variant='ghost'
                className='size-6'
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent id='actions'>
              <DropdownMenuItem onClick={copyId}>
                <Copy />
                {t('actions.copyId')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={editHandler}>
                <Pencil />
                {t('actions.edit')}
              </DropdownMenuItem>

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <Trash2 />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteConfirmDialog
            title={t('delete.title')}
            description={
              <Trans
                i18n={i18next}
                t={t}
                ns='patients'
                i18nKey='delete.description'
                values={{ name: patient.name }}
                components={{ strong: <strong /> }}
              />
            }
            open={open}
            onOpenChange={setOpen}
            onConfirm={handleConfirmDelete}
          />
        </>
      )
    },
  },
]
