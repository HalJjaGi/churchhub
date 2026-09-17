// 이메일 서비스 — Resend API
// 환경변수:
//   RESEND_API_KEY  — Resend API 키 (없으면 발송 생략, 로그만 기록)
//   RESEND_FROM     — 발신 주소 (기본: ChurchHub <support@churchhub.co.kr>)
//                     ※ churchhub.co.kr 도메인을 Resend에서 인증해야 해당 주소 사용 가능
//                     인증 전 테스트: RESEND_FROM=onboarding@resend.dev

type SendResult = {
  sent: boolean
  reason?: 'not_configured' | 'api_error'
  error?: string
  id?: string
}

const FROM_DEFAULT = 'ChurchHub <support@churchhub.co.kr>'

export const emailService = {
  async sendEmail(params: {
    to: string | string[]
    subject: string
    html: string
    from?: string
  }): Promise<SendResult> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.log('📧 [RESEND_API_KEY 미설정] 발송 생략 — 로그 기록:', {
        to: params.to,
        subject: params.subject,
      })
      return { sent: false, reason: 'not_configured' }
    }

    const from = params.from || process.env.RESEND_FROM || FROM_DEFAULT

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(params.to) ? params.to : [params.to],
          subject: params.subject,
          html: params.html,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        console.error('📧 이메일 발송 실패:', res.status, body)
        return { sent: false, reason: 'api_error', error: `${res.status}: ${body}` }
      }

      const data = (await res.json()) as { id?: string }
      console.log('📧 이메일 발송 성공:', { to: params.to, subject: params.subject, id: data.id })
      return { sent: true, id: data.id }
    } catch (error) {
      console.error('📧 이메일 발송 예외:', error)
      return { sent: false, reason: 'api_error', error: String(error) }
    }
  },
}
