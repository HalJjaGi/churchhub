import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { church: { select: { name: true, slug: true } } },
    })

    if (!schedule) {
      return NextResponse.json({ error: '일정을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json({ error: '일정을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  const existing = await prisma.schedule.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '일정을 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, description, date, endDate, category } = body

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        title: title !== undefined ? sanitizeText(title) : undefined,
        description: description !== undefined ? (description ? sanitizeText(description) : null) : undefined,
        date: date ? new Date(date) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
        category: category || undefined,
      },
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: '일정 수정에 실패했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  const existing = await prisma.schedule.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '일정을 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.schedule.delete({ where: { id } })
    return NextResponse.json({ message: '일정이 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: '일정 삭제에 실패했습니다.' }, { status: 500 })
  }
}
