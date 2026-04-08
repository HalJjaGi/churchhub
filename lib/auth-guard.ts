import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// 관리자 권한 확인 (API 라우트용)
// super_admin: 모든 교회 OK
// church_admin: 자기 교회만 OK (churchId 검증)
export async function requireAdmin(request: NextRequest, targetChurchId?: string) {
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  
  const role = token.role as string

  if (role === 'super_admin') {
    return null // 모든 권한
  }

  if (role === 'church_admin') {
    const userChurchId = token.churchId as string | undefined
    
    if (!userChurchId) {
      return NextResponse.json({ error: '교회가 등록되지 않았습니다.' }, { status: 403 })
    }

    // 특정 교회에 대한 작업인 경우, 자기 교회인지 확인
    if (targetChurchId && targetChurchId !== userChurchId) {
      return NextResponse.json({ error: '해당 교회에 대한 권한이 없습니다.' }, { status: 403 })
    }

    return null // 자기 교회 권한 OK
  }

  return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
}

// slug로 churchId 조회 후 권한 확인
export async function requireAdminForSlug(request: NextRequest, slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!church) {
    return { error: NextResponse.json({ error: '교회를 찾을 수 없습니다.' }, { status: 404 }), churchId: null }
  }

  const authError = await requireAdmin(request, church.id)
  
  return { error: authError, churchId: church.id }
}

// 사용자가 해당 교회에 속해있는지 확인
export async function getAuthorizedChurchId(
  request: NextRequest,
  requestedChurchId?: string
): Promise<{ churchId: string; error?: NextResponse } | { churchId: null; error: NextResponse }> {
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token) {
    return { churchId: null, error: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }) }
  }
  
  const role = token.role as string

  // Super admin은 모든 교회 접근 가능
  if (role === 'super_admin') {
    if (requestedChurchId) {
      return { churchId: requestedChurchId }
    }
    return { churchId: null, error: NextResponse.json({ error: 'churchId가 필요합니다.' }, { status: 400 }) }
  }
  
  // Church admin은 자기 교회만
  const userChurchId = token.churchId as string | undefined
  
  if (!userChurchId) {
    return { churchId: null, error: NextResponse.json({ error: '교회가 등록되지 않았습니다.' }, { status: 403 }) }
  }
  
  if (requestedChurchId && requestedChurchId !== userChurchId) {
    return { churchId: null, error: NextResponse.json({ error: '해당 교회에 대한 권한이 없습니다.' }, { status: 403 }) }
  }
  
  return { churchId: userChurchId }
}
