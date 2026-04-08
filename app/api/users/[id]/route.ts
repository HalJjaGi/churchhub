import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiRateLimit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// 사용자 수정 (Super Admin만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const rateLimitResponse = await apiRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params

  try {
    const body = await request.json()
    const { name, role, password, churchId } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = sanitizeText(name)
    if (role !== undefined) {
      const validRoles = ['church_admin', 'editor', 'member']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: '유효하지 않은 역할입니다.' }, { status: 400 })
      }
      data.role = role
    }
    if (churchId !== undefined) data.churchId = churchId
    if (password) {
      const strengthError = validatePasswordStrength(password)
      if (strengthError) {
        return NextResponse.json({ error: strengthError }, { status: 400 })
      }
      data.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id },
      data,
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

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: '사용자 수정에 실패했습니다.' }, { status: 500 })
  }
}

// 사용자 삭제 (Super Admin만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { id } = await params

  // 자기 자신은 삭제 불가
  if (token.sub === id) {
    return NextResponse.json({ error: '자신의 계정은 삭제할 수 없습니다.' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: '사용자가 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: '사용자 삭제에 실패했습니다.' }, { status: 500 })
  }
}
