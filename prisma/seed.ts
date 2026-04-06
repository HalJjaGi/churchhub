import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // 관리자 비밀번호 해시 생성
  const hashedPassword = await bcrypt.hash('admin123!', 10)

  // 데모 교회 데이터 생성
  const churches = await Promise.all([
    prisma.church.create({
      data: {
        slug: 'traditional-church',
        name: '전통교회',
        description: '따뜻한 공동체, 전통적인 예배',
        theme: JSON.stringify({
          colors: {
            primary: '#1e3a5f',
            secondary: '#8b7355',
            accent: '#d4af37',
            background: '#faf8f5',
          },
          font: 'serif',
          layout: 'traditional',
        }),
        modules: JSON.stringify({
          sermon: true,
          notice: true,
          community: true,
          gallery: false,
          donation: false,
        }),
        plan: 'basic',
      },
    }),
    prisma.church.create({
      data: {
        slug: 'modern-church',
        name: '모던교회',
        description: '현대적인 예배, 젊은 공동체',
        theme: JSON.stringify({
          colors: {
            primary: '#2d5aa0',
            secondary: '#5ba3e0',
            accent: '#ff6b6b',
            background: '#ffffff',
          },
          font: 'sans-serif',
          layout: 'modern',
        }),
        modules: JSON.stringify({
          sermon: true,
          notice: true,
          community: true,
          gallery: true,
          donation: true,
        }),
        plan: 'pro',
      },
    }),
    prisma.church.create({
      data: {
        slug: 'minimal-church',
        name: '미니멀교회',
        description: '단순함 속의 진리',
        theme: JSON.stringify({
          colors: {
            primary: '#333333',
            secondary: '#666666',
            accent: '#00bcd4',
            background: '#ffffff',
          },
          font: 'sans-serif',
          layout: 'minimal',
        }),
        modules: JSON.stringify({
          sermon: true,
          notice: true,
          community: false,
          gallery: false,
          donation: false,
        }),
        plan: 'starter',
      },
    }),
  ])

  // 테스트 사용자 생성 (비밀번호 포함)
  const user = await prisma.user.create({
    data: {
      email: 'admin@churchhub.dev',
      password: hashedPassword,
      name: '관리자',
      role: 'admin',
      churchId: churches[0].id,
    },
  })

  // 샘플 설교 데이터
  await Promise.all([
    prisma.sermon.create({
      data: {
        title: '사랑의 의미',
        content: '하나님의 사랑에 대한 깊은 묵상...',
        speaker: '김목사',
        date: new Date('2026-03-28'),
        churchId: churches[0].id,
      },
    }),
    prisma.sermon.create({
      data: {
        title: '믿음의 여정',
        content: '믿음으로 걷는 삶에 대하여...',
        speaker: '이목사',
        date: new Date('2026-03-21'),
        churchId: churches[0].id,
      },
    }),
  ])

  // 샘플 공지 데이터
  await Promise.all([
    prisma.notice.create({
      data: {
        title: '부활절 특별 예배 안내',
        content: '4월 5일 부활절 특별 예배가 있습니다.',
        churchId: churches[0].id,
      },
    }),
    prisma.notice.create({
      data: {
        title: '봄 성경 공부 모집',
        content: '새로운 성경 공부 모임을 모집합니다.',
        churchId: churches[0].id,
      },
    }),
  ])

  console.log('✅ Seed data created successfully!')
  console.log('Churches:', churches.map(c => c.name))
  console.log('User:', user.email)
  console.log('Password: admin123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
