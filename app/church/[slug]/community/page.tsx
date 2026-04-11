import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CommunityClient from './CommunityClient'

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { slug } = await params
  const { category } = await searchParams

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      posts: {
        include: { comments: true },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      },
    },
  })
  if (!church) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

  const filtered = category && category !== 'all'
    ? church.posts.filter((p) => p.category === category)
    : church.posts

  const serialized = filtered.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    comments: p.comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  }))

  return <CommunityClient slug={slug} church={church} colors={colors} posts={serialized} activeCategory={category || 'all'} />
}
