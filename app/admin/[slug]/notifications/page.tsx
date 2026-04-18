'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Subscriber {
  id: string
  email: string
  verified: boolean
  createdAt: string
}

interface NotifSetting {
  id: string
  type: string
  enabled: boolean
}

const NOTIF_TYPES = [
  { type: 'new_sermon', label: '새 설교 등록' },
  { type: 'new_notice', label: '새 공지사항' },
  { type: 'new_prayer', label: '새 기도 요청' },
  { type: 'new_bulletin', label: '새 주보 등록' },
]

export default function AdminNotificationsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [settings, setSettings] = useState<NotifSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingType, setSendingType] = useState<string | null>(null)

  // 구독자와 설정을 불러오기 위해 직접 DB 쿼리 API가 필요
  // 여기서는 간이로 관리자용 API 호출
  useEffect(() => {
    // TODO: 관리자용 구독자/설정 조회 API 필요
    // 임시로 빈 상태
    setLoading(false)
  }, [slug])

  const handleSendNotification = async (type: string) => {
    setSendingType(type)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type }),
      })
      const data = await res.json()
      alert(data.message || '알림 발송 완료')
    } catch {
      alert('알림 발송에 실패했습니다.')
    }
    setSendingType(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔔 알림 관리</h1>

      {/* 알림 설정 */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">알림 유형 설정</h2>
        <div className="space-y-3">
          {NOTIF_TYPES.map(({ type, label }) => (
            <div key={type} className="flex items-center justify-between py-2 border-b last:border-0">
              <span>{label}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSendNotification(type)}
                  disabled={sendingType === type}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  {sendingType === type ? '발송 중...' : '수동 발송'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">💡 실제 이메일 발송은 SMTP 설정 후 활성화됩니다.</p>
      </div>

      {/* 구독자 목록 */}
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">📧 구독자 목록</h2>
        <p className="text-gray-500 text-sm">구독자 관리 기능이 곧 추가됩니다.</p>
        {loading ? (
          <div className="text-center py-4 text-gray-400">불러오는 중...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-4 text-gray-400">아직 구독자가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left">이메일</th>
                <th className="px-4 py-2 text-center">상태</th>
                <th className="px-4 py-2 text-left">구독일</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${s.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {s.verified ? '확인됨' : '대기중'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{new Date(s.createdAt).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
