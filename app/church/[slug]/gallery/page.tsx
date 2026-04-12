import { notFound } from 'next/navigation'
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
    select: { id: true, name: true, theme: true },
  })

  if (!church) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

  return <GalleryClient church={church} colors={colors} slug={slug} />
}
