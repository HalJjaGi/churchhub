import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/posts?churchId=xxx
export async function GET(req: NextRequest) {
  const churchId = req.nextUrl.searchParams.get('churchId')
  if (!churchId) {
    return NextResponse.json({ error: 'churchId is required' }, { status: 400 })
  }

  const posts = await prisma.post.findMany({
    where: { churchId },
    include: { comments: { orderBy: { createdAt: 'asc' } } },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(posts)
}

// POST /api/posts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, category, authorName, churchId } = body

    if (!title || !content || !churchId) {
      return NextResponse.json({ error: 'title, content, churchId required' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: { title, content, category: category || 'general', authorName, churchId },
    })

    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
