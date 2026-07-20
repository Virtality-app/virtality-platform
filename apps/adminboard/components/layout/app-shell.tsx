'use client'

import AppSidebar from '@/components/layout/app-sidebar'
import TopBar from '@/components/layout/top-bar'
import { SidebarInset, SidebarProvider } from '@virtality/ui/components/sidebar'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const AppShell = ({
  children,
  defaultSidebarOpen,
}: {
  children: ReactNode
  defaultSidebarOpen?: boolean
}) => {
  const pathname = usePathname()
  const hideChrome = pathname === '/log-in' || pathname === '/no-access'

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AppSidebar />
      <SidebarInset className='min-w-0'>
        <TopBar />
        <div className='min-h-screen-with-header bg-background text-foreground h-full min-w-0'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppShell
