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
import { useReusablePrograms } from '@virtality/react-query'
import { filterProgramsBySearch } from '@/lib/program-library'
import { programLibraryColumns } from './columns'
import { Button } from '@virtality/ui/components/button'
import Link from 'next/link'
import { PlusSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useClientT } from '@/i18n/use-client-t'
import { useDataTableFooterLabels } from '@/hooks/use-data-table-footer-labels'
import { useForwardReturnTo } from '@/hooks/use-forward-return-to'

export default function ProgramLibraryTable() {
  const router = useRouter()
  const newProgramHref = useForwardReturnTo('/programs/new')
  const { t } = useClientT('programs')
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const { pagination, onPaginationChange } =
    usePersistedPageSize('program-library')

  const { data: programs, isPending } = useReusablePrograms()
  const filteredPrograms = useMemo(
    () => filterProgramsBySearch(programs ?? [], globalFilter),
    [programs, globalFilter],
  )

  const footerLabels = useDataTableFooterLabels()
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredPrograms,
    columns: programLibraryColumns,
    ...tableDefaults.models,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
  })

  const rowNavigation = (id: string) => {
    router.push(`/programs/${id}/edit`)
  }

  return (
    <div className='h-screen-with-nav flex flex-col p-8'>
      <div className='mb-4'>
        <h1 className='text-2xl font-semibold'>{t('library.title')}</h1>
        <p className='text-muted-foreground text-sm'>
          {t('library.description')}
        </p>
      </div>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      >
        <Button
          id='new-program'
          asChild
          variant='primary'
          className='ml-auto'
          data-tour='program-add'
        >
          <Link href={newProgramHref}>
            <PlusSquare /> {t('library.newProgram')}
          </Link>
        </Button>
      </DataTableHeader>
      <DataTableBody
        table={table}
        columns={programLibraryColumns}
        rowNavigation={rowNavigation}
        className='flex-1'
        isLoading={isPending}
      />
      <DataTableFooter table={table} labels={footerLabels} />
    </div>
  )
}
