'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type WorshipTime = { label: string; time: string; day: string }

export default function WorshipPage() {
  const params = useParams()
  const slug = params.slug as string
  const [times, setTimes] = useState<WorshipTime[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchWorship() }, [slug])

  const fetchWorship = async () => {
    try {
      const res = await fetch(`/api/churches/${slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.worshipTimes) {
          setTimes(JSON.parse(data.worshipTimes))
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const addTime = () => setTimes([...times, { label: '', time: '', day: '' }])
  const removeTime = (i: number) => setTimes(times.filter((_, idx) => idx !== i))
  const updateTime = (i: number, key: keyof WorshipTime, value: string) => {
    const updated = [...times]
    updated[i] = { ...updated[i], [key]: value }
    setTimes(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/churches/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worshipTimes: JSON.stringify(times) }),
      })
      if (res.ok) setMessage('저장되었습니다.')
      else { const d = await res.json(); setMessage(d.error || '저장 실패') }
    } catch { setMessage('오류 발생') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">로딩 중...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 설정으로</Link>
              <h1 className="text-2xl font-bold text-gray-900">예배 시간 관리</h1>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-4">
        {message && (
          <div className={`px-4 py-3 rounded ${message.includes('실패') || message.includes('오류') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {message}
          </div>
        )}

        {times.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">등록된 예배 시간이 없습니다.</p>
            <button onClick={addTime} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              + 예배 시간 추가
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {times.map((wt, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input type="text" value={wt.label} onChange={(e) => updateTime(i, 'label', e.target.value)}
                    placeholder="예배명 (예: 주일예배)" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={wt.day} onChange={(e) => updateTime(i, 'day', e.target.value)}
                    placeholder="요일 (예: 일요일)" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={wt.time} onChange={(e) => updateTime(i, 'time', e.target.value)}
                    placeholder="시간 (예: 오전 11:00)" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={() => removeTime(i)} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                  ✕
                </button>
              </div>
            ))}
            <div className="p-4">
              <button onClick={addTime} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                + 예배 시간 추가
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
