import { QueryProvider, ORPCProvider } from '@virtality/react-query'
import { ThemeProvider } from 'next-themes'
import TinyBaseProvider from '@/context/tinybase-context'
import TourProvider from '@/context/tour-context'
import CookieBanner from '@/components/layout/cookie-banner'
import { ToastContainer } from 'react-toastify'
import {
  ORPC_PREFIX,
  SERVER_URL,
  SERVER_URL_LOCAL,
  SERVER_URL_STAGING,
} from '@virtality/shared/types'
const env = process.env.ENV || 'development'

const baseURL =
  env === 'production'
    ? SERVER_URL
    : env === 'preview'
      ? SERVER_URL_STAGING
      : SERVER_URL_LOCAL

async function RootProvider({ children }: { children: React.ReactNode }) {
  return (
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
                {children}
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
  )
}

export default RootProvider
