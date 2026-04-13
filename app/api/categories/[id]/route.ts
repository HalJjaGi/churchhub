import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/categories/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(category)
}

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.category.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(req, existing.churchId)
  if (authError) return authError

  try {
    const body = await req.json()
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        icon: body.icon,
        color: body.color,
        order: body.order,
      },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.category.findUnique({ where: { id }, select: { churchId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  const authError = await requireAdmin(request, existing.churchId)
  if (authError) return authError

  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
