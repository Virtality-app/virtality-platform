import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TranslationEditDialog } from './translation-edit-dialog'
import type { TranslationTableRow } from '@/lib/translation-rows'

vi.mock('@virtality/react-query', () => ({
  useUpsertTranslation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResetTranslation: () => ({ mutate: vi.fn(), isPending: false }),
}))

const row: TranslationTableRow = {
  id: 'common:hi',
  namespace: 'common',
  key: 'hi',
  defaultEnglish: 'Hello {{name}}',
  english: 'Hello {{name}}',
  englishOverridden: true,
  greek: 'Γεια {{name}}',
  greekValue: null,
  greekDraft: 'Γεια {{name}}',
  status: 'needs-review',
}

describe('TranslationEditDialog', () => {
  afterEach(cleanup)

  it('lets a reviewer approve the draft, and offers reset for overridden English', () => {
    render(<TranslationEditDialog row={row} open onOpenChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Reset to default' }),
    ).toBeInTheDocument()
  })

  it('names a dropped placeholder and disables Save until it is back', () => {
    render(<TranslationEditDialog row={row} open onOpenChange={() => {}} />)
    fireEvent.change(screen.getByLabelText('Greek'), {
      target: { value: 'Γεια' },
    })
    expect(screen.getByText('Missing {{name}}')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Greek'), {
      target: { value: 'Γεια {{name}}!' },
    })
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
  })
})
