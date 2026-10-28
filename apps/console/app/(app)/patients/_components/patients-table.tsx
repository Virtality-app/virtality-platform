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
import { usePersistedPageSize } from '@virtality/ui/lib/use-persisted-page-size'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@virtality/ui/components/button'
import Link from 'next/link'
import { PlusSquare, Trash2 } from 'lucide-react'
import { columns } from './patients-columns'
import DeleteConfirmDialog from '@/components/dialogs/delete-confirm-dialog'
import useIsAuthed from '@/hooks/use-is-authed'
import {
  usePatients,
  useDeletePatient,
  useORPC,
  getQueryClient,
} from '@virtality/react-query'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import { filterPatientsBySearch } from '@/lib/patient-list'
import { useClientT } from '@/i18n/use-client-t'

const PatientsTable = () => {
  'use no memo'
  const { t } = useClientT('patients')
  useIsAuthed()
  usePageViewTracking({ props: { route_group: 'patient' } })
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { pagination, onPaginationChange } = usePersistedPageSize('patients')

  const { data: tableData, isPending } = usePatients()
  const filteredPatients = useMemo(
    () => filterPatientsBySearch(tableData ?? [], globalFilter),
    [tableData, globalFilter],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredPatients,
    columns,
    ...tableDefaults.models,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
  })

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)

  const { mutate: deletePatients } = useDeletePatient({
    onSuccess: () => {
      trackAnalyticsEvent('patient_deleted', {})
      setRowSelection({})
      return queryClient.invalidateQueries({
        queryKey: orpc.patient.list.key(),
      })
    },
  })

  const deleteSelectedHandler = () => {
    const ids = selectedRows.map((patient) => patient.id)
    if (!ids.length) return
    for (const id of ids) {
      deletePatients({ id })
    }
  }

  const rowNavigation = (id: string) => {
    router.push(`/patients/${id}/patient-dashboard`)
  }

  return (
    <div className='h-screen-with-header flex flex-col p-8'>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      >
        {selectedRows.length !== 0 && (
          <DeleteConfirmDialog
            title={t('list.deleteSelectedTitle')}
            description={t('list.deleteSelectedDescription')}
            onConfirm={deleteSelectedHandler}
            asChild
          >
            <Button variant='destructive' className='mr-auto'>
              <Trash2 />
              {t('list.deleteSelected')}
            </Button>
          </DeleteConfirmDialog>
        )}
        <Button id='new-program' asChild variant='primary' className='ml-auto'>
          <Link href={`/patients/new`}>
            <PlusSquare /> {t('list.newPatient')}
          </Link>
        </Button>
      </DataTableHeader>
      <DataTableBody
        table={table}
        columns={columns}
        rowNavigation={rowNavigation}
        className='flex-1'
        isLoading={isPending}
      />
      <DataTableFooter table={table} />
    </div>
  )
}

export default PatientsTable
