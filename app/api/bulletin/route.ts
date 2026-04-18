import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'

// 주보 목록 조회
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
  }

  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const where = { church: { slug } }
  const [items, total] = await Promise.all([
    prisma.bulletin.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bulletin.count({ where }),
  ])

  return NextResponse.json({
    bulletins: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

// 주보 생성 (관리자)
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, date, content, churchId, slug } = body

    if (!title || !date || !content) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // churchId 또는 slug로 교회 조회
    let resolvedChurchId = churchId
    if (!resolvedChurchId && slug) {
      const church = await prisma.church.findUnique({ where: { slug }, select: { id: true } })
      if (!church) return NextResponse.json({ error: '교회를 찾을 수 없습니다.' }, { status: 404 })
      resolvedChurchId = church.id
    }
    if (!resolvedChurchId) {
      return NextResponse.json({ error: 'churchId 또는 slug가 필요합니다.' }, { status: 400 })
    }

    const authError = await requireAdmin(request, resolvedChurchId)
    if (authError) return authError

    const bulletin = await prisma.bulletin.create({
      data: {
        title: sanitizeText(title),
        date: new Date(date),
        content: JSON.stringify(content),
        churchId: resolvedChurchId,
      },
    })

    return NextResponse.json(bulletin, { status: 201 })
  } catch (error) {
    console.error('Error creating bulletin:', error)
    return NextResponse.json({ error: '주보 생성에 실패했습니다.' }, { status: 500 })
  }
}
