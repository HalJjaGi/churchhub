import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Rate limit store 인터페이스 (나중에 Redis로 교체 가능)
interface RateLimitStore {
  get(key: string): RateLimitRecord | undefined
  set(key: string, record: RateLimitRecord): void
  delete(key: string): void
  keys(): string[]
}

// In-memory store (프로덕션에서는 Redis 구현체로 교체)
class MemoryStore implements RateLimitStore {
  private store: Record<string, RateLimitRecord> = {}

  get(key: string) { return this.store[key] }
  set(key: string, record: RateLimitRecord) { this.store[key] = record }
  delete(key: string) { delete this.store[key] }
  keys() { return Object.keys(this.store) }
}

const store: RateLimitStore = new MemoryStore()

// 정기적으로 만료된 기록 정리 (메모리 누수 방지)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const key of store.keys()) {
      const record = store.get(key)
      if (record && record.resetTime < now) {
        store.delete(key)
      }
    }
  }, 60 * 1000)
}

interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
}

/**
 * Rate Limiter
 * store를 교체하면 Redis 등 외부 스토어 사용 가능
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' } = config

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const key = `${ip}:${userAgent}`

    const now = Date.now()
    let record = store.get(key)

    // 만료된 기록 삭제
    if (record && now > record.resetTime) {
      store.delete(key)
      record = undefined
    }

    // 새 기록 생성 또는 카운트 증가
    if (!record) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
    } else {
      record.count++
      store.set(key, record)
    }

    const currentRecord = store.get(key)!

    // 한도 초과 확인
    if (currentRecord.count > max) {
      return NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((currentRecord.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((currentRecord.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(currentRecord.resetTime / 1000)),
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
  windowMs: 60 * 1000,
  max: 100,
})

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
})
