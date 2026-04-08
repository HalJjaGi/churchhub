import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
}

export function SermonFeatured({ theme, sermons }: SermonSectionProps) {
  if (sermons.length === 0) return null

  const featured = sermons[0]
  const rest = sermons.slice(1)

  return (
    <section>
      {/* 피처드 설교 */}
      <div
        className="rounded-xl overflow-hidden shadow-lg mb-8"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <div className="grid md:grid-cols-2">
          {featured.thumbnail && (
            <div className="aspect-video md:aspect-auto">
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8 text-white flex flex-col justify-center">
            <span className="text-sm font-medium opacity-80 mb-2">이번 주 설교</span>
            <h2 className="text-3xl font-bold mb-3">{featured.title}</h2>
            <p className="opacity-90 mb-2">{featured.speaker}</p>
            <p className="text-sm opacity-70">
              {new Date(featured.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {featured.youtubeUrl && (
              <a
                href={featured.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium"
              >
                ▶ 설교 영상 보기
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 나머지 설교 */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {rest.map((sermon) => (
            <div key={sermon.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div
                className="w-2 h-12 rounded-full flex-shrink-0"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{sermon.title}</h3>
                <p className="text-sm text-gray-500">{sermon.speaker}</p>
              </div>
              <time className="text-sm text-gray-400 flex-shrink-0">
                {new Date(sermon.date).toLocaleDateString('ko-KR')}
              </time>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
