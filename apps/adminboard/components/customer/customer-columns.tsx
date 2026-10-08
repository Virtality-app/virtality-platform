'use client'

import DateCell from '@/components/tables/date-cell'
import { ColumnHeader } from '@/components/tables/header-cell'
import { formatCustomerBillingStatus } from '@/lib/admin-customer-display'
import { createCustomerTrialFilterFn } from '@/lib/customer-table-filters'
import { valueListFilterFn } from '@/lib/table-value-filters'
import {
  customerCanLaunchVr,
  formatCustomerTableAccess,
  resolveCustomerTrialStanding,
} from '@/lib/customer-table-display'
import { CustomerTrialCell } from '@/components/customer/customer-trial-cell'
import { CustomerVrCell } from '@/components/customer/customer-vr-cell'
import type { AdminCustomerListItem } from '@virtality/shared/utils'
import { ColumnDef } from '@tanstack/react-table'
import startCase from 'lodash.startcase'

export function createCustomerColumns(
  now: Date,
): ColumnDef<AdminCustomerListItem>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
    },
    {
      id: 'vr',
      accessorFn: (row) => customerCanLaunchVr(row.accessStatus),
      filterFn: 'equals',
      header: ({ column }) => <ColumnHeader column={column} title='VR' />,
      cell: ({ row }) => (
        <CustomerVrCell
          canLaunchVr={customerCanLaunchVr(row.original.accessStatus)}
        />
      ),
    },
    {
      id: 'trial',
      accessorFn: (row) =>
        row.trialEnd == null ? undefined : new Date(row.trialEnd).getTime(),
      sortUndefined: 'last',
      filterFn: createCustomerTrialFilterFn(now),
      header: ({ column }) => <ColumnHeader column={column} title='Trial' />,
      cell: ({ row }) => (
        <CustomerTrialCell
          standing={resolveCustomerTrialStanding(row.original.trialEnd, now)}
        />
      ),
    },
    {
      id: 'access',
      accessorFn: (row) => formatCustomerTableAccess(row),
      filterFn: valueListFilterFn,
      header: ({ column }) => <ColumnHeader column={column} title='Access' />,
    },
    {
      id: 'billing',
      accessorFn: (row) => formatCustomerBillingStatus(row.billingStatus),
      filterFn: valueListFilterFn,
      header: ({ column }) => <ColumnHeader column={column} title='Billing' />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column, header }) => (
        <ColumnHeader column={column} title={startCase(header.id)} />
      ),
      cell: ({ row, column }) => <DateCell row={row} id={column.id} />,
    },
  ]
}
