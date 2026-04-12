'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  order: number
  type: string
}

export default function CategoryManagePage() {
  const params = useParams()
  const slug = params.slug as string
  const [churchId, setChurchId] = useState('')
  const [galleryCats, setGalleryCats] = useState<Category[]>([])
  const [communityCats, setCommunityCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState<string | null>(null) // 'gallery' | 'community'
  const [form, setForm] = useState({ name: '', slug: '', icon: '', color: '#3b82f6' })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setChurchId(data.id)
      fetch(`/api/categories?churchId=${data.id}&type=gallery`).then(r => r.json()).then(setGalleryCats)
      fetch(`/api/categories?churchId=${data.id}&type=community`).then(r => r.json()).then(setCommunityCats)
      setLoading(false)
    })
  }, [slug])

  const handleSave = async (type: string) => {
    setSaving(true)
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type, churchId, order: type === 'gallery' ? galleryCats.length : communityCats.length }),
      })
    }
    const cats = await fetch(`/api/categories?churchId=${churchId}&type=${type}`).then(r => r.json())
    if (type === 'gallery') setGalleryCats(cats)
    else setCommunityCats(cats)
    setShowForm(null)
    setEditId(null)
    setForm({ name: '', slug: '', icon: '', color: '#3b82f6' })
    setSaving(false)
  }

  const handleEdit = (cat: Category) => {
    setEditId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '', color: cat.color || '#3b82f6' })
    setShowForm(cat.type)
  }

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (type === 'gallery') setGalleryCats(galleryCats.filter(c => c.id !== id))
    else setCommunityCats(communityCats.filter(c => c.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  const CatSection = ({ title, icon, cats, type }: { title: string; icon: string; cats: Category[]; type: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{icon} {title}</h2>
        <button onClick={() => { setShowForm(showForm === type ? null : type); setEditId(null); setForm({ name: '', slug: '', icon: '', color: '#3b82f6' }) }} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          {showForm === type && !editId ? '취소' : '+ 추가'}
        </button>
      </div>

      {showForm === type && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(type) }} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <input type="text" placeholder="이모지" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="px-3 py-2 border rounded-md text-sm text-center" />
            <input type="text" required placeholder="이름" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 border rounded-md text-sm" />
            {!editId && <input type="text" required placeholder="슬러그 (영문)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="px-3 py-2 border rounded-md text-sm" />}
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs text-gray-500">색상</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
              {saving ? '저장 중...' : editId ? '수정' : '추가'}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setShowForm(null); setForm({ name: '', slug: '', icon: '', color: '#3b82f6' }) }} className="px-4 py-1.5 border rounded-md text-sm">취소</button>}
          </div>
        </form>
      )}

      {cats.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">카테고리가 없습니다</p>
      ) : (
        <div className="space-y-2">
          {cats.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-3">
                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#9ca3af' }} />
                <span className="font-medium text-gray-900">{cat.name}</span>
                <span className="text-xs text-gray-400">/{cat.slug}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="text-xs text-blue-600 hover:underline">수정</button>
                <button onClick={() => handleDelete(cat.id, type)} className="text-xs text-red-600 hover:underline">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
            <h1 className="text-2xl font-bold text-gray-900">🏷 카테고리 / 게시판 관리</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <CatSection title="갤러리 카테고리" icon="🖼" cats={galleryCats} type="gallery" />
        <CatSection title="커뮤니티 게시판" icon="💬" cats={communityCats} type="community" />
      </main>
    </div>
  )
}
