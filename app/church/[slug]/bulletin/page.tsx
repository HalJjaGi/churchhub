'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Bulletin {
  id: string
  title: string
  date: string
  createdAt: string
}

export default function BulletinListPage() {
  const params = useParams()
  const slug = params.slug as string
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/bulletin?slug=${slug}&page=${page}&limit=12`)
      .then(r => r.json())
      .then(data => {
        if (data.bulletins) {
          setBulletins(data.bulletins)
          setTotalPages(data.pagination.totalPages)
        }
      })
      .finally(() => setLoading(false))
  }, [slug, page])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">📰 주보</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">주보가 없습니다.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bulletins.map((b) => (
            <Link key={b.id} href={`/church/${slug}/bulletin/${b.id}`}
              className="p-5 bg-white rounded-xl shadow-sm border hover:shadow-md transition block"
            >
              <h3 className="font-semibold text-lg mb-1">{b.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(b.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </Link>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">이전</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">다음</button>
        </div>
      )}
    </div>
  )
}
