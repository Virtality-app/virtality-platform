import { describe, expect, it } from 'vitest'
import type { BlogResolvedPost } from '@virtality/shared/types'
import {
  buildBlogPostingJsonLd,
  buildOrganizationJsonLd,
  serializeJsonLd,
} from './json-ld'

const SITE = 'https://www.virtality.app'

const post: BlogResolvedPost = {
  slug: 'vr-and-frozen-shoulder',
  title: 'VR and frozen shoulder',
  excerpt: 'What two sessions changed for one patient.',
  cover: 'https://cdn.virtality.app/blog/cover.jpg',
  authorId: 'kate',
  publishedAt: '2026-10-01',
  featured: false,
  body: [],
  author: { id: 'kate', name: 'Kate Doe' },
}

describe('buildOrganizationJsonLd', () => {
  it('describes Virtality with an absolute url and logo', () => {
    expect(buildOrganizationJsonLd(`${SITE}/`)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Virtality',
      url: SITE,
      logo: `${SITE}/virtality_small_rounded.png`,
    })
  })

  it('lists the social profiles that are set as sameAs', () => {
    const jsonLd = buildOrganizationJsonLd(SITE, [
      'https://www.linkedin.com/company/virtality',
      undefined,
      'https://x.com/virtality',
    ])
    expect(jsonLd.sameAs).toEqual([
      'https://www.linkedin.com/company/virtality',
      'https://x.com/virtality',
    ])
  })
})

describe('buildBlogPostingJsonLd', () => {
  it('describes the Post with its Author and Virtality as publisher', () => {
    expect(buildBlogPostingJsonLd(post, SITE)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE}/blog/vr-and-frozen-shoulder`,
      },
      url: `${SITE}/blog/vr-and-frozen-shoulder`,
      headline: 'VR and frozen shoulder',
      description: 'What two sessions changed for one patient.',
      image: ['https://cdn.virtality.app/blog/cover.jpg'],
      datePublished: '2026-10-01',
      author: { '@type': 'Person', name: 'Kate Doe' },
      publisher: {
        '@type': 'Organization',
        name: 'Virtality',
        url: SITE,
        logo: `${SITE}/virtality_small_rounded.png`,
      },
    })
  })

  it('makes a site-relative Cover absolute', () => {
    const jsonLd = buildBlogPostingJsonLd(
      { ...post, cover: '/placeholder.svg' },
      SITE,
    )
    expect(jsonLd.image).toEqual([`${SITE}/placeholder.svg`])
  })
})

describe('serializeJsonLd', () => {
  it('escapes < so Post text cannot close the script tag', () => {
    const out = serializeJsonLd({ headline: '</script><script>alert(1)' })
    expect(out).not.toContain('<')
    expect(JSON.parse(out)).toEqual({ headline: '</script><script>alert(1)' })
  })
})
