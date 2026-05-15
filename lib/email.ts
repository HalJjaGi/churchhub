// 임시: resend 비활성화 버전
export const emailService = {
  async sendEmail(params: {
    to: string | string[]
    subject: string
    html: string
    from?: string
  }) {
    console.log('📧 Email sending disabled (temporarily)')
    console.log('To:', params.to)
    console.log('Subject:', params.subject)
    return true // 임시로 성공 반환
  }
}
