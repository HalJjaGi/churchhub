import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Theme } from '@/components/church/types'
import { defaultTheme } from '@/components/church/types'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const church = await prisma.church.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      theme: true,
      intro: true,
      vision: true,
      history: true,
      pastorName: true,
      pastorMessage: true,
      pastorImage: true,
    },
  })

  if (!church) notFound()

  let theme: Theme
  try { theme = JSON.parse(church.theme) } catch { theme = defaultTheme }

  const hasContent = church.intro || church.vision || church.history || church.pastorName

  if (!hasContent) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="py-12 text-center" style={{ backgroundColor: theme.colors.primary }}>
          <div className="max-w-4xl mx-auto px-4">
            <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white">← 교회 메인</Link>
            <h1 className="text-4xl font-bold text-white mt-4" style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}>
              {church.name}
            </h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
          아직 소개 내용이 등록되지 않았습니다.
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50" style={{ backgroundColor: theme.colors.background }}>
      <header className="py-16 text-white" style={{ backgroundColor: theme.colors.primary }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white">← 교회 메인</Link>
          <h1
            className="text-4xl font-bold mt-4 mb-2"
            style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}
          >
            {church.name}
          </h1>
          {church.description && <p className="text-lg opacity-80">{church.description}</p>}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* 교회 소개 */}
        {church.intro && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>교회 소개</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {church.intro}
            </div>
          </section>
        )}

        {/* 비전 */}
        {church.vision && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>비전</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {church.vision}
            </div>
          </section>
        )}

        {/* 역사 */}
        {church.history && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary }}>역사</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {church.history}
            </div>
          </section>
        )}

        {/* 담임목사 */}
        {church.pastorName && (
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>담임목사</h2>
            <div className="flex flex-col md:flex-row gap-8">
              {church.pastorImage && (
                <div className="flex-shrink-0">
                  <img
                    src={church.pastorImage}
                    alt={church.pastorName}
                    className="w-48 h-48 object-cover rounded-lg shadow"
                  />
                </div>
              )}
              <div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: theme.colors.primary, fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}
                >
                  {church.pastorName}
                </h3>
                {church.pastorMessage && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {church.pastorMessage}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
