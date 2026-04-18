'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Schedule = {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  category: string
}

type Pagination = { page: number; limit: number; total: number; totalPages: number }

const categories = [
  { value: '', label: '전체', icon: '📋' },
  { value: 'general', label: '일반', icon: '📌' },
  { value: 'worship', label: '예배', icon: '🙏' },
  { value: 'event', label: '행사', icon: '🎉' },
  { value: 'meeting', label: '모임', icon: '🤝' },
  { value: 'education', label: '교육', icon: '📚' },
]

export default function SchedulesPage() {
  const params = useParams()
  const slug = params.slug as string

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [churchId, setChurchId] = useState('')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', date: '', endDate: '', category: 'general' })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  // 필터
  const [selectedMonth, setSelectedMonth] = useState('') // YYYY-MM
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => { loadData() }, [slug, selectedMonth, selectedCategory])

  const loadData = async (page = 1) => {
    try {
      const schedParams = new URLSearchParams({ slug, page: String(page), limit: '20' })
      if (selectedMonth) schedParams.set('month', selectedMonth)
      if (selectedCategory) schedParams.set('category', selectedCategory)

      const [churchRes, schedRes] = await Promise.all([
        fetch(`/api/churches/${slug}`),
        fetch(`/api/schedules?${schedParams}`),
      ])
      if (churchRes.ok) { const d = await churchRes.json(); setChurchId(d.id) }
      if (schedRes.ok) {
        const data = await schedRes.json()
        setSchedules(data.schedules)
        setPagination(data.pagination)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditId(null)
    setForm({ title: '', description: '', date: '', endDate: '', category: 'general' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (s: Schedule) => {
    setEditId(s.id)
    setForm({
      title: s.title,
      description: s.description || '',
      date: s.date ? new Date(s.date).toISOString().slice(0, 16) : '',
      endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : '',
      category: s.category,
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    try {
      const body = { ...form, churchId }
      const url = editId ? `/api/schedules/${editId}` : '/api/schedules'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        loadData(pagination.page)
      } else {
        const d = await res.json()
        setError(d.error || '실패했습니다.')
      }
    } catch { setError('오류가 발생했습니다.') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
      if (res.ok) loadData(pagination.page)
      else alert('삭제 실패')
    } catch { alert('오류 발생') }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  // 월 선택용 헬퍼
  const generateMonths = () => {
    const now = new Date()
    const months = []
    for (let i = -6; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ value: val, label: `${d.getFullYear()}년 ${d.getMonth() + 1}월` })
    }
    return months
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">로딩 중...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 설정으로</Link>
              <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
              <span className="text-sm text-gray-500">총 {pagination.total}개</span>
            </div>
            <button onClick={openAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              + 일정 추가
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">월:</span>
            <select
              value={selectedMonth}
              onChange={e => { setSelectedMonth(e.target.value); setLoading(true) }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 기간</option>
              {generateMonths().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">카테고리:</span>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setLoading(true) }}
                className={`px-3 py-1 text-sm rounded-full border transition ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 일정이 없습니다.</p>
            <button onClick={openAdd} className="text-blue-600 hover:text-blue-700">첫 번째 일정 추가하기 →</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schedules.map((s) => {
                    const cat = categories.find(c => c.value === s.category) || categories[1]
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{s.title}</div>
                          {s.description && <div className="text-sm text-gray-500 truncate max-w-xs">{s.description}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(s.date)}</td>
                        <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{cat.icon} {cat.label}</span></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-700 text-sm">수정</button>
                          <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-700 text-sm">삭제</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => loadData(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-2 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => loadData(p)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      p === pagination.page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadData(pagination.page + 1)}
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

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{editId ? '일정 수정' : '일정 추가'}</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작일 <span className="text-red-500">*</span></label>
                    <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                    <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {categories.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">취소</button>
                <button type="submit" disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {formLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
