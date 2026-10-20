'use client'

import { ExerciseMediaCell } from '@/components/resources/exercises/exercise-media-cell'
import { BooleanCell } from '@/components/tables/boolean-cell'
import { ColumnHeader } from '@/components/tables/header-cell'
import { Exercise } from '@virtality/db'
import { ColumnDef } from '@tanstack/react-table'
import startCase from 'lodash.startcase'
import { valueListFilterFn } from '@/lib/table-value-filters'
import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'

export type ExerciseColumnHandlers = {
  onEditMedia: (exercise: Exercise) => void
}

export function createExerciseColumns({
  onEditMedia,
}: ExerciseColumnHandlers): ColumnDef<Exercise>[] {
  return [
    {
      accessorKey: 'id',
      cell({ row }) {
        const id: string = row.getValue('id')
        return <div>{id.split('-')[0]}</div>
      },
    },
    {
      accessorKey: 'displayName',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
    },
    {
      id: 'media',
      header: 'Media',
      enableSorting: false,
      cell: ({ row }) => (
        <ExerciseMediaCell
          image={row.original.image}
          video={row.original.video}
        />
      ),
    },
    {
      accessorKey: 'direction',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
      filterFn: valueListFilterFn,
    },
    {
      accessorKey: 'category',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
      filterFn: valueListFilterFn,
    },
    {
      accessorKey: 'enabled',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
      cell: ({ row }) => (
        <BooleanCell value={row.getValue<boolean>('enabled')} />
      ),
    },
    {
      accessorKey: 'isNew',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
      cell: ({ row }) => <BooleanCell value={row.getValue<boolean>('isNew')} />,
    },
    {
      accessorKey: 'description',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => onEditMedia(row.original)}
        >
          <ImageIcon className='size-4' />
          Edit media
        </Button>
      ),
    },
  ]
}
