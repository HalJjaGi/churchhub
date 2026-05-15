import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

interface ChurchPageProps {
  params: Promise<{ slug: string }>
}

export default async function ChurchPage({ params }: ChurchPageProps) {
  const { slug } = await params
  
  const church = await prisma.church.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      address: true
    }
  })

  if (!church) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 교회 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{church.name}</h1>
            <nav className="flex gap-4">
              <a href="/" className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900">
                홈으로
              </a>
              <a href={`/donate?church=${church.slug}`} className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-900">
                후원하기
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 교회 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">교회 소개</h2>
          <p className="text-gray-600 mb-6">
            {church.description || '교회 소개가 준비 중입니다.'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">연락처</h3>
              <p className="text-gray-600">
              </p>
              <p className="text-gray-600">
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">사업자 정보</h3>
              <p className="text-gray-600">
              </p>
              <p className="text-gray-600">
              </p>
              <p className="text-gray-600">
              </p>
            </div>
          </div>
        </div>

        {/* 추가 콘텐츠 영역 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">예배 안내</h3>
            <p className="text-gray-600">주일 예배 시간 안내</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">소식</h3>
            <p className="text-gray-600">교회 소식과 공지사항</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">후원</h3>
            <p className="text-gray-600">교회를 후원해주세요</p>
          </div>
        </div>
      </main>

      {/* 교회별 푸터 */}
      <Footer churchSlug={church.slug} />
    </div>
  )
}
