'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

const planLabels: Record<string, { name: string; desc: string; color: string }> = {
  starter: { name: '스타터', desc: '기본 기능 — 무료', color: 'bg-gray-100 text-gray-700' },
  basic: { name: '베이직', desc: '설교 + 공지 + 일정', color: 'bg-blue-100 text-blue-700' },
  pro: { name: '프로', desc: '갤러리 + 커뮤니티 + 히어로 커스텀', color: 'bg-purple-100 text-purple-700' },
  enterprise: { name: '엔터프라이즈', desc: '전체 기능 + 우선 지원', color: 'bg-orange-100 text-orange-700' },
}

export default function ChurchManagePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [church, setChurch] = useState<any>(null)
  const [plan, setPlan] = useState('starter')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setChurch(data)
      setPlan(data.plan || 'starter')
      setLoading(false)
    })
  }, [slug])

  const handlePlanChange = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/churches/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (res.ok) {
      setMessage('요금제가 변경되었습니다.')
      setChurch({ ...church, plan })
    } else {
      setMessage('변경에 실패했습니다.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    const confirmed = prompt('정말 삭제하시겠습니까? 교회명을 입력하세요:')
    if (confirmed !== church?.name) {
      if (confirmed !== null) setMessage('교회명이 일치하지 않습니다.')
      return
    }

    const res = await fetch(`/api/churches/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/churches')
    } else {
      const data = await res.json()
      setMessage(data.error || '삭제에 실패했습니다.')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
            <h1 className="text-2xl font-bold text-gray-900">⚙️ 교회 관리</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {message && (
          <div className={`px-4 py-3 rounded border ${message.includes('실패') || message.includes('일치') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* 교회 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 교회 정보</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">이름:</span> <span className="font-medium">{church?.name}</span></div>
            <div><span className="text-gray-500">슬러그:</span> <span className="font-medium">{slug}</span></div>
            <div><span className="text-gray-500">설명:</span> <span className="font-medium">{church?.description || '없음'}</span></div>
            <div><span className="text-gray-500">생성일:</span> <span className="font-medium">{church?.createdAt ? new Date(church.createdAt).toLocaleDateString('ko-KR') : '-'}</span></div>
          </div>
        </div>

        {/* 요금제 변경 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">💎 요금제</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(planLabels).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPlan(key)}
                className={`text-left p-4 rounded-lg border-2 transition ${
                  plan === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${val.color}`}>{val.name}</span>
                  {church?.plan === key && <span className="text-xs text-blue-600">현재</span>}
                </div>
                <p className="text-sm text-gray-600">{val.desc}</p>
              </button>
            ))}
          </div>
          {plan !== church?.plan && (
            <button
              onClick={handlePlanChange}
              disabled={saving}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {saving ? '변경 중...' : `${planLabels[plan].name}으로 변경`}
            </button>
          )}
        </div>

        {/* 교회 삭제 */}
        <div className="bg-white rounded-lg shadow p-6 border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-2">🗑 교회 삭제</h2>
          <p className="text-sm text-gray-500 mb-4">
            이 교회와 모든 데이터(설교, 공지, 일정, 갤러리, 게시글)가 영구적으로 삭제됩니다. 되돌릴 수 없습니다.
          </p>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            교회 삭제
          </button>
        </div>
      </main>
    </div>
  )
}
