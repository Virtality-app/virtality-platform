'use client'

import type { Column } from '@tanstack/react-table'
import ColumnHeader from '@/components/tables/header-cell'
import { useClientT } from '@/i18n/use-client-t'

interface ProgramColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  titleKey: 'name' | 'exercises' | 'updatedAt'
}

const ProgramColumnHeader = <TData, TValue>({
  column,
  titleKey,
}: ProgramColumnHeaderProps<TData, TValue>) => {
  const { t } = useClientT('programs')

  return <ColumnHeader column={column} title={t(`columns.${titleKey}`)} />
}

export default ProgramColumnHeader
