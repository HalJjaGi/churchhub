import type { Theme } from '../types'

type GalleryItem = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string | null
}

type Props = {
  theme: Theme
  galleries: GalleryItem[]
  churchSlug: string
}

export function GalleryGrid({ theme, galleries, churchSlug }: Props) {
  if (galleries.length === 0) return null

  const display = galleries.slice(0, 6)

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          📷 갤러리
        </h2>
        <a
          href={`/church/${churchSlug}/gallery`}
          className="text-sm font-medium hover:underline transition-colors"
          style={{ color: theme.colors.secondary || theme.colors.primary }}
        >
          전체 보기 →
        </a>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {display.map((g, i) => (
          <a
            key={g.id}
            href={`/church/${churchSlug}/gallery`}
            className="group relative block aspect-square rounded-xl overflow-hidden bg-gray-100"
          >
            <img
              src={g.imageUrl}
              alt={g.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white text-sm font-medium line-clamp-1">{g.title}</p>
              {g.category && (
                <p className="text-white/70 text-xs">{g.category}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
