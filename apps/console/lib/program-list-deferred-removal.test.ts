import { describe, expect, it } from 'vitest'
import {
  bulkSelectableRowIds,
  enabledMemberIds,
  isDeferredRemoval,
  isGlobalCheckSatisfied,
  markDeferredRemoval,
  pruneDeferredRemovalIds,
  segmentCheckboxChecked,
  segmentMembersFullyDeferred,
  toDeferredRemovalIdSet,
  unmarkDeferredRemoval,
} from './program-list-deferred-removal'

const rows = [{ id: 'left' }, { id: 'right' }, { id: 'solo' }]

describe('program list deferred removal', () => {
  it('marks and unmarks a row without dropping it from the list', () => {
    let deferred = toDeferredRemovalIdSet([])
    deferred = markDeferredRemoval(deferred, 'left')
    expect(isDeferredRemoval(deferred, 'left')).toBe(true)
    deferred = unmarkDeferredRemoval(deferred, 'left')
    expect(isDeferredRemoval(deferred, 'left')).toBe(false)
  })

  it('excludes deferred rows from bulk selection scope', () => {
    const deferred = toDeferredRemovalIdSet(['left'])
    expect(bulkSelectableRowIds(rows, deferred)).toEqual(['right', 'solo'])
    expect(enabledMemberIds(['left', 'right'], deferred)).toEqual(['right'])
  })

  it('treats a segment as fully deferred only when every member is deferred', () => {
    const deferred = toDeferredRemovalIdSet(['left'])
    expect(segmentMembersFullyDeferred(['left', 'right'], deferred)).toBe(false)
    expect(
      segmentMembersFullyDeferred(
        ['left', 'right'],
        toDeferredRemovalIdSet(['left', 'right']),
      ),
    ).toBe(true)
  })

  it('aggregates segment checkboxes from enabled members only', () => {
    const deferred = toDeferredRemovalIdSet(['left'])
    expect(
      segmentCheckboxChecked(['left', 'right'], ['right'], deferred),
    ).toBe(true)
    expect(
      segmentCheckboxChecked(['left', 'right'], [], deferred),
    ).toBe(false)
    expect(
      segmentCheckboxChecked(
        ['left', 'right'],
        ['left'],
        toDeferredRemovalIdSet([]),
      ),
    ).toBe('indeterminate')
    expect(segmentCheckboxChecked(['left'], ['left'], deferred)).toBe(false)
  })

  it('requires every selectable row for global check', () => {
    const deferred = toDeferredRemovalIdSet(['left'])
    expect(
      isGlobalCheckSatisfied(rows, ['right', 'solo'], deferred),
    ).toBe(true)
    expect(isGlobalCheckSatisfied(rows, ['right'], deferred)).toBe(false)
  })

  it('prunes markers when rows are removed from the list', () => {
    const deferred = toDeferredRemovalIdSet(['left', 'gone'])
    expect(
      pruneDeferredRemovalIds(deferred, toDeferredRemovalIdSet(['left', 'right'])),
    ).toEqual(['left'])
  })
})
