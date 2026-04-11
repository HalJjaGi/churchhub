'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarGrid } from './CalendarGrid'

type Schedule = {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  category: string
}

type Props = {
  slug: string
  churchName: string
  colors: { primary: string }
  year: number
  month: number
  schedules: Schedule[]
  categoryColors: Record<string, { bg: string; text: string; label: string }>
  categoryDotColors: Record<string, string>
  prevMonth: { year: number; month: number }
  nextMonth: { year: number; month: number }
  monthNames: string[]
}

export default function CalendarClient({
  slug, churchName, colors, year, month, schedules,
  categoryColors, categoryDotColors, prevMonth, nextMonth, monthNames,
}: Props) {
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const now = new Date()

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  // 모바일: 날짜별 리스트
  const schedulesByDate = schedules.reduce<Record<string, Schedule[]>>((acc, s) => {
    const key = new Date(s.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href={`/church/${slug}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
                ← {churchName}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📅 교회 일정</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* 오늘 버튼 */}
              <Link
                href={`/church/${slug}/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                오늘
              </Link>
              <Link href={`/church/${slug}/calendar?year=${prevMonth.year}&month=${prevMonth.month}`} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition">◀</Link>
              <span className="text-lg font-bold text-gray-900 min-w-[120px] text-center">{year}년 {monthNames[month - 1]}</span>
              <Link href={`/church/${slug}/calendar?year=${nextMonth.year}&month=${nextMonth.month}`} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition">▶</Link>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(categoryColors).map(([key, val]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  activeCategories.includes(key) ? 'ring-2 ring-offset-1' : 'opacity-60'
                } ${val.bg} ${val.text}`}
                style={activeCategories.includes(key) ? { boxShadow: `0 0 0 2px ${colors.primary}` } : {}}
              >
                {val.label}
              </button>
            ))}
            {activeCategories.length > 0 && (
              <button onClick={() => setActiveCategories([])} className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-700">전체해제</button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 데스크톱: 캘린더 그리드 */}
        <div className="hidden md:block">
          <CalendarGrid
            year={year}
            month={month}
            schedules={schedules}
            categoryColors={categoryColors}
            categoryDotColors={categoryDotColors}
            activeCategories={activeCategories}
          />
        </div>

        {/* 모바일: 날짜별 리스트 */}
        <div className="md:hidden">
          {schedules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">이 달에 등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(schedulesByDate).map(([dateStr, daySchedules]) => (
                <div key={dateStr}>
                  <h3 className="text-sm font-bold text-gray-500 mb-2">{dateStr}</h3>
                  <div className="space-y-2">
                    {daySchedules.map((s) => {
                      const config = categoryColors[s.category] || categoryColors.general
                      const dot = categoryDotColors[s.category] || 'bg-gray-400'
                      return (
                        <details key={s.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                          <summary className="p-4 cursor-pointer hover:bg-gray-50 transition list-none">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{s.title}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
                            </div>
                          </summary>
                          {s.description && (
                            <div className="px-4 pb-4 text-sm text-gray-600 border-t">
                              <p className="pt-3">{s.description}</p>
                            </div>
                          )}
                        </details>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href={`/church/${slug}`} className="hover:underline" style={{ color: colors.primary }}>← 교회 메인으로</Link>
        </div>
      </div>
    </main>
  )
}
