import { scheduleAfterDropdownClose } from '@/lib/schedule-after-dropdown-close'
import { useCallback, useState } from 'react'

export function useDropdownMenuAction<T>(item: T) {
  const [open, setOpen] = useState(false)

  const openDialogAction = useCallback(
    (action: (item: T) => void) => () => {
      scheduleAfterDropdownClose(
        () => setOpen(false),
        () => action(item),
      )
    },
    [item],
  )

  return { open, setOpen, openDialogAction }
}
