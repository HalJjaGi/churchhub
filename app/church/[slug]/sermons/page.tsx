import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; series?: string }>;
}

export default async function SermonsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || '1', 10);
  const search = sp.search || '';
  const seriesFilter = sp.series || '';
  const limit = 9;

  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true, name: true, theme: true },
  });

  if (!church) notFound();

  // where 조건 구성
  const where: any = { churchId: church.id };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { speaker: { contains: search, mode: 'insensitive' } },
      { bibleRef: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (seriesFilter) {
    where.series = seriesFilter;
  }

  const [sermons, total, allSeries] = await Promise.all([
    prisma.sermon.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sermon.count({ where }),
    prisma.sermon.findMany({
      where: { churchId: church.id, series: { not: null } },
      select: { series: true },
      distinct: ['series'],
      orderBy: { series: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  let colors = { primary: '#2563eb' };
  try {
    const theme = JSON.parse(church.theme || '{}');
    colors = theme.colors || colors;
  } catch {}

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="py-10 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white transition">
            ← {church.name}
          </Link>
          <h1 className="text-3xl font-bold mt-2">설교</h1>
          <p className="text-white/80 mt-1">말씀으로 은혜받으세요</p>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8">
        {/* 검색 & 필터 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form method="GET" action={`/church/${slug}/sermons`} className="flex gap-2 flex-1" role="search">
            <label htmlFor="sermon-search" className="sr-only">설교 검색</label>
            <input
              id="sermon-search"
              type="text"
              name="search"
              defaultValue={search}
              placeholder="제목, 설교자, 성경 구절 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition min-h-[44px]"
              style={{ backgroundColor: colors.primary }}
            >
              검색
            </button>
          </form>

          {allSeries.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <a
                href={`/church/${slug}/sermons${search ? `?search=${search}` : ''}`}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  !seriesFilter ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={!seriesFilter ? { backgroundColor: colors.primary } : {}}
              >
                전체
              </a>
              {allSeries.map((s) => (
                <a
                  key={s.series}
                  href={`/church/${slug}/sermons?series=${encodeURIComponent(s.series!)}${search ? `&search=${search}` : ''}`}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    seriesFilter === s.series ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={seriesFilter === s.series ? { backgroundColor: colors.primary } : {}}
                >
                  {s.series}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* 검색 결과 정보 */}
        {(search || seriesFilter) && (
          <p className="text-sm text-gray-500 mb-4">
            총 {total}건{search ? ` "${search}" 검색 결과` : ''}{seriesFilter ? ` [${seriesFilter}]` : ''}
          </p>
        )}

        {/* 설교 목록 */}
        {sermons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <span className="text-4xl mb-3 block">📖</span>
            <p className="text-gray-400">등록된 설교가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <a
                key={sermon.id}
                href={`/church/${slug}/sermons/${sermon.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* 썸네일 */}
                <div className="w-full h-44 bg-gray-100 overflow-hidden relative">
                  {sermon.thumbnail ? (
                    <img src={sermon.thumbnail} alt={sermon.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ backgroundColor: `${colors.primary}15` }}>
                      📖
                    </div>
                  )}
                  {sermon.youtubeUrl && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">▶ 영상</span>
                  )}
                </div>

                <div className="p-4">
                  {/* 시리즈 배지 */}
                  {sermon.series && (
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {sermon.series}
                    </span>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{sermon.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{sermon.speaker}</span>
                    <span>·</span>
                    <time>{new Date(sermon.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</time>
                  </div>

                  {/* 성경 구절 */}
                  {sermon.bibleRef && (
                    <p className="text-xs text-gray-400 mt-1.5">📕 {sermon.bibleRef}</p>
                  )}

                  {/* 태그 */}
                  {sermon.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sermon.tags.split(',').map((tag, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <nav className="flex justify-center gap-1 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams();
              if (search) params.set('search', search);
              if (seriesFilter) params.set('series', seriesFilter);
              params.set('page', String(p));
              const isActive = p === page;
              return (
                <a
                  key={p}
                  href={`/church/${slug}/sermons?${params.toString()}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition ${
                    isActive ? 'text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={isActive ? { backgroundColor: colors.primary } : {}}
                >
                  {p}
                </a>
              );
            })}
          </nav>
        )}

        {/* 뒤로가기 */}
        <div className="mt-8">
          <a href={`/church/${slug}`} className="inline-flex items-center hover:underline" style={{ color: colors.primary }}>
            ← 교회 메인으로
          </a>
        </div>
      </div>
    </main>
  );
}
