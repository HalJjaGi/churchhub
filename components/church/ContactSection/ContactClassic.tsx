import type { Theme, ChurchData } from '../types'

type ContactProps = {
  theme: Theme
  church: ChurchData
}

export function ContactClassic({ theme, church }: ContactProps) {
  const hasContact = church.address || church.phone || church.email || church.parking
  if (!hasContact) return null

  return (
    <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        오시는 길
      </h2>
      <div className="space-y-3">
        {church.address && (
          <div className="flex gap-3">
            <span className="text-gray-400">📍</span>
            <span className="text-gray-700">{church.address}</span>
          </div>
        )}
        {church.phone && (
          <div className="flex gap-3">
            <span className="text-gray-400">📞</span>
            <span className="text-gray-700">{church.phone}</span>
          </div>
        )}
        {church.email && (
          <div className="flex gap-3">
            <span className="text-gray-400">✉️</span>
            <span className="text-gray-700">{church.email}</span>
          </div>
        )}
        {church.parking && (
          <div className="flex gap-3">
            <span className="text-gray-400">🅿️</span>
            <span className="text-gray-700">{church.parking}</span>
          </div>
        )}
      </div>
    </section>
  )
}
