import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request })
    
    if (!token || token.role !== 'admin') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return NextResponse.next()
  }
  
  // 2. API 라우트 접근 제어 (GET 제외)
  if (pathname.startsWith('/api') && 
      request.method !== 'GET' &&
      !pathname.startsWith('/api/auth')) {
    const token = await getToken({ req: request })
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.next()
  }
  
  // 3. 서브도메인 처리 (프로덕션만)
  const hostname = request.headers.get('host') || ''
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  
  if (!isLocalhost) {
    const subdomain = hostname.split('.')[0]
    
    // 유효한 서브도메인이면 교회 페이지로 라우팅
    if (subdomain && 
        subdomain !== 'www' && 
        subdomain !== 'churchhub' &&
        /^[a-z0-9-]+$/.test(subdomain)) {
      const url = request.nextUrl.clone()
      url.pathname = `/church/${subdomain}${pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
