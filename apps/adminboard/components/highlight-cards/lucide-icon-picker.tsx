'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  listRenderableLucideIconNames,
  resolveLucideIconComponent,
} from '@/lib/lucide-icons'
import { cn } from '@/lib/utils'
import { ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type UIEvent } from 'react'

/** How many icons to mount per page so opening stays responsive. */
export const LUCIDE_ICON_PICKER_PAGE_SIZE = 80

const LOAD_MORE_SCROLL_THRESHOLD_PX = 48

type LucideIconPickerProps = {
  value: string
  onChange: (iconName: string) => void
  id?: string
  disabled?: boolean
}

function filterLucideIconNames(
  iconNames: readonly string[],
  query: string,
): string[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return [...iconNames]
  }

  return iconNames.filter((name) =>
    name.toLowerCase().includes(normalizedQuery),
  )
}

export function LucideIconPicker({
  value,
  onChange,
  id,
  disabled = false,
}: LucideIconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(LUCIDE_ICON_PICKER_PAGE_SIZE)
  const iconNames = useMemo(() => listRenderableLucideIconNames(), [])
  const SelectedIcon = useMemo(() => resolveLucideIconComponent(value), [value])

  const matchedIconNames = useMemo(
    () => filterLucideIconNames(iconNames, search),
    [iconNames, search],
  )

  const visibleIconNames = useMemo(
    () => matchedIconNames.slice(0, visibleCount),
    [matchedIconNames, visibleCount],
  )

  const hasMoreIcons = visibleCount < matchedIconNames.length

  const resetVisibleWindow = () => {
    setVisibleCount(LUCIDE_ICON_PICKER_PAGE_SIZE)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch('')
      resetVisibleWindow()
    }
  }

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    resetVisibleWindow()
  }

  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasMoreIcons) {
      return
    }

    const list = event.currentTarget
    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight

    if (distanceFromBottom > LOAD_MORE_SCROLL_THRESHOLD_PX) {
      return
    }

    setVisibleCount((current) =>
      Math.min(current + LUCIDE_ICON_PICKER_PAGE_SIZE, matchedIconNames.length),
    )
  }

  return (
    <div className='flex min-w-0 items-center gap-3'>
      <div
        className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg border'
        aria-hidden
      >
        {SelectedIcon ? (
          <SelectedIcon className='size-6' />
        ) : (
          <span className='text-muted-foreground text-xs'>?</span>
        )}
      </div>
      {/* modal: lets CommandList scroll under Dialog's RemoveScroll lock */}
      <Popover modal open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            role='combobox'
            disabled={disabled}
            className='min-w-0 flex-1 justify-between font-normal'
          >
            <span className={cn('truncate', !value && 'text-muted-foreground')}>
              {value || 'Select icon…'}
            </span>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-(--radix-popover-trigger-width) p-0'
          align='start'
          collisionPadding={8}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search Lucide icons…'
              value={search}
              onValueChange={handleSearchChange}
            />
            <CommandList
              className='max-h-72 overscroll-contain'
              onScroll={handleListScroll}
            >
              <CommandEmpty>No icon found.</CommandEmpty>
              <CommandGroup>
                {visibleIconNames.map((name) => {
                  const Icon = resolveLucideIconComponent(name)
                  return (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        onChange(name)
                        handleOpenChange(false)
                      }}
                    >
                      {Icon ? (
                        <Icon className='mr-2 size-4' />
                      ) : (
                        <span className='mr-2 size-4' />
                      )}
                      <span className='truncate'>{name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function LucideIconGlyph({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = resolveLucideIconComponent(name)
  if (!Icon) {
    return (
      <span className={cn('bg-muted inline-block size-5 rounded', className)} />
    )
  }

  return <Icon className={cn('size-5', className)} />
}
