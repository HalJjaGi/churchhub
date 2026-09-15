import Link from 'next/link'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ChurchHub 교회 갤러리
        </h1>
        <p className="text-lg text-gray-600">
          교회 웹사이트 예시를 살펴보세요
        </p>
        <Link href="/" className="text-blue-600">홈으로 돌아가기</Link>
      </div>
    </div>
  )
}
