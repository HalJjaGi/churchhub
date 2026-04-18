import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { requireAdmin } from '@/lib/auth-guard'

// 주보 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const bulletin = await prisma.bulletin.findUnique({ where: { id } })
  if (!bulletin) {
    return NextResponse.json({ error: '주보를 찾을 수 없습니다.' }, { status: 404 })
  }
  return NextResponse.json(bulletin)
}

// 주보 수정 (관리자)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const bulletin = await prisma.bulletin.findUnique({ where: { id } })
  if (!bulletin) {
    return NextResponse.json({ error: '주보를 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, bulletin.churchId)
  if (authError) return authError

  try {
    const body = await request.json()
    const updated = await prisma.bulletin.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.content && { content: JSON.stringify(body.content) }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating bulletin:', error)
    return NextResponse.json({ error: '주보 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 주보 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const bulletin = await prisma.bulletin.findUnique({ where: { id } })
  if (!bulletin) {
    return NextResponse.json({ error: '주보를 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, bulletin.churchId)
  if (authError) return authError

  await prisma.bulletin.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
