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

type ChurchForm = {
  intro: string
  vision: string
  address: string
  phone: string
  email: string
  parking: string
  pastorName: string
  pastorMessage: string
  pastorImage: string
  heroTitle: string
  heroSubtitle: string
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

  const [form, setForm] = useState<ChurchForm>({
    intro: '', vision: '', address: '', phone: '', email: '', parking: '',
    pastorName: '', pastorMessage: '', pastorImage: '',
    heroTitle: '', heroSubtitle: '',
  })

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setChurch(data)
      setPlan(data.plan || 'starter')
      setForm({
        intro: data.intro || '',
        vision: data.vision || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        parking: data.parking || '',
        pastorName: data.pastorName || '',
        pastorMessage: data.pastorMessage || '',
        pastorImage: data.pastorImage || '',
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
      })
      setLoading(false)
    })
  }, [slug])

  const handleSaveInfo = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/churches/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setChurch({ ...church, ...form, ...data })
      setMessage('교회 정보가 저장되었습니다.')
    } else {
      setMessage('저장에 실패했습니다.')
    }
    setSaving(false)
  }

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

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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

        {/* 교회 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 교회 기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>교회 이름</label>
              <div className="text-sm font-medium text-gray-900 py-2">{church?.name}</div>
            </div>
            <div>
              <label className={labelClass}>교회 소개</label>
              <textarea rows={3} value={form.intro} onChange={e => setForm({ ...form, intro: e.target.value })} className={inputClass} placeholder="교회 소개를 입력하세요" />
            </div>
            <div>
              <label className={labelClass}>비전</label>
              <textarea rows={2} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} className={inputClass} placeholder="교회 비전을 입력하세요" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>주소</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputClass} placeholder="교회 주소" />
              </div>
              <div>
                <label className={labelClass}>전화번호</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="02-0000-0000" />
              </div>
              <div>
                <label className={labelClass}>이메일</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="church@example.com" />
              </div>
              <div>
                <label className={labelClass}>주차 안내</label>
                <input type="text" value={form.parking} onChange={e => setForm({ ...form, parking: e.target.value })} className={inputClass} placeholder="주차 안내 문구" />
              </div>
            </div>
          </div>
        </div>

        {/* 담임목사 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🙏 담임목사</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>담임목사명</label>
                <input type="text" value={form.pastorName} onChange={e => setForm({ ...form, pastorName: e.target.value })} className={inputClass} placeholder="목사명" />
              </div>
              <div>
                <label className={labelClass}>사진 URL</label>
                <input type="url" value={form.pastorImage} onChange={e => setForm({ ...form, pastorImage: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className={labelClass}>인사말</label>
              <textarea rows={4} value={form.pastorMessage} onChange={e => setForm({ ...form, pastorMessage: e.target.value })} className={inputClass} placeholder="담임목사 인사말을 입력하세요" />
            </div>
            {form.pastorImage && (
              <div>
                <label className={labelClass}>사진 미리보기</label>
                <img src={form.pastorImage} alt="담임목사 프로필" loading="lazy" className="w-32 h-32 rounded-full object-cover border" />
              </div>
            )}
          </div>
        </div>

        {/* 히어로 배너 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎨 히어로 배너</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>히어로 제목</label>
              <input type="text" value={form.heroTitle} onChange={e => setForm({ ...form, heroTitle: e.target.value })} className={inputClass} placeholder="메인 페이지에 표시될 제목" />
            </div>
            <div>
              <label className={labelClass}>히어로 부제목</label>
              <input type="text" value={form.heroSubtitle} onChange={e => setForm({ ...form, heroSubtitle: e.target.value })} className={inputClass} placeholder="제목 아래에 표시될 부제목" />
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button onClick={handleSaveInfo} disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
            {saving ? '저장 중...' : '💾 모든 정보 저장'}
          </button>
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
