import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'

// 설교 시리즈 목록 조회
export async function GET(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug 파라미터가 필요합니다.' }, { status: 400 })
  }

  try {
    const result = await prisma.sermon.findMany({
      where: { church: { slug }, series: { not: null } },
      select: { series: true },
      distinct: ['series'],
      orderBy: { series: 'asc' },
    })

    return NextResponse.json(result.map(r => r.series))
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json({ error: '시리즈 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}
