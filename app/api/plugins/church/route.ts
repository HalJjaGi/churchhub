import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/plugins/church?churchId=xxx — 교회별 활성 플러그인
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const churchId = searchParams.get('churchId')

  if (!churchId) {
    return NextResponse.json({ error: 'churchId is required' }, { status: 400 })
  }

  const churchPlugins = await prisma.churchPlugin.findMany({
    where: { churchId, enabled: true },
    include: { plugin: true },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(churchPlugins)
}

// POST /api/plugins/church — 교회에 플러그인 활성화
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const { churchId, pluginId, config, order, enabled } = body

  const churchPlugin = await prisma.churchPlugin.upsert({
    where: {
      churchId_pluginId: { churchId, pluginId },
    },
    update: {
      enabled: enabled !== undefined ? enabled : true,
      config: config ? JSON.stringify(config) : '{}',
      order: order !== undefined ? order : 0,
    },
    create: {
      churchId,
      pluginId,
      enabled: enabled !== undefined ? enabled : true,
      config: config ? JSON.stringify(config) : '{}',
      order: order !== undefined ? order : 0,
    },
  })

  return NextResponse.json(churchPlugin)
}

// PUT /api/plugins/church — 교회 플러그인 설정 업데이트
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const { id, config, order, enabled } = body

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const updateData: Record<string, any> = {}
  if (config !== undefined) updateData.config = JSON.stringify(config)
  if (order !== undefined) updateData.order = order
  if (enabled !== undefined) updateData.enabled = enabled

  const churchPlugin = await prisma.churchPlugin.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(churchPlugin)
}

// DELETE /api/plugins/church — 교회 플러그인 비활성화
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  await prisma.churchPlugin.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
