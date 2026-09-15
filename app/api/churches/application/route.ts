import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

// POST /api/churches/application — 교회 웹사이트 신청 접수
const applicationSchema = z.object({
  churchName: z
    .string()
    .trim()
    .min(1, '교회명을 입력해주세요')
    .max(100, '교회명은 100자 이하로 입력해주세요'),
  churchNameEnglish: z
    .string()
    .trim()
    .min(1, '교회 영문명을 입력해주세요')
    .max(50, '교회 영문명은 50자 이하로 입력해주세요')
    .regex(/^[a-zA-Z0-9-]+$/, '영문명은 영문자, 숫자, 하이픈(-)만 사용할 수 있습니다'),
  pastorName: z
    .string()
    .trim()
    .min(1, '담임목사 이름을 입력해주세요')
    .max(50, '담임목사 이름은 50자 이하로 입력해주세요'),
  contactPhone: z
    .string()
    .trim()
    .min(1, '연락처를 입력해주세요')
    .max(30, '연락처는 30자 이하로 입력해주세요'),
  contactEmail: z
    .string()
    .trim()
    .email('유효한 이메일을 입력해주세요')
    .max(100, '이메일은 100자 이하로 입력해주세요'),
  address: z
    .string()
    .trim()
    .min(1, '주소를 입력해주세요')
    .max(200, '주소는 200자 이하로 입력해주세요'),
  website: z.string().trim().max(200, '웹사이트 주소는 200자 이하로 입력해주세요').optional().or(z.literal('')),
  description: z.string().trim().max(2000, '소개는 2000자 이하로 입력해주세요').optional().or(z.literal('')),
  memberCount: z.string().trim().optional().or(z.literal('')),
  establishedYear: z.string().trim().optional().or(z.literal('')),
  theme: z.enum(['modern', 'classic', 'warm']).default('modern'),
  agreeTerms: z.boolean().refine((v) => v === true, '이용약관에 동의해주세요'),
  agreePrivacy: z.boolean().refine((v) => v === true, '개인정보처리방침에 동의해주세요'),
  agreeMarketing: z.boolean().optional().default(false),
})

// 영문명 → slug 변환 (폼과 동일한 규칙, 서버에서 재적용)
function convertToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parsePositiveInt(value: string | undefined | null): number | null {
  if (!value) return null
  const n = parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = applicationSchema.safeParse(body)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { message: firstIssue?.message || '입력값을 확인해주세요' },
        { status: 400 }
      )
    }
    const v = parsed.data
    const slug = convertToSlug(v.churchNameEnglish)

    if (!slug) {
      return NextResponse.json(
        { message: '유효한 교회 영문명을 입력해주세요' },
        { status: 400 }
      )
    }

    // 1) 승인된 교회 사이트 주소(slug)와 충돌 확인
    const existingChurch = await prisma.church.findUnique({ where: { slug } })
    if (existingChurch) {
      return NextResponse.json(
        { message: '이미 사용 중인 교회 영문명입니다. 다른 영문명을 입력해주세요.' },
        { status: 409 }
      )
    }

    // 2) 처리 중(대기/검토/승인)인 다른 신청과 slug 충돌 확인
    const existingApplication = await prisma.churchApplication.findFirst({
      where: {
        slug,
        status: { in: ['pending', 'under_review', 'approved'] },
      },
    })
    if (existingApplication) {
      return NextResponse.json(
        { message: '이미 사용 중인 교회 영문명입니다. 다른 영문명을 입력해주세요.' },
        { status: 409 }
      )
    }

    // 3) 같은 이메일로 접수된 처리 중 신청이 있는지 확인 (중복 신청 방지)
    const duplicateByEmail = await prisma.churchApplication.findFirst({
      where: {
        email: v.contactEmail.toLowerCase(),
        status: { in: ['pending', 'under_review', 'approved'] },
      },
    })
    if (duplicateByEmail) {
      return NextResponse.json(
        { message: '이미 접수된 신청이 있습니다. 검토 결과를 기다려주시거나 신청 상태 조회를 이용해주세요.' },
        { status: 409 }
      )
    }

    const application = await prisma.churchApplication.create({
      data: {
        churchName: v.churchName,
        pastorName: v.pastorName,
        phone: v.contactPhone,
        email: v.contactEmail.toLowerCase(),
        address: v.address,
        website: v.website || null,
        description: v.description || '',
        theme: v.theme,
        slug,
        memberCount: parsePositiveInt(v.memberCount),
        establishedYear: parsePositiveInt(v.establishedYear),
        agreeTerms: v.agreeTerms,
        agreePrivacy: v.agreePrivacy,
        agreeMarketing: v.agreeMarketing,
      },
      select: { id: true },
    })

    // 접수 확인 이메일 (SMTP 미설정 시 로그만 남음)
    emailService.sendEmail({
      to: v.contactEmail.toLowerCase(),
      subject: `[ChurchHub] '${v.churchName}' 교회 웹사이트 신청 접수`,
      html: `
        <p>안녕하세요, ${v.pastorName} 목사님.</p>
        <p><strong>${v.churchName}</strong> 교회 웹사이트 신청이 정상적으로 접수되었습니다.</p>
        <p>접수 내용은 3영업일 내 검토하여 결과를 안내드립니다.</p>
        <p>신청 상태 조회: https://churchhub.co.kr/apply/status</p>
      `,
    }).catch(() => {})

    return NextResponse.json(
      {
        message: '교회 신청이 정상적으로 접수되었습니다.',
        applicationId: application.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('교회 신청 처리 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
