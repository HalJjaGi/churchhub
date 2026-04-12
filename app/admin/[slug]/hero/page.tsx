'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'

export default function HeroSettingsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [form, setForm] = useState({ heroTitle: '', heroSubtitle: '', heroImage: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setForm({
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        heroImage: data.heroImage || '',
      })
      setLoading(false)
    })
  }, [slug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const churchRes = await fetch(`/api/churches/${slug}`)
    const church = await churchRes.json()

    const res = await fetch(`/api/churches/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        id: church.id,
        name: church.name,
        slug: church.slug,
        theme: church.theme,
        modules: church.modules,
      }),
    })

    if (res.ok) {
      setSuccess('저장되었습니다.')
    } else {
      setError('저장에 실패했습니다.')
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
            <h1 className="text-2xl font-bold text-gray-900">🖼 히어로 배너 설정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">히어로 제목</label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 환영합니다"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">히어로 부제목</label>
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 하나님의 사랑을 나누는 공동체"
            />
          </div>

          <ImageUpload
            value={form.heroImage}
            onChange={(url) => setForm({ ...form, heroImage: url })}
            label="히어로 배경 이미지"
            category="hero"
          />

          {/* 미리보기 */}
          {form.heroImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
              <div className="relative h-48 rounded-xl overflow-hidden bg-gray-900">
                <img src={form.heroImage} alt="preview" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                  {form.heroTitle && <h2 className="text-2xl font-bold">{form.heroTitle}</h2>}
                  {form.heroSubtitle && <p className="text-sm mt-2 text-white/80">{form.heroSubtitle}</p>}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </form>
      </main>
    </div>
  )
}
