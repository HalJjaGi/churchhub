import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImage?: string | null
}

export function ImageHero({ theme, churchName, description, heroTitle, heroSubtitle, heroImage }: HeroProps) {
  const title = heroTitle || churchName
  const subtitle = heroSubtitle || description

  return (
    <header
      className="relative text-white py-24 px-4"
      style={{ backgroundColor: theme.colors.primary }}
    >
      {heroImage && (
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      {!heroImage && <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />}
      <div className="relative max-w-7xl mx-auto text-center">
        <h1
          className="text-5xl font-bold mb-4"
          style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl opacity-90 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
