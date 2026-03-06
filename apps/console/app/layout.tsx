import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/app/globals.css'
import Navbar from '@/components/layout/navbar'
import { ThemeProvider } from 'next-themes'
import { ToastContainer } from 'react-toastify'
import TinyBaseProvider from '@/context/tinybase-context'
import TourProvider from '@/context/tour-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import RootSidebar from '@/components/layout/sidebar'
import CookieBanner from '@/components/layout/cookie-banner'
import { ORPCProvider, QueryProvider } from '@virtality/react-query'
import {
  ORPC_PREFIX,
  SERVER_URL,
  SERVER_URL_LOCAL,
  SERVER_URL_STAGING,
} from '@virtality/shared/types'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Virtality App',
  description: 'Because every move matters.',
}

const env = process.env.ENV || 'development'

const baseURL =
  env === 'production'
    ? SERVER_URL
    : env === 'preview'
      ? SERVER_URL_STAGING
      : SERVER_URL_LOCAL

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={'en'} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh antialiased dark:bg-zinc-950`}
      >
        <QueryProvider>
          <ORPCProvider url={baseURL + ORPC_PREFIX} credentials='include'>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <TinyBaseProvider>
                <TourProvider>
                  <div id='root'>
                    <SidebarProvider suppressHydrationWarning>
                      <RootSidebar />
                      <main className='w-full'>
                        <Navbar />
                        {children}
                      </main>
                    </SidebarProvider>
                    <ToastContainer
                      position='bottom-right'
                      autoClose={5000}
                      hideProgressBar
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss={false}
                      draggable
                      pauseOnHover={false}
                      theme='dark'
                    />
                    <CookieBanner />
                  </div>
                </TourProvider>
              </TinyBaseProvider>
            </ThemeProvider>
          </ORPCProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
