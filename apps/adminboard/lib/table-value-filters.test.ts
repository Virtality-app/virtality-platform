import { describe, expect, it } from 'vitest'
import { toggleListValue, valueListFilterFn } from './table-value-filters'

describe('table value filters', () => {
  it('toggles a value in and out of the selection', () => {
    expect(toggleListValue(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleListValue(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('matches rows against the selected values', () => {
    const row = (value: string) =>
      ({ getValue: () => value }) as unknown as Parameters<
        typeof valueListFilterFn
      >[0]

    expect(valueListFilterFn(row('Strength'), 'category', [])).toBe(true)
    expect(valueListFilterFn(row('Strength'), 'category', ['Strength'])).toBe(
      true,
    )
    expect(valueListFilterFn(row('Balance'), 'category', ['Strength'])).toBe(
      false,
    )
  })
})
