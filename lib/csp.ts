import { NextRequest, NextResponse } from 'next/server'

// CSP nonce 생성
export function generateNonce(): string {
  const array = new Uint8Array(16)
  // crypto.randomUUID 기반으로 간단하게
  return crypto.randomUUID().replace(/-/g, '')
}

// CSP 헤더 생성 (nonce 포함)
export function getCSPHeaders(nonce: string) {
  return {
    'Content-Security-Policy': [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      `img-src 'self' data: https://img.youtube.com https://i.ytimg.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `frame-src https://www.youtube.com https://youtube.com`,
      `connect-src 'self'`,
    ].join('; '),
  }
}
