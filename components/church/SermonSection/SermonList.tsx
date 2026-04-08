import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
  churchSlug: string
}

export function SermonList({ theme, sermons, churchSlug }: SermonSectionProps) {
  if (sermons.length === 0) return null

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        최근 설교
      </h2>
      <div className="space-y-4">
        {sermons.map((sermon) => (
          <div key={sermon.id} className="border-b pb-4 last:border-0">
            <h3 className="text-lg font-semibold text-gray-900">{sermon.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {sermon.speaker} · {new Date(sermon.date).toLocaleDateString('ko-KR')}
            </p>
            {sermon.content && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{sermon.content}</p>
            )}
          </div>
        ))}
      </div>
      <a
        href={`/church/${churchSlug}/sermons`}
        className="inline-block mt-4 text-sm font-medium"
        style={{ color: theme.colors.accent }}
      >
        전체 설교 보기 →
      </a>
    </section>
  )
}
