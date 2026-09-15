// 이메일 서비스
// SMTP가 설정되면 실제 발송으로 교체한다. 현재는 로그만 남긴다.
// 필요한 환경변수 (설정 시 구현 예정):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
export const emailService = {
  async sendEmail(params: {
    to: string | string[]
    subject: string
    html: string
    from?: string
  }) {
    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
    if (!smtpConfigured) {
      console.log('📧 [SMTP 미설정] 이메일 발송 생략 — 로그 기록:', {
        to: params.to,
        subject: params.subject,
      })
      return { sent: false, reason: 'smtp_not_configured' as const }
    }
    // SMTP 구현 예정 (nodemailer) — 크레덴셜 제공 시 활성화
    console.log('📧 SMTP 설정 감지 — 발송 구현 대기 중:', {
      to: params.to,
      subject: params.subject,
    })
    return { sent: false, reason: 'smtp_not_implemented' as const }
  }
}
