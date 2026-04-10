import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import GalleryClient from './GalleryClient'

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      galleries: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!church) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

  return <GalleryClient church={church} colors={colors} slug={slug} />
}
