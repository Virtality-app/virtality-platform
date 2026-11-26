import { describe, expect, it } from 'vitest'
import type { BlogResolvedPost } from '@virtality/shared/types'
import {
  buildHomeMetadata,
  buildPageMetadata,
  buildPostMetadata,
} from './page-metadata'

const post: BlogResolvedPost = {
  slug: 'vr-and-frozen-shoulder',
  title: 'VR and frozen shoulder',
  excerpt: 'What two sessions changed for one patient.',
  cover: 'https://cdn.virtality.app/blog/cover.jpg',
  authorId: 'kate',
  publishedAt: '2026-10-01',
  featured: false,
  body: [],
  author: { id: 'kate', name: 'Kate Doe', role: 'Physiotherapist' },
}

describe('buildPageMetadata', () => {
  it('sets the title, description and canonical path', () => {
    const metadata = buildPageMetadata({
      title: 'Blog',
      description: 'News from Virtality.',
      path: '/blog',
    })

    expect(metadata.title).toEqual({ absolute: 'Blog · Virtality' })
    expect(metadata.description).toBe('News from Virtality.')
    expect(metadata.alternates).toEqual({ canonical: '/blog' })
  })

  it('gives Open Graph and Twitter the full title and the default image', () => {
    const metadata = buildPageMetadata({
      title: 'Contact',
      description: 'Get in touch.',
      path: '/contact',
    })

    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Virtality',
      url: '/contact',
      title: 'Contact · Virtality',
      description: 'Get in touch.',
      images: [{ url: '/open-graph/og-image.png', width: 1200, height: 630 }],
    })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Contact · Virtality',
      images: ['/open-graph/og-image.png'],
    })
  })
})

describe('buildPostMetadata', () => {
  it('uses the Post title, Excerpt and canonical Post path', () => {
    const metadata = buildPostMetadata(post)

    expect(metadata.title).toEqual({
      absolute: 'VR and frozen shoulder · Virtality',
    })
    expect(metadata.description).toBe(
      'What two sessions changed for one patient.',
    )
    expect(metadata.alternates).toEqual({
      canonical: '/blog/vr-and-frozen-shoulder',
    })
  })

  it('shares the Cover as an article with its date and Author', () => {
    const metadata = buildPostMetadata(post)

    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: 'VR and frozen shoulder · Virtality',
      description: 'What two sessions changed for one patient.',
      images: [{ url: post.cover, alt: post.title }],
      publishedTime: '2026-10-01',
      authors: ['Kate Doe'],
    })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [post.cover],
    })
  })

  it('does not add the brand twice when the Post title names Virtality', () => {
    const metadata = buildPostMetadata({
      ...post,
      title: 'Virtality at InnoDays Crete',
    })
    expect(metadata.title).toEqual({ absolute: 'Virtality at InnoDays Crete' })
    expect(metadata.openGraph?.title).toBe('Virtality at InnoDays Crete')
  })

  it('encodes the slug in the canonical path', () => {
    const metadata = buildPostMetadata({ ...post, slug: 'a b' })
    expect(metadata.alternates).toEqual({ canonical: '/blog/a%20b' })
  })
})

describe('buildHomeMetadata', () => {
  it('points the canonical and og:url at the site root', () => {
    const metadata = buildHomeMetadata()
    expect(metadata.alternates).toEqual({ canonical: '/' })
    expect(metadata.openGraph).toMatchObject({
      url: '/',
      title: 'Virtality · VR rehabilitation for physiotherapists',
    })
  })
})
