import type { Theme } from '../types'

type WorshipTime = {
  label: string
  time: string
  day: string
}

type Props = {
  theme: Theme
  worshipTimes: string | null
}

export function WorshipSchedule({ theme, worshipTimes }: Props) {
  if (!worshipTimes) return null

  let times: WorshipTime[]
  try {
    times = JSON.parse(worshipTimes)
  } catch {
    return null
  }

  if (times.length === 0) return null

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        🕐 예배 시간
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {times.map((wt, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg border"
            style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.accent }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {wt.day.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{wt.label}</div>
              <div className="text-sm text-gray-500">{wt.day} · {wt.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
