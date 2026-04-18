import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params

  const church = await prisma.church.findUnique({
    where: { slug },
    select: { name: true, theme: true },
  })

  if (!church) notFound()

  const sermon = await prisma.sermon.findUnique({
    where: { id },
  })

  if (!sermon) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

  // YouTube URL → embed URL 변환
  let embedUrl: string | null = null
  if (sermon.youtubeUrl) {
    const match = sermon.youtubeUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="py-12 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href={`/church/${slug}`}
            className="text-white/70 text-sm hover:text-white transition"
          >
            ← {church.name}
          </Link>
          <Link
            href={`/church/${slug}/sermons`}
            className="text-white/70 text-sm hover:text-white transition ml-3"
          >
            설교 목록
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* YouTube 임베드 */}
        {embedUrl && (
          <div className="mb-8 aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={embedUrl}
              title={sermon.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* 썸네일 (YouTube 없을 때) */}
        {!embedUrl && sermon.thumbnail && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={sermon.thumbnail}
              alt={sermon.title}
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* 메타 정보 */}
        <article className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <time>
              {new Date(sermon.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </time>
            <span>·</span>
            <span>{sermon.speaker}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{sermon.title}</h1>

          {/* 시리즈 & 성경 구절 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sermon.series && (
              <span className="inline-block text-sm px-3 py-1 rounded-full text-white" style={{ backgroundColor: colors.primary }}>
                {sermon.series}
              </span>
            )}
            {sermon.bibleRef && (
              <span className="inline-block text-sm px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                📕 {sermon.bibleRef}
              </span>
            )}
          </div>

          {/* 태그 */}
          {sermon.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {sermon.tags.split(',').map((tag, i) => (
                <a
                  key={i}
                  href={`/church/${slug}/sermons?search=${tag.trim()}`}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition"
                >
                  #{tag.trim()}
                </a>
              ))}
            </div>
          )}

          {sermon.content && (
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {sermon.content}
            </div>
          )}

          {/* YouTube 링크 */}
          {sermon.youtubeUrl && !embedUrl && (
            <div className="mt-8 pt-6 border-t">
              <a
                href={sermon.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                🎬 YouTube에서 보기
              </a>
            </div>
          )}
        </article>

        {/* 뒤로가기 */}
        <div className="mt-8">
          <Link
            href={`/church/${slug}/sermons`}
            className="inline-flex items-center gap-1 hover:underline"
            style={{ color: colors.primary }}
          >
            ← 설교 목록으로
          </Link>
        </div>
      </div>
    </main>
  )
}
