import { getTokenCompat } from './lib/auth-guard'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken as _getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 회원가입은 런치 정책상 차단 (교회 계정은 신청 승인 플로우로만 발급)
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname === '/api/auth/register') {
    return NextResponse.json({ error: '회원가입은 현재 제한되어 있습니다.' }, { status: 403 })
  }

  // 정적 파일 및 인증 관련 경로는 스킵
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth') ||
      pathname === '/favicon.ico' ||
      pathname === '/admin-login') {
    return NextResponse.next()
  }

  // 1. 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    const token = await getTokenCompat(request)
    
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string

    // Super Admin → 모든 교회 관리 가능
    if (role === 'super_admin') {
      return NextResponse.next()
    }

    // 목사/교회 대표(church_admin)와 하위 관리자(editor)
    if (role === 'church_admin' || role === 'editor') {
      const churchId = token.churchId as string | undefined

      if (!churchId) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // 역할별 접근 가능 경로
      const isMain = /^\/admin\/([^/]+)$/.test(pathname)
      const isContent = /^\/admin\/([^/]+)\/(sermons|notices|galleries|schedules|bulletin|prayer|community|boards)(\/|$)/.test(pathname)

      if (role === 'editor') {
        // 하위 관리자(editor): 콘텐츠 페이지만 (설정/테마/사용자관리 불가)
        if (!(isMain || isContent)) {
          const userChurch = await prisma.church.findUnique({
            where: { id: churchId },
            select: { slug: true },
          })
          if (userChurch) {
            return NextResponse.redirect(new URL(`/admin/${userChurch.slug}`, request.url))
          }
          return NextResponse.redirect(new URL('/login', request.url))
        }
      }
      // 목사(church_admin): 자기 교회의 모든 관리 페이지 허용
      // (타 교회/플랫폼 페이지는 아래 slug 소유 검증이 차단함)

      // 교회 slug가 아닌 특수 페이지는 slug 소유 검증 제외
      const nonChurchPaths = ['/admin/change-password']
      if (!nonChurchPaths.includes(pathname)) {
        // URL에서 slug 추출 + 자기 교회인지 검증
        const slugMatch = pathname.match(/^\/admin\/([^/]+)/)
        if (slugMatch) {
          const slug = slugMatch[1]

          const church = await prisma.church.findUnique({
            where: { slug },
            select: { id: true }
          })

          if (!church || church.id !== churchId) {
            const userChurch = await prisma.church.findUnique({
              where: { id: churchId },
              select: { slug: true },
            })

            if (userChurch) {
              return NextResponse.redirect(new URL(`/admin/${userChurch.slug}`, request.url))
            }

            return NextResponse.redirect(new URL('/login', request.url))
          }
        }
      }

      return NextResponse.next()
    }

    // admin 이하 권한은 접근 불가
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 2. API 라우트 접근 제어 (GET 제외)
  if (pathname.startsWith('/api') && 
      request.method !== 'GET' &&
      !pathname.startsWith('/api/auth') &&
      !pathname.startsWith('/api/subscribe') &&
      !pathname.startsWith('/api/prayer') &&
      !pathname.startsWith('/api/churches/application') &&
      !pathname.startsWith('/api/applications/search')) {
    const token = await getTokenCompat(request)
    
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
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('trycloudflare.com')
  
  if (!isLocalhost) {
    const subdomain = hostname.split('.')[0]
    
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
  // Prisma 사용을 위해 Node.js 런타임에서 실행 (엣지에선 PrismaClient 불가)
  runtime: 'nodejs',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
