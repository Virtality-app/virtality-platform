'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ColumnHeader } from '@/components/tables/header-cell'
import { TranslationRowActions } from '@/components/translations/translation-row-actions'
import { valueListFilterFn } from '@/lib/table-value-filters'
import {
  TRANSLATION_STATUS_LABELS,
  type TranslationTableRow,
} from '@/lib/translation-rows'

export const columns: ColumnDef<TranslationTableRow>[] = [
  {
    accessorKey: 'namespace',
    header: ({ column }) => <ColumnHeader column={column} title='Namespace' />,
    filterFn: valueListFilterFn,
  },
  {
    accessorKey: 'key',
    header: ({ column }) => <ColumnHeader column={column} title='Key' />,
    cell: ({ row }) => (
      <span className='font-mono text-xs'>{row.original.key}</span>
    ),
  },
  {
    accessorKey: 'english',
    header: ({ column }) => <ColumnHeader column={column} title='English' />,
    cell: ({ row }) => (
      <div className='max-w-xs truncate'>{row.original.english}</div>
    ),
  },
  {
    accessorKey: 'greek',
    header: ({ column }) => <ColumnHeader column={column} title='Greek' />,
    cell: ({ row }) => (
      <div className='max-w-xs truncate'>{row.original.greek || '-'}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <ColumnHeader column={column} title='Status' />,
    cell: ({ row }) => TRANSLATION_STATUS_LABELS[row.original.status],
    filterFn: valueListFilterFn,
  },
  {
    id: 'actions',
    cell: ({ row }) => <TranslationRowActions row={row.original} />,
  },
]
