'use client'

import { createCustomerColumns } from '@/components/customer/customer-columns'
import { CustomerTableFilters } from '@/components/customer/customer-table-filters'
import {
  buildCustomerColumnFilters,
  EMPTY_CUSTOMER_TABLE_FILTERS,
  type CustomerTableFilters as Filters,
} from '@/lib/customer-table-filters'
import {
  DataTableBody,
  DataTableFooter,
  DataTableHeader,
} from '@virtality/ui/components/data-table'
import { useAdminCustomers } from '@virtality/react-query'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useResourceTable } from '@virtality/ui/lib/use-resource-table'

export function CustomerTable() {
  const router = useRouter()
  const { data, isPending } = useAdminCustomers()
  // One clock per table mount so every Trial cell agrees on "today".
  const columns = useMemo(() => createCustomerColumns(new Date()), [])
  const [filters, setFilters] = useState<Filters>(EMPTY_CUSTOMER_TABLE_FILTERS)
  const { table, globalFilter, setGlobalFilter, setColumnFilters } =
    useResourceTable({
      tableId: 'customers',
      data: data ?? [],
      columns,
      getRowId: (row) => row.userId,
      enableColumnFilters: true,
    })

  const applyFilters = (next: Filters) => {
    setFilters(next)
    setColumnFilters(buildCustomerColumnFilters(next))
  }

  return (
    <div className='grid gap-4'>
      <DataTableHeader
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filters={
          <CustomerTableFilters
            value={filters}
            onChange={applyFilters}
            onReset={() => applyFilters(EMPTY_CUSTOMER_TABLE_FILTERS)}
          />
        }
      />
      <DataTableBody
        table={table}
        columns={columns}
        rowNavigation={(userId) => {
          router.push(`/customers/${userId}`)
        }}
        isLoading={isPending}
      />
      <DataTableFooter table={table} />
    </div>
  )
}
