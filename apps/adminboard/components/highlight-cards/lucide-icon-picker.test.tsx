import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { listRenderableLucideIconNames } from '@/lib/lucide-icons'
import {
  LUCIDE_ICON_PICKER_PAGE_SIZE,
  LucideIconPicker,
} from './lucide-icon-picker'

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  Element.prototype.scrollIntoView = vi.fn()
})

function openIconPicker() {
  const onChange = vi.fn()
  render(<LucideIconPicker value='Activity' onChange={onChange} id='icon' />)
  fireEvent.click(screen.getByRole('combobox'))
  return onChange
}

function mockListScrollMetrics(
  list: HTMLElement,
  metrics: { scrollTop: number; clientHeight: number; scrollHeight: number },
) {
  Object.defineProperties(list, {
    scrollTop: {
      configurable: true,
      get: () => metrics.scrollTop,
    },
    clientHeight: {
      configurable: true,
      get: () => metrics.clientHeight,
    },
    scrollHeight: {
      configurable: true,
      get: () => metrics.scrollHeight,
    },
  })
}

describe('LucideIconPicker', () => {
  afterEach(() => {
    cleanup()
  })

  it('does not mount every Lucide icon when the dropdown opens', () => {
    const totalIcons = listRenderableLucideIconNames().length
    expect(totalIcons).toBeGreaterThan(500)

    openIconPicker()

    const listbox = screen.getByRole('listbox')
    const options = within(listbox).getAllByRole('option')

    expect(options.length).toBe(LUCIDE_ICON_PICKER_PAGE_SIZE)
    expect(options.length).toBeLessThan(totalIcons)
  })

  it('loads another page of icons when scrolled near the end', () => {
    openIconPicker()

    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getAllByRole('option')).toHaveLength(
      LUCIDE_ICON_PICKER_PAGE_SIZE,
    )

    mockListScrollMetrics(listbox, {
      scrollTop: 900,
      clientHeight: 288,
      scrollHeight: 1200,
    })
    fireEvent.scroll(listbox)

    expect(within(listbox).getAllByRole('option')).toHaveLength(
      LUCIDE_ICON_PICKER_PAGE_SIZE * 2,
    )
  })

  it('does not load more when scrolled only partway through the list', () => {
    openIconPicker()

    const listbox = screen.getByRole('listbox')
    mockListScrollMetrics(listbox, {
      scrollTop: 40,
      clientHeight: 288,
      scrollHeight: 1200,
    })
    fireEvent.scroll(listbox)

    expect(within(listbox).getAllByRole('option')).toHaveLength(
      LUCIDE_ICON_PICKER_PAGE_SIZE,
    )
  })

  it('finds icons outside the initial window via search', () => {
    openIconPicker()

    const search = screen.getByPlaceholderText(/Search Lucide icons/i)
    fireEvent.change(search, { target: { value: 'Zap' } })

    const listbox = screen.getByRole('listbox')
    const options = within(listbox).getAllByRole('option')
    const labels = options.map((option) => option.textContent ?? '')

    expect(labels.some((label) => label.includes('Zap'))).toBe(true)
    expect(options.length).toBeLessThanOrEqual(LUCIDE_ICON_PICKER_PAGE_SIZE)
  })

  it('uses a modal popover with a capped scroll region for dialog nesting', () => {
    openIconPicker()

    const listbox = screen.getByRole('listbox')
    expect(listbox.className).toMatch(/overflow-y-auto/)
    expect(listbox.className).toMatch(/max-h-/)
    expect(listbox.className).toMatch(/overscroll-contain/)

    // Modal Popover opts into its own RemoveScroll shard (body[data-scroll-locked]),
    // which is what lets the list scroll inside a Dialog.
    expect(document.body.dataset.scrollLocked).toBe('1')
  })
})
