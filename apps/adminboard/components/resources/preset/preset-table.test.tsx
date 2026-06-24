import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockPush = vi.fn()
const mockUsePresets = vi.fn()
const mockDataTableBody = vi.fn(
  (_props: { isLoading?: boolean; rowNavigation?: (id: string) => void }) => (
    <div data-testid='data-table-body' />
  ),
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@virtality/react-query/legacy', () => ({
  usePresets: () => mockUsePresets(),
}))

vi.mock('@virtality/ui/components/data-table', () => ({
  DataTableHeader: () => <div data-testid='data-table-header' />,
  DataTableBody: (props: {
    isLoading?: boolean
    rowNavigation?: (id: string) => void
  }) => {
    mockDataTableBody(props)
    return <div data-testid='data-table-body' />
  },
  DataTableFooter: () => <div data-testid='data-table-footer' />,
}))

vi.mock('./preset-popover', () => ({
  default: () => null,
}))

vi.mock('@/app/resources/preset/columns', () => ({
  columns: [{ accessorKey: 'name', header: 'Name' }],
}))

import PresetTable from './preset-table'

describe('PresetTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes isLoading while presets are pending instead of rendering Loading...', () => {
    mockUsePresets.mockReturnValue({
      data: undefined,
      isPending: true,
    })

    render(<PresetTable />)

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(mockDataTableBody).toHaveBeenCalledWith(
      expect.objectContaining({ isLoading: true }),
    )
  })

  it('wires rowNavigation to the preset detail route', () => {
    mockUsePresets.mockReturnValue({
      data: [{ id: 'preset-1' }],
      isPending: false,
    })

    render(<PresetTable />)

    const rowNavigation =
      mockDataTableBody.mock.calls.at(-1)?.[0]?.rowNavigation
    expect(rowNavigation).toBeTypeOf('function')
    rowNavigation?.('preset-1')
    expect(mockPush).toHaveBeenCalledWith('/resources/preset/preset-1')
  })
})
