import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function NoticeDetailPage({
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

  const notice = await prisma.notice.findUnique({
    where: { id },
  })

  if (!notice) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

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
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-white rounded-xl shadow-sm p-8">
          {/* 메타 */}
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <time>
              {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </time>
            <span>·</span>
            <span>공지사항</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">{notice.title}</h1>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </article>

        {/* 다른 공지 */}
        <div className="mt-8">
          <Link
            href={`/church/${slug}/notices`}
            className="inline-flex items-center gap-1 hover:underline"
            style={{ color: colors.primary }}
          >
            ← 공지 목록으로
          </Link>
        </div>
      </div>
    </main>
  )
}
