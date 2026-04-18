'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Sermon = {
  id: string
  title: string
  speaker: string
  date: string
  youtubeUrl: string | null
  thumbnail: string | null
  series: string | null
  bibleRef: string | null
  tags: string | null
}

export default function SermonListPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [seriesFilter, setSeriesFilter] = useState('')
  const [allSeries, setAllSeries] = useState<string[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    fetchSermons()
  }, [slug, pagination.page, search, seriesFilter])

  useEffect(() => {
    fetchSeries()
  }, [slug])

  const fetchSeries = async () => {
    try {
      const res = await fetch(`/api/sermons/series?slug=${slug}`)
      if (res.ok) setAllSeries(await res.json())
    } catch {}
  }

  const fetchSermons = async () => {
    try {
      const params = new URLSearchParams({ slug, page: String(pagination.page), limit: '20' })
      if (search) params.set('search', search)
      if (seriesFilter) params.set('series', seriesFilter)
      const res = await fetch(`/api/sermons?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSermons(data.sermons || data)
        if (data.pagination) setPagination(prev => ({ ...prev, ...data.pagination }))
      }
    } catch (error) {
      console.error('Error fetching sermons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSermons(sermons.filter((s) => s.id !== id))
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting sermon:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">
                ← 설정으로
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">설교 관리</h1>
            </div>
            <Link
              href={`/admin/${slug}/sermons/new`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              설교 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 검색 & 필터 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            placeholder="제목, 설교자, 성경 구절 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {allSeries.length > 0 && (
            <select
              value={seriesFilter}
              onChange={(e) => { setSeriesFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 시리즈</option>
              {allSeries.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {sermons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 설교가 없습니다.</p>
            <Link
              href={`/admin/${slug}/sermons/new`}
              className="text-blue-600 hover:text-blue-700"
            >
              첫 번째 설교 추가하기 →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    설교
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    설교자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    시리즈 / 성경
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {sermon.thumbnail && (
                          <img src={sermon.thumbnail} alt="" className="w-16 h-10 object-cover rounded mr-3" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{sermon.title}</div>
                          {sermon.tags && (
                            <div className="flex gap-1 mt-1">
                              {sermon.tags.split(',').slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{sermon.speaker}</td>
                    <td className="px-6 py-4">
                      {sermon.series && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{sermon.series}</span>
                      )}
                      {sermon.bibleRef && (
                        <span className="text-xs text-gray-500 ml-1">{sermon.bibleRef}</span>
                      )}
                      {!sermon.series && !sermon.bibleRef && <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(sermon.date)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/${slug}/sermons/${sermon.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(sermon.id)}
                        disabled={deleting === sermon.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === sermon.id ? '삭제 중...' : '삭제'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
                  p === pagination.page ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
