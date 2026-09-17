'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type EditorUser = {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function ChurchUsersPage() {
  const params = useParams()
  const slug = params.slug as string

  const [users, setUsers] = useState<EditorUser[]>([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [createdAccount, setCreatedAccount] = useState<{ email: string; tempPassword: string } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/church-users')
      if (res.status === 401) {
        setError('로그인이 필요합니다.')
        return
      }
      if (res.status === 403) {
        setError('하위 관리자 관리는 목사(교회 대표)만 가능합니다.')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      } else {
        setError('목록을 불러오지 못했습니다.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setCreatedAccount(null)
    try {
      const res = await fetch('/api/church-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreatedAccount({ email: data.user.email, tempPassword: data.tempPassword })
        setMessage('하위 관리자가 추가되었습니다. 아래 임시 비밀번호를 전달해 주세요.')
        setEmail('')
        setName('')
        await load()
      } else {
        setMessage(`❌ ${data.message || '추가 실패'}`)
      }
    } catch {
      setMessage('❌ 네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('이 하위 관리자를 제거하시겠습니까?')) return
    try {
      const res = await fetch(`/api/church-users?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      setMessage(res.ok ? '제거했습니다.' : `❌ ${data.message || '제거 실패'}`)
      if (res.ok) await load()
    } catch {
      setMessage('❌ 네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">하위 관리자 관리</h1>
              <p className="text-sm text-gray-500">설교·공지·갤러리 등 콘텐츠를 함께 관리할 분들을 초대하세요</p>
            </div>
            <Link
              href={`/admin/${slug}`}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
            >
              ← 관리 홈
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${message.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            {message}
          </div>
        )}

        {createdAccount && (
          <div className="mb-6 bg-white border-2 border-amber-300 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2">🔐 하위 관리자 계정이 생성되었습니다</h2>
            <div className="bg-amber-50 rounded-lg p-4 font-mono text-sm space-y-1">
              <div>로그인: <span className="font-bold">https://churchhub.co.kr/login</span></div>
              <div>이메일: <span className="font-bold">{createdAccount.email}</span></div>
              <div>임시 비밀번호: <span className="font-bold text-base">{createdAccount.tempPassword}</span></div>
            </div>
            <p className="text-xs text-amber-700 mt-3">
              ⚠️ 이 화면을 벗어나면 임시 비밀번호를 다시 볼 수 없습니다. 초대 이메일이 발송되었으니 전달이 어려운 경우 이메일을 확인해 주세요.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* 추가 폼 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">하위 관리자 추가</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 김집사"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: staff@example.com"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? '추가 중...' : '+ 추가'}
              </button>
            </div>
          </form>
        </div>

        {/* 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">현재 하위 관리자 {users.length > 0 && `(${users.length}명)`}</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">불러오는 중...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              아직 하위 관리자가 없습니다.<br />
              <span className="text-sm">위에서 추가하면 설교·공지 등 콘텐츠 관리를 함께할 수 있어요.</span>
            </div>
          ) : (
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">하위 관리자</span>
                    <button
                      onClick={() => handleRemove(u.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      제거
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 bg-blue-50 rounded-lg p-4">
          <p className="font-medium text-blue-900 mb-1">ℹ️ 하위 관리자 권한 안내</p>
          <p>설교, 공지, 갤러리, 일정, 주보, 기도, 커뮤니티 콘텐츠를 관리할 수 있습니다. 교회 설정, 테마, 사용자 관리는 목사(대표)만 가능합니다.</p>
        </div>
      </main>
    </div>
  )
}
