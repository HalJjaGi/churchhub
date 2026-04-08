// YouTube URL에서 비디오 ID 추출
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // 다양한 YouTube URL 형식 지원
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// YouTube 썸네일 URL 가져오기
export function getYouTubeThumbnail(videoId: string): string {
  // maxresdefault (최고 화질) → hqdefault (고화질) 순으로 시도
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

// YouTube 임베드 URL 생성
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

// YouTube watch URL 생성
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}
