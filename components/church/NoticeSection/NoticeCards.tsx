import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
  churchSlug?: string
}

export function NoticeCards({ theme, notices, churchSlug }: NoticeSectionProps) {
  if (notices.length === 0) return null

  return (
    <section>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        공지사항
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {notices.map((notice) => (
          <a
            key={notice.id}
            href={churchSlug ? `/church/${churchSlug}/notices/${notice.id}` : undefined}
            className="block bg-white rounded-lg shadow-sm p-5 border-l-4 hover:shadow-md transition-shadow"
            style={{ borderColor: theme.colors.accent }}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{notice.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{notice.content}</p>
            <p className="text-xs text-gray-400 mt-3">
              {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
