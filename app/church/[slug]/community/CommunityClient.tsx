'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ImageUpload } from '@/components/ImageUpload'

type Board = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  allowWrite: string
  _count?: { posts: number }
}

type Comment = {
  id: string
  content: string
  authorName: string | null
  createdAt: string
}

type Post = {
  id: string
  title: string
  content: string
  imageUrl: string | null
  category: string
  pinned: boolean
  authorName: string | null
  boardId: string | null
  comments: Comment[]
  createdAt: string
}

type Props = {
  slug: string
  church: { name: string }
  colors: { primary: string }
  posts: Post[]
  activeCategory: string
}

export default function CommunityClient({ slug, church, colors, posts, activeCategory }: Props) {
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null
  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoard, setActiveBoard] = useState<string | null>(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [form, setForm] = useState({ title: '', content: '', category: 'general', authorName: '', imageUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/churches/${slug}`).then(r => r.json()).then(data => {
      fetch(`/api/boards?churchId=${data.id}`).then(r => r.json()).then(setBoards)
    })
  }, [slug])

  const filtered = activeBoard ? posts.filter(p => p.boardId === activeBoard) : posts

  const canWrite = () => {
    if (!activeBoard) return true
    const board = boards.find(b => b.id === activeBoard)
    return board?.allowWrite !== 'closed'
  }

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const churchRes = await fetch(`/api/churches/${slug}`)
    if (!churchRes.ok) { setSaving(false); return }
    const churchData = await churchRes.json()

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, churchId: churchData.id, boardId: activeBoard }),
    })
    if (res.ok) {
      setShowNewPost(false)
      setForm({ title: '', content: '', category: 'general', authorName: '', imageUrl: '' })
      window.location.reload()
    }
    setSaving(false)
  }

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment, authorName: commentAuthor || '익명', postId }),
    })
    setNewComment('')
    setCommentAuthor('')
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="py-12 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href={`/church/${slug}`} className="text-white/70 text-sm hover:text-white">← {church.name}</Link>
          <h1 className="text-3xl font-bold mt-4">💬 커뮤니티</h1>
          <p className="text-white/80 mt-2">{posts.length}개의 글</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 게시판 탭 */}
        {boards.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setActiveBoard(null)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${!activeBoard ? 'text-white' : 'bg-gray-200 text-gray-700'}`} style={!activeBoard ? { backgroundColor: colors.primary } : {}}>전체</button>
            {boards.map(b => (
              <button key={b.id} onClick={() => setActiveBoard(b.id)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${activeBoard === b.id ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} style={activeBoard === b.id ? { backgroundColor: colors.primary } : {}}>
                {b.icon} {b.name}
              </button>
            ))}
          </div>
        )}

        {/* 글쓰기 */}
        <div className="flex justify-end mb-4">
          {canWrite() && (
            <button onClick={() => setShowNewPost(!showNewPost)} className="px-4 py-2 text-white rounded-md text-sm hover:opacity-90" style={{ backgroundColor: colors.primary }}>
              {showNewPost ? '취소' : '+ 글쓰기'}
            </button>
          )}
        </div>

        {showNewPost && (
          <form onSubmit={handleNewPost} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <input type="text" placeholder="이름 (선택)" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} className="w-40 px-3 py-2 border rounded-md text-sm" />
            <input type="text" required placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
            <textarea required rows={4} placeholder="내용을 입력하세요" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
            <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="이미지 (선택)" category="notice" />
            <button type="submit" disabled={saving} className="px-4 py-2 text-white rounded-md text-sm disabled:opacity-50" style={{ backgroundColor: colors.primary }}>
              {saving ? '등록 중...' : '등록'}
            </button>
          </form>
        )}

        {/* 게시글 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow"><p className="text-gray-500">등록된 글이 없습니다.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                  <div className="flex items-center gap-2">
                    {post.pinned && <span className="text-xs">📌</span>}
                    <span className="text-xs text-gray-400">{post.authorName || '익명'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt={post.title} loading="lazy" className="mt-2 h-32 object-cover rounded-md" />}
                  <span className="text-xs text-gray-400 mt-2 inline-block">💬 {post.comments.length}</span>
                </div>

                {expandedPost === post.id && (
                  <div className="border-t px-4 py-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt={`${post.title} 이미지`} loading="lazy" className="mt-3 max-h-64 object-cover rounded-lg" />}

                    {post.comments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-gray-500">댓글 {post.comments.length}개</p>
                        {post.comments.map(c => (
                          <div key={c.id} className="bg-gray-50 rounded-md p-3">
                            <p className="text-xs text-gray-400">{c.authorName || '익명'} · {new Date(c.createdAt).toLocaleDateString('ko-KR')}</p>
                            <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <input type="text" placeholder="이름" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} className="w-20 px-2 py-1.5 border rounded text-xs" />
                      <input type="text" placeholder="댓글을 입력하세요" value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 px-3 py-1.5 border rounded text-sm" onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)} />
                      <button onClick={() => handleComment(post.id)} className="px-3 py-1.5 text-white rounded text-xs" style={{ backgroundColor: colors.primary }}>등록</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href={`/church/${slug}`} className="hover:underline" style={{ color: colors.primary }}>← 교회 메인으로</Link>
        </div>
      </div>
    </main>
  )
}
