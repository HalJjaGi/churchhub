import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
  churchSlug: string
}

export function SermonCards({ theme, sermons, churchSlug }: SermonSectionProps) {
  if (sermons.length === 0) return null

  return (
    <section>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        최근 설교
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sermons.map((sermon) => (
          <div
            key={sermon.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {sermon.thumbnail && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={sermon.thumbnail}
                  alt={sermon.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{sermon.title}</h3>
              <p className="text-sm text-gray-500">
                {sermon.speaker} · {new Date(sermon.date).toLocaleDateString('ko-KR')}
              </p>
              {sermon.content && (
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{sermon.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <a
        href={`/church/${churchSlug}/sermons`}
        className="inline-block mt-6 text-sm font-medium"
        style={{ color: theme.colors.accent }}
      >
        전체 설교 보기 →
      </a>
    </section>
  )
}
