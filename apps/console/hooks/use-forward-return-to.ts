import { useSearchParams } from 'next/navigation'
import { RETURN_TO_PARAM, withReturnTo } from '@/lib/home-picker-return'

/**
 * `href` carrying this page's `returnTo`, so a create page opened from a list
 * the dashboard sent us to still comes back to the dashboard.
 */
export function useForwardReturnTo(href: string): string {
  const returnTo = useSearchParams().get(RETURN_TO_PARAM)
  return returnTo ? withReturnTo(href, returnTo) : href
}
