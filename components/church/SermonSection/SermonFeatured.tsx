import type { Theme, Sermon } from '../types'

type SermonSectionProps = {
  theme: Theme
  sermons: Sermon[]
}

export function SermonFeatured({ theme, sermons }: SermonSectionProps) {
  const featured = sermons[0]
  const rest = sermons.slice(1)

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        📖 최근 설교
      </h2>

      {sermons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
          <span className="text-4xl mb-3 block">📖</span>
          <p className="text-gray-400 text-sm">아직 등록된 설교가 없습니다</p>
        </div>
      ) : (
      <>
      {/* 피처드 */}
      <div
        className="rounded-xl overflow-hidden shadow-lg mb-6"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <div className="grid sm:grid-cols-2">
          {featured.thumbnail ? (
            <div className="aspect-video md:aspect-auto">
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="hidden sm:flex items-center justify-center bg-white/10">
              <span className="text-6xl">📖</span>
            </div>
          )}
          <div className="p-6 md:p-8 text-white flex flex-col justify-center">
            <span className="text-xs font-medium opacity-70 uppercase tracking-wider mb-2">
              이번 주 설교
            </span>
            <h3 className="text-2xl font-bold mb-3">{featured.title}</h3>
            <p className="text-sm opacity-80 mb-4 line-clamp-3">{featured.content}</p>
            <div className="flex items-center gap-3 text-sm opacity-70">
              <span>{featured.speaker}</span>
              <span>·</span>
              <span>{new Date(featured.date).toLocaleDateString('ko-KR')}</span>
            </div>
            {featured.youtubeUrl && (
              <a
                href={featured.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors w-fit"
              >
                ▶ 영상 보기
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 나머지 카드 */}
      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((sermon) => (
            <div
              key={sermon.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <h4 className="font-semibold text-gray-900 line-clamp-1">{sermon.title}</h4>
              <p className="text-sm text-gray-500 mt-1">
                {sermon.speaker} · {new Date(sermon.date).toLocaleDateString('ko-KR')}
              </p>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </section>
  )
}
