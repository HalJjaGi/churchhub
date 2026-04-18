import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// GET /api/notices?slug=xxx or ?churchId=xxx
export async function GET(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req)
  if (rateLimitResponse) return rateLimitResponse

  const slug = req.nextUrl.searchParams.get('slug')
  const churchId = req.nextUrl.searchParams.get('churchId')
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10)
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)
  const search = req.nextUrl.searchParams.get('search') || ''

  const where: any = {}
  if (slug) {
    where.church = { slug }
  } else if (churchId) {
    where.churchId = churchId
  } else {
    return NextResponse.json({ error: 'slug or churchId required' }, { status: 400 })
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notice.count({ where }),
  ])

  return NextResponse.json({
    notices,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

// POST /api/notices
export async function POST(req: NextRequest) {
  try {
    const { title, content, imageUrl, pinned, churchId } = await req.json()
    if (!title || !content || !churchId) return NextResponse.json({ error: 'title, content, churchId required' }, { status: 400 })

    const notice = await prisma.notice.create({
      data: { title: sanitizeText(title), content: sanitizeText(content), imageUrl, pinned: pinned || false, churchId },
    })
    return NextResponse.json(notice, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
