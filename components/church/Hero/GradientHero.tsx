import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
}

export function GradientHero({ theme, churchName, description }: HeroProps) {
  return (
    <header className="relative text-white overflow-hidden">
      {/* 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`,
        }}
      />

      {/* 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/8 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
      </div>

      {/* 십자가 실루엣 */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none hidden lg:block">
        <svg width="200" height="300" viewBox="0 0 200 300" fill="currentColor">
          <rect x="80" y="0" width="40" height="300" rx="4" />
          <rect x="0" y="80" width="200" height="40" rx="4" />
        </svg>
      </div>

      {/* 콘텐츠 */}
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif' }}
        >
          {churchName}
        </h1>
        {description && (
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* 웨이브 구분선 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 5 480 0 720 15C960 30 1200 45 1440 20V60H0Z" fill="var(--color-background, #ffffff)" />
        </svg>
      </div>
    </header>
  )
}
