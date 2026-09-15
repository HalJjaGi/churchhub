'use client'

import Link from 'next/link'

export default function ThemeTestPage() {
  return (
    <div className='min-h-screen bg-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            🎨 테마 선택기 테스트 페이지
          </h1>
          <p className='text-gray-600'>
            이 페이지는 테마 선택기가 정상적으로 작동하는지 테스트하기 위한 페이지입니다.
          </p>
          <Link href='/' className='text-blue-600 hover:underline'>
            ← 메인 페이지로 돌아가기
          </Link>
        </div>

        <div className='bg-blue-50 rounded-xl p-6 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            테마 선택기 섹션 (이것이 보여야 합니다)
          </h2>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
            <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <span className='px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full'>
                  classic + warm
                </span>
                <span className='text-xl'>✨</span>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>전통적 클래식</h3>
              <p className='text-gray-600 text-sm mb-4'>장엄하고 신성한 분위기</p>
              <button className='w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-orange-800 transition-all'>
                이 테마 선택하기
              </button>
            </div>

            <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <span className='px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full'>
                  modern + cool
                </span>
                <span className='text-xl'>✨</span>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>모던 클린</h3>
              <p className='text-gray-600 text-sm mb-4'>세련되고 깔끔한 현대 디자인</p>
              <button className='w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all'>
                이 테마 선택하기
              </button>
            </div>

            <div className='bg-white rounded-xl p-6 border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <span className='px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full'>
                  minimal + monochrome
                </span>
                <span className='text-xl'>✨</span>
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>미니멀 퓨어</h3>
              <p className='text-gray-600 text-sm mb-4'>완벽한 미니멀리즘 디자인</p>
              <button className='w-full px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all'>
                이 테마 선택하기
              </button>
            </div>
          </div>

          <div className='bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 text-center'>
            <h3 className='text-lg font-bold text-gray-900 mb-3'>
              3,125가지 테마 조합이 가능합니다
            </h3>
            <p className='text-gray-600 text-sm'>
              5가지 구성요소로 무한한 디자인 조합을 만드세요
            </p>
          </div>
        </div>

        <div className='text-center'>
          <p className='text-sm text-gray-500'>
            이 페이지가 정상적으로 보인다면, 테마 선택기 기능이 정상적으로 작동하는 것입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
