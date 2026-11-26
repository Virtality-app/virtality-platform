import type { MetadataRoute } from 'next'

/** Public pages listed in the sitemap, besides one entry per published Post. */
export const SITEMAP_FIXED_PATHS = [
  '/',
  '/blog',
  '/contact',
  '/waitlist',
  '/privacy',
  '/terms',
] as const

/** Paths crawlers should skip on production. */
export const ROBOTS_DISALLOWED_PATHS = [
  '/api/',
  '/thank-you',
  '/email-preferences',
] as const

type SitemapPost = { slug: string; publishedAt: string }

function absoluteUrl(websiteUrl: string, path: string) {
  const base = websiteUrl.replace(/\/+$/, '')
  return path === '/' ? base : `${base}${path}`
}

export function buildSitemap(
  websiteUrl: string,
  posts: readonly SitemapPost[],
): MetadataRoute.Sitemap {
  return [
    ...SITEMAP_FIXED_PATHS.map((path) => ({
      url: absoluteUrl(websiteUrl, path),
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(websiteUrl, `/blog/${encodeURIComponent(post.slug)}`),
      lastModified: post.publishedAt,
    })),
  ]
}

/** Header that keeps a response out of search results. */
export const NOINDEX_HEADER = {
  key: 'X-Robots-Tag',
  value: 'noindex, nofollow',
} as const

/**
 * Only production is indexable. Staging (`preview`) and local builds send
 * `noindex` on every response so they never compete with the real site.
 */
export function buildNoindexHeaders(env: string | undefined) {
  if (env === 'production') return []
  return [{ source: '/:path*', headers: [NOINDEX_HEADER] }]
}

/**
 * Production lists the private paths and the sitemap. Every other env allows
 * everything: a `Disallow` would stop Google from fetching pages, so it would
 * never see the `noindex` header from `buildNoindexHeaders`.
 */
export function buildRobots(
  websiteUrl: string,
  env: string | undefined,
): MetadataRoute.Robots {
  if (env !== 'production') {
    return { rules: { userAgent: '*', allow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...ROBOTS_DISALLOWED_PATHS],
    },
    sitemap: absoluteUrl(websiteUrl, '/sitemap.xml'),
  }
}
