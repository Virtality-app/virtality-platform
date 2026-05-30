import { describe, expect, it } from 'vitest'

import { cn } from './cn.ts'

describe('cn', () => {
  it('merges tailwind classes with later wins for conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('drops falsy values', () => {
    expect(cn('text-sm', false && 'hidden', undefined, 'font-medium')).toBe(
      'text-sm font-medium',
    )
  })
})
