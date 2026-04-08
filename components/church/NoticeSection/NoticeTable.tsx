import type { Theme, Notice } from '../types'

type NoticeSectionProps = {
  theme: Theme
  notices: Notice[]
}

export function NoticeTable({ theme, notices }: NoticeSectionProps) {
  if (notices.length === 0) return null

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: theme.colors.primary }}
      >
        공지사항
      </h2>
      <div className="divide-y">
        {notices.map((notice) => (
          <div key={notice.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-gray-900">{notice.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
