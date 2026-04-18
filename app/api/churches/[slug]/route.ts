import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

// Super Admin 전용 체크
async function requireSuperAdmin(request: NextRequest) {
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super Admin 권한이 필요합니다.' }, { status: 403 })
  }
  return null
}

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Invalid color format')

const sectionsSchema = z.object({
  hero: z.enum(['image', 'gradient', 'text']),
  sermon: z.enum(['list', 'cards', 'featured']),
  notice: z.enum(['table', 'cards', 'timeline']),
  footer: z.enum(['full', 'minimal']),
})

const themeSchema = z.object({
  colors: z.object({
    primary: colorSchema,
    secondary: colorSchema,
    accent: colorSchema,
    background: colorSchema,
  }),
  font: z.enum(['serif', 'sans-serif']),
  layout: z.enum(['traditional', 'modern', 'minimal']),
  sections: sectionsSchema.optional(),
})

const modulesSchema = z.object({
  sermon: z.boolean(),
  notice: z.boolean(),
  community: z.boolean(),
  gallery: z.boolean(),
  donation: z.boolean(),
})

const churchUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .optional(),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  plan: z.enum(['starter', 'basic', 'pro', 'enterprise']).optional(),
  theme: themeSchema.optional(),
  modules: modulesSchema.optional(),
  // 교회 기본 정보
  intro: z.string().max(2000).optional(),
  vision: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().max(100).optional(),
  parking: z.string().max(500).optional(),
  // 담임목사
  pastorName: z.string().max(50).optional(),
  pastorMessage: z.string().max(2000).optional(),
  pastorImage: z.string().max(500).optional(),
  // 히어로 배너
  heroTitle: z.string().max(200).optional(),
  heroSubtitle: z.string().max(300).optional(),
})

// GET /api/churches/[slug] - 특정 교회 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        sermons: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        notices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    
    if (!church) {
      return NextResponse.json(
        { error: 'Church not found' },
        { status: 404 }
      )
    }
    
    // JSON 문자열 파싱 (에러 처리)
    let theme, modules
    try {
      theme = JSON.parse(church.theme)
    } catch (e) {
      console.error('Failed to parse theme:', e)
      theme = null
    }
    
    try {
      modules = JSON.parse(church.modules)
    } catch (e) {
      console.error('Failed to parse modules:', e)
      modules = null
    }
    
    const parsedChurch = {
      ...church,
      theme,
      modules,
    }
    
    return NextResponse.json(parsedChurch)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/churches/[slug] - 교회 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const authError = await requireSuperAdmin(request)
  if (authError) return authError
  try {
    const body = await request.json()
    
    // Zod 검증
    let validated
    try {
      validated = churchUpdateSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }
    
    const { name, description, theme, modules, plan, intro, vision, address, phone, email, parking, pastorName, pastorMessage, pastorImage, heroTitle, heroSubtitle } = validated
    
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (theme) updateData.theme = JSON.stringify(theme)
    if (modules) updateData.modules = JSON.stringify(modules)
    if (plan) updateData.plan = plan
    if (intro !== undefined) updateData.intro = intro
    if (vision !== undefined) updateData.vision = vision
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (parking !== undefined) updateData.parking = parking
    if (pastorName !== undefined) updateData.pastorName = pastorName
    if (pastorMessage !== undefined) updateData.pastorMessage = pastorMessage
    if (pastorImage !== undefined) updateData.pastorImage = pastorImage
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle
    
    const church = await prisma.church.update({
      where: { slug },
      data: updateData,
    })
    
    // JSON 파싱 (에러 처리)
    let parsedTheme, parsedModules
    try {
      parsedTheme = JSON.parse(church.theme)
    } catch (e) {
      console.error('Failed to parse theme:', e)
      parsedTheme = null
    }
    
    try {
      parsedModules = JSON.parse(church.modules)
    } catch (e) {
      console.error('Failed to parse modules:', e)
      parsedModules = null
    }
    
    return NextResponse.json({
      ...church,
      theme: parsedTheme,
      modules: parsedModules,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/churches/[slug] - 교회 삭제 (Super Admin만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 삭제는 Super Admin만
  const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  const { getToken } = await import('next-auth/jwt')
  const token = await getToken({ req: request, secret: SECRET })
  
  if (!token || token.role !== 'super_admin') {
    return NextResponse.json({ error: 'Super Admin 권한이 필요합니다.' }, { status: 403 })
  }

  try {
    await prisma.church.delete({ where: { slug } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
