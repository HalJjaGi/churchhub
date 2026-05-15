'use client'

interface FooterProps {
  churchSlug?: string
}

export default function Footer({ churchSlug }: FooterProps) {
  // 기본값 (메인 페이지용) - 사용자가 요청한 정보로 업데이트
  const businessInfo = {
    business_name: 'ChurchHub',
    business_owner: '이지원',
    business_number: '753-06-03404',
    business_address: '서울특별시 양천구 목동중앙로 43 2층',
    business_phone: '070-8065-7623'
  }

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-gray-800 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 교회 정보 */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">{businessInfo.business_name}</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="font-medium">대표자명:</span> {businessInfo.business_owner}</p>
                <p><span className="font-medium">사업자등록번호:</span> {businessInfo.business_number}</p>
                <p><span className="font-medium">사업장 주소:</span> {businessInfo.business_address}</p>
                <p><span className="font-medium">전화번호:</span> {businessInfo.business_phone}</p>
              </div>
            </div>
            
            {/* 빠른 링크 */}
            <div>
              <h4 className="text-md font-semibold mb-4">빠른 링크</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/" className="hover:text-white transition-colors">홈</a></li>
                <li><a href="/donate" className="hover:text-white transition-colors">후원하기</a></li>
                <li><a href="/api/subscribe" className="hover:text-white transition-colors">구독신청</a></li>
              </ul>
            </div>
            
            {/* 고객지원 */}
            <div>
              <h4 className="text-md font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2026 {businessInfo.business_name}. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-2 md:mt-0">
              Powered by ChurchHub
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
