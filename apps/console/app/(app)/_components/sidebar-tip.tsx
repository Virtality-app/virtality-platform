'use client'

import { P } from '@/components/ui/typography'
import { ArrowLeft, Sidebar, X } from 'lucide-react'
import { Item, ItemContent, ItemMedia } from '@/components/ui/item'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const SidebarTip = ({
  handleSidebarTipClose,
}: {
  handleSidebarTipClose: () => void
}) => {
  const isMobile = useIsMobile()

  return (
    <Item variant='outline' className='relative hover:[&_svg]:block'>
      <ItemMedia variant='icon'>
        {isMobile ? <Sidebar /> : <ArrowLeft />}
      </ItemMedia>
      <ItemContent>
        {isMobile ? (
          <P>Tap this icon in the top navigation bar to open the sidebar.</P>
        ) : (
          <P>
            This is the sidebar, it gives you access to most of the app&apos;s
            features.
          </P>
        )}
      </ItemContent>
      <X
        onClick={handleSidebarTipClose}
        className={cn(
          'bg-card hover:bg-accent absolute -top-2.5 -right-2.5 hidden rounded-full border p-1',
          isMobile && 'block',
        )}
      />
    </Item>
  )
}

export default SidebarTip
