'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'

export default function NewGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const churchRes = await fetch(`/api/churches/${slug}`)
    if (!churchRes.ok) {
      setError('교회를 찾을 수 없습니다.')
      setSaving(false)
      return
    }
    const church = await churchRes.json()

    const res = await fetch('/api/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        category: form.category || null,
        churchId: church.id,
      }),
    })

    if (res.ok) {
      router.push(`/admin/${slug}/galleries`)
    } else {
      const data = await res.json()
      setError(data.error || '추가에 실패했습니다.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/galleries`} className="text-gray-600 hover:text-gray-900">← 목록으로</Link>
            <h1 className="text-2xl font-bold text-gray-900">📷 이미지 추가</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            label="이미지 *"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택 안함</option>
              <option value="worship">예배</option>
              <option value="event">행사</option>
              <option value="community">공동체</option>
              <option value="mission">선교</option>
              <option value="youth">청년</option>
              <option value="children">어린이</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href={`/admin/${slug}/galleries`}
              className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving || !form.imageUrl}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '추가'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
