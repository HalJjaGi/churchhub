'use client'

import { useState } from 'react'

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
}

export function CalendarGrid({ year, month, schedules, categoryColors, categoryDotColors }: Props) {
  const [selected, setSelected] = useState<Schedule | null>(null)

  // 월의 첫째 날과 마지막 날
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDayOfWeek = firstDay.getDay() // 0=Sun
  const totalDays = lastDay.getDate()

  // 일정을 날짜별로 매핑
  const schedulesByDay: Record<number, Schedule[]> = {}
  schedules.forEach((s) => {
    const d = new Date(s.date)
    const day = d.getDate()
    if (!schedulesByDay[day]) schedulesByDay[day] = []
    schedulesByDay[day].push(s)

    // 다일정(multi-day) 처리
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

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {weekdays.map((wd, i) => (
            <div
              key={wd}
              className={`py-3 text-center text-sm font-semibold ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[100px] bg-gray-50 border-b border-r border-gray-100 p-1" />
            }

            const daySchedules = schedulesByDay[day] || []
            const todayHighlight = isToday(day)

            return (
              <div
                key={day}
                className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${
                  todayHighlight ? 'bg-blue-50' : 'hover:bg-gray-50'
                } transition`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  todayHighlight
                    ? 'w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full'
                    : (idx % 7 === 0 ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700')
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((s) => {
                    const dotColor = categoryDotColors[s.category] || 'bg-gray-400'
                    return (
                      <button
                        key={`${day}-${s.id}`}
                        onClick={() => setSelected(selected?.id === s.id ? null : s)}
                        className="w-full text-left"
                      >
                        <div className={`text-xs truncate px-1.5 py-0.5 rounded ${
                          categoryColors[s.category]?.bg || 'bg-gray-100'
                        } ${
                          categoryColors[s.category]?.text || 'text-gray-700'
                        }`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${dotColor}`} />
                          {s.title}
                        </div>
                      </button>
                    )
                  })}
                  {daySchedules.length > 3 && (
                    <p className="text-xs text-gray-400 pl-1">+{daySchedules.length - 3}개 더</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${categoryDotColors[selected.category] || 'bg-gray-400'}`} />
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              categoryColors[selected.category]?.bg || 'bg-gray-100'
            } ${
              categoryColors[selected.category]?.text || 'text-gray-700'
            }`}>
              {categoryColors[selected.category]?.label || '일반'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {new Date(selected.date).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
            })}
            {selected.endDate && (
              <span> ~ {new Date(selected.endDate).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}</span>
            )}
          </p>
          {selected.description && (
            <p className="text-gray-700 leading-relaxed">{selected.description}</p>
          )}
          <button
            onClick={() => setSelected(null)}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600"
          >
            닫기
          </button>
        </div>
      )}
    </>
  )
}
