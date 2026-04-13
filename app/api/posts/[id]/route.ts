import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/posts/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await prisma.post.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: 'asc' } } },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

// PUT /api/posts/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.post.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(req, existing.churchId)
  if (authError) return authError

  try {
    const body = await req.json()
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl,
        category: body.category,
        pinned: body.pinned,
      },
    })
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/posts/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.post.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
