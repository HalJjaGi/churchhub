'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSermonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [form, setForm] = useState({
    title: '',
    content: '',
    speaker: '',
    date: '',
    youtubeUrl: '',
  })
  const [churchId, setChurchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 교회 정보 가져오기 (churchId 획득용)
  useState(() => {
    fetch(`/api/churches/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setChurchId(data.id)
      })
      .catch(console.error)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!churchId) {
      setError('교회 정보를 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          churchId,
          date: form.date || undefined,
          youtubeUrl: form.youtubeUrl || undefined,
        }),
      })

      if (res.ok) {
        router.push(`/admin/${slug}/sermons`)
      } else {
        const data = await res.json()
        setError(data.error || '설교 추가에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error creating sermon:', err)
      setError('설교 추가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}/sermons`} className="text-gray-600 hover:text-gray-900">
              ← 목록으로
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">설교 추가</h1>
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
              placeholder="설교 제목"
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
              placeholder="설교자 이름"
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
              placeholder="설교 요약 또성 내용"
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
            <p className="mt-1 text-sm text-gray-500">
              YouTube URL을 입력하면 썸네일이 자동으로 추출됩니다.
            </p>
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
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
