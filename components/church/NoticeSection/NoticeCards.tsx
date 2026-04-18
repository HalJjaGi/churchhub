import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
  churchSlug?: string
}

export function NoticeCards({ theme, notices, churchSlug }: NoticeSectionProps) {
  const isNew = (date: Date | string) => {
    const diff = Date.now() - new Date(date).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  }

  return (
    <section id="notices">
      <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.primary }}>
        📢 공지사항
      </h2>
      {notices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center">
          <span className="text-4xl mb-3 block">📢</span>
          <p className="text-gray-400 text-sm">아직 등록된 공지사항이 없습니다</p>
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {notices.map((notice) => (
          <a
            key={notice.id}
            href={churchSlug ? `/church/${churchSlug}/notices/${notice.id}` : undefined}
            className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ borderLeftColor: notice.pinned ? theme.colors.accent : undefined, borderLeftWidth: notice.pinned ? '4px' : undefined }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {notice.pinned && <span className="mr-1">📌</span>}
                {notice.title}
              </h3>
              {isNew(notice.createdAt) && (
                <span
                  className="px-2 py-0.5 text-xs font-bold text-white rounded-full shrink-0"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  NEW
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{notice.content}</p>
            <p className="text-xs text-gray-400 mt-3">
              {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </a>
        ))}
      </div>
      )}
    </section>
  )
}
