'use client'

import { useTranslations } from '@virtality/react-query'
import type { TranslationStatus } from '@virtality/shared/utils'
import {
  DataTableBody,
  DataTableFooter,
  DataTableHeader,
} from '@virtality/ui/components/data-table'
import { useResourceTable } from '@virtality/ui/lib/use-resource-table'
import { useEffect, useMemo, useState } from 'react'
import { columns } from '@/components/translations/columns'
import FilterBadge from '@/components/ui/filter-badge'
import { toggleListValue } from '@/lib/table-value-filters'
import {
  buildTranslationColumnFilters,
  buildTranslationRows,
  distinctNamespaces,
  TRANSLATION_STATUSES,
  TRANSLATION_STATUS_LABELS,
} from '@/lib/translation-rows'

const TranslationsTable = () => {
  const { data, isPending } = useTranslations()
  const rows = useMemo(() => buildTranslationRows(data ?? []), [data])
  const namespaces = useMemo(() => distinctNamespaces(rows), [rows])
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<TranslationStatus[]>(
    [],
  )
  const { table, globalFilter, setGlobalFilter, setColumnFilters } =
    useResourceTable({
      tableId: 'translations',
      data: rows,
      columns,
      getRowId: (row) => row.id,
      enableColumnFilters: true,
    })

  useEffect(() => {
    setColumnFilters(
      buildTranslationColumnFilters(selectedNamespaces, selectedStatuses),
    )
    table.setPageIndex(0)
  }, [selectedNamespaces, selectedStatuses, setColumnFilters, table])

  return (
    <div className='p-8'>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filters={
          <div className='flex flex-wrap items-center gap-2'>
            {TRANSLATION_STATUSES.map((status) => (
              <FilterBadge
                key={status}
                name={TRANSLATION_STATUS_LABELS[status]}
                checked={selectedStatuses.includes(status)}
                onClick={() =>
                  setSelectedStatuses(
                    toggleListValue(
                      selectedStatuses,
                      status,
                    ) as TranslationStatus[],
                  )
                }
              />
            ))}
            {namespaces.map((namespace) => (
              <FilterBadge
                key={namespace}
                name={namespace}
                checked={selectedNamespaces.includes(namespace)}
                onClick={() =>
                  setSelectedNamespaces(
                    toggleListValue(selectedNamespaces, namespace),
                  )
                }
              />
            ))}
          </div>
        }
      />
      <DataTableBody table={table} columns={columns} isLoading={isPending} />
      <DataTableFooter table={table} />
    </div>
  )
}

export default TranslationsTable
