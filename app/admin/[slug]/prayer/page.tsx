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

export default function AdminPrayerPage() {
  const params = useParams()
  const slug = params.slug as string
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPrayers = async () => {
    setLoading(true)
    const res = await fetch(`/api/prayer?slug=${slug}&page=${page}&limit=20`)
    const data = await res.json()
    if (data.prayers) {
      setPrayers(data.prayers)
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPrayers() }, [slug, page])

  const toggleAnswered = async (id: string) => {
    const res = await fetch(`/api/prayer/${id}?action=answer`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json()
      setPrayers(prev => prev.map(p => p.id === id ? updated : p))
    }
  }

  const deletePrayer = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/prayer/${id}`, { method: 'DELETE' })
    if (res.ok) fetchPrayers()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🙏 기도 요청 관리</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : prayers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">기도 요청이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">제목</th>
                <th className="px-4 py-3 text-left">작성자</th>
                <th className="px-4 py-3 text-center">기도</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-left">날짜</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {prayers.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3">{p.isAnonymous ? '익명' : p.authorName || '익명'}</td>
                  <td className="px-4 py-3 text-center">🙏 {p.prayerCount}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAnswered(p.id)}
                      className={`px-2 py-1 text-xs rounded-full ${p.isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {p.isAnswered ? '✅ 응답됨' : '대기중'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deletePrayer(p.id)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">이전</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">다음</button>
        </div>
      )}
    </div>
  )
}
