import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText, sanitizeURL } from '@/lib/sanitize'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'
import { requireAdmin } from '@/lib/auth-guard'

// 설교 상세 조회 (공개)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  try {
    const sermon = await prisma.sermon.findUnique({
      where: { id },
      include: { church: { select: { name: true, slug: true } } },
    })

    if (!sermon) {
      return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(sermon)
  } catch (error) {
    console.error('Error fetching sermon:', error)
    return NextResponse.json({ error: '설교를 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 설교 수정 (관리자만 + 소유권 검증)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  // 레코드 조회 후 churchId로 권한 검증
  const existing = await prisma.sermon.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    const body = await request.json()
    const { title, content, speaker, date, youtubeUrl } = body

    let thumbnail = undefined
    if (youtubeUrl !== undefined) {
      const videoId = extractYouTubeId(sanitizeURL(youtubeUrl))
      thumbnail = videoId ? getYouTubeThumbnail(videoId) : null
    }

    const sermon = await prisma.sermon.update({
      where: { id },
      data: {
        title: title !== undefined ? sanitizeText(title) : undefined,
        content: content !== undefined ? sanitizeText(content) : undefined,
        speaker: speaker !== undefined ? sanitizeText(speaker) : undefined,
        date: date ? new Date(date) : undefined,
        youtubeUrl: youtubeUrl !== undefined ? (youtubeUrl ? sanitizeURL(youtubeUrl) : null) : undefined,
        thumbnail,
      },
    })

    return NextResponse.json(sermon)
  } catch (error) {
    console.error('Error updating sermon:', error)
    return NextResponse.json({ error: '설교 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 설교 삭제 (관리자만 + 소유권 검증)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  // 레코드 조회 후 churchId로 권한 검증
  const existing = await prisma.sermon.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) {
    return NextResponse.json({ error: '설교를 찾을 수 없습니다.' }, { status: 404 })
  }

  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.sermon.delete({ where: { id } })
    return NextResponse.json({ message: '설교가 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json({ error: '설교 삭제에 실패했습니다.' }, { status: 500 })
  }
}
