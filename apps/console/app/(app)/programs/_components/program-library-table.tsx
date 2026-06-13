'use client'

import {
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { tableDefaults } from '@/components/tables/tanstack-table'
import {
  DataTableBody,
  DataTableFooter,
  DataTableHeader,
} from '@/components/tables/data-table'
import { useReusablePrograms } from '@virtality/react-query'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import { filterProgramsBySearch } from '@/lib/program-library'
import { programLibraryColumns } from './columns'

export default function ProgramLibraryTable() {
  usePageViewTracking({
    props: { route_group: 'program', tab_view: 'program-library' },
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data: programs } = useReusablePrograms()
  const filteredPrograms = useMemo(
    () => filterProgramsBySearch(programs ?? [], globalFilter),
    [programs, globalFilter],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredPrograms,
    columns: programLibraryColumns,
    ...tableDefaults.models,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <div className='h-screen-with-nav flex flex-col p-8'>
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold'>Program Library</h1>
        <p className='text-muted-foreground text-sm'>
          Browse and manage your reusable therapy programs.
        </p>
      </div>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <DataTableBody
        table={table}
        columns={programLibraryColumns}
        className='flex-1'
      />
      <DataTableFooter table={table} />
    </div>
  )
}
