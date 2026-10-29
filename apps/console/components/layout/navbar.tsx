'use client'

import { useClientT } from '@/i18n/use-client-t'
import Link from 'next/link'
import Avatar from '@/components/layout/avatar'
import { Button } from '@virtality/ui/components/button'
import { SidebarTrigger } from '@virtality/ui/components/sidebar'
import { Sidebar } from 'lucide-react'
import { SubscribeRenewBanner } from '@/components/layout/subscribe-renew-banner'

const Navbar = () => {
  const { t } = useClientT('layout')
  return (
    <header className='sticky top-0 z-10 col-span-2 col-start-1 flex h-15 border-b bg-zinc-200/80 px-2 py-1 text-zinc-800 drop-shadow-sm backdrop-blur-xs backdrop-saturate-180 dark:border-b-zinc-600 dark:bg-zinc-950 dark:text-white'>
      <nav className='relative flex w-full items-center gap-6 text-xl font-semibold'>
        <SidebarTrigger>
          <Sidebar />
        </SidebarTrigger>

        <SubscribeRenewBanner />

        <Button asChild variant='ghost' className='ml-auto max-lg:text-sm'>
          <Link href='/'>{t('navbar.dashboard')}</Link>
        </Button>

        <Avatar />
      </nav>
    </header>
  )
}

export default Navbar
