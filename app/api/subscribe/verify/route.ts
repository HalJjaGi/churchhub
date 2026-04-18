import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 이메일 구독 확인 — GET /api/subscribe/verify?token=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 })
  }

  const subscriber = await prisma.subscriber.findFirst({ where: { token } })
  if (!subscriber) {
    return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 404 })
  }

  if (subscriber.verified) {
    return NextResponse.json({ message: '이미 확인된 구독입니다.' })
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { verified: true },
  })

  return NextResponse.json({ success: true, message: '이메일 구독이 확인되었습니다!' })
}
