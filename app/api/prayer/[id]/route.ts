import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { requireAdmin } from '@/lib/auth-guard'

// 기도하기 (prayerCount 증가) — POST /api/prayer/[id]?action=pray
// 응답됨 토글 — POST /api/prayer/[id]?action=answer (관리자)
// 삭제 — DELETE (관리자)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  const prayer = await prisma.prayerRequest.findUnique({ where: { id } })
  if (!prayer) {
    return NextResponse.json({ error: '기도 요청을 찾을 수 없습니다.' }, { status: 404 })
  }

  if (action === 'pray') {
    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: { prayerCount: { increment: 1 } },
    })
    return NextResponse.json(updated)
  }

  if (action === 'answer') {
    const churchId = prayer.churchId
    const authError = await requireAdmin(request, churchId)
    if (authError) return authError

    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: { isAnswered: !prayer.isAnswered },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: '알 수 없는 action입니다.' }, { status: 400 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const prayer = await prisma.prayerRequest.findUnique({ where: { id } })
  if (!prayer) {
    return NextResponse.json({ error: '기도 요청을 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, prayer.churchId)
  if (authError) return authError

  await prisma.prayerRequest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
