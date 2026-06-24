'use client'

import {
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import {
  DataTableBody,
  DataTableFooter,
  DataTableHeader,
} from '@virtality/ui/components/data-table'
import { tableDefaults } from '@virtality/ui/lib/table-defaults'
import { useState } from 'react'
import { usePatientSessions } from '@virtality/react-query'
import { sessionsColumns } from './sessions-columns'
import type { ExtendedPatientSession } from '@/types/models'

interface SessionsTableProps {
  patientId: string
  onSessionSelect: (value: string) => void
  /** When provided, use this list instead of fetching (e.g. date-filtered). */
  sessions?: ExtendedPatientSession[] | null
}

const SessionsTable = ({
  patientId,
  onSessionSelect,
  sessions: sessionsProp,
}: SessionsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data: fetchedSessions, isPending } = usePatientSessions({
    input: {
      where: {
        patientId,
        AND: [
          { deletedAt: null },
          { status: { in: ['COMPLETED', 'INTERRUPTED'] } },
        ],
      },
    },
  })

  const usesProvidedSessions = sessionsProp !== undefined
  const tableData =
    (usesProvidedSessions ? sessionsProp : fetchedSessions) ?? []

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData,
    columns: sessionsColumns,
    ...tableDefaults.models,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
  })

  const rowNavigation = (id: string) => {
    onSessionSelect(id)
  }

  return (
    <div className='flex flex-1 flex-col px-4'>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <DataTableBody
        table={table}
        columns={sessionsColumns}
        rowNavigation={rowNavigation}
        className='flex-1'
        isLoading={!usesProvidedSessions && isPending}
      />
      <DataTableFooter table={table} />
    </div>
  )
}

export default SessionsTable
