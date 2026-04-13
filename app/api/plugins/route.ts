import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-guard'

// GET /api/plugins — 전체 플러그인 목록 (관리자)
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const plugins = await prisma.plugin.findMany({
    orderBy: [{ type: 'asc' }, { label: 'asc' }],
    include: {
      churchPlugins: true,
    },
  })

  return NextResponse.json(plugins)
}

// POST /api/plugins — 플러그인 등록
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()

  const plugin = await prisma.plugin.upsert({
    where: { name: body.name },
    update: {
      type: body.type,
      label: body.label,
      description: body.description || '',
      version: body.version || '1.0.0',
      icon: body.icon || '📦',
      config: JSON.stringify(body.defaultConfig || {}),
      configSchema: JSON.stringify(body.configSchema || []),
    },
    create: {
      name: body.name,
      type: body.type,
      label: body.label,
      description: body.description || '',
      version: body.version || '1.0.0',
      icon: body.icon || '📦',
      config: JSON.stringify(body.defaultConfig || {}),
      configSchema: JSON.stringify(body.configSchema || []),
    },
  })

  return NextResponse.json(plugin)
}
