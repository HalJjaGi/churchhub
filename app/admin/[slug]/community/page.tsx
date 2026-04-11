'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const categoryLabels: Record<string, string> = {
  general: '일반', question: '질문', testimony: '간증', prayer: '기도요청', share: '나눔',
}

export default function AdminPostsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [churchId, setChurchId] = useState('')

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      setChurchId(data.id)
      fetch(`/api/posts?churchId=${data.id}`).then(r => r.json()).then(setPosts).finally(() => setLoading(false))
    })
  }, [slug])

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== id))
  }

  const togglePin = async (id: string, pinned: boolean) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !pinned }),
    })
    if (res.ok) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: !pinned } : p))
    }
  }

  const deleteComment = async (postId: string, commentId: string) => {
    await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter((c: any) => c.id !== commentId) } : p))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/admin/${slug}`} className="text-gray-600 hover:text-gray-900">← 대시보드</Link>
            <h1 className="text-2xl font-bold text-gray-900">💬 커뮤니티 관리</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">등록된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.pinned && <span>📌</span>}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{categoryLabels[post.category] || post.category}</span>
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    <span className="text-xs text-gray-400">{post.authorName || '익명'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePin(post.id, post.pinned)} className="text-xs text-blue-600 hover:underline">{post.pinned ? '고정해제' : '고정'}</button>
                    <button onClick={() => handleDelete(post.id)} className="text-xs text-red-600 hover:underline">삭제</button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>
                {post.comments?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-500">댓글 {post.comments.length}개</p>
                    {post.comments.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
                        <span className="text-xs text-gray-700">{c.authorName || '익명'}: {c.content}</span>
                        <button onClick={() => deleteComment(post.id, c.id)} className="text-xs text-red-500 hover:underline">삭제</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
