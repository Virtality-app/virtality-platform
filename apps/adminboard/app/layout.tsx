import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cookies } from 'next/headers'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import AppShell from '@/components/layout/app-shell'
import { QueryProvider, ORPCProvider } from '@virtality/react-query'
import { Toaster } from '@/components/ui/sonner'
import { getServerUrl, ORPC_PREFIX } from '@virtality/shared/types'
import { SIDEBAR_COOKIE_NAME } from '@virtality/ui/components/sidebar'
import { cn } from '@/lib/utils'

const baseURL = getServerUrl()

export const metadata: Metadata = {
  title: 'Virtality Adminboard',
  description: '',
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const cookieStore = await cookies()
  const defaultSidebarOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          'min-h-svh antialiased',
        )}
      >
        <QueryProvider>
          <ORPCProvider url={baseURL + ORPC_PREFIX} credentials='include'>
            <ThemeProvider
              defaultTheme='system'
              attribute='class'
              enableSystem
              disableTransitionOnChange
            >
              <AppShell defaultSidebarOpen={defaultSidebarOpen}>
                {children}
              </AppShell>
              <Toaster />
            </ThemeProvider>
          </ORPCProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
