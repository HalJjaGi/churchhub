import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 관리자 권한 확인 (API 라우트용)
export async function requireAdmin(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }
  
  if (token.role !== 'admin') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }
  
  return null // null이면 권한 있음
}

// 사용자가 해당 교회에 속해있는지 확인
export async function getAuthorizedChurchId(
  request: NextRequest,
  requestedChurchId?: string
): Promise<{ churchId: string; error?: NextResponse } | { churchId: null; error: NextResponse }> {
  const token = await getToken({ req: request })
  
  if (!token) {
    return { churchId: null, error: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }) }
  }
  
  // Super admin은 모든 교회 접근 가능
  if (token.role === 'admin') {
    if (requestedChurchId) {
      return { churchId: requestedChurchId }
    }
    return { churchId: null, error: NextResponse.json({ error: 'churchId가 필요합니다.' }, { status: 400 }) }
  }
  
  // 일반 사용자는 자신의 교회만 접근 가능
  const userChurchId = token.churchId as string | undefined
  
  if (!userChurchId) {
    return { churchId: null, error: NextResponse.json({ error: '교회가 등록되지 않았습니다.' }, { status: 403 }) }
  }
  
  if (requestedChurchId && requestedChurchId !== userChurchId) {
    return { churchId: null, error: NextResponse.json({ error: '해당 교회에 대한 권한이 없습니다.' }, { status: 403 }) }
  }
  
  return { churchId: userChurchId }
}
