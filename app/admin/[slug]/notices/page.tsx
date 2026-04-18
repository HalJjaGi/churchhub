'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Notice = {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: string
}

type Pagination = { page: number; limit: number; total: number; totalPages: number }

export default function NoticeListPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [notices, setNotices] = useState<Notice[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetchNotices(1)
  }, [slug, search])

  const fetchNotices = async (page: number = pagination.page) => {
    try {
      const params = new URLSearchParams({ slug, page: String(page), limit: '10' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/notices?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotices(data.notices)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    fetchNotices(1)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchNotices(pagination.page)
      } else {
        alert('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePin = async (notice: Notice) => {
    setToggling(notice.id)
    try {
      const res = await fetch(`/api/notices/${notice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !notice.pinned }),
      })
      if (res.ok) {
        fetchNotices(pagination.page)
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    } finally {
      setToggling(null)
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
              <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
              <span className="text-sm text-gray-500">총 {pagination.total}개</span>
            </div>
            <Link
              href={`/admin/${slug}/notices/new`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              공지 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 검색바 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="공지사항 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-sm">
              검색
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm">
                초기화
              </button>
            )}
          </div>
        </form>

        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">{search ? '검색 결과가 없습니다.' : '등록된 공지사항이 없습니다.'}</p>
            {!search && (
              <Link href={`/admin/${slug}/notices/new`} className="text-blue-600 hover:text-blue-700">
                첫 번째 공지 추가하기 →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notices.map((notice) => (
                    <tr key={notice.id} className={`hover:bg-gray-50 ${notice.pinned ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePin(notice)}
                          disabled={toggling === notice.id}
                          className={`text-lg ${notice.pinned ? 'opacity-100' : 'opacity-30 hover:opacity-60'} disabled:opacity-50`}
                          title={notice.pinned ? '고정 해제' : '고정'}
                        >
                          📌
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {notice.pinned && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">고정</span>}
                          <span className="font-medium text-gray-900">{notice.title}</span>
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {notice.content.substring(0, 80)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(notice.createdAt)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/admin/${slug}/notices/${notice.id}/edit`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          disabled={deleting === notice.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deleting === notice.id ? '삭제 중...' : '삭제'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => fetchNotices(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchNotices(p)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      p === pagination.page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchNotices(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-2 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
