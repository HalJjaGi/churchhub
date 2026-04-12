import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories?churchId=xxx&type=gallery
export async function GET(req: NextRequest) {
  const churchId = req.nextUrl.searchParams.get('churchId')
  const type = req.nextUrl.searchParams.get('type') || 'gallery'
  if (!churchId) return NextResponse.json({ error: 'churchId required' }, { status: 400 })

  const categories = await prisma.category.findMany({
    where: { churchId, type },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(categories)
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const { name, slug, icon, color, order, type, churchId } = await req.json()
    if (!name || !slug || !churchId) return NextResponse.json({ error: 'name, slug, churchId required' }, { status: 400 })

    const category = await prisma.category.create({
      data: { name, slug, icon, color, order: order || 0, type: type || 'gallery', churchId },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}
