import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/comments?postId=xxx
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('postId')
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}

// POST /api/comments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, authorName, postId } = body

    if (!content || !postId) {
      return NextResponse.json({ error: 'content, postId required' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: { content, authorName, postId },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
