import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseUploadBucketObjects = vi.fn()

vi.mock('@virtality/shared/utils', () => ({
  normalizeBucketPrefix: (prefix: string) => prefix,
  validateBucketTargetPrefix: () => null,
}))

vi.mock('@virtality/react-query', () => ({
  useUploadBucketObjects: (options?: unknown) =>
    mockUseUploadBucketObjects(options),
}))

import { BucketUploadDialog } from './bucket-upload-dialog'

const longFilename =
  'this-is-an-extremely-long-filename-that-would-overflow-the-dialog-without-truncation.png'

describe('BucketUploadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUploadBucketObjects.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('renders selected file names with truncation instead of overflowing the dialog', () => {
    render(
      <BucketUploadDialog
        open
        onOpenChange={vi.fn()}
        currentPrefix='images/'
      />,
    )

    const fileInput = screen.getByLabelText('Files')
    const file = new File(['content'], longFilename, { type: 'image/png' })

    fireEvent.change(fileInput, {
      target: { files: [file] },
    })

    const selectedFileName = screen.getByTestId('bucket-upload-selected-file')
    expect(selectedFileName).toHaveTextContent(longFilename)
    expect(selectedFileName).toHaveClass('truncate')
    expect(selectedFileName).toHaveAttribute('title', longFilename)
    expect(screen.getByText('1 file selected.')).toBeInTheDocument()
  })
})
