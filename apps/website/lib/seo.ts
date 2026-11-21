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

/**
 * Only production is indexable. Staging (`preview`) and local builds block
 * every crawler so they never compete with the real site in search results.
 */
export function buildRobots(
  websiteUrl: string,
  env: string | undefined,
): MetadataRoute.Robots {
  if (env !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } }
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
