import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
}

export function TextHero({ theme, churchName, description }: HeroProps) {
  return (
    <header className="relative py-20 sm:py-28 px-4 text-center overflow-hidden">
      {/* 장식 라인 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-gray-200" />

      <div className="max-w-4xl mx-auto relative">
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
          }}
        >
          {churchName}
        </h1>
        {description && (
          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        <div
          className="w-20 h-1 mx-auto mt-8 rounded-full"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </header>
  )
}
