import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/galleries/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gallery = await prisma.gallery.findUnique({ where: { id } })
  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(gallery)
}

// PUT /api/galleries/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.gallery.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(req, existing.churchId)
  if (authError) return authError

  try {
    const body = await req.json()
    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        category: body.category,
      },
    })
    return NextResponse.json(gallery)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/galleries/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.gallery.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.gallery.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
