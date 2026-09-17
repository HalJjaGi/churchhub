import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getTokenCompat } from '@/lib/auth-guard'
import { emailService } from '@/lib/email'

// /api/church-users — 하위 관리자(editor) 관리 (목사 church_admin 전용)

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%^&*'
  const all = upper + lower + digits + special
  const pick = (chars: string) => chars[crypto.randomInt(chars.length)]
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)]
  for (let i = 0; i < 8; i++) chars.push(pick(all))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

async function requireChurchAdmin(request: NextRequest) {
  const token = await getTokenCompat(request)
  if (!token) return { error: NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }), churchId: null }
  const role = token.role as string
  const churchId = token.churchId as string | undefined
  if (role !== 'church_admin' || !churchId) {
    return { error: NextResponse.json({ message: '목사(교회 대표)만 하위 관리자를 관리할 수 있습니다.' }, { status: 403 }), churchId: null }
  }
  return { error: null, churchId }
}

// GET — 자기 교회의 하위 관리자 목록
export async function GET(request: NextRequest) {
  const { error, churchId } = await requireChurchAdmin(request)
  if (!churchId) {
    return error ?? NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { churchId, role: 'editor' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

const createSchema = z.object({
  email: z.string().trim().email('유효한 이메일을 입력해주세요').max(100),
  name: z.string().trim().min(1, '이름을 입력해주세요').max(50),
})

// POST — 하위 관리자 추가 (임시 비밀번호 발급)
export async function POST(request: NextRequest) {
  const { error, churchId } = await requireChurchAdmin(request)
  if (!churchId) {
    return error ?? NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 })
  }

  try {
    const parsed = createSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || '입력값을 확인해주세요' },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: '이미 등록된 이메일입니다. 다른 이메일을 사용해주세요.' },
        { status: 409 }
      )
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { name: true, slug: true },
    })

    const tempPassword = generateTempPassword()
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        password: await bcrypt.hash(tempPassword, 10),
        role: 'editor',
        churchId,
      },
      select: { id: true, email: true, name: true },
    })

    // 초대 이메일
    emailService.sendEmail({
      to: email,
      subject: `[ChurchHub] '${church?.name}' 교회 하위 관리자로 초대되었습니다`,
      html: `
        <p>안녕하세요, ${parsed.data.name}님.</p>
        <p><strong>${church?.name}</strong> 교회 웹사이트의 하위 관리자로 초대되었습니다.</p>
        <ul>
          <li>로그인: https://churchhub.co.kr/login</li>
          <li>관리 페이지: https://churchhub.co.kr/admin/${church?.slug}</li>
          <li>이메일: ${email}</li>
          <li>임시 비밀번호: <strong>${tempPassword}</strong></li>
        </ul>
        <p>로그인 후 반드시 비밀번호를 변경해 주세요. 하위 관리자는 설교·공지·갤러리 등 콘텐츠를 관리할 수 있습니다.</p>
      `,
    }).catch(() => {})

    return NextResponse.json(
      { message: '하위 관리자를 추가했습니다.', user, tempPassword },
      { status: 201 }
    )
  } catch (err) {
    console.error('하위 관리자 추가 오류:', err)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// DELETE — 하위 관리자 제거 (?id=)
export async function DELETE(request: NextRequest) {
  const { error, churchId } = await requireChurchAdmin(request)
  if (!churchId) {
    return error ?? NextResponse.json({ message: '권한이 없습니다.' }, { status: 403 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ message: 'id가 필요합니다.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || user.churchId !== churchId || user.role !== 'editor') {
    return NextResponse.json(
      { message: '자기 교회의 하위 관리자만 제거할 수 있습니다.' },
      { status: 404 }
    )
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: '하위 관리자를 제거했습니다.' })
}
