import { describe, expect, it } from 'vitest'
import { buildRobots, buildSitemap } from './seo'

const SITE = 'https://www.virtality.app'

describe('buildSitemap', () => {
  it('lists the fixed pages and one entry per Post with publishedAt', () => {
    const sitemap = buildSitemap(SITE, [
      { slug: 'first-post', publishedAt: '2026-10-01T09:00:00.000Z' },
      { slug: 'second', publishedAt: '2026-11-02T09:00:00.000Z' },
    ])

    expect(sitemap.map((entry) => entry.url)).toEqual([
      'https://www.virtality.app',
      'https://www.virtality.app/blog',
      'https://www.virtality.app/contact',
      'https://www.virtality.app/waitlist',
      'https://www.virtality.app/privacy',
      'https://www.virtality.app/terms',
      'https://www.virtality.app/blog/first-post',
      'https://www.virtality.app/blog/second',
    ])
    expect(sitemap.at(-2)?.lastModified).toBe('2026-10-01T09:00:00.000Z')
  })

  it('does not double the slash when the site URL ends with one', () => {
    const sitemap = buildSitemap(`${SITE}/`, [])
    expect(sitemap[0]?.url).toBe(SITE)
    expect(sitemap[1]?.url).toBe(`${SITE}/blog`)
  })
})

describe('buildRobots', () => {
  it('allows crawling on production, minus private paths, and links the sitemap', () => {
    expect(buildRobots(SITE, 'production')).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you', '/email-preferences'],
      },
      sitemap: 'https://www.virtality.app/sitemap.xml',
    })
  })

  it.each(['preview', 'development', undefined])(
    'blocks every crawler when the env is %s',
    (env) => {
      expect(buildRobots(SITE, env)).toEqual({
        rules: { userAgent: '*', disallow: '/' },
      })
    },
  )
})
