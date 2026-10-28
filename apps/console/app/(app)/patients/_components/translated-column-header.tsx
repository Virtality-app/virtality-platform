'use client'

import type { Column } from '@tanstack/react-table'
import ColumnHeader from '@/components/tables/header-cell'
import { useClientT } from '@/i18n/use-client-t'

interface TranslatedColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  /** Key in the `patients` namespace. */
  labelKey: string
  className?: string
}

const TranslatedColumnHeader = <TData, TValue>({
  column,
  labelKey,
  className,
}: TranslatedColumnHeaderProps<TData, TValue>) => {
  const { t } = useClientT('patients')
  return (
    <ColumnHeader column={column} title={t(labelKey)} className={className} />
  )
}

export default TranslatedColumnHeader
