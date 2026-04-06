import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  // 관리자 페이지 접근 제어
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // API 라우트 접근 제어 (GET 제외)
  if (request.nextUrl.pathname.startsWith('/api') && 
      request.method !== 'GET' &&
      !request.nextUrl.pathname.startsWith('/api/auth')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  // 서브도메인 처리 (기존 로직 유지)
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  // 서브도메인 검증 (소문자, 숫자, 하이픈만 허용)
  if (subdomain && !/^[a-z0-9-]+$/.test(subdomain) && subdomain !== 'www' && subdomain !== 'churchhub') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // 개발 환경에서는 localhost 체크
  const isLocalhost = hostname.includes('localhost')
  
  if (!isLocalhost && subdomain && subdomain !== 'www' && subdomain !== 'churchhub') {
    // 교회 사이트로 라우팅
    const url = request.nextUrl.clone()
    url.pathname = `/church/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
