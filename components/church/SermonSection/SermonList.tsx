import Link from 'next/link'
import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
  churchSlug: string
}

export function SermonList({ theme, sermons, churchSlug }: SermonSectionProps) {
  if (sermons.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          📖 최근 설교
        </h2>
        <Link
          href={`/church/${churchSlug}/sermons`}
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: theme.colors.secondary || theme.colors.primary }}
        >
          전체 보기 →
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {sermons.map((sermon) => (
          <Link
            key={sermon.id}
            href={`/church/${churchSlug}/sermons/${sermon.id}`}
            className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {new Date(sermon.date).getDate()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {sermon.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {sermon.speaker} · {new Date(sermon.date).toLocaleDateString('ko-KR')}
              </p>
              {sermon.content && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{sermon.content}</p>
              )}
            </div>
            {sermon.youtubeUrl && (
              <span className="px-2 py-1 bg-red-50 text-red-500 text-xs font-medium rounded shrink-0">
                ▶ 영상
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
