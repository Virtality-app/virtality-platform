import type { MetadataRoute } from 'next'
import { getWebsiteUrl } from '@virtality/shared/types'
import { getCachedBlogPosts } from '@/lib/marketing-prefetch'
import { buildSitemap } from '@/lib/seo'

// Like the blog pages: render per request so the build never needs the API.
// The Posts read stays cached under the `blog` tag, so `/api/revalidate`
// refreshes the sitemap when the adminboard publishes.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getCachedBlogPosts()
  return buildSitemap(getWebsiteUrl(), posts)
}
