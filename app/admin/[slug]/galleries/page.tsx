'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function AdminGalleriesPage() {
  const params = useParams()
  const slug = params.slug as string

  const [galleries, setGalleries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [churchId, setChurchId] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchChurch()
  }, [slug])

  const fetchChurch = async () => {
    const res = await fetch(`/api/churches/${slug}`)
    if (res.ok) {
      const data = await res.json()
      setChurchId(data.id)
      fetchGalleries(data.id, 1, '')
    }
  }

  const fetchGalleries = async (cId: string, page: number, category: string) => {
    const params = new URLSearchParams({ churchId: cId, page: String(page), limit: '20' })
    if (category) params.set('category', category)
    const res = await fetch(`/api/galleries?${params}`)
    if (res.ok) {
      const data = await res.json()
      setGalleries(data.galleries)
      setPagination(data.pagination)
      // Extract unique categories
      const cats = new Set<string>()
      data.galleries.forEach((g: any) => { if (g.category) cats.add(g.category) })
      // Merge with existing categories
      setCategories(prev => {
        const merged = new Set([...prev, ...cats])
        return Array.from(merged).sort()
      })
    }
    setLoading(false)
  }

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat)
    fetchGalleries(churchId, 1, cat)
  }

  const handlePageChange = (page: number) => {
    fetchGalleries(churchId, page, categoryFilter)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/galleries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchGalleries(churchId, pagination.page, categoryFilter)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
              <h1 className="text-2xl font-bold text-gray-900">📷 갤러리 관리</h1>
              <span className="text-sm text-gray-500">총 {pagination.total}개</span>
            </div>
            <Link
              href={`/admin/${slug}/galleries/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + 이미지 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-500">카테고리:</span>
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-3 py-1 text-sm rounded-full border transition ${
                categoryFilter === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 text-sm rounded-full border transition ${
                  categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {galleries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">등록된 이미지가 없습니다.</p>
            <Link href={`/admin/${slug}/galleries/new`} className="text-blue-600 hover:underline">
              첫 이미지 추가하기 →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleries.map((g) => (
                <div key={g.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-200">
                    <img src={g.imageUrl} alt={g.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{g.title}</h3>
                    {g.description && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">{g.description}</p>
                    )}
                    {g.category && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full mt-2">
                        {g.category}
                      </span>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/admin/${slug}/galleries/${g.id}/edit`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      p === pagination.page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
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
