import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { emailService } from '@/lib/email'
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

    // 확인 이메일 발송
    await sendVerificationEmail(cleanEmail, token, slug, church.id)
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

// 확인 이메일 발송 함수
async function sendVerificationEmail(email: string, token: string, slug: string, churchName: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/subscribe/verify?token=${token}`
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ChurchHub</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${churchName}</p>
      </div>
      
      <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">구독 확인 이메일</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          ${churchName}의 소식 구독을 신청해주셔서 감사합니다.<br>
          아래 버튼을 클릭하여 구독을 완료해주세요:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
            구독 확인하기
          </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="color: #495057; margin: 0; font-size: 14px;">
            <strong>또는 아래 링크로 접속:</strong><br>
            <a href="${verifyUrl}" style="color: #667eea; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 30px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>⚠️ 보안 안내</strong><br>
            이 이메일은 24시간 동안 유효합니다.<br>
            본인이 신청하지 않았다면 이 이메일을 무시해주세요.
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin: 0;">
          문제가 있으시면 교회 관리자에게 문의해주세요.<br>
          <strong>${churchName} 드림</strong>
        </p>
      </div>
    </div>
  `

  try {
    await emailService.sendEmail({
      to: email,
      subject: `[${churchName}] 구독 확인 이메일`,
      html,
    })
    console.log('✅ 구독 확인 이메일 발송 완료:', email)
  } catch (error) {
    console.error('❌ 구독 확인 이메일 발송 실패:', error)
  }
}
