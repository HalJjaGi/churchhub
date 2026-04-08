'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Church = {
  id: string
  slug: string
  name: string
  description: string | null
  theme: {
    colors: {
      primary: string
      secondary: string
      accent: string
      background: string
    }
    font: 'serif' | 'sans-serif'
    layout: 'traditional' | 'modern' | 'minimal'
  }
  modules: {
    sermon: boolean
    notice: boolean
    community: boolean
    gallery: boolean
    donation: boolean
  }
  plan: string
}

export default function ChurchAdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchChurch()
  }, [slug])

  const fetchChurch = async () => {
    try {
      const res = await fetch(`/api/churches/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setChurch(data)
      } else {
        alert('교회를 찾을 수 없습니다.')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching church:', error)
      alert('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!church) return
    
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch(`/api/churches/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: church.name,
          description: church.description,
          theme: church.theme,
          modules: church.modules,
        }),
      })
      
      if (res.ok) {
        setMessage('저장되었습니다!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert('저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Error saving church:', error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!church) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">교회를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← 뒤로
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {church.name} 설정
              </h1>
            </div>
            <div className="flex gap-4">
              <Link
                href={`/church/${church.slug}`}
                target="_blank"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {message}
          </div>
        )}

        {/* Content Management */}
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            콘텐츠 관리
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href={`/admin/${slug}/sermons`}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">설교 관리</div>
                <div className="text-sm text-gray-500">설교 추가, 수정, 삭제</div>
              </div>
            </Link>
            <Link
              href={`/admin/${slug}/notices`}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">공지사항</div>
                <div className="text-sm text-gray-500">공지 추가, 수정, 삭제</div>
              </div>
            </Link>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">갤러리</div>
                <div className="text-sm text-gray-500">준비 중</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              기본 정보
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  교회 이름
                </label>
                <input
                  type="text"
                  value={church.name}
                  onChange={(e) => setChurch({ ...church, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  value={church.description || ''}
                  onChange={(e) => setChurch({ ...church, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              테마 설정
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주요 색상
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={church.theme.colors.primary}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, primary: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={church.theme.colors.primary}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, primary: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보조 색상
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={church.theme.colors.secondary}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, secondary: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={church.theme.colors.secondary}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, secondary: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강조 색상
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={church.theme.colors.accent}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, accent: e.target.value }
                      }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={church.theme.colors.accent}
                    onChange={(e) => setChurch({
                      ...church,
                      theme: {
                        ...church.theme,
                        colors: { ...church.theme.colors, accent: e.target.value }
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  폰트 스타일
                </label>
                <select
                  value={church.theme.font}
                  onChange={(e) => setChurch({
                    ...church,
                    theme: {
                      ...church.theme,
                      font: e.target.value as 'serif' | 'sans-serif'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="serif">Serif (전통적)</option>
                  <option value="sans-serif">Sans-serif (현대적)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Module Settings */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              모듈 설정
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(church.modules).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900">
                      {key === 'sermon' && '설교'}
                      {key === 'notice' && '공지사항'}
                      {key === 'community' && '커뮤니티'}
                      {key === 'gallery' && '갤러리'}
                      {key === 'donation' && '헌금'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {key === 'sermon' && '설교 콘텐츠 표시'}
                      {key === 'notice' && '공지사항 표시'}
                      {key === 'community' && '커뮤니티 기능'}
                      {key === 'gallery' && '사진 갤러리'}
                      {key === 'donation' && '온라인 헌금'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setChurch({
                        ...church,
                        modules: {
                          ...church.modules,
                          [key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
