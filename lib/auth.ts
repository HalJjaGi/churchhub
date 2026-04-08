import { hash, compare } from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * 비밀번호 강도 검증
 * - 최소 8자
 * - 영문 + 숫자 + 특수문자 각 1개 이상
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다')
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('영문자를 포함해야 합니다')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
