import DOMPurify from 'isomorphic-dompurify'

/**
 * HTML 입력 정제 (XSS 방지)
 * 허용되는 태그만 남기고 나머지 제거
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a',
      'blockquote',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * 텍스트 입력 정제 (HTML 태그 완전 제거)
 */
export function sanitizeText(text: string): string {
  // HTML 태그 제거
  const withoutTags = text.replace(/<[^>]*>/g, '')
  
  // 특수 문자 이스케이프
  return withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * URL 정제 (javascript: 프로토콜 방지)
 */
export function sanitizeURL(url: string): string {
  // 프로토콜 확인
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  
  try {
    const parsed = new URL(url)
    if (!allowedProtocols.includes(parsed.protocol)) {
      return ''
    }
    return url
  } catch {
    // 상대 경로나 잘못된 URL
    if (url.startsWith('/') || url.startsWith('#')) {
      return url
    }
    return ''
  }
}

/**
 * 객체 내 모든 문자열 정제
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    html?: boolean // HTML 허용 여부
  } = {}
): T {
  const { html = false } = options
  
  const result: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = html ? sanitizeHTML(value) : sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, options)
    } else {
      result[key] = value
    }
  }
  
  return result as T
}
