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
      setMessage(data.message || '구독 신청이 완료되었습니다! 🎉')
      setEmail('')
    } else {
      setMessage(data.error || '구독 신청에 실패했습니다.')
    }
    setSubmitting(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📬</span>
          <h3 className="text-xl font-bold">소식 구독</h3>
        </div>
        <p className="text-white/80 text-sm mb-5">
          교회 소식과 새로운 설교 소식을 이메일로 받아보세요.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 bg-white/15 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm min-h-[44px]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-white/90 disabled:opacity-50 whitespace-nowrap transition-colors min-h-[44px]"
          >
            {submitting ? '신청 중...' : '구독하기'}
          </button>
        </form>
        {message && (
          <p className="mt-3 text-sm text-white/90 bg-white/10 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
