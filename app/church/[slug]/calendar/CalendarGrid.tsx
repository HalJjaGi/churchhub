'use client'

import { useState, useMemo } from 'react'

type Schedule = {
  id: string
  title: string
  description: string | null
  date: string
  endDate: string | null
  category: string
}

type Props = {
  year: number
  month: number
  schedules: Schedule[]
  categoryColors: Record<string, { bg: string; text: string; label: string }>
  categoryDotColors: Record<string, string>
  activeCategories: string[]
}

export function CalendarGrid({ year, month, schedules, categoryColors, categoryDotColors, activeCategories }: Props) {
  const [selected, setSelected] = useState<Schedule | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [weekOffset, setWeekOffset] = useState(0)

  // 카테고리 필터
  const filtered = schedules.filter((s) => activeCategories.length === 0 || activeCategories.includes(s.category))

  // 월의 첫째 날과 마지막 날
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDayOfWeek = firstDay.getDay()
  const totalDays = lastDay.getDate()

  // 일정을 날짜별로 매핑
  const schedulesByDay: Record<number, Schedule[]> = {}
  filtered.forEach((s) => {
    const d = new Date(s.date)
    const day = d.getDate()
    if (!schedulesByDay[day]) schedulesByDay[day] = []
    schedulesByDay[day].push(s)

    if (s.endDate) {
      const end = new Date(s.endDate)
      let current = new Date(d)
      current.setDate(current.getDate() + 1)
      while (current <= end) {
        if (current.getMonth() === month - 1 && current.getFullYear() === year) {
          const dayNum = current.getDate()
          if (!schedulesByDay[dayNum]) schedulesByDay[dayNum] = []
          schedulesByDay[dayNum].push(s)
        }
        current.setDate(current.getDate() + 1)
      }
    }
  })

  // 다가오는 일정 (오늘 기준 30일)
  const upcoming = useMemo(() => {
    const now = new Date()
    return filtered
      .filter((s) => new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [filtered])

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  // 주간 뷰: 현재 주 계산
  const weekStart = useMemo(() => {
    const d = new Date(year, month - 1, 1)
    d.setDate(d.getDate() + weekOffset * 7)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    return d
  }, [year, month, weekOffset])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day

  const isTodayDate = (d: Date) =>
    today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth() && today.getDate() === d.getDate()

  return (
    <>
      <div className="flex gap-6">
        {/* 메인 캘린더 */}
        <div className="flex-1">
          {/* 뷰 토글 */}
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setView('month')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              월간
            </button>
            <button onClick={() => setView('week')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              주간
            </button>
            {view === 'week' && (
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => setWeekOffset(weekOffset - 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">◀</button>
                <button onClick={() => setWeekOffset(0)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">이번주</button>
                <button onClick={() => setWeekOffset(weekOffset + 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">▶</button>
              </div>
            )}
          </div>

          {view === 'month' ? (
            /* 월간 뷰 */
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b">
                {weekdays.map((wd, i) => (
                  <div key={wd} className={`py-3 text-center text-sm font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
                    {wd}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100 p-1" />
                  }
                  const daySchedules = schedulesByDay[day] || []
                  const todayHL = isToday(day)
                  return (
                    <div key={day} className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${todayHL ? 'bg-blue-50' : 'hover:bg-gray-50'} transition`}>
                      <div className={`text-sm font-medium mb-1 ${todayHL ? 'w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full' : (idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700')}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 3).map((s) => {
                          const dotColor = categoryDotColors[s.category] || 'bg-gray-400'
                          return (
                            <button key={`${day}-${s.id}`} onClick={() => setSelected(selected?.id === s.id ? null : s)} className="w-full text-left">
                              <div className={`text-xs truncate px-1.5 py-0.5 rounded ${categoryColors[s.category]?.bg || 'bg-gray-100'} ${categoryColors[s.category]?.text || 'text-gray-700'}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${dotColor}`} />
                                {s.title}
                              </div>
                            </button>
                          )
                        })}
                        {daySchedules.length > 3 && <p className="text-xs text-gray-400 pl-1">+{daySchedules.length - 3}개 더</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* 주간 뷰 */
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((d, i) => {
                  const todayHL = isTodayDate(d)
                  return (
                    <div key={i} className={`py-3 text-center border-r last:border-r-0 ${todayHL ? 'bg-blue-50' : ''}`}>
                      <div className="text-xs text-gray-500">{weekdays[i]}</div>
                      <div className={`text-lg font-bold ${todayHL ? 'text-blue-600' : 'text-gray-700'}`}>{d.getDate()}</div>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDays.map((d, i) => {
                  const daySchedules = d.getMonth() === month - 1 && d.getFullYear() === year
                    ? (schedulesByDay[d.getDate()] || [])
                    : []
                  return (
                    <div key={i} className="border-r last:border-r-0 p-2 space-y-2">
                      {daySchedules.map((s) => (
                        <button key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)} className="w-full text-left">
                          <div className={`text-xs p-2 rounded-lg ${categoryColors[s.category]?.bg || 'bg-gray-100'} ${categoryColors[s.category]?.text || 'text-gray-700'}`}>
                            <div className="font-medium">{s.title}</div>
                            <div className="text-[10px] opacity-70 mt-0.5">
                              {new Date(s.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 다가오는 일정 사이드바 */}
        <div className="hidden lg:block w-72">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">📌 다가오는 일정</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400">다가오는 일정이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <button key={s.id} onClick={() => setSelected(s)} className="w-full text-left hover:bg-gray-50 rounded-lg p-2 transition">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryDotColors[s.category] || 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 truncate">{s.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-4">
                      {new Date(s.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상세 패널 */}
      {selected && (
        <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${categoryDotColors[selected.category] || 'bg-gray-400'}`} />
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[selected.category]?.bg || 'bg-gray-100'} ${categoryColors[selected.category]?.text || 'text-gray-700'}`}>
              {categoryColors[selected.category]?.label || '일반'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {new Date(selected.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            {selected.endDate && (
              <span> ~ {new Date(selected.endDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
          </p>
          {selected.description && <p className="text-gray-700 leading-relaxed">{selected.description}</p>}
          <button onClick={() => setSelected(null)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">닫기</button>
        </div>
      )}
    </>
  )
}
