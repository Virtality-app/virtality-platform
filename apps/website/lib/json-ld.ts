import type { BlogResolvedPost } from '@virtality/shared/types'
import { postPath, SITE_NAME } from './page-metadata'

export const LOGO_PATH = '/virtality_small_rounded.png'

type JsonLd = Record<string, unknown>

function absoluteUrl(websiteUrl: string, path: string) {
  if (/^https?:\/\//.test(path)) return path
  const base = websiteUrl.replace(/\/+$/, '')
  return path === '/' ? base : `${base}${path}`
}

function organization(websiteUrl: string) {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl(websiteUrl, '/'),
    logo: absoluteUrl(websiteUrl, LOGO_PATH),
  }
}

/**
 * schema.org `Organization` for the homepage. `sameAs` lists Virtality's
 * social profiles; unset ones are skipped.
 */
export function buildOrganizationJsonLd(
  websiteUrl: string,
  socialProfiles: readonly (string | undefined)[] = [],
): JsonLd {
  const sameAs = socialProfiles.filter((url): url is string => Boolean(url))

  return {
    '@context': 'https://schema.org',
    ...organization(websiteUrl),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/** schema.org `BlogPosting` for a Post page. */
export function buildBlogPostingJsonLd(
  post: BlogResolvedPost,
  websiteUrl: string,
): JsonLd {
  const url = absoluteUrl(websiteUrl, postPath(post.slug))

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(websiteUrl, post.cover)],
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: organization(websiteUrl),
  }
}

/**
 * `JSON.stringify` for a `<script type="application/ld+json">` body. `<` is
 * escaped so Post text can't close the script tag.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
