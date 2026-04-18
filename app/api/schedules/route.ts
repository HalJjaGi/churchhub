import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const month = searchParams.get('month') || '' // format: YYYY-MM
  const category = searchParams.get('category') || ''

  if (!slug) {
    return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
  }

  try {
    const where: any = { church: { slug } }
    if (month) {
      const [y, m] = month.split('-').map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 1)
      where.date = { gte: start, lt: end }
    }
    if (category) {
      where.category = category
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        orderBy: { date: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.schedule.count({ where }),
    ])

    return NextResponse.json({
      schedules,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: '일정을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, description, date, endDate, category, churchId } = body

    if (!title || !date || !churchId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const authError = await requireAdmin(request, churchId)
    if (authError) return authError

    const schedule = await prisma.schedule.create({
      data: {
        title: sanitizeText(title),
        description: description ? sanitizeText(description) : null,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        category: category || 'general',
        churchId,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: '일정 추가에 실패했습니다.' }, { status: 500 })
  }
}
