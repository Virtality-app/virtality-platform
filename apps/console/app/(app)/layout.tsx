import { SidebarProvider } from '@/components/ui/sidebar'
import RootSidebar from '@/components/layout/sidebar'
import Navbar from '@/components/layout/navbar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <RootSidebar />
      <main className='w-full'>
        <Navbar />
        {children}
      </main>
    </SidebarProvider>
  )
}
