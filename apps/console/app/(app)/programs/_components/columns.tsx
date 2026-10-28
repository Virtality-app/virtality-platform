'use client'

import { ColumnDef } from '@tanstack/react-table'
import DateCell from '@/components/tables/date-cell'
import { CompleteReusableProgram } from '@/types/models'
import { getProgramExerciseCount } from '@/lib/program-library'
import ProgramActionsCell from './program-actions-cell'
import ProgramColumnHeader from './program-column-header'

export const programLibraryColumns: ColumnDef<CompleteReusableProgram>[] = [
  {
    accessorKey: '#',
    cell: ({ cell }) => <div>{cell.row.index + 1}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <ProgramColumnHeader column={column} titleKey='name' />
    ),
  },
  {
    id: 'exerciseCount',
    accessorFn: (row) => getProgramExerciseCount(row),
    header: ({ column }) => (
      <ProgramColumnHeader column={column} titleKey='exercises' />
    ),
    cell: ({ row }) => <div>{getProgramExerciseCount(row.original)}</div>,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <ProgramColumnHeader column={column} titleKey='updatedAt' />
    ),
    cell: ({ row, column }) => <DateCell row={row} id={column.id} />,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ProgramActionsCell programId={row.original.id} />,
  },
]
