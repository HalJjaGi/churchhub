'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function AdminBulletinPage() {
  const params = useParams()
  const slug = params.slug as string
  const [bulletins, setBulletins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchBulletins = async () => {
    setLoading(true)
    const res = await fetch(`/api/bulletin?slug=${slug}&page=${page}&limit=20`)
    const data = await res.json()
    if (data.bulletins) {
      setBulletins(data.bulletins)
      setTotalPages(data.pagination.totalPages)
    }
    setLoading(false)
  }

  useEffect(() => { fetchBulletins() }, [slug, page])

  const deleteBulletin = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/bulletin/${id}`, { method: 'DELETE' })
    if (res.ok) fetchBulletins()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📰 주보 관리</h1>
        <Link href={`/admin/${slug}/bulletin/new`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + 새 주보 작성
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">불러오는 중...</div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">주보가 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">제목</th>
                <th className="px-4 py-3 text-left">날짜</th>
                <th className="px-4 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {bulletins.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{b.title}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.date).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deleteBulletin(b.id)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
