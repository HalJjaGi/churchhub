'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface PrayerRequest {
  id: string
  title: string
  content: string
  authorName: string | null
  isAnonymous: boolean
  isAnswered: boolean
  prayerCount: number
  createdAt: string
}

export default function PrayerPage() {
  const params = useParams()
  const slug = params.slug as string
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 폼 상태
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAuthor, setFormAuthor] = useState('')
  const [formAnonymous, setFormAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchPrayers = async () => {
    setLoading(true)
    const params = new URLSearchParams({ slug, page: String(page), limit: '12' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/prayer?${params}`)
    const data = await res.json()
    if (data.prayers) {
      setPrayers(data.prayers)
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPrayers() }, [slug, page])

  const handlePray = async (id: string) => {
    const res = await fetch(`/api/prayer/${id}?action=pray`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json()
      setPrayers(prev => prev.map(p => p.id === id ? updated : p))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        title: formTitle,
        content: formContent,
        authorName: formAuthor,
        isAnonymous: formAnonymous,
      }),
    })
    if (res.ok) {
      setFormTitle('')
      setFormContent('')
      setFormAuthor('')
      setFormAnonymous(false)
      setShowForm(false)
      fetchPrayers()
    }
    setSubmitting(false)
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">🙏 기도 요청</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? '닫기' : '+ 기도 요청하기'}
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="기도 요청 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchPrayers())}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => { setPage(1); fetchPrayers() }} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            검색
          </button>
        </div>
      </div>

      {/* 작성 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-4">새 기도 요청</h2>
          <input
            type="text" placeholder="제목" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />
          <textarea
            placeholder="기도 요청 내용" value={formContent} onChange={(e) => setFormContent(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" required
          />
          <div className="flex items-center gap-4 mb-4">
            {!formAnonymous && (
              <input
                type="text" placeholder="이름 (선택)" value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formAnonymous} onChange={(e) => setFormAnonymous(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-600">익명으로 작성</span>
            </label>
          </div>
          <button
            type="submit" disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '작성 중...' : '기도 요청 올리기'}
          </button>
        </form>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">기도 요청이 없습니다.</div>
      ) : (
        <div className="grid gap-4">
          {prayers.map((prayer) => (
            <div key={prayer.id} className="p-5 bg-white rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{prayer.title}</h3>
                {prayer.isAnswered && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    ✅ 응답됨
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-3 whitespace-pre-wrap">{prayer.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  {prayer.isAnonymous ? '익명' : prayer.authorName || '익명'} · {formatDate(prayer.createdAt)}
                </span>
                <button
                  onClick={() => handlePray(prayer.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition"
                >
                  🙏 {prayer.prayerCount}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >이전</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >다음</button>
        </div>
      )}
    </div>
  )
}
