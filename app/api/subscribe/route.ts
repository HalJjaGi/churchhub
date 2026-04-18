import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import crypto from 'crypto'

// 구독 신청
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email, slug } = body

    if (!email || !slug) {
      return NextResponse.json({ error: '이메일과 교회 slug가 필요합니다.' }, { status: 400 })
    }

    const cleanEmail = sanitizeText(email).toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 })
    }

    const church = await prisma.church.findUnique({ where: { slug }, select: { id: true } })
    if (!church) {
      return NextResponse.json({ error: '교회를 찾을 수 없습니다.' }, { status: 404 })
    }

    const token = crypto.randomBytes(32).toString('hex')

    const subscriber = await prisma.subscriber.upsert({
      where: { email_churchId: { email: cleanEmail, churchId: church.id } },
      update: { token },
      create: {
        email: cleanEmail,
        churchId: church.id,
        token,
        verified: false,
      },
    })

    // TODO: 확인 이메일 발송 (SMTP 설정 후 구현)
    // sendVerificationEmail(cleanEmail, token, slug)

    return NextResponse.json({
      success: true,
      message: '구독 신청이 완료되었습니다. 이메일을 확인해주세요.',
      // 개발 중에만 token 반환 (프로덕션에서는 제거)
      ...(process.env.NODE_ENV === 'development' && { verifyToken: token }),
    }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({ error: '구독 신청에 실패했습니다.' }, { status: 500 })
  }
}

// 구독 해지
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 })
    }

    const subscriber = await prisma.subscriber.findFirst({ where: { token } })
    if (!subscriber) {
      return NextResponse.json({ error: '구독자를 찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.subscriber.delete({ where: { id: subscriber.id } })
    return NextResponse.json({ success: true, message: '구독이 해지되었습니다.' })
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json({ error: '구독 해지에 실패했습니다.' }, { status: 500 })
  }
}
