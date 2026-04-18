import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function NoticesPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const page = parseInt(sp.page || '1', 10)
  const search = sp.search || ''
  const limit = 10

  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true, name: true, theme: true },
  })

  if (!church) notFound()

  const where: any = { churchId: church.id }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notice.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch {}

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="py-10 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white transition">
            ← {church.name}
          </Link>
          <h1 className="text-3xl font-bold mt-2">공지사항</h1>
          <p className="text-white/80 mt-1">교회 소식과 안내를 확인하세요</p>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        {/* 검색 */}
        <form method="GET" action={`/church/${slug}/notices`} className="flex gap-2 mb-6">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="공지사항 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: colors.primary }}
          >
            검색
          </button>
        </form>

        {(search) && (
          <p className="text-sm text-gray-500 mb-4">총 {total}건 "{search}" 검색 결과</p>
        )}

        {/* 공지 목록 */}
        {notices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-gray-400 text-lg">공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {notices.map((notice) => (
              <a
                key={notice.id}
                href={`/church/${slug}/notices/${notice.id}`}
                className="block px-6 py-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.pinned && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                          📌 고정
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 truncate">{notice.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{notice.content}</p>
                  </div>
                  <time className="text-sm text-gray-400 whitespace-nowrap mt-1">
                    {formatDate(notice.createdAt)}
                  </time>
                </div>
                {notice.imageUrl && (
                  <div className="mt-3">
                    <img src={notice.imageUrl} alt="" className="w-20 h-14 object-cover rounded" />
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <nav className="flex justify-center gap-1 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (search) params.set('search', search)
              params.set('page', String(p))
              const isActive = p === page
              return (
                <a
                  key={p}
                  href={`/church/${slug}/notices?${params.toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
                    isActive ? 'text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: colors.primary } : {}}
                >
                  {p}
                </a>
              )
            })}
          </nav>
        )}

        <div className="mt-8">
          <a href={`/church/${slug}`} className="inline-flex items-center hover:underline" style={{ color: colors.primary }}>
            ← 교회 메인으로
          </a>
        </div>
      </div>
    </main>
  )
}
