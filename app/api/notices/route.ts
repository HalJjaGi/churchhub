import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notices?churchId=xxx
export async function GET(req: NextRequest) {
  const churchId = req.nextUrl.searchParams.get('churchId')
  if (!churchId) return NextResponse.json({ error: 'churchId required' }, { status: 400 })

  const notices = await prisma.notice.findMany({
    where: { churchId },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(notices)
}

// POST /api/notices
export async function POST(req: NextRequest) {
  try {
    const { title, content, imageUrl, pinned, churchId } = await req.json()
    if (!title || !content || !churchId) return NextResponse.json({ error: 'title, content, churchId required' }, { status: 400 })

    const notice = await prisma.notice.create({
      data: { title, content, imageUrl, pinned: pinned || false, churchId },
    })
    return NextResponse.json(notice, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
