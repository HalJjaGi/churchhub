import Link from 'next/link'
import type { Theme } from '../types'

type NavProps = {
  theme: Theme
  churchName: string
  churchSlug: string
}

export function NavTop({ theme, churchName, churchSlug }: NavProps) {
  return (
    <header
      style={{ backgroundColor: theme.colors.primary }}
      className="text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
            >
              {churchName}
            </h1>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              ← 교회 목록
            </Link>
            <Link href={`/admin/${churchSlug}`} className="hover:opacity-80 transition-opacity">
              관리
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
