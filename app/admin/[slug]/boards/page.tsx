'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BoardManagePage() {
  const params = useParams()
  const slug = params.slug as string
  const [boards, setBoards] = useState<any[]>([])
  const [churchId, setChurchId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '📝', allowWrite: 'all' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setChurchId(data.id)
      fetch(`/api/boards?churchId=${data.id}`).then(r => r.json()).then(d => { setBoards(d); setLoading(false) })
    })
  }, [slug])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: boards.length, churchId }),
    })
    if (res.ok) {
      const board = await res.json()
      setBoards([...boards, board])
      setShowForm(false)
      setForm({ name: '', slug: '', description: '', icon: '📝', allowWrite: 'all' })
    } else {
      const data = await res.json()
      alert(data.error || '생성 실패')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 게시글도 함께 삭제됩니다.')) return
    const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' })
    if (res.ok) setBoards(boards.filter(b => b.id !== id))
  }

  const toggleWrite = async (board: any) => {
    const options = ['all', 'admin_only', 'closed']
    const current = options.indexOf(board.allowWrite)
    const next = options[(current + 1) % options.length]
    const res = await fetch(`/api/boards/${board.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...board, allowWrite: next }),
    })
    if (res.ok) {
      setBoards(boards.map(b => b.id === board.id ? { ...b, allowWrite: next } : b))
    }
  }

  const writeLabels: Record<string, string> = { all: '누구나 작성', admin_only: '관리자만', closed: '작성 금지' }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
              <h1 className="text-2xl font-bold text-gray-900">📋 게시판 관리</h1>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              {showForm ? '취소' : '+ 게시판 추가'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이모지</label>
                <input type="text" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="자유게시판" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 *</label>
                <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="free" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="자유롭게 글을 작성하세요" />
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
              {saving ? '생성 중...' : '게시판 생성'}
            </button>
          </form>
        )}

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">게시판이 없습니다. 기본 카테고리로 운영됩니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {boards.map(board => (
              <div key={board.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{board.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{board.name}</h3>
                    <p className="text-sm text-gray-500">{board.description || board.slug} · {board._count?.posts || 0}개 글</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleWrite(board)} className={`text-xs px-3 py-1 rounded-full ${
                    board.allowWrite === 'all' ? 'bg-green-100 text-green-700' :
                    board.allowWrite === 'admin_only' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {writeLabels[board.allowWrite]}
                  </button>
                  <button onClick={() => handleDelete(board.id)} className="text-xs text-red-600 hover:underline">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
