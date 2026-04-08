import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'

// 공지사항 목록 조회 (공개 - slug 기반만 허용)
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    if (!slug) {
      return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
    }

    const notices = await prisma.notice.findMany({
      where: { church: { slug } },
      include: { church: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: '공지사항 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 공지사항 추가 (관리자만)
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, content, churchId } = body

    // churchId로 권한 검증
    const authError = await requireAdmin(request, churchId)
    if (authError) return authError

    if (!title || !content || !churchId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title: sanitizeText(title),
        content: sanitizeText(content),
        churchId,
      },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: '공지사항 추가에 실패했습니다.' }, { status: 500 })
  }
}
