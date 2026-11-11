import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const DASHBOARD_TABS = ['overview', 'sessions', 'clinicians'] as const

export type DashboardTab = (typeof DASHBOARD_TABS)[number]

const isDashboardTab = (value: string | null): value is DashboardTab =>
  DASHBOARD_TABS.includes(value as DashboardTab)

/** The open dashboard tab, kept in `?tab=` so it survives reloads and links. */
export function useDashboardTab() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const raw = searchParams.get('tab')
  const tab: DashboardTab = isDashboardTab(raw) ? raw : 'overview'

  const setTab = useCallback(
    (next: string) => {
      if (!isDashboardTab(next)) return
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'overview') params.delete('tab')
      else params.set('tab', next)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams],
  )

  return { tab, setTab }
}
