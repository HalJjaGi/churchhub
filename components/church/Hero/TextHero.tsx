import type { Theme } from '../types'

type HeroProps = {
  theme: Theme
  churchName: string
  description: string | null
}

export function TextHero({ theme, churchName, description }: HeroProps) {
  return (
    <header className="py-24 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-7xl font-bold mb-6 tracking-tight"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
          }}
        >
          {churchName}
        </h1>
        {description && (
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
        <div
          className="w-16 h-1 mx-auto mt-8 rounded-full"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
    </header>
  )
}
