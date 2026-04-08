import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
}

export function NoticeTimeline({ theme, notices }: NoticeSectionProps) {
  if (notices.length === 0) return null

  return (
    <section>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        공지사항
      </h2>
      <div className="relative">
        {/* 타임라인 라인 */}
        <div
          className="absolute left-4 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: theme.colors.secondary + '40' }}
        />
        <div className="space-y-6">
          {notices.map((notice) => (
            <div key={notice.id} className="relative pl-12">
              {/* 타임라인 점 */}
              <div
                className="absolute left-2 top-1 w-5 h-5 rounded-full border-2 bg-white"
                style={{ borderColor: theme.colors.accent }}
              />
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: theme.colors.accent + '20',
                      color: theme.colors.accent,
                    }}
                  >
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
