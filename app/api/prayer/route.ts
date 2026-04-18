import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// 기도 요청 목록 조회
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
  }

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '12', 10)
  const search = searchParams.get('search') || ''

  const where: any = { church: { slug } }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prayerRequest.count({ where }),
  ])

  return NextResponse.json({
    prayers: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

// 기도 요청 작성
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, content, authorName, isAnonymous, slug } = body

    if (!title || !content || !slug) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const church = await prisma.church.findUnique({ where: { slug }, select: { id: true } })
    if (!church) {
      return NextResponse.json({ error: '교회를 찾을 수 없습니다.' }, { status: 404 })
    }

    const prayer = await prisma.prayerRequest.create({
      data: {
        title: sanitizeText(title),
        content: sanitizeText(content),
        authorName: isAnonymous ? null : sanitizeText(authorName || ''),
        isAnonymous: !!isAnonymous,
        churchId: church.id,
      },
    })

    return NextResponse.json(prayer, { status: 201 })
  } catch (error) {
    console.error('Error creating prayer request:', error)
    return NextResponse.json({ error: '기도 요청 작성에 실패했습니다.' }, { status: 500 })
  }
}
