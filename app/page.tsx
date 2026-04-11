import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const churches = await prisma.church.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      address: true,
      theme: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <nav className="relative max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            🙏 ChurchHub
          </Link>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition"
            >
              로그인
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              관리자
            </Link>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            교회 웹사이트를<br className="hidden sm:block" /> 쉽게 만드세요
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            ChurchHub으로 전문적인 교회 웹사이트를 몇 분 만에 구축하세요.
            설교, 공지사항, 일정 관리까지 올인원.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin/churches/new"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg"
            >
              무료로 시작하기
            </Link>
            {churches.length > 0 && (
              <a
                href="#churches"
                className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/20"
              >
                교회 둘러보기 ↓
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              교회에 필요한 모든 기능
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              웹사이트 하나로 교회 소식을 전하고, 성도들과 소통하세요.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '📖',
                title: '설교 관리',
                desc: '설교 영상과 본문을 등록하고, 성도들에게 말씀을 전달하세요.',
              },
              {
                icon: '📢',
                title: '공지사항',
                desc: '교회 소식과 행사 안내를 쉽게 등록하고 공유하세요.',
              },
              {
                icon: '📅',
                title: '교회 일정',
                desc: '예배, 모임, 행사 일정을 한눈에 관리하세요.',
              },
              {
                icon: '🎨',
                title: '맞춤 테마',
                desc: '전통, 모던, 미니멀 — 교회 분위기에 맞는 디자인을 선택하세요.',
              },
              {
                icon: '📍',
                title: '오시는 길',
                desc: '주소, 연락처, 주차 안내로 처음 오시는 분도 쉽게 찾을 수 있습니다.',
              },
              {
                icon: '🔐',
                title: '권한 관리',
                desc: '슈퍼 관리자, 교회 관리자, 에디터 — 역할별로 권한을 나누세요.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Churches */}
      {churches.length > 0 && (
        <section id="churches" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                등록된 교회
              </h2>
              <p className="text-lg text-gray-600">
                {churches.length}개 교회가 ChurchHub과 함께하고 있습니다
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {churches.map((church) => {
                let colors = { primary: '#2563eb' }
                try {
                  const theme = JSON.parse(church.theme || '{}')
                  colors = theme.colors || colors
                } catch { /* ignore */ }

                return (
                  <Link
                    key={church.slug}
                    href={`/church/${church.slug}`}
                    className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div
                      className="h-3"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                        {church.name}
                      </h3>
                      {church.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {church.description}
                        </p>
                      )}
                      {church.address && (
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <span>📍</span> {church.address}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            지금 시작하세요
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            교회 웹사이트가 필요하신가요? ChurchHub에서 무료로 만들 수 있습니다.
          </p>
          <Link
            href="/admin/churches/new"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg"
          >
            교회 등록하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🙏</span>
              <span className="text-white font-bold">ChurchHub</span>
            </div>
            <p className="text-sm">© 2026 ChurchHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
