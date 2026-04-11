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
          className="text-sm font-medium hover:underline"
          style={{ color: theme.colors.primary }}
        >
          전체 보기 →
        </a>
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {display.map((g) => (
          <a
            key={g.id}
            href={`/church/${churchSlug}/gallery`}
            className="block aspect-square rounded-xl overflow-hidden bg-gray-200 hover:opacity-90 transition"
          >
            <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
          </a>
        ))}
      </div>
    </section>
  )
}
