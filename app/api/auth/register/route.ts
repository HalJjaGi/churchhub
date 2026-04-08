import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'
import { authRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이하여야 합니다'),
  churchId: z.string().optional(),
})

// POST /api/auth/register - 회원가입
export async function POST(request: NextRequest) {
  // Rate Limiting 체크
  const rateLimitResponse = await authRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    
    // 입력 정제
    body.name = sanitizeText(body.name || '')
    body.email = sanitizeText(body.email || '')
    
    // Zod 검증
    let validated
    try {
      validated = registerSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: '입력값 검증 실패', details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }
    
    // 비밀번호 강도 검증
    const { valid, errors } = validatePasswordStrength(validated.password)
    if (!valid) {
      return NextResponse.json(
        { error: '비밀번호 요구사항 미충족', details: errors },
        { status: 400 }
      )
    }
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다' },
        { status: 409 }
      )
    }
    
    // 비밀번호 해싱
    const hashedPassword = await hashPassword(validated.password)
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        churchId: validated.churchId || null,
        role: 'member', // 기본 역할
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json(
      { message: '회원가입 완료', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
