import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
  churchSlug?: string
}

export function NoticeTable({ theme, notices, churchSlug }: NoticeSectionProps) {
  if (notices.length === 0) return null

  return (
    <section id="notices" className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
          📢 공지사항
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {notices.map((notice) => (
          <a
            key={notice.id}
            href={churchSlug ? `/church/${churchSlug}/notices/${notice.id}` : undefined}
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-12 text-center shrink-0">
              <div className="text-xs text-gray-400">{new Date(notice.createdAt).getMonth() + 1}월</div>
              <div className="text-lg font-bold text-gray-700">{new Date(notice.createdAt).getDate()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {notice.pinned && <span className="text-xs">📌</span>}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {notice.title}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{notice.content}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
