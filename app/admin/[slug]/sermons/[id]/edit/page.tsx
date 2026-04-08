'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditSermonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const sermonId = params.id as string

  const [form, setForm] = useState({
    title: '',
    content: '',
    speaker: '',
    date: '',
    youtubeUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSermon()
  }, [sermonId])

  const fetchSermon = async () => {
    try {
      const res = await fetch(`/api/sermons/${sermonId}`)
      if (res.ok) {
        const data = await res.json()
        setForm({
          title: data.title,
          content: data.content,
          speaker: data.speaker,
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          youtubeUrl: data.youtubeUrl || '',
        })
      } else {
        setError('설교를 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('Error fetching sermon:', err)
      setError('설교를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/sermons/${sermonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: form.date || undefined,
          youtubeUrl: form.youtubeUrl || null,
        }),
      })

      if (res.ok) {
        router.push(`/admin/${slug}/sermons`)
      } else {
        const data = await res.json()
        setError(data.error || '설교 수정에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error updating sermon:', err)
      setError('설교 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/sermons`} className="text-gray-600 hover:text-gray-900">
              ← 목록으로
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">설교 수정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교자 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.speaker}
              onChange={(e) => setForm({ ...form, speaker: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설교 날짜
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL
            </label>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href={`/admin/${slug}/sermons`}
              className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
