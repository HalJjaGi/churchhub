import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// GET /api/galleries?churchId=xxx or ?slug=xxx [&page=1&limit=20&category=xxx]
export async function GET(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req)
  if (rateLimitResponse) return rateLimitResponse

  const churchId = req.nextUrl.searchParams.get('churchId')
  const slug = req.nextUrl.searchParams.get('slug')
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10)
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)
  const category = req.nextUrl.searchParams.get('category') || ''

  if (!churchId && !slug) {
    return NextResponse.json({ error: 'churchId or slug is required' }, { status: 400 })
  }

  const where: any = {}
  if (slug) {
    where.church = { slug }
  } else {
    where.churchId = churchId
  }
  if (category) {
    where.category = category
  }

  const [galleries, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gallery.count({ where }),
  ])

  return NextResponse.json({
    galleries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

// POST /api/galleries
export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await req.json()
    const { title, description, imageUrl, category, churchId } = body

    if (!title || !imageUrl || !churchId) {
      return NextResponse.json({ error: 'title, imageUrl, churchId required' }, { status: 400 })
    }

    const gallery = await prisma.gallery.create({
      data: {
        title: sanitizeText(title),
        description: description ? sanitizeText(description) : null,
        imageUrl,
        category: category ? sanitizeText(category) : null,
        churchId,
      },
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }
}
