'use client'

import type { DataTableFooterLabels } from '@virtality/ui/components/data-table'
import { useClientT } from '@/i18n/use-client-t'

/** Translated text for the shared table footer. */
export function useDataTableFooterLabels(): DataTableFooterLabels {
  const { t } = useClientT('shared')
  return {
    selected: (selected, total) =>
      t('table.selected', { selected, count: total }),
    rows: (count) => t('table.rows', { count }),
    rowsPerPage: t('table.rowsPerPage'),
    previous: t('table.previous'),
    next: t('table.next'),
  }
}
