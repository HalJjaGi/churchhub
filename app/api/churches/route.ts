import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '../auth/[...nextauth]/route'

const churchSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be 50 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  plan: z.enum(['starter', 'basic', 'pro', 'enterprise']).optional(),
})

// GET /api/churches - 교회 목록 조회
export async function GET() {
  try {
    const churches = await prisma.church.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        plan: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(churches)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/churches - 새 교회 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Zod 검증
    let validated
    try {
      validated = churchSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.issues },
          { status: 400 }
        )
      }
      throw error
    }
    
    const { slug, name, description, theme, modules, plan } = {
      ...validated,
      theme: body.theme,
      modules: body.modules,
    }
    
    // 슬러그 중복 확인
    const existing = await prisma.church.findUnique({
      where: { slug },
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Church with this slug already exists' },
        { status: 409 }
      )
    }
    
    const church = await prisma.church.create({
      data: {
        slug,
        name,
        description: description || null,
        theme: theme || {
          colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            accent: '#f59e0b',
            background: '#ffffff',
          },
          font: 'sans-serif',
          layout: 'modern',
        },
        modules: modules || {
          sermon: true,
          notice: true,
          community: false,
          gallery: false,
          donation: false,
        },
        plan: plan || 'starter',
      },
    })
    
    return NextResponse.json(church, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
