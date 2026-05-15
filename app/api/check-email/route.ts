import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function GET() {
  try {
    // emailService 상태 확인
    const status = {
      resendApiKey: process.env.RESEND_API_KEY ? '설정됨' : '설정 안됨',
      resendFromEmail: process.env.RESEND_FROM_EMAIL || '설정 안됨',
      resendFromName: process.env.RESEND_FROM_NAME || '설정 안됨',
      nextauthUrl: process.env.NEXTAUTH_URL || '설정 안됨',
    }

    // 간단한 테스트 이메일 발송 시도
    const testResult = await emailService.sendEmail({
      to: '01dlwldnjs@gmail.com',
      subject: 'EmailService 테스트 - 처치허브',
      html: '<h2>EmailService 테스트</h2><p>이 이메일은 emailService.sendEmail로 발송됩니다.</p>'
    })

    return NextResponse.json({
      status,
      testResult,
      message: testResult ? '이메일 발송 성공' : '이메일 발송 실패'
    })
  } catch (error) {
    console.error('Email service check error:', error)
    return NextResponse.json({ 
      error: '이메일 서비스 체크 실패',
      details: error instanceof Error ? error.message : "알 수 없는 에러" 
    }, { status: 500 })
  }
}
