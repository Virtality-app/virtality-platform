import type { MetadataRoute } from 'next'

/**
 * Crawling is allowed so search engines can fetch pages and see the
 * `X-Robots-Tag: noindex` header from `next.config.ts`. A `Disallow` here
 * would keep already-indexed URLs in results. No sitemap: nothing here
 * should be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' } }
}
