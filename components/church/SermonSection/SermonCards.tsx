import Link from 'next/link'
import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
  churchSlug: string
}

export function SermonCards({ theme, sermons, churchSlug }: SermonSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          📖 최근 설교
        </h2>
        {sermons.length > 0 && (
          <Link
            href={`/church/${churchSlug}/sermons`}
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: theme.colors.secondary || theme.colors.primary }}
          >
            전체 보기 →
          </Link>
        )}
      </div>
      {sermons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
          <span className="text-4xl mb-3 block">📖</span>
          <p className="text-gray-400 text-sm">아직 등록된 설교가 없습니다</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon, i) => (
            <Link
              key={sermon.id}
              href={`/church/${churchSlug}/sermons/${sermon.id}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {sermon.thumbnail ? (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.primary}10` }}
                >
                  <span className="text-4xl">📖</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {sermon.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: theme.colors.secondary || theme.colors.primary }}
                  >
                    {sermon.speaker}
                  </span>
                  <span>{new Date(sermon.date).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
