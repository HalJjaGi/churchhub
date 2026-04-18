'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { validatePasswordStrength } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 비밀번호 입력 시 강도 검증
    if (name === 'password') {
      const { valid, errors: passwordErrors } = validatePasswordStrength(value)
      if (!valid && value.length > 0) {
        setErrors(passwordErrors)
      } else {
        setErrors([])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // 비밀번호 일치 확인
    if (formData.password !== formData.confirmPassword) {
      setErrors(['비밀번호가 일치하지 않습니다'])
      setLoading(false)
      return
    }

    // 비밀번호 강도 검증
    const { valid, errors: passwordErrors } = validatePasswordStrength(formData.password)
    if (!valid) {
      setErrors(passwordErrors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setErrors([data.error || '회원가입 중 오류가 발생했습니다'])
      }
    } catch (error) {
      setErrors(['서버 오류가 발생했습니다'])
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const password = formData.password
    if (password.length === 0) return 'bg-gray-200'
    
    const strength = validatePasswordStrength(password)
    if (strength.valid) return 'bg-green-500'
    
    const errorCount = strength.errors.length
    if (errorCount <= 1) return 'bg-yellow-500'
    if (errorCount <= 2) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getPasswordStrengthText = () => {
    const password = formData.password
    if (password.length === 0) return ''
    
    const strength = validatePasswordStrength(password)
    if (strength.valid) return '강함'
    
    const errorCount = strength.errors.length
    if (errorCount <= 1) return '보통'
    if (errorCount <= 2) return '약함'
    return '매우 약함'
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">회원가입 완료!</h2>
            <p className="text-gray-600">로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ChurchHub 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            새로운 계정을 생성하세요
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <ul className="list-disc list-inside text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${Math.min(100, (formData.password.length / 12) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {[
                      { label: '8자 이상', met: formData.password.length >= 8 },
                      { label: '영문자 포함', met: /[a-zA-Z]/.test(formData.password) },
                      { label: '숫자 포함', met: /[0-9]/.test(formData.password) },
                      { label: '특수문자 포함 (!@#$% 등)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <span className={`mr-1 ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
                          {req.met ? '✓' : '○'}
                        </span>
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                로그인
              </a>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}