import Link from 'next/link'
import type { Theme } from '../types'

type NavSidebarProps = {
  theme: Theme
  churchName: string
  churchSlug: string
  activeModule?: string
}

export function NavSidebar({ theme, churchName, churchSlug, activeModule }: NavSidebarProps) {
  const menuItems = [
    { label: '홈', href: `/church/${churchSlug}` },
    { label: '설교', href: `/church/${churchSlug}/sermons` },
    { label: '연락처', href: `/church/${churchSlug}/contact` },
    { label: '관리', href: `/admin/${churchSlug}` },
  ]

  return (
    <aside
      style={{ backgroundColor: theme.colors.primary }}
      className="w-64 min-h-screen text-white flex flex-col"
    >
      <div className="p-6 border-b border-white/20">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← 교회 목록
        </Link>
        <h1
          className="text-2xl font-bold mt-2"
          style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
        >
          {churchName}
        </h1>
      </div>
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-3 text-sm transition-colors ${
              activeModule === item.label
                ? 'bg-white/20 font-semibold'
                : 'hover:bg-white/10'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
