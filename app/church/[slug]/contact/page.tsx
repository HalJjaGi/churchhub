import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params;

  const church = await prisma.church.findUnique({
    where: { slug },
  });

  if (!church) {
    notFound();
  }

  // 테마에 따른 위치 정보 파싱 (테마에 저장된 경우)
  let locationInfo = {
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'contact@church.example.com',
    parking: '주차 공간이 제한됩니다. 대중교통 이용을 권장합니다.',
  };

  try {
    const themeData = JSON.parse(church.theme || '{}');
    if (themeData.location) {
      locationInfo = { ...locationInfo, ...themeData.location };
    }
  } catch {
    // 테마 파싱 실패 시 기본값 사용
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {church.name} - 오시는 길
          </h1>
          <p className="text-gray-600">
            연락처 및 위치 안내
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 지도 섹션 */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="h-64 bg-gray-400 flex items-center justify-center"
              data-map="true"
              role="img"
              aria-label="교회 위치 지도"
            >
              <div className="text-center text-white">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p>지도 로딩 중...</p>
              </div>
            </div>
          </section>

          {/* 연락처 정보 */}
          <section className="space-y-4">
            {/* 주소 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                주소
              </h2>
              <p className="text-gray-700">{locationInfo.address}</p>
            </div>

            {/* 전화 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                전화
              </h2>
              <a
                href={`tel:${locationInfo.phone}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {locationInfo.phone}
              </a>
            </div>

            {/* 이메일 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                이메일
              </h2>
              <a
                href={`mailto:${locationInfo.email}`}
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {locationInfo.email}
              </a>
            </div>

            {/* 주차 안내 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                주차 안내
              </h2>
              <p className="text-gray-700">{locationInfo.parking}</p>
            </div>
          </section>
        </div>

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
