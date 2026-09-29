import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { idleMutation } = vi.hoisted(() => ({
  idleMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@virtality/react-query', () => ({
  useAdminEmailDraftPreview: () => ({
    data: undefined,
    refetch: vi.fn(),
    isFetching: false,
  }),
  useAdminEmailDraftRecipients: () => ({ refetch: vi.fn() }),
  useAddAdminEmailAttachment: idleMutation,
  useArchiveAdminEmailDraft: idleMutation,
  useCloneAdminEmailDraft: idleMutation,
  useFinalSendAdminEmailDraft: idleMutation,
  useRemoveAdminEmailAttachment: idleMutation,
  useRestoreAdminEmailDraft: idleMutation,
  useTestSendAdminEmailDraft: idleMutation,
  useUpdateAdminEmailDraft: idleMutation,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import type { DraftWorkspaceData } from './use-admin-email-draft-actions'
import { useAdminEmailDraftWorkspace } from './use-admin-email-draft-workspace'

const savedAt = '2026-09-29T10:00:00.000Z'

const draftFromServer = (updatedAt: string): DraftWorkspaceData => ({
  id: 'draft-1',
  subject: 'June update',
  previewText: null,
  bodyBlocks: [{ type: 'paragraph', id: 'p1', text: 'Hello' }],
  recipients: [],
  topic: 'product_updates',
  audienceId: null,
  isFinalSent: false,
  // oRPC deserialises dates into a fresh Date on every fetch.
  updatedAt: new Date(updatedAt),
  sendReadiness: { ready: false, reasons: [] },
  attachments: [],
})

const callbacks = {
  onCloned: vi.fn(),
  onArchived: vi.fn(),
  onRestored: vi.fn(),
  onFinalSent: vi.fn(),
}

const renderWorkspace = () =>
  renderHook(
    ({ draft }: { draft: DraftWorkspaceData }) =>
      useAdminEmailDraftWorkspace({ draft, isArchived: false, ...callbacks }),
    { initialProps: { draft: draftFromServer(savedAt) } },
  )

describe('useAdminEmailDraftWorkspace', () => {
  it('keeps unsaved edits when the draft is refetched unchanged', () => {
    const { result, rerender } = renderWorkspace()

    act(() => result.current.patch({ subject: 'Unsaved subject' }))

    // Returning to the tab refetches the stale drafts list.
    rerender({ draft: draftFromServer(savedAt) })

    expect(result.current.form.subject).toBe('Unsaved subject')
    expect(result.current.isDirty).toBe(true)
  })

  it('takes the server copy after the draft is saved', () => {
    const { result, rerender } = renderWorkspace()

    act(() => result.current.patch({ subject: 'Unsaved subject' }))

    rerender({
      draft: {
        ...draftFromServer('2026-09-29T10:05:00.000Z'),
        subject: 'Saved subject',
      },
    })

    expect(result.current.form.subject).toBe('Saved subject')
    expect(result.current.isDirty).toBe(false)
  })
})
