'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const defaultTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
  },
  font: 'sans-serif',
  layout: 'modern',
}

const defaultModules = {
  sermon: true,
  notice: true,
  community: false,
  gallery: false,
  donation: false,
}

export default function NewChurchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    plan: 'starter',
    address: '',
    phone: '',
    email: '',
    parking: '',
    mapLat: '',
    mapLng: '',
  })

  // 교회명으로 slug 자동 생성 (한글 제거, 영문/숫자만)
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        plan: form.plan,
        theme: defaultTheme,
        modules: defaultModules,
      }

      if (form.description) body.description = form.description

      const res = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/admin/churches')
      } else {
        const data = await res.json()
        const msg = data.details 
          ? data.details.map((d: {message: string}) => d.message).join(', ')
          : data.error || '교회 추가에 실패했습니다.'
        setError(msg)
      }
    } catch {
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/churches" className="text-gray-600 hover:text-gray-900">← 교회 목록</Link>
            <h1 className="text-2xl font-bold text-gray-900">교회 추가</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                교회명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 소망교회"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL 경로) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-2">/church/</span>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="hope-church"
                  pattern="^[a-z0-9-]+$"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">영문 소문자, 숫자, 하이픈만 가능</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="교회 소개 (500자 이내)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요금제</label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 'starter', label: 'Starter', desc: '기본' },
                  { value: 'basic', label: 'Basic', desc: '표준' },
                  { value: 'pro', label: 'Pro', desc: '프로' },
                  { value: 'enterprise', label: 'Enterprise', desc: '기업' },
                ].map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setForm({ ...form, plan: plan.value })}
                    className={`p-3 border rounded-lg text-center transition ${
                      form.plan === plan.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{plan.label}</div>
                    <div className="text-xs mt-1">{plan.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">연락처 정보</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="서울특별시 강남구 테헤란로 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="02-1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="info@church.kr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주차 안내</label>
              <input
                type="text"
                value={form.parking}
                onChange={(e) => setForm({ ...form, parking: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="지하 1-2층 주차장 (200대 가능)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">위도</label>
                <input
                  type="number"
                  step="any"
                  value={form.mapLat}
                  onChange={(e) => setForm({ ...form, mapLat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="37.5665"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">경도</label>
                <input
                  type="number"
                  step="any"
                  value={form.mapLng}
                  onChange={(e) => setForm({ ...form, mapLng: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="126.9780"
                />
              </div>
            </div>
          </div>

          {/* 기본 설정 미리보기 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 설정</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">테마:</span>{' '}
                <span className="text-gray-900">Modern (Sans-serif)</span>
              </div>
              <div>
                <span className="text-gray-500">모듈:</span>{' '}
                <span className="text-gray-900">설교, 공지</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">생성 후 관리자에서 변경 가능합니다.</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <Link
              href="/admin/churches"
              className="flex-1 px-4 py-2 text-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !form.name || !form.slug}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '교회 추가'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
