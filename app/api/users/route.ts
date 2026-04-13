import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/auth-guard'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// 사용자 목록 조회 (Super Admin만)
export async function GET(request: NextRequest) {
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const churchId = searchParams.get('churchId')

  try {
    const where = churchId ? { churchId } : {}
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        churchId: true,
        createdAt: true,
        church: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: '사용자 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// 사용자 추가 (Super Admin만)
export async function POST(request: NextRequest) {
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email, password, name, role, churchId } = body

    if (!email || !password || !role || !churchId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
    }

    // 비밀번호 강도 검증
    const validation = validatePasswordStrength(password)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    // 중복 이메일 체크
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 })
    }

    // 유효한 역할인지 확인
    const validRoles = ['church_admin', 'editor', 'member']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 })
    }

    // 교회 존재 확인
    const church = await prisma.church.findUnique({ where: { id: churchId } })
    if (!church) {
      return NextResponse.json({ error: '교회를 찾을 수 없습니다.' }, { status: 404 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: sanitizeText(email),
        password: hashedPassword,
        name: name ? sanitizeText(name) : null,
        role,
        churchId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        churchId: true,
        createdAt: true,
        church: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: '사용자 추가에 실패했습니다.' }, { status: 500 })
  }
}
