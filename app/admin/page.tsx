import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import LogoutButton from './LogoutButton'

export default async function AdminPage() {
  const session = await auth()
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              ChurchHub 관리자
            </h1>
            <nav className="flex gap-4 items-center">
              {session?.user && (
                <span className="text-sm text-gray-600">
                  {session.user.email} ({session.user.role})
                </span>
              )}
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                메인으로
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            교회 관리
          </h2>
        </div>

        {/* Church List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {churches.map((church) => (
              <li key={church.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {church.name}
                      </h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          church.plan === 'pro' ? 'bg-green-100 text-green-800' :
                          church.plan === 'basic' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {church.plan === 'starter' && '시작하기'}
                          {church.plan === 'basic' && '기본'}
                          {church.plan === 'pro' && '프로'}
                          {church.plan === 'enterprise' && '기업'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="text-sm text-gray-500">
                          {church.description || '설명 없음'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Link
                          href={`/admin/${church.slug}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          설정
                        </Link>
                        <Link
                          href={`/church/${church.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          방문
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
