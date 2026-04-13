import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/notices/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notice = await prisma.notice.findUnique({ where: { id } })
  if (!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(notice)
}

// PUT /api/notices/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.notice.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(req, existing.churchId)
  if (authError) return authError

  try {
    const body = await req.json()
    const notice = await prisma.notice.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl,
        pinned: body.pinned,
      },
    })
    return NextResponse.json(notice)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/notices/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.notice.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.notice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
