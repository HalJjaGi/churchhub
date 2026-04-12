'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Gallery = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string | null
  createdAt: string | Date
}

type Props = {
  church: {
    name: string
    id: string
  }
  colors: { primary: string }
  slug: string
}

export default function GalleryClient({ church, colors, slug }: Props) {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [categories, setCategories] = useState<{id:string; name:string; slug:string; icon:string|null; color:string|null}[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ images: Gallery[]; index: number } | null>(null)

  // DB에서 카테고리 + 갤러리 로드
  useEffect(() => {
    fetch(`/api/categories?churchId=${church.id}&type=gallery`).then(r => r.json()).then(setCategories)
    fetch(`/api/galleries?churchId=${church.id}`).then(r => r.json()).then(data => {
      setGalleries(data.map((g: any) => ({ ...g, createdAt: g.createdAt, description: g.description })))
    })
  }, [church.id])

  const filtered = activeCategory
    ? galleries.filter((g) => g.category === activeCategory)
    : galleries

  // ESC로 라이트박스 닫기, 화살표로 이동
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight' && lightbox.index < lightbox.images.length - 1) {
        setLightbox({ ...lightbox, index: lightbox.index + 1 })
      }
      if (e.key === 'ArrowLeft' && lightbox.index > 0) {
        setLightbox({ ...lightbox, index: lightbox.index - 1 })
      }
    },
    [lightbox]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const openLightbox = (index: number) => {
    setLightbox({ images: filtered, index })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="py-12 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white">
            ← {church.name}
          </Link>
          <h1 className="text-3xl font-bold mt-4">📷 갤러리</h1>
          <p className="text-white/80 mt-2">{galleries.length}장의 사진</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                !activeCategory ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={!activeCategory ? { backgroundColor: colors.primary } : {}}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  activeCategory === cat.slug ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={activeCategory === cat.slug ? { backgroundColor: cat.color || colors.primary } : {}}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* 갤러리 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-gray-500">등록된 사진이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((g, i) => (
              <div
                key={g.id}
                onClick={() => openLightbox(i)}
                className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
              >
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{g.title}</h3>
                  {g.category && (
                    <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full mt-1">
                      {g.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href={`/church/${slug}`} className="hover:underline" style={{ color: colors.primary }}>
            ← 교회 메인으로
          </Link>
        </div>
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10"
          >
            ✕
          </button>

          {/* 이전 */}
          {lightbox.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightbox({ ...lightbox, index: lightbox.index - 1 })
              }}
              className="absolute left-4 text-white/70 hover:text-white text-4xl z-10"
            >
              ‹
            </button>
          )}

          {/* 다음 */}
          {lightbox.index < lightbox.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightbox({ ...lightbox, index: lightbox.index + 1 })
              }}
              className="absolute right-4 text-white/70 hover:text-white text-4xl z-10"
            >
              ›
            </button>
          )}

          {/* 이미지 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[85vh] mx-4 flex flex-col items-center"
          >
            <img
              src={lightbox.images[lightbox.index].imageUrl}
              alt={lightbox.images[lightbox.index].title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="text-white text-center mt-4">
              <h3 className="font-semibold text-lg">{lightbox.images[lightbox.index].title}</h3>
              {lightbox.images[lightbox.index].description && (
                <p className="text-white/70 text-sm mt-1">
                  {lightbox.images[lightbox.index].description}
                </p>
              )}
              <span className="text-white/50 text-xs mt-2 block">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
