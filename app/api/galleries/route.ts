import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/galleries?churchId=xxx
export async function GET(req: NextRequest) {
  const churchId = req.nextUrl.searchParams.get('churchId')
  if (!churchId) {
    return NextResponse.json({ error: 'churchId is required' }, { status: 400 })
  }

  const galleries = await prisma.gallery.findMany({
    where: { churchId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(galleries)
}

// POST /api/galleries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, imageUrl, category, churchId } = body

    if (!title || !imageUrl || !churchId) {
      return NextResponse.json({ error: 'title, imageUrl, churchId required' }, { status: 400 })
    }

    const gallery = await prisma.gallery.create({
      data: { title, description, imageUrl, category, churchId },
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 })
  }
}
