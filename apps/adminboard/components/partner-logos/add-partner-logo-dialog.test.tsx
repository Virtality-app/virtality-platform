import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

const mockUseCreatePartnerLogo = vi.fn()
const mockUseUploadBucketObjects = vi.fn()

vi.mock('@virtality/shared/utils', () => ({
  bucketCdnUrl: (objectKey: string) => `https://cdn.example/${objectKey}`,
}))

vi.mock('@virtality/react-query', () => ({
  useCreatePartnerLogo: () => mockUseCreatePartnerLogo(),
  useUploadBucketObjects: () => mockUseUploadBucketObjects(),
}))

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { alt, ...rest } = props
    return <img alt={typeof alt === 'string' ? alt : ''} {...rest} />
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock('@/components/email/bucket-object-picker-dialog', () => ({
  BucketObjectPickerDialog: () => null,
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => (
    <button type='button'>{children}</button>
  ),
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { AddPartnerLogoDialog } from './add-partner-logo-dialog'

const longFilename =
  'this-is-an-extremely-long-filename-that-would-overflow-the-dialog-without-truncation.png'

describe('AddPartnerLogoDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreatePartnerLogo.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    mockUseUploadBucketObjects.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('renders selected file names with truncation instead of overflowing the dialog', () => {
    render(<AddPartnerLogoDialog open onOpenChange={vi.fn()} />)

    const fileInput = screen.getByLabelText('Images')
    const file = new File(['content'], longFilename, { type: 'image/png' })

    fireEvent.change(fileInput, {
      target: { files: [file] },
    })

    const selectedFileName = screen.getByTestId(
      'partner-logo-upload-selected-file',
    )
    expect(selectedFileName).toHaveTextContent(longFilename)
    expect(selectedFileName).toHaveClass('truncate')
    expect(selectedFileName).toHaveAttribute('title', longFilename)
    expect(screen.getByText('1 file selected.')).toBeInTheDocument()
  })
})
