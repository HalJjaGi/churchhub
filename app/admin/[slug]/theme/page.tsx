'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Theme = {
  colors: { primary: string; secondary: string; accent: string; background: string }
  font: 'serif' | 'sans-serif'
  layout: 'traditional' | 'modern' | 'minimal'
  sections?: {
    hero: 'image' | 'gradient' | 'text'
    sermon: 'list' | 'cards' | 'featured'
    notice: 'table' | 'cards' | 'timeline'
    footer: 'full' | 'minimal'
  }
}

const defaultSections = {
  hero: 'gradient' as const,
  sermon: 'cards' as const,
  notice: 'cards' as const,
  footer: 'full' as const,
}

const heroOptions = [
  { value: 'image', label: '이미지', desc: '큰 배경 + 그라데이션 오버레이' },
  { value: 'gradient', label: '그라데이션', desc: '화려한 색상 그라데이션' },
  { value: 'text', label: '텍스트', desc: '심플한 텍스트 중심' },
]

const sermonOptions = [
  { value: 'list', label: '리스트', desc: '세로 나열형' },
  { value: 'cards', label: '카드', desc: '카드 그리드 (썸네일 포함)' },
  { value: 'featured', label: '피처드', desc: '최신 설교 강조 + 나머지 리스트' },
]

const noticeOptions = [
  { value: 'table', label: '표', desc: '클래식 표 형태' },
  { value: 'cards', label: '카드', desc: '카드 레이아웃' },
  { value: 'timeline', label: '타임라인', desc: '시간순 타임라인' },
]

const footerOptions = [
  { value: 'full', label: '풀', desc: '교회명 + 카피라이트' },
  { value: 'minimal', label: '미니멀', desc: '한 줄 텍스트만' },
]

