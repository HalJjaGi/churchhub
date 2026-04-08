import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (프로덕션에서는 Redis 사용 권장)
const store: RateLimitStore = {}

interface RateLimitConfig {
  windowMs: number // 시간 윈도우 (밀리초)
  max: number // 최대 요청 수
  message?: string // 초과 시 메시지
}

/**
 * Rate Limiter
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // 클라이언트 식별 (IP + User-Agent)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const key = `${ip}:${userAgent}`

    const now = Date.now()
    const record = store[key]

    // 만료된 기록 삭제
    if (record && now > record.resetTime) {
      delete store[key]
    }

    // 새 기록 생성 또는 카운트 증가
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
    } else {
      store[key].count++
    }

    // 한도 초과 확인
    if (store[key].count > max) {
      return NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((store[key].resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(store[key].resetTime / 1000)),
          }
        }
      )
    }

    return null // 통과
  }
}

/**
 * API Rate Limiter
 * - 일반 API: 100회/분
 * - 인증 API: 10회/분
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100,
})

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10,
  message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
})

/**
 * 정기적으로 만료된 기록 정리 (메모리 누수 방지)
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }
  }, 60 * 1000) // 1분마다 정리
}
