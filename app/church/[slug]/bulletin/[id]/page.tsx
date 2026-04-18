'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface BulletinData {
  id: string
  title: string
  date: string
  content: string
}

export default function BulletinDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string
  const [bulletin, setBulletin] = useState<BulletinData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/bulletin/${id}`)
      .then(r => r.json())
      .then(data => setBulletin(data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-12 text-gray-500">불러오는 중...</div>
  if (!bulletin) return <div className="text-center py-12 text-gray-500">주보를 찾을 수 없습니다.</div>

  let content: any = {}
  try { content = JSON.parse(bulletin.content) } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{bulletin.title}</h1>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm print:hidden"
        >
          🖨️ 인쇄
        </button>
      </div>

      <div className="p-4 sm:p-8 bg-white rounded-xl shadow-md border print:shadow-none print:border-0">
        <div className="text-center mb-8 pb-4 border-b">
          <p className="text-gray-500">
            {new Date(bulletin.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        {/* 예배 순서 */}
        {content.order?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">📋 예배 순서</h2>
            <ol className="list-decimal list-inside space-y-1">
              {content.order.map((item: string, i: number) => (
                <li key={i} className="py-1">{item}</li>
              ))}
            </ol>
          </div>
        )}

        {/* 찬송가 */}
        {content.hymns?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">🎵 찬송가</h2>
            <ul className="list-disc list-inside space-y-1">
              {content.hymns.map((h: string, i: number) => <li key={i}>{h}</li>)}
            </ul>
          </div>
        )}

        {/* 설교 */}
        {content.sermonTitle && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">📖 설교</h2>
            <p className="font-medium">{content.sermonTitle}</p>
            {content.sermonSpeaker && <p className="text-sm text-gray-600">설교자: {content.sermonSpeaker}</p>}
            {content.sermonBible && <p className="text-sm text-gray-600">본문: {content.sermonBible}</p>}
          </div>
        )}

        {/* 공지사항 */}
        {content.announcements?.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">📢 공지사항</h2>
            <ul className="list-disc list-inside space-y-1">
              {content.announcements.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}

        {/* 헌금 위원 */}
        {content.offering && (
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">💰 헌금 위원</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {content.offering.thanks && <p>감사헌금: {content.offering.thanks}</p>}
              {content.offering.mission && <p>선교헌금: {content.offering.mission}</p>}
            </div>
          </div>
        )}

        {/* 다음 주 */}
        {content.nextWeek && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-lg mb-2">📅 다음 주</h2>
            {content.nextWeek.duty && <p className="text-sm">당번: {content.nextWeek.duty}</p>}
            {content.nextWeek.reader && <p className="text-sm">성경 봉독: {content.nextWeek.reader}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
