'use client'

import Link from 'next/link'
import type { Theme } from '../types'

interface Props {
  theme: Theme
  churchSlug: string
  intro?: string | null
  vision?: string | null
  pastorName?: string | null
  pastorMessage?: string | null
  pastorImage?: string | null
}

export function AboutSection({ theme, churchSlug, intro, vision, pastorName, pastorMessage, pastorImage }: Props) {
  if (!intro && !vision && !pastorName) return null

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 담임목사 소개 카드 */}
        {pastorName && (
          <div className="mb-12 sm:mb-16">
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.secondary || theme.colors.primary}08)` }}
            >
              <div className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
                  {pastorImage ? (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 ring-4 ring-white">
                      <img src={pastorImage} alt={`${pastorName} 담임목사`} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-4xl sm:text-5xl"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})` }}
                    >
                      🙏
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left">
                    <span
                      className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${theme.colors.primary}15`, color: theme.colors.primary }}
                    >
                      담임목사
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-4">{pastorName}</h2>
                    {pastorMessage && (
                      <blockquote className="relative text-gray-600 leading-relaxed">
                        <span
                          className="absolute -left-2 -top-2 text-4xl opacity-20 select-none"
                          style={{ color: theme.colors.primary }}
                        >
                          &ldquo;
                        </span>
                        <p className="pl-4 border-l-3 italic" style={{ borderColor: theme.colors.primary }}>
                          {pastorMessage}
                        </p>
                      </blockquote>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 교회 소개 + 비전 카드 */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {intro && (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primary}cc)` }}
                >
                  🏛
                </span>
                <h3 className="text-lg font-bold text-gray-900">교회 소개</h3>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{intro}</p>
            </div>
          )}
          {vision && (
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.secondary || theme.colors.primary}, ${(theme.colors.secondary || theme.colors.primary)}cc)` }}
                >
                  ✨
                </span>
                <h3 className="text-lg font-bold text-gray-900">우리의 비전</h3>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{vision}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/church/${churchSlug}/about`}
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: theme.colors.primary }}
          >
            교회 소개 더보기 →
          </Link>
        </div>
      </div>
    </section>
  )
}
