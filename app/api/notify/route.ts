import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { requireAdminForSlug } from '@/lib/auth-guard'

// 알림 발송 트리거 (관리자)
export async function POST(request: NextRequest) {
  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { slug, type } = body // type: "new_sermon", "new_notice", "new_prayer", "new_bulletin"

    if (!slug || !type) {
      return NextResponse.json({ error: 'slug와 type이 필요합니다.' }, { status: 400 })
    }

    const { error: authError, churchId } = await requireAdminForSlug(request, slug)
    if (authError) return authError

    // 알림 설정 확인
    const setting = await prisma.notificationSetting.findUnique({
      where: { churchId_type: { churchId: churchId!, type } },
    })

    if (!setting || !setting.enabled) {
      return NextResponse.json({ message: '해당 알림이 비활성화되어 있습니다.' })
    }

    // 구독자 목록 (verified만)
    const subscribers = await prisma.subscriber.findMany({
      where: { churchId: churchId!, verified: true },
      select: { email: true },
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ message: '구독자가 없습니다.' })
    }

    // TODO: 실제 이메일 발송 (SMTP/Resend 연동 후 구현)
    // for (const sub of subscribers) {
    //   await sendNotificationEmail(sub.email, type, data)
    // }

    return NextResponse.json({
      success: true,
      message: `알림이 ${subscribers.length}명의 구독자에게 발송 대기 중입니다. (SMTP 설정 필요)`,
      subscriberCount: subscribers.length,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: '알림 발송에 실패했습니다.' }, { status: 500 })
  }
}
