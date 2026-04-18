import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
  churchSlug?: string
}

export function NoticeTimeline({ theme, notices, churchSlug }: NoticeSectionProps) {
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
      <div className="relative">
        <div
          className="absolute left-[9px] top-2 bottom-2 w-0.5 rounded-full"
          style={{ backgroundColor: `${theme.colors.primary}20` }}
        />
        <div className="space-y-4">
          {notices.map((notice) => (
            <a
              key={notice.id}
              href={churchSlug ? `/church/${churchSlug}/notices/${notice.id}` : undefined}
              className="flex gap-4 group"
            >
              <div className="relative shrink-0">
                <div
                  className="w-5 h-5 rounded-full border-2 bg-white mt-1.5"
                  style={{ borderColor: notice.pinned ? theme.colors.accent : theme.colors.primary }}
                />
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}
                  >
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {notice.pinned && <span className="text-xs">📌 고정</span>}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {notice.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
      )}
    </section>
  )
}
