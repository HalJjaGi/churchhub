import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Theme = {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  font: 'serif' | 'sans-serif'
  layout: 'traditional' | 'modern' | 'minimal'
}

type Modules = {
  sermon: boolean
  notice: boolean
  community: boolean
  gallery: boolean
  donation: boolean
}

const defaultTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
  },
  font: 'sans-serif',
  layout: 'modern',
}

const defaultModules: Modules = {
  sermon: true,
  notice: true,
  community: false,
  gallery: false,
  donation: false,
}

export default async function ChurchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      sermons: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      notices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  
  if (!church) {
    notFound()
  }
  
  let theme: Theme
  try {
    theme = JSON.parse(church.theme)
  } catch (e) {
    console.error('Failed to parse theme:', e)
    theme = defaultTheme
  }
  
  let modules: Modules
  try {
    modules = JSON.parse(church.modules)
  } catch (e) {
    console.error('Failed to parse modules:', e)
    modules = defaultModules
  }
  
  return (
    <div
      style={{
        '--color-primary': theme.colors.primary,
        '--color-secondary': theme.colors.secondary,
        '--color-accent': theme.colors.accent,
        '--color-background': theme.colors.background,
        '--font-family': theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
      } as React.CSSProperties}
      className="min-h-screen"
    >
      {/* Header */}
      <header
        style={{ backgroundColor: 'var(--color-primary)' }}
        className="text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-family)' }}>
                {church.name}
              </h1>
              {church.description && (
                <p className="text-lg opacity-90">
                  {church.description}
                </p>
              )}
            </div>
            <nav className="flex gap-6">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                ← 교회 목록
              </Link>
              <Link href={`/admin/${church.slug}`} className="hover:opacity-80 transition-opacity">
                관리
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ backgroundColor: 'var(--color-background)' }}
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Sermon Section */}
          {modules.sermon && church.sermons.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
                최근 설교
              </h2>
              <div className="space-y-4">
                {church.sermons.map((sermon) => (
                  <div key={sermon.id} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {sermon.speaker} • {new Date(sermon.date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notice Section */}
          {modules.notice && church.notices.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
                공지사항
              </h2>
              <div className="space-y-4">
                {church.notices.map((notice) => (
                  <div key={notice.id} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notice.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: 'var(--color-secondary)' }}
        className="text-white mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">{church.name}</p>
            <p className="opacity-80">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
