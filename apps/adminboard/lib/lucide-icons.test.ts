import { describe, expect, it } from 'vitest'
import {
  listRenderableLucideIconNames,
  resolveLucideIconComponent,
} from './lucide-icons'

describe('lucide icon helpers', () => {
  it('lists only renderable Lucide icon export names', () => {
    const names = listRenderableLucideIconNames()

    expect(names.length).toBeGreaterThan(100)
    expect(names).toContain('Activity')
    expect(names).not.toContain('createLucideIcon')
    expect(names).not.toContain('icons')
    expect(names).not.toContain('Icon')
  })

  it('resolves known icons and rejects invalid names', () => {
    expect(resolveLucideIconComponent('Activity')).not.toBeNull()
    expect(resolveLucideIconComponent('NotARealIcon')).toBeNull()
    expect(resolveLucideIconComponent('createLucideIcon')).toBeNull()
  })
})
