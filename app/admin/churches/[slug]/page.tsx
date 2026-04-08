'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Church = {
  id: string
  name: string
  slug: string
  description: string | null
  plan: string
  address: string | null
  phone: string | null
  email: string | null
  parking: string | null
}

type User = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function ChurchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [church, setChurch] = useState<Church | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'church_admin' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    try {
      const [churchRes, usersRes] = await Promise.all([
        fetch(`/api/churches/${slug}`),
        fetch(`/api/users?churchId=${(await (await fetch(`/api/churches/${slug}`)).json()).id}`),
      ])

      if (churchRes.ok) {
        const churchData = await churchRes.json()
        setChurch(churchData)

        if (usersRes.ok) {
          const userData = await usersRes.json()
          setUsers(userData)
        } else {
          // churchId로 다시 조회
          const usersRes2 = await fetch(`/api/users?churchId=${churchData.id}`)
          if (usersRes2.ok) {
            setUsers(await usersRes2.json())
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    if (!church) return

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          churchId: church.id,
        }),
      })

      if (res.ok) {
        const newUser = await res.json()
        setUsers([...users, newUser])
        setShowAddModal(false)
        setForm({ name: '', email: '', password: '', role: 'church_admin' })
      } else {
        const data = await res.json()
        setFormError(data.error || '추가에 실패했습니다.')
      }
    } catch {
      setFormError('오류가 발생했습니다.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return
    setFormLoading(true)
    setFormError('')

    try {
      const body: Record<string, string> = {}
      if (form.name) body.name = form.name
      if (form.role) body.role = form.role
      if (form.password) body.password = form.password

      const res = await fetch(`/api/users/${showEditModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const updated = await res.json()
        setUsers(users.map(u => u.id === updated.id ? updated : u))
        setShowEditModal(null)
        setForm({ name: '', email: '', password: '', role: 'church_admin' })
      } else {
        const data = await res.json()
        setFormError(data.error || '수정에 실패했습니다.')
      }
    } catch {
      setFormError('오류가 발생했습니다.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
      } else {
        const data = await res.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch {
      alert('오류가 발생했습니다.')
    }
  }

  const openEditModal = (user: User) => {
    setForm({ name: user.name || '', email: user.email, password: '', role: user.role })
    setShowEditModal(user)
    setFormError('')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">로딩 중...</div></div>
  }

  if (!church) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">교회를 찾을 수 없습니다.</div></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/churches" className="text-gray-600 hover:text-gray-900">← 교회 목록</Link>
            <h1 className="text-2xl font-bold text-gray-900">{church.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Church Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">교회 정보</h2>
            <dl className="space-y-3">
              {[
                ['이름', church.name],
                ['Slug', church.slug],
                ['요금제', church.plan],
                ['주소', church.address],
                ['전화', church.phone],
                ['이메일', church.email],
                ['주차', church.parking],
                ['설명', church.description],
              ].map(([label, value]) => (
                value ? (
                  <div key={label as string} className="flex justify-between">
                    <dt className="text-sm text-gray-500">{label}</dt>
                    <dd className="text-sm text-gray-900 text-right max-w-xs truncate">{value}</dd>
                  </div>
                ) : null
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 링크</h2>
            <div className="space-y-3">
              <Link
                href={`/admin/${church.slug}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span>⚙️</span>
                <span className="text-sm font-medium text-gray-900">교회 설정 관리</span>
              </Link>
              <Link
                href={`/admin/${church.slug}/sermons`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span>🎬</span>
                <span className="text-sm font-medium text-gray-900">설교 관리</span>
              </Link>
              <Link
                href={`/admin/${church.slug}/notices`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span>📋</span>
                <span className="text-sm font-medium text-gray-900">공지사항 관리</span>
              </Link>
              <Link
                href={`/church/${church.slug}`}
                target="_blank"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <span>🌐</span>
                <span className="text-sm font-medium text-gray-900">교회 페이지 보기</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              계정 관리 <span className="text-sm font-normal text-gray-500">({users.length}명)</span>
            </h2>
            <button
              onClick={() => { setShowAddModal(true); setFormError(''); setForm({ name: '', email: '', password: '', role: 'church_admin' }) }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + 계정 추가
            </button>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              등록된 계정이 없습니다.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-700 text-sm">수정</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700 text-sm">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal title="계정 추가" onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} loading={formLoading} error={formError}>
          <FormField label="이름" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="홍길동" />
          <FormField label="이메일" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="user@church.kr" required />
          <FormField label="비밀번호" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="8자 이상 (영문+숫자+특수문자)" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="church_admin">Church Admin (전체 관리)</option>
              <option value="editor">Editor (콘텐츠 편집)</option>
              <option value="member">Member (조회만)</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            교회: <strong>{church.name}</strong>에 자동 등록됩니다.
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <Modal title="계정 수정" onClose={() => setShowEditModal(null)} onSubmit={handleEditUser} loading={formLoading} error={formError}>
          <FormField label="이름" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input type="email" value={form.email} disabled className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500" />
          </div>
          <FormField label="새 비밀번호" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="변경하지 않으려면 비워두세요" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="church_admin">Church Admin (전체 관리)</option>
              <option value="editor">Editor (콘텐츠 편집)</option>
              <option value="member">Member (조회만)</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
    church_admin: { label: 'Church Admin', color: 'bg-blue-100 text-blue-700' },
    editor: { label: 'Editor', color: 'bg-green-100 text-green-700' },
    member: { label: 'Member', color: 'bg-gray-100 text-gray-600' },
  }
  const c = config[role] || config.member
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.color}`}>{c.label}</span>
}

function Modal({ title, onClose, onSubmit, loading, error, children }: {
  title: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean; error: string; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
            {children}
          </div>
          <div className="px-6 py-4 border-t flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">취소</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? '처리 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({ label, type = 'text', value, onChange, placeholder, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
