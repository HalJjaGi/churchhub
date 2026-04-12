import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 정적 파일 및 인증 관련 경로는 스킵
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/auth') ||
      pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // 1. 관리자 페이지 접근 제어
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: SECRET })
    
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

    // Church Admin → 자기 교회만 관리 가능 (제한된 경로만)
    if (role === 'church_admin') {
      const churchId = token.churchId as string | undefined
      
      if (!churchId) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // church_admin 접근 가능 경로
      const allowedPaths = [
        /^\/admin\/([^/]+)$/,           // /admin/[slug] (메인)
        /^\/admin\/([^/]+)\/sermons/,   // /admin/[slug]/sermons/*
        /^\/admin\/([^/]+)\/notices/,   // /admin/[slug]/notices/*
      ]
      
      const isAllowed = allowedPaths.some(pattern => pattern.test(pathname))
      
      if (!isAllowed) {
        // 허용되지 않은 경로 → 자기 교회 메인으로 리다이렉트
        const userChurch = await prisma.church.findUnique({
          where: { id: churchId },
          select: { slug: true },
        })
        if (userChurch) {
          return NextResponse.redirect(new URL(`/admin/${userChurch.slug}`, request.url))
        }
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // URL에서 slug 추출
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
      
      return NextResponse.next()
    }

    // admin 이하 권한은 접근 불가
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 2. API 라우트 접근 제어 (GET 제외)
  if (pathname.startsWith('/api') && 
      request.method !== 'GET' &&
      !pathname.startsWith('/api/auth')) {
    const token = await getToken({ req: request, secret: SECRET })
    
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
