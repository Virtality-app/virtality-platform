'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@virtality/ui/components/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useClientT } from '@/i18n/use-client-t'
import type { PatientListItem } from '@/types/models'
import PatientInitialsAvatar from './patient-initials-avatar'

const PinPatientPopover = ({
  candidates,
  disabled,
  onPin,
}: {
  candidates: PatientListItem[]
  disabled: boolean
  onPin: (patientId: string) => void
}) => {
  const { t } = useClientT('home')
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='self-start'
          disabled={disabled || candidates.length === 0}
        >
          <Plus /> {t('pinned.pin')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-0'>
        <Command>
          <CommandInput placeholder={t('pinned.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('pinned.noneFound')}</CommandEmpty>
            <CommandGroup>
              {candidates.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.name}
                  onSelect={() => {
                    onPin(patient.id)
                    setOpen(false)
                  }}
                >
                  <PatientInitialsAvatar
                    name={patient.name}
                    image={patient.image}
                    className='size-6 text-[10px]'
                  />
                  <span className='truncate'>{patient.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default PinPatientPopover
