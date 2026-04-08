import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText, sanitizeURL } from '@/lib/sanitize'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'

// 설교 목록 조회
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const churchId = searchParams.get('churchId')
  const slug = searchParams.get('slug')

  try {
    const where = churchId ? { churchId } : slug ? { church: { slug } } : {}
    
    const sermons = await prisma.sermon.findMany({
      where,
      include: { church: { select: { name: true, slug: true } } },
      orderBy: { date: 'desc' },
    })
    
    return NextResponse.json(sermons)
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json({ error: '설교 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 설교 추가
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { title, content, speaker, date, youtubeUrl, churchId } = body

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
