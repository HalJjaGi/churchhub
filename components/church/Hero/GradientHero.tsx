import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
}

export function GradientHero({ theme, churchName, description }: HeroProps) {
  return (
    <header
      className="relative text-white py-32 px-4 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`,
      }}
    >
      {/* 장식 원형 */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/5 blur-lg" />

      <div className="relative max-w-7xl mx-auto text-center">
        <h1
          className="text-6xl font-bold mb-4 tracking-tight"
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
