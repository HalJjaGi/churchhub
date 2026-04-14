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
    <header className="relative text-white overflow-hidden">
      {heroImage ? (
        <>
          <div className="absolute inset-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </div>
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})`,
          }}
        >
          {/* 패턴 오버레이 */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg"
          style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {subtitle}
          </p>
        )}
      </div>

      {/* 웨이브 구분선 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V35C360 0 720 55 1080 20C1260 5 1380 10 1440 15V60H0Z" fill="var(--color-background, #ffffff)" />
        </svg>
      </div>
    </header>
  )
}
