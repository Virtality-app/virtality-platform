'use client'

import { P } from '@/components/ui/typography'
import { ArrowUpRight, X } from 'lucide-react'
import { Item, ItemContent, ItemMedia } from '@/components/ui/item'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const DropdownTip = ({
  handleDropdownTipClose,
}: {
  handleDropdownTipClose: () => void
}) => {
  const isMobile = useIsMobile()

  return (
    <Item
      variant='outline'
      className='bg-card absolute top-4 right-10 m-2 hover:[&_svg]:block'
    >
      <ItemContent>
        <P>Click your name or avatar to open your account menu.</P>
      </ItemContent>
      <ItemMedia variant='icon'>
        <ArrowUpRight />
      </ItemMedia>
      <X
        onClick={handleDropdownTipClose}
        className={cn(
          'bg-card hover:bg-accent absolute -top-2.5 -left-2.5 hidden rounded-full border p-1',
          isMobile && 'block',
        )}
      />
    </Item>
  )
}

export default DropdownTip
