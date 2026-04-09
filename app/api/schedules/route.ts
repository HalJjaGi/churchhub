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

  if (!slug) {
    return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: { church: { slug } },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(schedules)
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
