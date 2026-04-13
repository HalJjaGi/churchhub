'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Plugin = {
  id: string
  name: string
  type: string
  label: string
  description: string
  icon: string
  version: string
  enabled: boolean
  churchPlugins: ChurchPlugin[]
}

type ChurchPlugin = {
  id: string
  enabled: boolean
  config: string
  order: number
}

const typeLabels: Record<string, string> = {
  section: '섹션',
  feature: '기능',
  theme: '테마',
  widget: '위젯',
}

const typeOrder = ['theme', 'section', 'feature', 'widget']

export default function PluginsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      const res = await fetch('/api/plugins')
      if (res.ok) {
        const data = await res.json()
        setPlugins(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const togglePlugin = async (plugin: Plugin) => {
    const existing = plugin.churchPlugins[0]
    setSaving(plugin.name)

    try {
      if (existing) {
        // 토글
        await fetch('/api/plugins/church', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existing.id,
            enabled: !existing.enabled,
          }),
        })
      } else {
        // 새로 활성화
        // churchId 필요 — slug로 조회
        const churchRes = await fetch(`/api/churches/${slug}`)
        if (!churchRes.ok) return
        const church = await churchRes.json()

        await fetch('/api/plugins/church', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            churchId: church.id,
            pluginId: plugin.id,
            enabled: true,
          }),
        })
      }
      await loadPlugins()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  const updateOrder = async (churchPluginId: string, newOrder: number) => {
    setSaving('order')
    try {
      await fetch('/api/plugins/church', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: churchPluginId, order: newOrder }),
      })
      await loadPlugins()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    )
  }

  const grouped = typeOrder.reduce((acc, type) => {
    const items = plugins.filter(p => p.type === type)
    if (items.length > 0) acc.push({ type, items })
    return acc
  }, [] as { type: string; items: Plugin[] }[])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 관리자</Link>
            <h1 className="text-2xl font-bold text-gray-900">🔌 플러그인 관리</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">교회에 활성화할 플러그인을 선택하세요</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {grouped.map(({ type, items }) => (
          <div key={type} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {typeLabels[type] || type}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(plugin => {
                const churchPlugin = plugin.churchPlugins[0]
                const isActive = churchPlugin?.enabled ?? false

                return (
                  <div
                    key={plugin.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{plugin.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{plugin.label}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{plugin.description}</p>
                          <span className="text-xs text-gray-400 mt-1 inline-block">v{plugin.version}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePlugin(plugin)}
                        disabled={saving === plugin.name}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                          isActive ? 'bg-blue-600' : 'bg-gray-300'
                        } ${saving === plugin.name ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {isActive && churchPlugin && type === 'section' && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">순서:</span>
                        <input
                          type="number"
                          value={churchPlugin.order}
                          onChange={(e) => updateOrder(churchPlugin.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          min={0}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 text-sm text-gray-500">
          총 {plugins.length}개 플러그인 · {plugins.filter(p => p.churchPlugins[0]?.enabled).length}개 활성
        </div>
      </main>
    </div>
  )
}
