import type { Theme } from '../types'

type FooterProps = {
  theme: Theme
  churchName: string
}

export function FooterMinimal({ theme, churchName }: FooterProps) {
  return (
    <footer className="py-6 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} {churchName}
    </footer>
  )
}
