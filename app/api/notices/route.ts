import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

// 공지사항 목록 조회
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const churchId = searchParams.get('churchId')
  const slug = searchParams.get('slug')

  try {
    const where = churchId ? { churchId } : slug ? { church: { slug } } : {}
    
    const notices = await prisma.notice.findMany({
      where,
      include: { church: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: '공지사항 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 공지사항 추가
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, content, churchId } = body

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
