'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApplyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // 교회 기본 정보
    churchName: '',
    churchNameEnglish: '',
    pastorName: '',
    contactPhone: '',
    contactEmail: '',

    // 교회 상세 정보
    address: '',
    website: '',
    description: '',
    memberCount: '',
    establishedYear: '',

    // 테마 선택
    theme: 'modern',

    // 약관 동의
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 영문명 유효성 검사 - 영어, 숫자, 하이픈만 허용
  const validateEnglishName = (name: string): boolean => {
    return /^[a-zA-Z0-9-]+$/.test(name)
  }

  // 영문명을 slug 형식으로 변환
  const convertToSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 필수 필드 검증
    if (!formData.churchName.trim()) {
      newErrors.churchName = '교회명을 입력해주세요'
    }
    if (!formData.churchNameEnglish.trim()) {
      newErrors.churchNameEnglish = '교회 영문명을 입력해주세요'
    } else if (!validateEnglishName(formData.churchNameEnglish)) {
      newErrors.churchNameEnglish = '영문명은 영문자, 숫자, 하이픈(-)만 사용할 수 있습니다'
    }
    if (!formData.pastorName.trim()) {
      newErrors.pastorName = '담임목사 이름을 입력해주세요'
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = '연락처를 입력해주세요'
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = '이메일을 입력해주세요'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = '유효한 이메일 주소를 입력해주세요'
    }
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요'
    }

    // 약관 동의 검증
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '이용약관에 동의해주세요'
    }
    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/churches/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // 신청 성공
        alert('교회 신청이 완료되었습니다!\\n\\n📝 신청이 정상적으로 접수되었습니다.\\n📞 곧 연락드려 필요한 추가 정보를 안내해 드릴 예정입니다.\\n\\n감사합니다!\\n- ChurchHub 팀')
        router.push('/')
      } else {
        const error = await response.json()
        alert(error.message || '신청 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('신청 오류:', error)
      alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    // 영문명 입력시 실시간 유효성 검사
    if (name === 'churchNameEnglish') {
      // 영어, 숫자, 하이픈만 허용하고 자동으로 소문자로 변환
      const englishValue = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
      
      setFormData(prev => ({
        ...prev,
        [name]: englishValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">⛪ ChurchHub</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                로그인
              </Link>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            교회 웹사이트 신청
          </h1>
          <p className="text-lg text-gray-600">
            ChurchHub으로 전문적인 교회 웹사이트를 만들어보세요
          </p>
        </div>

        {/* 신청 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. 교회 기본 정보 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                교회 기본 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-2">
                    교회명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="churchName"
                    name="churchName"
                    value={formData.churchName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.churchName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 서울중앙교회"
                  />
                  {errors.churchName && (
                    <p className="mt-1 text-sm text-red-600">{errors.churchName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="churchNameEnglish" className="block text-sm font-medium text-gray-700 mb-2">
                    교회 영문명 <span className="text-blue-600">🔗</span>
                  </label>
                  <input
                    type="text"
                    id="churchNameEnglish"
                    name="churchNameEnglish"
                    value={formData.churchNameEnglish}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.churchNameEnglish ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: seoul-central-church"
                  />
                  <p className="mt-1 text-sm text-gray-500">교회 영문명은 교회 사이트 주소로 사용됩니다.</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                    <span className="text-gray-600">사이트 주소: </span>
                    <span className="font-mono text-blue-700">churchhub.co.kr/church/</span>
                    <span id="slugPreview" className="font-bold text-blue-800">
                      {formData.churchNameEnglish ? 
                        convertToSlug(formData.churchNameEnglish) : 'church-name'
                      }
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    영문자(a-z), 숫자(0-9), 하이픈(-)만 입력 가능하며 자동으로 소문자로 변환됩니다.
                  </p>
                </div>

                <div>
                  <label htmlFor="pastorName" className="block text-sm font-medium text-gray-700 mb-2">
                    담임목사 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pastorName"
                    name="pastorName"
                    value={formData.pastorName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.pastorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 김민수"
                  />
                  <p className="mt-1 text-sm text-gray-500">성함만 입력해주세요. '목사' 호칭은 자동으로 표시됩니다.</p>
                  {errors.pastorName && (
                    <p className="mt-1 text-sm text-red-600">{errors.pastorName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 010-1234-5678"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: church@example.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">신청 결과 안내에 사용되니 정확히 입력해주세요.</p>
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. 교회 상세 정보 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                교회 상세 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="예: 서울특별시 강남구 테헤란로 123"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="establishedYear" className="block text-sm font-medium text-gray-700 mb-2">
                    설립년도
                  </label>
                  <input
                    type="number"
                    id="establishedYear"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 1990"
                    min="1800"
                    max="2026"
                  />
                </div>

                <div>
                  <label htmlFor="memberCount" className="block text-sm font-medium text-gray-700 mb-2">
                    교인 수
                  </label>
                  <input
                    type="number"
                    id="memberCount"
                    name="memberCount"
                    value={formData.memberCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 500"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    교회 소개 <span className="text-gray-400 text-xs">(선택사항)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="교회의 특징이나 비전, 사역 내용 등을 간략하게 소개해주세요."
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    기존 웹사이트 <span className="text-gray-400 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: https://seoulchurch.org"
                  />
                  <p className="mt-1 text-sm text-gray-500">기존에 운영 중인 웹사이트가 있다면 입력해주세요.</p>
                </div>
              </div>
            </div>

            {/* 3. 테마 선택 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                테마 선택
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'modern', name: '모던', desc: '깔끔하고 세련된 디자인', color: 'bg-blue-500' },
                  { id: 'classic', name: '클래식', desc: '전통적이고 신중한 디자인', color: 'bg-gray-600' },
                  { id: 'warm', name: '웜', desc: '따뜻하고 친근한 디자인', color: 'bg-orange-500' }
                ].map((theme) => (
                  <div key={theme.id}>
                    <input
                      type="radio"
                      id={theme.id}
                      name="theme"
                      value={theme.id}
                      checked={formData.theme === theme.id}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor={theme.id}
                      className={`block p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.theme === theme.id
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-full h-20 ${theme.color} rounded-lg mb-4`}></div>
                      <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                      <p className="text-sm text-gray-600">{theme.desc}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 약관 동의 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                약관 동의
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="agreeTerms" className="text-sm font-medium text-gray-900 block">
                      이용약관 동의 (필수) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      ChurchHub 서비스 이용약관에 동의합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreePrivacy"
                    name="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onChange={handleInputChange}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="agreePrivacy" className="text-sm font-medium text-gray-900 block">
                      개인정보처리방침 동의 (필수) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      교회명, 담임목사, 연락처 등 신청에 필요한 최소한의 개인정보를 수집하고 이용하는 것에 동의합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeMarketing"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleInputChange}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="agreeMarketing" className="text-sm font-medium text-gray-900 block">
                      마케팅 정보 수신 동의 (선택)
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      ChurchHub의 새로운 소식과 이벤트 정보를 받아보실 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>
                    동의 철회는 계정 설정 또는 support@churchhub.co.kr으로 문의해주세요.
                    수집된 개인정보는 개인정보처리방침에 따라 관리됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '신청 중...' : '교회 신청하기'}
              </button>
            </div>
          </form>
        </div>

        {/* 안내문구 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">신청 안내</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 신청 후 3영업일 내로 검토하여 결과를 알려드립니다</li>
            <li>• 승인 시 무료로 교회 웹사이트가 생성됩니다</li>
            <li>• 필요한 추가 정보는 나중에 연락드려 안내해 드립니다</li>
            <li>• 문의사항이 있으시면 고객지원으로 연락주세요</li>
          </ul>
        </div>

        {/* 고객지원 정보 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>문의: 070-8065-7623 | 이메일: support@churchhub.co.kr</p>
          <p className="mt-2">평일 9:00-18:00 (주말 및 공휴일 제외)</p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-blue-600">
              📋 신청하신 내역을 확인하고 싶으신가요?
            </p>
            <Link href="/apply/status" className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium">
              신청 상태 확인하기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
