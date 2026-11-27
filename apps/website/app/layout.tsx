import type { Metadata } from 'next'
import './globals.css'
import { dmSans, jetbrainsMono } from './fonts/fonts'
import { ThemeProvider } from '@/context/ThemeProvider'
import Navbar from '@/components/layout/navbar'
import { Toaster } from 'sonner'
import Footer from '@/components/layout/footer'
import CookieBanner from '@/components/layout/cookie-banner'
import {
  getServerUrl,
  getWebsiteUrl,
  ORPC_PREFIX,
} from '@virtality/shared/types'
import { ORPCProvider, QueryProvider } from '@virtality/react-query'
import { cn } from '@/lib/utils'
import {
  DEFAULT_OG_IMAGE,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  TITLE_TEMPLATE,
} from '@/lib/page-metadata'

const websiteURL = getWebsiteUrl()
const baseURL = getServerUrl()

export const metadata: Metadata = {
  metadataBase: new URL(websiteURL),
  title: { template: TITLE_TEMPLATE, default: HOME_TITLE },
  description: HOME_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        dmSans.variable,
        jetbrainsMono.variable,
        'scroll-pt-15 scroll-smooth',
      )}
    >
      <body className='antialiased'>
        <ThemeProvider
          storageKey='website-theme'
          attribute='class'
          defaultTheme='light'
          disableTransitionOnChange
        >
          <QueryProvider>
            <ORPCProvider url={baseURL + ORPC_PREFIX} credentials='include'>
              <Navbar />
              <main className='min-h-screen-with-nav'>{children}</main>
              <Footer />
              <CookieBanner />
              <Toaster />
            </ORPCProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
