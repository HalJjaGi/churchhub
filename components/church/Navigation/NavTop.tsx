'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Theme } from '../types'

type NavProps = {
  theme: Theme
  churchName: string
  churchSlug: string
}

export function NavTop({ theme, churchName, churchSlug }: NavProps) {
  const [open, setOpen] = useState(false)

  const menuItems = [
    { label: '설교', href: `/church/${churchSlug}/sermons` },
    { label: '공지', href: `/church/${churchSlug}#notices` },
    { label: '일정', href: `/church/${churchSlug}#schedule` },
    { label: '연락처', href: `/church/${churchSlug}/contact` },
  ]

  return (
    <header
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/church/${churchSlug}`} className="flex items-center gap-2 shrink-0">
            <span className="text-lg">⛪</span>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
            >
              {churchName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="mx-2 w-px h-6 bg-white/20" />
            <Link
              href="/"
              className="px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              교회 목록
            </Link>
            <Link
              href={`/admin/${churchSlug}`}
              className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              관리
            </Link>
          </nav>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 -mr-2 text-white/80 hover:text-white"
            aria-label="메뉴"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 pb-4 space-y-1 border-t border-white/10">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link
              href="/"
              className="flex-1 text-center px-4 py-2 text-sm text-white/60 hover:text-white border border-white/20 rounded-lg transition-colors"
            >
              교회 목록
            </Link>
            <Link
              href={`/admin/${churchSlug}`}
              className="flex-1 text-center px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              관리
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
