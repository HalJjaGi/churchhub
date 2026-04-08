'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type ChurchStats = {
  id: string
  name: string
  slug: string
  plan: string
  _count: { users: number; sermons: number; notices: number }
}

type RecentUser = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  church: { name: string; slug: string } | null
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ churches: 0, users: 0, sermons: 0, notices: 0 })
  const [churches, setChurches] = useState<ChurchStats[]>([])
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [churchRes, userRes] = await Promise.all([
        fetch('/api/churches'),
        fetch('/api/users'),
      ])

      if (churchRes.ok) {
        const churchData = await churchRes.json()
        setChurches(churchData)
        
        let totalUsers = 0, totalSermons = 0, totalNotices = 0
        churchData.forEach((c: ChurchStats) => {
          totalUsers += c._count?.users || 0
          totalSermons += c._count?.sermons || 0
          totalNotices += c._count?.notices || 0
        })
        setStats({ churches: churchData.length, users: totalUsers, sermons: totalSermons, notices: totalNotices })
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setRecentUsers(userData.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ChurchHub</h1>
              <p className="text-sm text-gray-500">Super Admin 대시보드</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '교회', value: stats.churches, color: 'bg-blue-500', href: '/admin/churches' },
            { label: '계정', value: stats.users, color: 'bg-green-500', href: '/admin/churches' },
            { label: '설교', value: stats.sermons, color: 'bg-purple-500', href: '#' },
            { label: '공지', value: stats.notices, color: 'bg-orange-500', href: '#' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {stat.value}
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
            <div className="space-y-3">
              <Link
                href="/admin/churches"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏢</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">교회 관리</div>
                  <div className="text-sm text-gray-500">교회 목록 조회, 추가, 계정 관리</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Churches */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">교회 목록</h2>
            <div className="divide-y">
              {churches.slice(0, 5).map((church) => (
                <Link
                  key={church.id}
                  href={`/admin/churches/${church.slug}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="font-medium text-gray-900">{church.name}</div>
                    <div className="text-sm text-gray-500">{church.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {church.plan}
                    </span>
                    <span className="text-xs text-gray-400">
                      {church._count?.users || 0}명
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {churches.length > 5 && (
              <Link href="/admin/churches" className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700">
                전체 보기 ({churches.length}개) →
              </Link>
            )}
          </div>
        </div>

        {/* Recent Users */}
        {recentUsers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 계정</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이메일</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">교회</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">역할</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{user.name || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{user.church?.name || '-'}</td>
                      <td className="px-4 py-2">
                        <RoleBadge role={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
    church_admin: { label: 'Church Admin', color: 'bg-blue-100 text-blue-700' },
    editor: { label: 'Editor', color: 'bg-green-100 text-green-700' },
    member: { label: 'Member', color: 'bg-gray-100 text-gray-600' },
  }
  const c = config[role] || config.member
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.color}`}>{c.label}</span>
}
