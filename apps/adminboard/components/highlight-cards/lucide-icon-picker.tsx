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
import { useMemo, useState } from 'react'

type LucideIconPickerProps = {
  value: string
  onChange: (iconName: string) => void
  id?: string
  disabled?: boolean
}

export function LucideIconPicker({
  value,
  onChange,
  id,
  disabled = false,
}: LucideIconPickerProps) {
  const [open, setOpen] = useState(false)
  const iconNames = useMemo(() => listRenderableLucideIconNames(), [])
  const SelectedIcon = useMemo(() => resolveLucideIconComponent(value), [value])

  return (
    <div className='flex items-center gap-3'>
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            role='combobox'
            disabled={disabled}
            className='w-full justify-between font-normal'
          >
            <span className={cn(!value && 'text-muted-foreground')}>
              {value || 'Select icon…'}
            </span>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-(--radix-popover-trigger-width) p-0'
          align='start'
        >
          <Command>
            <CommandInput placeholder='Search Lucide icons…' />
            <CommandList>
              <CommandEmpty>No icon found.</CommandEmpty>
              <CommandGroup>
                {iconNames.map((name) => {
                  const Icon = resolveLucideIconComponent(name)
                  return (
                    <CommandItem
                      key={name}
                      value={name}
                      onSelect={() => {
                        onChange(name)
                        setOpen(false)
                      }}
                    >
                      {Icon ? (
                        <Icon className='mr-2 size-4' />
                      ) : (
                        <span className='mr-2 size-4' />
                      )}
                      {name}
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
