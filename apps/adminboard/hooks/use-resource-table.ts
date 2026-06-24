'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { tableDefaults } from '@virtality/ui/lib/table-defaults'
import { useState } from 'react'

type UseResourceTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
  enableColumnFilters?: boolean
}

export function useResourceTable<TData>({
  data,
  columns,
  enableColumnFilters = false,
}: UseResourceTableOptions<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    ...tableDefaults.models,
    state: enableColumnFilters
      ? {
          sorting,
          globalFilter,
          columnFilters,
          rowSelection,
          columnVisibility,
        }
      : {
          sorting,
          globalFilter,
          rowSelection,
          columnVisibility,
        },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    ...(enableColumnFilters ? { onColumnFiltersChange: setColumnFilters } : {}),
  })

  return {
    table,
    globalFilter,
    setGlobalFilter,
    setColumnFilters,
  }
}
