import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// POST /api/applications/search — 교회 신청 상태 조회
// 교회명 + 신청 시 사용한 이메일로 본인 신청 내역을 확인한다.
const searchSchema = z.object({
  churchName: z
    .string()
    .trim()
    .min(1, '교회명을 입력해주세요')
    .max(100, '교회명은 100자 이하로 입력해주세요'),
  contactEmail: z
    .string()
    .trim()
    .email('유효한 이메일을 입력해주세요')
    .max(100, '이메일은 100자 이하로 입력해주세요'),
})

function formatDateTime(date: Date): string {
  // 한국 서비스 기준 KST(UTC+9)로 표시 — 컨테이너 타임존과 무관하게 고정
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: '신청이 정상적으로 접수되었습니다. 현재 검토 대기 중입니다.',
  under_review: '신청 내용을 검토하고 있습니다. 결과는 곧 안내드리겠습니다.',
  approved: '신청이 승인되었습니다. 교회 웹사이트 생성이 진행됩니다.',
  rejected: '신청이 반려되었습니다. 자세한 사항은 고객지원으로 문의해주세요.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = searchSchema.safeParse(body)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { message: firstIssue?.message || '입력값을 확인해주세요' },
        { status: 400 }
      )
    }

    const application = await prisma.churchApplication.findFirst({
      where: {
        churchName: {
          equals: parsed.data.churchName,
          mode: 'insensitive',
        },
        email: parsed.data.contactEmail.toLowerCase(),
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        churchName: true,
        status: true,
        submittedAt: true,
        phone: true,
        email: true,
        address: true,
        theme: true,
        notes: true,
      },
    })

    if (!application) {
      return NextResponse.json({ application: null })
    }

    // 접수일 기준 3영업일 후를 예상 완료일로 표시 (단순 +3일)
    const estimated = new Date(application.submittedAt)
    estimated.setDate(estimated.getDate() + 3)

    return NextResponse.json({
      application: {
        id: application.id,
        churchName: application.churchName,
        status: application.status,
        submittedAt: formatDateTime(application.submittedAt),
        estimatedCompletion: formatDateTime(estimated),
        contactEmail: application.email,
        contactPhone: application.phone,
        address: application.address,
        theme: application.theme,
        message: application.notes || STATUS_MESSAGES[application.status] || '신청 상태를 확인 중입니다.',
      },
    })
  } catch (error) {
    console.error('신청 상태 조회 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
