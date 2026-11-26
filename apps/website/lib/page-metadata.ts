import type { Metadata } from 'next'
import type { BlogResolvedPost } from '@virtality/shared/types'

export const SITE_NAME = 'Virtality'

/** Appended to every page title by the root layout's `title.template`. */
export const TITLE_TEMPLATE = `%s · ${SITE_NAME}`

export const HOME_TITLE = `${SITE_NAME} · VR rehabilitation for physiotherapists`

export const HOME_DESCRIPTION =
  'Virtality is a VR rehabilitation platform for physiotherapists. Patients do guided, evidence-based exercises in virtual reality, so clinics treat more patients and recovery stalls less.'

export const DEFAULT_OG_IMAGE = {
  url: '/open-graph/og-image.png',
  width: 1200,
  height: 630,
}

/** Homepage: the layout's default title, plus its canonical and `og:url`. */
export function buildHomeMetadata(): Metadata {
  return {
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: '/',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

/** Full `<title>`, without doubling the brand when the title already has it. */
function pageTitle(title: string) {
  return title.includes(SITE_NAME) ? title : TITLE_TEMPLATE.replace('%s', title)
}

type PageMetadataInput = {
  /** Page title; ` · Virtality` is added unless it already names Virtality. */
  title: string
  description: string
  /** Path of the page, e.g. `/blog`. Becomes the canonical URL. */
  path: `/${string}`
}

/**
 * Metadata for a fixed website page. Open Graph and Twitter are set in full
 * because Next replaces, not merges, the layout's `openGraph`.
 */
export function buildPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const fullTitle = pageTitle(title)

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export function postPath(slug: string): `/${string}` {
  return `/blog/${encodeURIComponent(slug)}`
}

/** Post title and Excerpt, with the Cover as the share image. */
export function buildPostMetadata(post: BlogResolvedPost): Metadata {
  const path = postPath(post.slug)
  const fullTitle = pageTitle(post.title)

  return {
    title: { absolute: fullTitle },
    description: post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description: post.excerpt,
      images: [{ url: post.cover, alt: post.title }],
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: post.excerpt,
      images: [post.cover],
    },
  }
}
