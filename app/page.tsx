'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'theme' | 'module'>('theme')
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [modules, setModules] = useState({
    sermon: true,
    calendar: true,
    gallery: false,
    contact: true,
    announcements: true,
  })

  const themes = [
    { id: 'traditional', name: '전통', color: '#8B4513' },
    { id: 'modern', name: '모던', color: '#2d5aa0' },
    { id: 'minimal', name: '미니멀', color: '#333333' },
  ]

  const moduleList = [
    { id: 'sermon', name: '설교', description: '설교 영상' },
    { id: 'announcements', name: '공지사항', description: '교회 공지' },
    { id: 'calendar', name: '캘린더', description: '교회 일정' },
    { id: 'gallery', name: '갤러리', description: '사진 갤러리' },
    { id: 'contact', name: '오시는 길', description: '연락처' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">🙏 ChurchHub</h1>
            <nav className="flex gap-4">
              <Link href="/admin" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                관리자
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">교회 웹사이트를 쉽게 만드세요</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ChurchHub은 교회를 위한 웹사이트 플랫폼입니다. 전통적이거나 현대적인 디자인으로 교회의 특성에 맞는 웹사이트를 만들 수 있습니다.
          </p>
        </div>

        {/* 탭 UI */}
        <div className="mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('theme')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'theme'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              테마 선택
            </button>
            <button
              onClick={() => setActiveTab('module')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'module'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              모듈 관리
            </button>
          </div>
        </div>

        {/* 테마 선택 탭 */}
        {activeTab === 'theme' && (
          <>
            {/* 현재 선택된 테마 표시 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                현재 선택된 테마: <span className="font-semibold text-blue-600">
                  {themes.find(t => t.id === selectedTheme)?.name}
                </span>
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`cursor-pointer border-2 rounded-lg p-6 transition ${
                    selectedTheme === theme.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full h-32 rounded mb-4"
                    style={{ backgroundColor: theme.color }}
                  />
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{theme.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTheme(theme.id)
                      }}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      선택
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 모듈 관리 탭 */}
        {activeTab === 'module' && (
          <div className="space-y-4 mb-12">
            {moduleList.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{module.name}</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
                <button
                  onClick={() =>
                    setModules((prev) => ({
                      ...prev,
                      [module.id]: !prev[module.id as keyof typeof prev],
                    }))
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    modules[module.id as keyof typeof modules]
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={modules[module.id as keyof typeof modules]}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                      modules[module.id as keyof typeof modules]
                        ? 'left-7'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 교회 카드 */}
        <h3 className="text-2xl font-bold mb-6">미리보기</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/church/demo"
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">데모 교회</h3>
            <p className="text-gray-600 mb-4">샘플 교회 페이지</p>
            <span className="text-blue-600 hover:text-blue-800">미리보기 →</span>
          </Link>

          <Link
            href="/church/sae-church"
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">새교회</h3>
            <p className="text-gray-600 mb-4">따뜻한 공동체</p>
            <span className="text-blue-600 hover:text-blue-800">방문하기 →</span>
          </Link>

          <Link
            href="/church/peace-church"
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">평화교회</h3>
            <p className="text-gray-600 mb-4">평화로운 예배</p>
            <span className="text-blue-600 hover:text-blue-800">방문하기 →</span>
          </Link>

          <Link
            href="/church/hope-church"
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">소망교회</h3>
            <p className="text-gray-600 mb-4">소망을 전하는 교회</p>
            <span className="text-blue-600 hover:text-blue-800">방문하기 →</span>
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">© 2026 ChurchHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
