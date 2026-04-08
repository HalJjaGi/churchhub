import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText, sanitizeURL } from '@/lib/sanitize'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'
import { requireAdmin } from '@/lib/auth-guard'

// 설교 목록 조회 (공개 - slug 기반만 허용)
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    // slug 기반만 허용 (churchId 직접 조회 차단 → IDOR 방지)
    if (!slug) {
      return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
    }

    const sermons = await prisma.sermon.findMany({
      where: { church: { slug } },
      include: { church: { select: { name: true, slug: true } } },
      orderBy: { date: 'desc' },
    })
    
    return NextResponse.json(sermons)
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json({ error: '설교 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 설교 추가 (관리자만)
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, content, speaker, date, youtubeUrl, churchId } = body

    // churchId로 권한 검증
    const authError = await requireAdmin(request, churchId)
    if (authError) return authError

    if (!title || !content || !speaker || !churchId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // YouTube 썸네일 자동 추출
    let thumbnail = null
    if (youtubeUrl) {
      const videoId = extractYouTubeId(sanitizeURL(youtubeUrl))
      if (videoId) {
        thumbnail = getYouTubeThumbnail(videoId)
      }
    }

    const sermon = await prisma.sermon.create({
      data: {
        title: sanitizeText(title),
        content: sanitizeText(content),
        speaker: sanitizeText(speaker),
        date: date ? new Date(date) : new Date(),
        youtubeUrl: youtubeUrl ? sanitizeURL(youtubeUrl) : null,
        thumbnail,
        churchId,
      },
    })

    return NextResponse.json(sermon, { status: 201 })
  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json({ error: '설교 추가에 실패했습니다.' }, { status: 500 })
  }
}
