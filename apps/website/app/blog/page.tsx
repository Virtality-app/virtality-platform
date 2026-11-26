import { BlogIndex, getFeaturedPost, getPosts } from '@/sections/blog'
import { buildPageMetadata } from '@/lib/page-metadata'

export const dynamic = 'force-dynamic'

export const metadata = buildPageMetadata({
  title: 'Blog',
  description:
    'News, clinical stories and product updates from Virtality, the VR rehabilitation platform for physiotherapists.',
  path: '/blog',
})

const BlogPage = async () => {
  const [posts, featured] = await Promise.all([getPosts(), getFeaturedPost()])

  return <BlogIndex posts={posts} featured={featured} />
}

export default BlogPage
