import { ORPCError } from '@orpc/server'
import { describe, expect, it } from 'vitest'
import {
  HighlightCardCollectionFullError,
  HighlightCardNotFoundError,
  HighlightCardValidationError,
} from '@virtality/shared/utils'
import { toHighlightCardOrpcError } from './highlight-card.ts'

describe('toHighlightCardOrpcError', () => {
  it('maps validation errors to BAD_REQUEST', () => {
    const mapped = toHighlightCardOrpcError(
      new HighlightCardValidationError('Title cannot be empty.'),
    )

    expect(mapped).toBeInstanceOf(ORPCError)
    expect(mapped?.code).toBe('BAD_REQUEST')
    expect(mapped?.message).toBe('Title cannot be empty.')
  })

  it('maps collection-full errors to CONFLICT', () => {
    const mapped = toHighlightCardOrpcError(
      new HighlightCardCollectionFullError('benefits'),
    )

    expect(mapped).toBeInstanceOf(ORPCError)
    expect(mapped?.code).toBe('CONFLICT')
    expect(mapped?.message).toContain('benefits')
  })

  it('maps not-found errors to NOT_FOUND', () => {
    const mapped = toHighlightCardOrpcError(
      new HighlightCardNotFoundError('card-1'),
    )

    expect(mapped).toBeInstanceOf(ORPCError)
    expect(mapped?.code).toBe('NOT_FOUND')
    expect(mapped?.message).toContain('card-1')
  })

  it('returns null for unknown errors', () => {
    expect(toHighlightCardOrpcError(new Error('unexpected'))).toBeNull()
  })
})
