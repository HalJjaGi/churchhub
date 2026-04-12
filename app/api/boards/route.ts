import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/boards?churchId=xxx
export async function GET(req: NextRequest) {
  const churchId = req.nextUrl.searchParams.get('churchId')
  if (!churchId) return NextResponse.json({ error: 'churchId required' }, { status: 400 })

  const boards = await prisma.board.findMany({
    where: { churchId },
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  })
  return NextResponse.json(boards)
}

// POST /api/boards
export async function POST(req: NextRequest) {
  try {
    const { name, slug, description, icon, order, allowWrite, churchId } = await req.json()
    if (!name || !slug || !churchId) return NextResponse.json({ error: 'name, slug, churchId required' }, { status: 400 })

    const board = await prisma.board.create({
      data: { name, slug, description, icon, order: order || 0, allowWrite: allowWrite || 'all', churchId },
    })
    return NextResponse.json(board, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: '이미 존재하는 슬러그입니다.' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 })
  }
}
