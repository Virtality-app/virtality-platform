'use client'

import Link from 'next/link'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@virtality/ui/components/dropdown-menu'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'

/**
 * The `⋯` menu (Edit, Delete) beside a picker row. Hidden until the row is
 * hovered or focused, but always shown on the picked row and on touch.
 */
const StartSessionRowMenu = ({
  label,
  editHref,
  selected,
  onDelete,
}: {
  /** Names the row for assistive tech, e.g. the patient's name. */
  label: string
  editHref: string
  selected: boolean
  onDelete: () => void
}) => {
  const { t } = useClientT(['home', 'common'])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          aria-label={t('home:startSession.rowActions', { name: label })}
          className={cn(
            'absolute top-1/2 right-1.5 size-6 -translate-y-1/2 opacity-0 transition-opacity',
            'group-focus-within/row:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100',
            selected && 'opacity-100',
          )}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <Link href={editHref}>
            <Pencil />
            {t('common:btn.edit')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onClick={onDelete}>
          <Trash2 />
          {t('common:btn.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default StartSessionRowMenu
