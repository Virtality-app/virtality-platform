'use client'

import { useUpsertTranslation } from '@virtality/react-query'
import { Check, Ellipsis, Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TranslationEditDialog } from '@/components/translations/translation-edit-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDropdownMenu } from '@/hooks/use-dropdown-menu-action'
import type { TranslationTableRow } from '@/lib/translation-rows'

export function TranslationRowActions({ row }: { row: TranslationTableRow }) {
  const { open, setOpen, runAfterClose } = useDropdownMenu()
  const [editOpen, setEditOpen] = useState(false)
  const { mutate: upsert } = useUpsertTranslation()

  const approve = () =>
    upsert(
      {
        locale: 'el',
        namespace: row.namespace,
        key: row.key,
        value: row.greek,
      },
      {
        onSuccess: () => toast.success('Translation approved'),
        onError: (error) => toast.error(`Failed to approve: ${error.message}`),
      },
    )

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost' className='size-6'>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {row.status === 'needs-review' && (
            <DropdownMenuItem onSelect={() => runAfterClose(approve)}>
              <Check />
              Approve
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => runAfterClose(() => setEditOpen(true))}
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TranslationEditDialog
        row={row}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
