import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import '@/app/globals.css'
import RootProvider from '@/context/root-provider'
import { LanguageProvider } from '@/i18n/language-provider'
import { resolveRequestLanguage } from '@/i18n/request-language'
import { loadServerTranslations } from '@/i18n/server-translations'
import { settings } from '@/i18n/settings'
import { cn } from '@/lib/utils'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const language = resolveRequestLanguage(
    (await cookies()).get(settings.cookieName)?.value,
    (await headers()).get('accept-language'),
  )
  const resources = await loadServerTranslations(language)

  return (
    <html lang={language} suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-svh antialiased dark:bg-zinc-950',
        )}
      >
        <LanguageProvider language={language} resources={resources}>
          <RootProvider>{children}</RootProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
