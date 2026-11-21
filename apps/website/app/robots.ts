import type { MetadataRoute } from 'next'
import { getWebsiteUrl } from '@virtality/shared/types'
import { buildRobots } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getWebsiteUrl(), process.env.NEXT_PUBLIC_ENV)
}
