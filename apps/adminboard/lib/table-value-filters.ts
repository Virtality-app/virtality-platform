import type { Row } from '@tanstack/react-table'

export const toggleListValue = (values: string[], value: string): string[] =>
  values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value]

/** Row passes when its value is one of the selected (or none selected). */
export const valueListFilterFn = <TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true
  }
  return filterValue.includes(row.getValue<string>(columnId))
}
