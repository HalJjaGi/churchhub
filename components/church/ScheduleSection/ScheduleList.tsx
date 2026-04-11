import type { Theme } from '../types'

type Schedule = {
  id: string
  title: string
  description: string | null
  date: Date
  endDate: Date | null
  category: string
}

type Props = {
  theme: Theme
  schedules: Schedule[]
  churchSlug?: string
}

const categoryConfig: Record<string, { icon: string; bg: string; text: string }> = {
  worship: { icon: '🙏', bg: 'bg-purple-100', text: 'text-purple-700' },
  event: { icon: '🎉', bg: 'bg-green-100', text: 'text-green-700' },
  meeting: { icon: '🤝', bg: 'bg-blue-100', text: 'text-blue-700' },
  education: { icon: '📚', bg: 'bg-orange-100', text: 'text-orange-700' },
  general: { icon: '📌', bg: 'bg-gray-100', text: 'text-gray-700' },
}

export function ScheduleList({ theme, schedules, churchSlug }: Props) {
  const now = new Date()
  const upcoming = schedules
    .filter((s) => new Date(s.date) >= now)
    .slice(0, 6)

  if (upcoming.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          📅 다가오는 일정
        </h2>
        {churchSlug && (
          <a
            href={`/church/${churchSlug}/calendar`}
            className="text-sm font-medium hover:underline"
            style={{ color: theme.colors.primary }}
          >
            전체 일정 보기 →
          </a>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((schedule) => {
          const config = categoryConfig[schedule.category] || categoryConfig.general
          return (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}>
                  {config.icon} {schedule.category === 'worship' ? '예배' : schedule.category === 'event' ? '행사' : schedule.category === 'meeting' ? '모임' : schedule.category === 'education' ? '교육' : '일반'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{schedule.title}</h3>
              {schedule.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{schedule.description}</p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                {new Date(schedule.date).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
                })}
                {schedule.endDate && (
                  <span> ~ {new Date(schedule.endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