export default function ThemeSettingsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTheme()
  }, [slug])

  const fetchTheme = async () => {
    try {
      const res = await fetch(`/api/churches/${slug}`)
      if (res.ok) {
        const data = await res.json()
        const parsed = typeof data.theme === 'string' ? JSON.parse(data.theme) : data.theme
        setTheme({
          ...parsed,
          sections: parsed.sections || {
            hero: parsed.layout === 'traditional' ? 'image' : parsed.layout === 'minimal' ? 'text' : 'gradient',
            sermon: parsed.layout === 'traditional' ? 'list' : parsed.layout === 'minimal' ? 'list' : 'cards',
            notice: parsed.layout === 'traditional' ? 'table' : parsed.layout === 'minimal' ? 'timeline' : 'cards',
            footer: parsed.layout === 'minimal' ? 'minimal' : 'full',
          },
        })
      }
    } catch (error) {
      console.error('Error fetching theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!theme) return
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch(`/api/churches/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })

      if (res.ok) {
        setMessage('저장되었습니다.')
      } else {
        const data = await res.json()
        setMessage(data.error || '저장에 실패했습니다.')
      }
    } catch {
      setMessage('오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const updateColor = (key: string, value: string) => {
    if (!theme) return
    setTheme({ ...theme, colors: { ...theme.colors, [key]: value } })
  }

  const updateSection = (key: string, value: string) => {
    if (!theme) return
    setTheme({
      ...theme,
      sections: { ...(theme.sections || defaultSections), [key]: value },
    })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">로딩 중...</div></div>
  }

  if (!theme) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-500">테마를 불러올 수 없습니다.</div></div>
  }

  const sections = theme.sections || defaultSections

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 설정으로</Link>
              <h1 className="text-2xl font-bold text-gray-900">디자인 설정</h1>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/church/${slug}`}
                target="_blank"
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                미리보기
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {message && (
          <div className={`px-4 py-3 rounded ${message.includes('실패') || message.includes('오류') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* 프리셋 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 프리셋 테마</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              { name: 'Grace', desc: '우아한 전통', layout: 'traditional' as const, primary: '#1e3a5f', secondary: '#8b7355', accent: '#d4af37', background: '#faf8f5', font: 'serif' as const },
              { name: 'Joy', desc: '밝고 활기찬', layout: 'modern' as const, primary: '#2d5aa0', secondary: '#5ba3e0', accent: '#ff6b6b', background: '#ffffff', font: 'sans-serif' as const },
              { name: 'Peace', desc: '차분한 미니멀', layout: 'minimal' as const, primary: '#333333', secondary: '#666666', accent: '#00bcd4', background: '#ffffff', font: 'sans-serif' as const },
              { name: 'Glory', desc: '웅장한 예배', layout: 'traditional' as const, primary: '#4a1a6b', secondary: '#7b3fa0', accent: '#ffd700', background: '#1a1a2e', font: 'serif' as const },
              { name: 'Light', desc: '깔끔한 모던', layout: 'modern' as const, primary: '#0ea5e9', secondary: '#38bdf8', accent: '#f97316', background: '#f8fafc', font: 'sans-serif' as const },
            ].map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setTheme({
                    ...theme,
                    layout: preset.layout,
                    font: preset.font,
                    colors: {
                      primary: preset.primary,
                      secondary: preset.secondary,
                      accent: preset.accent,
                      background: preset.background,
                    },
                    sections: {
                      hero: preset.layout === 'traditional' ? 'image' : preset.layout === 'minimal' ? 'text' : 'gradient',
                      sermon: preset.layout === 'traditional' ? 'list' : preset.layout === 'minimal' ? 'list' : 'featured',
                      notice: preset.layout === 'traditional' ? 'table' : preset.layout === 'minimal' ? 'timeline' : 'cards',
                      footer: preset.layout === 'minimal' ? 'minimal' : 'full',
                    },
                  })
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                  <span className="font-semibold text-gray-900">{preset.name}</span>
                </div>
                <p className="text-sm text-gray-500">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 색상 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎨 색상</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { key: 'primary', label: '주요 색상' },
              { key: 'secondary', label: '보조 색상' },
              { key: 'accent', label: '강조 색상' },
              { key: 'background', label: '배경 색상' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.colors[key as keyof typeof theme.colors]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.colors[key as keyof typeof theme.colors]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 폰트 & 레이아웃 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✏️ 폰트 & 레이아웃</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">폰트</label>
              <div className="flex gap-3">
                {(['serif', 'sans-serif'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTheme({ ...theme, font: f })}
                    className={`flex-1 py-2 px-4 border rounded-lg text-sm transition ${
                      theme.font === f ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: f === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
                  >
                    {f === 'serif' ? 'Serif (전통)' : 'Sans-serif (현대)'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">레이아웃</label>
              <div className="flex gap-3">
                {(['traditional', 'modern', 'minimal'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setTheme({ ...theme, layout: l })}
                    className={`flex-1 py-2 px-3 border rounded-lg text-sm transition ${
                      theme.layout === l ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {l === 'traditional' ? '전통' : l === 'modern' ? '모던' : '미니멀'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 섹션별 스타일 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📐 섹션별 스타일</h2>
          <div className="space-y-6">
            <SectionSelector
              label="히어로"
              icon="🏔️"
              options={heroOptions}
              value={sections.hero}
              onChange={(v) => updateSection('hero', v)}
            />
            <SectionSelector
              label="설교 섹션"
              icon="🎬"
              options={sermonOptions}
              value={sections.sermon}
              onChange={(v) => updateSection('sermon', v)}
            />
            <SectionSelector
              label="공지사항 섹션"
              icon="📋"
              options={noticeOptions}
              value={sections.notice}
              onChange={(v) => updateSection('notice', v)}
            />
            <SectionSelector
              label="푸터"
              icon="📄"
              options={footerOptions}
              value={sections.footer}
              onChange={(v) => updateSection('footer', v)}
            />
          </div>
        </div>

        {/* 실시간 미리보기 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👁️ 실시간 미리보기</h2>
          <div className="rounded-lg overflow-hidden border shadow-sm">
            {/* 네비게이션 */}
            <div className="px-6 py-3 flex justify-between items-center text-white text-sm" style={{ backgroundColor: theme.colors.primary }}>
              <span className="font-bold" style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}>교회명</span>
              <div className="flex gap-3 opacity-80">
                <span>홈</span><span>설교</span><span>공지</span><span>연락처</span>
              </div>
            </div>

            {/* 히어로 */}
            {sections.hero === 'gradient' ? (
              <div className="px-6 py-12 text-white text-center" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})` }}>
                <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}>교회명 미리보기</h3>
                <p className="text-sm opacity-80">교회 설명 텍스트</p>
              </div>
            ) : sections.hero === 'text' ? (
              <div className="px-6 py-12 text-center">
                <h3 className="text-3xl font-bold mb-2" style={{ color: theme.colors.primary, fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}>교회명 미리보기</h3>
                <p className="text-sm text-gray-500">교회 설명 텍스트</p>
                <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: theme.colors.accent }} />
              </div>
            ) : (
              <div className="px-6 py-12 text-white relative" style={{ backgroundColor: theme.colors.primary }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                <div className="relative text-center">
                  <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}>교회명 미리보기</h3>
                  <p className="text-sm opacity-80">교회 설명 텍스트</p>
                </div>
              </div>
            )}

            {/* 본문 */}
            <div className="p-6 space-y-4" style={{ backgroundColor: theme.colors.background }}>
              {/* 설교 미리보기 */}
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: theme.colors.primary }}>
                  {sections.sermon === 'featured' ? '⭐ 이번 주 설교' : '최근 설교'}
                </h4>
                {sections.sermon === 'cards' ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="rounded border overflow-hidden">
                        <div className="h-8 bg-gray-200" />
                        <div className="p-1.5">
                          <div className="h-2 w-full rounded bg-gray-300 mb-1" />
                          <div className="h-1.5 w-2/3 rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sections.sermon === 'featured' ? (
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.primary }}>
                    <div className="p-3 text-white">
                      <div className="h-2 w-3/4 rounded bg-white/30 mb-1" />
                      <div className="h-1.5 w-1/2 rounded bg-white/20" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded bg-gray-200" />
                        <div className="h-1.5 w-12 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 공지 미리보기 */}
              <div>
                <h4 className="text-sm font-bold mb-2" style={{ color: theme.colors.primary }}>공지사항</h4>
                {sections.notice === 'cards' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2].map(i => (
                      <div key={i} className="rounded border p-2" style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.accent }}>
                        <div className="h-2 w-3/4 rounded bg-gray-200 mb-1" />
                        <div className="h-1.5 w-full rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                ) : sections.notice === 'timeline' ? (
                  <div className="relative pl-6">
                    <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ backgroundColor: theme.colors.secondary + '40' }} />
                    {[1,2].map(i => (
                      <div key={i} className="relative mb-2">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-white" style={{ borderColor: theme.colors.accent }} />
                        <div className="h-2 w-3/4 rounded bg-gray-200 mb-0.5" />
                        <div className="h-1.5 w-full rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {[1,2].map(i => (
                      <div key={i}>
                        <div className="h-2 w-2/3 rounded bg-gray-200 mb-0.5" />
                        <div className="h-1.5 w-full rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 푸터 */}
            {sections.footer === 'full' ? (
              <div className="px-4 py-3 text-white text-center text-xs" style={{ backgroundColor: theme.colors.primary }}>
                <p className="font-medium mb-0.5">교회명</p>
                <p className="opacity-60">© 2026 All rights reserved.</p>
              </div>
            ) : (
              <div className="px-4 py-2 text-center text-xs text-gray-400">
                © 2026 교회명
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionSelector({ label, icon, options, value, onChange }: {
  label: string
  icon: string
  options: { value: string; label: string; desc: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`p-3 border rounded-lg text-left transition ${
              value === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`text-sm font-medium ${value === opt.value ? 'text-blue-700' : 'text-gray-900'}`}>
              {opt.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
