'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminBulletinNewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [date, setDate] = useState('')
  const [order, setOrder] = useState<string[]>([''])
  const [hymns, setHymns] = useState<string[]>([''])
  const [sermonTitle, setSermonTitle] = useState('')
  const [sermonSpeaker, setSermonSpeaker] = useState('')
  const [sermonBible, setSermonBible] = useState('')
  const [announcements, setAnnouncements] = useState<string[]>([''])
  const [offeringThanks, setOfferingThanks] = useState('')
  const [offeringMission, setOfferingMission] = useState('')
  const [nextDuty, setNextDuty] = useState('')
  const [nextReader, setNextReader] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState(false)

  // 교회 ID 조회
  const [churchId, setChurchId] = useState('')
  useEffect(() => {
    fetch(`/api/bulletin?slug=${slug}&limit=1`).then(() => {
      // churchId는 서버에서 처리하므로 별도 조회 불필요
    })
  }, [slug])

  const addField = (arr: string[], setter: (v: string[]) => void) => setter([...arr, ''])
  const removeField = (arr: string[], setter: (v: string[]) => void, idx: number) =>
    setter(arr.filter((_, i) => i !== idx))
  const updateField = (arr: string[], setter: (v: string[]) => void, idx: number, val: string) =>
    setter(arr.map((v, i) => i === idx ? val : v))

  const handleSave = async () => {
    if (!date) { alert('날짜를 선택해주세요.'); return }
    setSubmitting(true)

    // churchId 구해야 함 — slug로 church 조회
    const churchRes = await fetch(`/api/sermons?slug=${slug}&limit=1`)
    // churchId를 얻기 위한 별도 방법 필요 → bulletin POST에서 slug 대신 churchId 사용
    // 우선 churchId를 구하기 위해 다른 API 활용
    const content = {
      order: order.filter(o => o.trim()),
      hymns: hymns.filter(h => h.trim()),
      sermonTitle,
      sermonSpeaker,
      sermonBible,
      announcements: announcements.filter(a => a.trim()),
      offering: { thanks: offeringThanks, mission: offeringMission },
      nextWeek: { duty: nextDuty, reader: nextReader },
    }

    // 날짜로 제목 자동 생성
    const dateObj = new Date(date)
    const title = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 주보`

    const res = await fetch('/api/bulletin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, content, slug }),  // slug 추가 필요
    })

    if (res.ok) {
      alert('주보가 저장되었습니다.')
      router.push(`/admin/${slug}/bulletin`)
    } else {
      const data = await res.json()
      alert(data.error || '저장에 실패했습니다.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📰 새 주보 작성</h1>

      {/* 날짜 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">주보 날짜 (주일)</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* 예배 순서 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">예배 순서</label>
        {order.map((o, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={o} onChange={(e) => updateField(order, setOrder, i, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg" placeholder="예: 묵도" />
            {order.length > 1 && <button onClick={() => removeField(order, setOrder, i)} className="text-red-500 px-2">✕</button>}
          </div>
        ))}
        <button onClick={() => addField(order, setOrder)} className="text-blue-600 text-sm hover:underline">+ 순서 추가</button>
      </div>

      {/* 찬송가 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">찬송가</label>
        {hymns.map((h, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={h} onChange={(e) => updateField(hymns, setHymns, i, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg" placeholder="예: 찬송가 1장" />
            {hymns.length > 1 && <button onClick={() => removeField(hymns, setHymns, i)} className="text-red-500 px-2">✕</button>}
          </div>
        ))}
        <button onClick={() => addField(hymns, setHymns)} className="text-blue-600 text-sm hover:underline">+ 찬송가 추가</button>
      </div>

      {/* 설교 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">설교 정보</label>
        <input type="text" value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="설교 제목" />
        <input type="text" value={sermonSpeaker} onChange={(e) => setSermonSpeaker(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="설교자" />
        <input type="text" value={sermonBible} onChange={(e) => setSermonBible(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" placeholder="성경 본문 (예: 창세기 12:1-4)" />
      </div>

      {/* 공지사항 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">공지사항</label>
        {announcements.map((a, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={a} onChange={(e) => updateField(announcements, setAnnouncements, i, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg" placeholder="공지사항" />
            {announcements.length > 1 && <button onClick={() => removeField(announcements, setAnnouncements, i)} className="text-red-500 px-2">✕</button>}
          </div>
        ))}
        <button onClick={() => addField(announcements, setAnnouncements)} className="text-blue-600 text-sm hover:underline">+ 공지 추가</button>
      </div>

      {/* 헌금 위원 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">헌금 위원</label>
        <input type="text" value={offeringThanks} onChange={(e) => setOfferingThanks(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="감사헌금 위원" />
        <input type="text" value={offeringMission} onChange={(e) => setOfferingMission(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" placeholder="선교헌금 위원" />
      </div>

      {/* 다음 주 */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">다음 주 안내</label>
        <input type="text" value={nextDuty} onChange={(e) => setNextDuty(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="당번" />
        <input type="text" value={nextReader} onChange={(e) => setNextReader(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" placeholder="성경 봉독자" />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {submitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
