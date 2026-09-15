'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Application = {
  id: string
  churchName: string
  pastorName: string
  phone: string
  email: string
  address: string
  website: string | null
  description: string
  theme: string
  slug: string | null
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  memberCount: number | null
  establishedYear: number | null
  churchId: string | null
}

const STATUS_META: Record<string, { label: string; badge: string }> = {
  pending: { label: '대기 중', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  under_review: { label: '검토 중', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  approved: { label: '승인 완료', badge: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: '반려', badge: 'bg-red-100 text-red-800 border-red-200' },
}

const THEME_LABELS: Record<string, string> = {
  modern: '모던',
  classic: '클래식',
  warm: '웜',
}

function formatDate(d: string | null): string {
  if (!d) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(d))
  } catch {
    return d
  }
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [accountInfo, setAccountInfo] = useState<{ email: string; tempPassword: string; churchName: string; siteUrl: string } | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const load = useCallback(async (statusFilter: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/applications?status=${statusFilter}`)
      if (res.status === 403 || res.status === 401) {
        setError('관리자 권한이 필요합니다. 로그인 후 다시 시도해주세요.')
        return
      }
      if (!res.ok) {
        setError('목록을 불러오지 못했습니다.')
        return
      }
      const data = await res.json()
      setApplications(data.applications || [])
      setCounts(data.counts || {})
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(filter)
  }, [filter, load])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    setActionMessage('')
    setAccountInfo(null)
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const data = await res.json()
      setActionMessage(res.ok ? data.message : `❌ ${data.message || '승인 실패'}`)
      if (res.ok) {
        if (data.adminAccount?.tempPassword) {
          setAccountInfo({
            email: data.adminAccount.email,
            tempPassword: data.adminAccount.tempPassword,
            churchName: data.church.name,
            siteUrl: `/church/${data.church.slug}`,
          })
        } else if (data.accountSkipped) {
          setActionMessage((m) => m + ' (이미 가입된 이메일이라 관리자 계정 생성은 건너뛰었어요)')
        }
        await load(filter)
      }
    } catch {
      setActionMessage('❌ 네트워크 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    setActionMessage('')
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', notes: rejectNote }),
      })
      const data = await res.json()
      setActionMessage(res.ok ? '신청을 반려했습니다.' : `❌ ${data.message || '반려 실패'}`)
      if (res.ok) {
        setRejectingId(null)
        setRejectNote('')
        await load(filter)
      }
    } catch {
      setActionMessage('❌ 네트워크 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '대기' },
    { key: 'under_review', label: '검토' },
    { key: 'approved', label: '승인' },
    { key: 'rejected', label: '반려' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">교회 신청 관리</h1>
              <p className="text-sm text-gray-500">ChurchHub Super Admin</p>
            </div>
            <Link
              href="/admin"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
            >
              ← 대시보드
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${actionMessage.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            {actionMessage}
          </div>
        )}

        {accountInfo && (
          <div className="mb-6 bg-white border-2 border-amber-300 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2">🔐 교회 관리자 계정이 생성되었습니다</h2>
            <p className="text-sm text-amber-800 mb-4">
              아래 정보를 <strong>{accountInfo.churchName}</strong> 담당자에게 전달해 주세요.
              SMTP 미설정으로 자동 이메일이 발송되지 않으니 수동으로 알려주셔야 합니다.
              이 화면을 벗어나면 임시 비밀번호를 다시 볼 수 없습니다.
            </p>
            <div className="bg-amber-50 rounded-lg p-4 font-mono text-sm space-y-1">
              <div>로그인: <span className="font-bold">https://churchhub.co.kr/login</span></div>
              <div>이메일: <span className="font-bold">{accountInfo.email}</span></div>
              <div>임시 비밀번호: <span className="font-bold text-base">{accountInfo.tempPassword}</span></div>
            </div>
            <p className="text-xs text-amber-700 mt-3">⚠️ 첫 로그인 후 비밀번호 변경을 안내해 주세요.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
            {error}
            <Link href="/login" className="ml-2 underline">로그인하기</Link>
          </div>
        )}

        {/* 필터 탭 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                filter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {counts[tab.key] !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">불러오는 중...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            신청 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const meta = STATUS_META[app.status] || { label: app.status, badge: 'bg-gray-100 text-gray-800 border-gray-200' }
              const isPending = app.status === 'pending' || app.status === 'under_review'
              return (
                <div key={app.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">{app.churchName}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        신청번호: {app.id.slice(-8)} · 접수: {formatDate(app.submittedAt)}
                        {app.reviewedAt && ` · 처리: ${formatDate(app.reviewedAt)}`}
                      </p>
                    </div>
                    {app.status === 'approved' && app.slug && (
                      <Link
                        href={`/church/${app.slug}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        target="_blank"
                      >
                        생성된 사이트 보기 →
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
                    <div><span className="text-gray-500">담임목사:</span> {app.pastorName}</div>
                    <div><span className="text-gray-500">연락처:</span> {app.phone}</div>
                    <div><span className="text-gray-500">이메일:</span> {app.email}</div>
                    <div><span className="text-gray-500">주소:</span> {app.address}</div>
                    <div>
                      <span className="text-gray-500">영문명(slug):</span>{' '}
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">{app.slug || '-'}</code>
                    </div>
                    <div>
                      <span className="text-gray-500">테마:</span> {THEME_LABELS[app.theme] || app.theme}
                      {app.memberCount !== null && <span className="text-gray-500"> · 교인 수: {app.memberCount}명</span>}
                      {app.establishedYear !== null && <span className="text-gray-500"> · 설립: {app.establishedYear}년</span>}
                    </div>
                    {app.description && (
                      <div className="md:col-span-2">
                        <span className="text-gray-500">소개:</span> {app.description}
                      </div>
                    )}
                    {app.notes && (
                      <div className="md:col-span-2 p-2 bg-gray-50 rounded text-gray-700">
                        <span className="text-gray-500">메모:</span> {app.notes}
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={processingId === app.id}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === app.id ? '처리 중...' : '✓ 승인'}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(rejectingId === app.id ? null : app.id)
                            setRejectNote('')
                          }}
                          className="px-5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100"
                        >
                          ✕ 반려
                        </button>
                      </div>
                      {rejectingId === app.id && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="반려 사유 (신청자가 상태 조회에서 볼 수 있습니다)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            maxLength={500}
                          />
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={processingId === app.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                          >
                            반려 확정
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
