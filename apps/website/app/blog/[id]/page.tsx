import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWebsiteUrl } from '@virtality/shared/types'
import { BlogPostView, getPostBySlug } from '@/sections/blog'
import JsonLd from '@/components/shared/json-ld'
import { buildBlogPostingJsonLd } from '@/lib/json-ld'
import { buildPostMetadata } from '@/lib/page-metadata'

export const dynamic = 'force-dynamic'

type BlogPostPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPostBySlug(id)

  // The page itself calls notFound(); an empty object keeps the defaults.
  if (!post) return {}

  return buildPostMetadata(post)
}

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { id } = await params
  const post = await getPostBySlug(id)

  if (!post) {
    notFound()
  }

  return (
    <>
      <JsonLd data={buildBlogPostingJsonLd(post, getWebsiteUrl())} />
      <BlogPostView post={post} />
    </>
  )
}

export default BlogPostPage
