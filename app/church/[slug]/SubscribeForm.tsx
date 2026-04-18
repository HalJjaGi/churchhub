'use client'

import { useState } from 'react'

export default function SubscribeForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setMessage('')

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, slug }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessage(data.message || '구독 신청이 완료되었습니다!')
      setEmail('')
    } else {
      setMessage(data.error || '구독 신청에 실패했습니다.')
    }
    setSubmitting(false)
  }

  return (
    <div className="mt-12 p-6 bg-gray-50 rounded-xl">
      <h3 className="text-lg font-semibold mb-2">📬 소식 구독</h3>
      <p className="text-sm text-gray-600 mb-4">교회 소식을 이메일로 받아보세요.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email" placeholder="이메일 주소" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
        >
          {submitting ? '신청 중...' : '구독하기'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
