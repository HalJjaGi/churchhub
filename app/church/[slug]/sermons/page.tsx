import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SermonsPage({ params }: Props) {
  const { slug } = await params;

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      sermons: {
        orderBy: { date: 'desc' },
        take: 10,
      },
    },
  });

  if (!church) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {church.name} - 설교
          </h1>
          <p className="text-gray-600">
            말씀으로 은혜받으세요
          </p>
        </header>

        {/* 설교 목록 */}
        {church.sermons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">등록된 설교가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {church.sermons.map((sermon) => (
              <a
                key={sermon.id}
                href={`/church/${slug}/sermons/${sermon.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {sermon.thumbnail && (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sermon.title}
                    </h2>
                    <time className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {new Date(sermon.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-gray-600 mb-2">
                    설교자: {sermon.speaker}
                  </p>
                  {sermon.content && (
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {sermon.content}
                    </p>
                  )}
                  {sermon.youtubeUrl && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 font-medium">
                      🎬 영상 보기
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 뒤로가기 */}
        <div className="mt-8">
          <a
            href={`/church/${slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← 교회 메인으로
          </a>
        </div>
      </div>
    </main>
  );
}
