import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
}

export function ImageHero({ theme, churchName, description }: HeroProps) {
  return (
    <header
      className="relative text-white py-24 px-4"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="relative max-w-7xl mx-auto text-center">
        <h1
          className="text-5xl font-bold mb-4"
          style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
        >
          {churchName}
        </h1>
        {description && (
          <p className="text-xl opacity-90 max-w-2xl mx-auto">{description}</p>
        )}
      </div>
    </header>
  )
}
