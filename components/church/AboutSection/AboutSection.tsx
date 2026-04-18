'use client'

import Link from 'next/link'
import type { Theme } from './types'

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
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 담임목사 소개 */}
        {pastorName && (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {pastorImage && (
                <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                  <img src={pastorImage} alt={pastorName} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: theme.colors.primary }}>
                  담임목사
                </h3>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{pastorName}</h2>
                {pastorMessage && (
                  <blockquote className="text-gray-600 leading-relaxed italic border-l-4 pl-4" style={{ borderColor: theme.colors.primary }}>
                    "{pastorMessage}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 교회 소개 + 비전 */}
        <div className="grid gap-8 md:grid-cols-2">
          {intro && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: theme.colors.primary }}>
                  🏛
                </span>
                교회 소개
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{intro}</p>
            </div>
          )}
          {vision && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: theme.colors.secondary }}>
                  ✨
                </span>
                우리의 비전
              </h3>
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
