import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarGrid } from './CalendarGrid'

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  worship: { bg: 'bg-orange-100', text: 'text-orange-700', label: '예배' },
  event: { bg: 'bg-blue-100', text: 'text-blue-700', label: '행사' },
  meeting: { bg: 'bg-green-100', text: 'text-green-700', label: '모임' },
  education: { bg: 'bg-purple-100', text: 'text-purple-700', label: '교육' },
  general: { bg: 'bg-gray-100', text: 'text-gray-700', label: '일반' },
}

const categoryDotColors: Record<string, string> = {
  worship: 'bg-orange-400',
  event: 'bg-blue-400',
  meeting: 'bg-green-400',
  education: 'bg-purple-400',
  general: 'bg-gray-400',
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { year: yearStr, month: monthStr } = await searchParams

  const church = await prisma.church.findUnique({
    where: { slug },
    include: { schedules: { orderBy: { date: 'asc' } } },
  })
  if (!church) notFound()

  const now = new Date()
  const year = yearStr ? parseInt(yearStr) : now.getFullYear()
  const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1

  // 해당 월 범위
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  // 해당 월 일정 필터링
  const monthSchedules = church.schedules.filter((s) => {
    const d = new Date(s.date)
    return d >= monthStart && d < monthEnd
  })

  // 이전/다음 달
  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href={`/church/${slug}`} className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block">
                ← {church.name}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📅 교회 일정</h1>
            </div>
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href={`/church/${slug}/calendar?year=${prevMonth.year}&month=${prevMonth.month}`}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                ◀
              </Link>
              <span className="text-lg font-bold text-gray-900 min-w-[120px] text-center">
                {year}년 {monthNames[month - 1]}
              </span>
              <Link
                href={`/church/${slug}/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                ▶
              </Link>
            </div>
          </div>
          {/* Category Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(categoryColors).map(([key, val]) => (
              <span key={key} className={`text-xs px-2 py-1 rounded-full font-medium ${val.bg} ${val.text}`}>
                {val.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Desktop: Calendar Grid */}
        <div className="hidden md:block">
          <CalendarGrid
            year={year}
            month={month}
            schedules={monthSchedules.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              date: s.date.toISOString(),
              endDate: s.endDate?.toISOString() ?? null,
              category: s.category,
            }))}
            categoryColors={categoryColors}
            categoryDotColors={categoryDotColors}
          />
        </div>

        {/* Mobile: Schedule List */}
        <div className="md:hidden">
          {monthSchedules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">이 달에 등록된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthSchedules.map((s) => {
                const config = categoryColors[s.category] || categoryColors.general
                return (
                  <details
                    key={s.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <summary className="p-4 cursor-pointer hover:bg-gray-50 transition list-none">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryDotColors[s.category] || 'bg-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{s.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(s.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                            {s.endDate && (
                              <span> ~ {new Date(s.endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                            )}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
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
          )}
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href={`/church/${slug}`} className="text-blue-600 hover:text-blue-800 text-sm">
            ← 교회 메인으로
          </Link>
        </div>
      </div>
    </main>
  )
}
