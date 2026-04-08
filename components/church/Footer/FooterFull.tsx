import Link from 'next/link'
import type { Theme } from '../types'

type FooterProps = {
  theme: Theme
  churchName: string
}

export function FooterFull({ theme, churchName }: FooterProps) {
  return (
    <footer
      style={{ backgroundColor: theme.colors.primary }}
      className="text-white mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">{churchName}</p>
          <p className="opacity-70 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="opacity-50 text-xs mt-2">
            Powered by <Link href="/" className="hover:opacity-100">ChurchHub</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
