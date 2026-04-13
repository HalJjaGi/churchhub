import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { initPlugins } from '@/core/init-plugins'

// POST /api/plugins/init — 플러그인 DB 초기화 (super_admin)
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    await initPlugins()
    return NextResponse.json({ success: true, message: '플러그인이 초기화되었습니다.' })
  } catch (error) {
    console.error('Plugin init error:', error)
    return NextResponse.json({ error: '플러그인 초기화 실패' }, { status: 500 })
  }
}
