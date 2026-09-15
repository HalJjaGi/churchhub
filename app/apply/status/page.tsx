'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApplicationStatusPage() {
  const router = useRouter()
  const [churchName, setChurchName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [applicationData, setApplicationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNotFound(false)
    
    try {
      // 실제로는 API 호출을 해야하지만, 현재는 데모용으로 구현
      // 나중에 실제 API 엔드포인트로 연결
      const response = await fetch('/api/applications/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchName,
          contactEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.application) {
          setApplicationData(data.application)
        } else {
          setNotFound(true)
        }
      } else {
        // API가 없으니 데모 데이터로 대체
        if (churchName && contactEmail) {
          // 데모용 응답
          setApplicationData({
            id: 'DEMO-001',
            churchName: churchName,
            status: 'under_review', // pending, approved, rejected
            submittedAt: '2026-05-20 09:00:00',
            estimatedCompletion: '2026-05-23 18:00:00',
            contactEmail: contactEmail,
            contactPhone: '010-1234-5678',
            address: '서울특별시 양천구 목동중앙로 43',
            theme: 'modern',
            message: '신청이 정상적으로 접수되었습니다. 현재 검토 중입니다.',
          })
        } else {
          setNotFound(true)
        }
      }
    } catch (error) {
      console.error('Error searching application:', error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '승인 완료'
      case 'rejected':
        return '반려'
      case 'pending':
        return '대기 중'
      case 'under_review':
        return '검토 중'
      default:
        return '상태 확인 중'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link className="flex items-center gap-2" href="/">
              <span className="text-2xl font-bold text-blue-600">⛪ ChurchHub</span>
            </Link>
            <div className="flex gap-4">
              <Link className="text-sm text-gray-600 hover:text-gray-900" href="/apply">신청하기</Link>
              <Link className="text-sm text-gray-600 hover:text-gray-900" href="/">홈으로</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">신청 상태 조회</h1>
          <p className="text-lg text-gray-600">교회 신청 현황을 확인해보세요</p>
        </div>

        {!applicationData ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-2">
                  교회명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="churchName"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="신청하신 교회명을 입력해주세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  신청 시 사용한 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="신청 시 사용한 이메일 주소를 입력해주세요"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !churchName || !contactEmail}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '조회 중...' : '신청 상태 조회하기'}
              </button>
            </form>

            {notFound && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  입력하신 정보로 신청 내역을 찾을 수 없습니다. 교회명과 이메일 주소를 정확하게 입력했는지 확인해주세요.
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">신청 상태 안내</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-900">대기 중</span>
                  </div>
                  <p className="text-sm text-gray-600">신청이 접수되어 검토 대기 중인 상태입니다</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-900">검토 중</span>
                  </div>
                  <p className="text-sm text-gray-600">신청 내용을 검토하고 있는 상태입니다</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-900">승인 완료</span>
                  </div>
                  <p className="text-sm text-gray-600">신청이 승인되어 웹사이트 생성이 진행됩니다</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-900">반려</span>
                  </div>
                  <p className="text-sm text-gray-600">신청이 반려되었습니다. 문의해주세요</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 상태 헤더 */}
            <div className={`p-6 ${getStatusColor(applicationData.status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{applicationData.churchName}</h2>
                  <p className="text-sm opacity-90">신청번호: {applicationData.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(applicationData.status)}`}>
                    {getStatusText(applicationData.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">신청일시</h3>
                  <p className="text-gray-900">{applicationData.submittedAt}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">예상 완료일</h3>
                  <p className="text-gray-900">{applicationData.estimatedCompletion}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">연락처 이메일</h3>
                  <p className="text-gray-900">{applicationData.contactEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">연락처</h3>
                  <p className="text-gray-900">{applicationData.contactPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">교회 주소</h3>
                  <p className="text-gray-900">{applicationData.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">선택 테마</h3>
                  <p className="text-gray-900">
                    {applicationData.theme === 'modern' && '모던'}
                    {applicationData.theme === 'classic' && '클래식'}
                    {applicationData.theme === 'warm' && '웜'}
                  </p>
                </div>
              </div>

              {applicationData.message && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">처리 안내</h3>
                  <p className="text-sm text-blue-800">{applicationData.message}</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setApplicationData(null)
                      setChurchName('')
                      setContactEmail('')
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    다른 신청 조회하기
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    홈으로 가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">문의사항이 있으신가요?</h3>
            <p className="text-sm text-blue-800 mb-4">
              신청 상태나 웹사이트 제작 과정에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm text-blue-700">
              <span>📞 070-8065-7623</span>
              <span>•</span>
              <span>📧 support@churchhub.co.kr</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              평일 9:00-18:00 (주말 및 공휴일 제외)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
