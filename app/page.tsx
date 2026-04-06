import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const churches = await prisma.church.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              🙏 ChurchHub
            </h1>
            <nav className="flex gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                관리자
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            교회 웹사이트를 쉽게 만드세요
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ChurchHub은 교회를 위한 웹사이트 플랫폼입니다. 
            전통적이거나 현대적인 디자인으로 교회의 특성에 맞는 웹사이트를 만들 수 있습니다.
          </p>
        </div>

        {/* Church List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {churches.map((church) => (
            <Link
              key={church.id}
              href={`/church/${church.slug}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {church.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {church.description || '교회 웹사이트'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {church.plan === 'starter' && '시작하기'}
                  {church.plan === 'basic' && '기본'}
                  {church.plan === 'pro' && '프로'}
                  {church.plan === 'enterprise' && '기업'}
                </span>
                <span className="text-blue-600 hover:text-blue-800">
                  방문하기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 ChurchHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
