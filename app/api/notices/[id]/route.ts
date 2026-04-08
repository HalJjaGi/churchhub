import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'

// 공지사항 상세 조회 (공개)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  try {
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: { church: { select: { name: true, slug: true } } },
    })

    if (!notice) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error fetching notice:', error)
    return NextResponse.json({ error: '공지사항을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 공지사항 수정 (관리자만 + 소유권 검증)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  // 레코드 조회 후 churchId로 권한 검증
  const existing = await prisma.notice.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, content } = body

    const notice = await prisma.notice.update({
      where: { id },
      data: {
        title: title !== undefined ? sanitizeText(title) : undefined,
        content: content !== undefined ? sanitizeText(content) : undefined,
      },
    })

    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error updating notice:', error)
    return NextResponse.json({ error: '공지사항 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 공지사항 삭제 (관리자만 + 소유권 검증)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  // 레코드 조회 후 churchId로 권한 검증
  const existing = await prisma.notice.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.notice.delete({ where: { id } })
    return NextResponse.json({ message: '공지사항이 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting notice:', error)
    return NextResponse.json({ error: '공지사항 삭제에 실패했습니다.' }, { status: 500 })
  }
}
