'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Church = {
  id: string
  name: string
  slug: string
  plan: string
  description: string | null
  _count: { users: number; sermons: number; notices: number }
}

export default function ChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([])
  const [filtered, setFiltered] = useState<Church[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  useEffect(() => {
    fetchChurches()
  }, [])

  useEffect(() => {
    let result = churches
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    if (planFilter) {
      result = result.filter(c => c.plan === planFilter)
    }
    setFiltered(result)
  }, [churches, search, planFilter])

  const fetchChurches = async () => {
    try {
      const res = await fetch('/api/churches')
      if (res.ok) {
        const data = await res.json()
        setChurches(data)
        setFiltered(data)
      }
    } catch (error) {
      console.error('Error fetching churches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`"${name}" 교회를 정말 삭제하시겠습니까?\n\n모든 설교, 공지사항, 게시글, 갤러리 등 관련 데이터가 함께 삭제됩니다.`)) return

    try {
      const res = await fetch(`/api/churches/${slug}`, { method: 'DELETE' })
      if (res.ok) {
        setChurches(churches.filter(c => c.slug !== slug))
      } else {
        const data = await res.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch {
      alert('오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
              <h1 className="text-2xl font-bold text-gray-900">교회 관리</h1>
            </div>
            <Link
              href="/admin/churches/new"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + 교회 추가
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="교회명 또는 slug 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 요금제</option>
            <option value="starter">Starter</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">교회명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요금제</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">계정</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">설교</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">공지</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((church) => (
                <tr key={church.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{church.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{church.description || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">{church.slug}</td>
                  <td className="px-6 py-4">
                    <PlanBadge plan={church.plan} />
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{church._count?.users || 0}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{church._count?.sermons || 0}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{church._count?.notices || 0}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      href={`/admin/churches/${church.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      관리 →
                    </Link>
                    <button
                      onClick={() => handleDelete(church.slug, church.name)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {search || planFilter ? '검색 결과가 없습니다.' : '등록된 교회가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          총 {filtered.length}개 교회
        </div>
      </main>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { color: string }> = {
    starter: { color: 'bg-gray-100 text-gray-600' },
    basic: { color: 'bg-blue-100 text-blue-700' },
    pro: { color: 'bg-purple-100 text-purple-700' },
    enterprise: { color: 'bg-orange-100 text-orange-700' },
  }
  const c = config[plan] || config.starter
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.color}`}>{plan}</span>
}
