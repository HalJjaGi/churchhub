import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// 신청 테마 → 교회 사이트 테마 JSON 프리셋
const THEME_PRESETS: Record<string, object> = {
  modern: {
    colors: { primary: '#3b82f6', secondary: '#6b7280', accent: '#f59e0b', background: '#ffffff' },
    font: 'sans-serif',
    layout: 'modern',
  },
  classic: {
    colors: { primary: '#4b5563', secondary: '#9ca3af', accent: '#b45309', background: '#ffffff' },
    font: 'serif',
    layout: 'traditional',
  },
  warm: {
    colors: { primary: '#ea580c', secondary: '#78716c', accent: '#f59e0b', background: '#fff7ed' },
    font: 'sans-serif',
    layout: 'modern',
  },
}

const DEFAULT_MODULES = {
  sermon: true,
  notice: true,
  community: false,
  gallery: false,
  donation: false,
}

async function requireSuperAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: SECRET })
  if (!token || token.role !== 'super_admin') {
    return null
  }
  return token
}

// GET /api/admin/applications — 신청 목록 (super_admin 전용)
export async function GET(request: NextRequest) {
  const token = await requireSuperAdmin(request)
  if (!token) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')

    const where = status && status !== 'all' ? { status } : {}

    const [applications, counts] = await Promise.all([
      prisma.churchApplication.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.churchApplication.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ])

    const countMap: Record<string, number> = { all: 0 }
    counts.forEach((c) => {
      countMap[c.status] = c._count._all
      countMap.all += c._count._all
    })

    return NextResponse.json({ applications, counts: countMap })
  } catch (error) {
    console.error('신청 목록 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  notes: z.string().trim().max(500, '처리 메모는 500자 이하로 입력해주세요').optional().or(z.literal('')),
})

// PATCH /api/admin/applications — 신청 승인/반려 처리
export async function PATCH(request: NextRequest) {
  const token = await requireSuperAdmin(request)
  if (!token) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { message: firstIssue?.message || '요청값을 확인해주세요' },
        { status: 400 }
      )
    }
    const { id, action, notes } = parsed.data
    const reviewer = (token.email as string) || (token.sub as string) || 'super_admin'

    if (action === 'reject') {
      const updated = await prisma.churchApplication.update({
        where: { id },
        data: {
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: reviewer,
          notes: notes || null,
        },
      })
      return NextResponse.json({ message: '신청을 반려했습니다.', application: updated })
    }

    // ── 승인: 교회 사이트 자동 생성 ──
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.churchApplication.findUnique({ where: { id } })
      if (!application) {
        throw new Error('NOT_FOUND')
      }
      if (!['pending', 'under_review'].includes(application.status)) {
        throw new Error('ALREADY_PROCESSED')
      }
      const slug = application.slug
      if (!slug) {
        throw new Error('NO_SLUG')
      }

      const existing = await tx.church.findUnique({ where: { slug } })
      if (existing) {
        throw new Error('SLUG_TAKEN')
      }

      const church = await tx.church.create({
        data: {
          slug,
          name: application.churchName,
          description: application.description || null,
          theme: JSON.stringify(
            THEME_PRESETS[application.theme] || THEME_PRESETS.modern
          ),
          modules: JSON.stringify(DEFAULT_MODULES),
          plan: 'starter',
          address: application.address,
          phone: application.phone,
          email: application.email,
          pastorName: application.pastorName,
        },
        select: { id: true, slug: true, name: true },
      })

      const updatedApplication = await tx.churchApplication.update({
        where: { id },
        data: {
          status: 'approved',
          churchId: church.id,
          reviewedAt: new Date(),
          reviewedBy: reviewer,
        },
      })

      return { church, application: updatedApplication }
    })

    return NextResponse.json({
      message: `승인 완료! ${result.church.name} 사이트가 생성되었습니다.`,
      church: result.church,
      application: result.application,
    })
  } catch (error) {
    if (error instanceof Error) {
      const errorMessages: Record<string, { message: string; status: number }> = {
        NOT_FOUND: { message: '신청을 찾을 수 없습니다.', status: 404 },
        ALREADY_PROCESSED: { message: '이미 처리된 신청입니다.', status: 409 },
        NO_SLUG: { message: '신청에 영문명(slug) 정보가 없습니다.', status: 400 },
        SLUG_TAKEN: { message: '이미 사용 중인 영문명입니다. 신청자에게 다른 영문명 안내가 필요합니다.', status: 409 },
      }
      const known = errorMessages[error.message]
      if (known) {
        return NextResponse.json({ message: known.message }, { status: known.status })
      }
    }
    console.error('신청 처리 오류:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
