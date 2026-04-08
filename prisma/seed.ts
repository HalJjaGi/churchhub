import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // 관리자 비밀번호 해시 생성
  const hashedPassword = await bcrypt.hash('admin123!', 10)

  // Clear existing data (순서 중요: 외래키 제약)
  await prisma.sermon.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.user.deleteMany()
  await prisma.church.deleteMany()

  // 데모 교회 데이터 생성 (위치 정보 포함)
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
        address: '서울특별시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@traditional-church.kr',
        parking: '지하 1-2층 주차장 (200대 가능)',
        mapLat: 37.5665,
        mapLng: 126.9780,
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
        address: '서울특별시 마포구 홍대입구역 45',
        phone: '02-2345-6789',
        email: 'hello@modern-church.kr',
        parking: '건물 뒤 주차장 (50대), 주차 안내원 상주',
        mapLat: 37.5563,
        mapLng: 126.9236,
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
          notice: false,
          community: false,
          gallery: false,
          donation: false,
        }),
        plan: 'starter',
        address: '서울특별시 용산구 한남대로 78',
        phone: '02-3456-7890',
        email: 'contact@minimal-church.kr',
        parking: '주차 공간 없음 (대중교통 이용 권장)',
        mapLat: 37.5326,
        mapLng: 127.0066,
      },
    }),
    prisma.church.create({
      data: {
        slug: 'demo',
        name: '데모 교회',
        description: '샘플 교회 페이지',
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
          donation: false,
        }),
        plan: 'starter',
        address: '서울특별시 송파구 올림픽로 100',
        phone: '02-4567-8901',
        email: 'demo@churchhub.dev',
        parking: '주차장 100대 가능',
        mapLat: 37.5151,
        mapLng: 127.0730,
      },
    }),
    prisma.church.create({
      data: {
        slug: 'sae-church',
        name: '새교회',
        description: '따뜻한 공동체',
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
          gallery: false,
          donation: false,
        }),
        plan: 'basic',
        address: '서울특별시 서초구 서초대로 200',
        phone: '02-5678-9012',
        email: 'contact@sae-church.kr',
        parking: '지하 주차장 150대',
        mapLat: 37.4836,
        mapLng: 127.0322,
      },
    }),
    prisma.church.create({
      data: {
        slug: 'peace-church',
        name: '평화교회',
        description: '평화로운 예배',
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
          gallery: true,
          donation: false,
        }),
        plan: 'basic',
        address: '서울특별시 성동구 왕십리로 300',
        phone: '02-6789-0123',
        email: 'peace@peace-church.kr',
        parking: '건물 앞 주차장 80대',
        mapLat: 37.5614,
        mapLng: 127.0372,
      },
    }),
    prisma.church.create({
      data: {
        slug: 'hope-church',
        name: '소망교회',
        description: '소망을 전하는 교회',
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
        address: '서울특별시 강서구 마곡중앙로 50',
        phone: '02-7890-1234',
        email: 'hope@hope-church.kr',
        parking: '지하 1층 주차장 60대',
        mapLat: 37.5602,
        mapLng: 126.8255,
      },
    }),
  ])

  // Super Admin (할짜기 전용)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@churchhub.dev',
      password: hashedPassword,
      name: '슈퍼 관리자',
      role: 'super_admin',
      // churchId 없음 → 모든 교회 관리 가능
    },
  })

  // Church Admin (각 교회별 관리자)
  const churchAdmins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@traditional-church.kr',
        password: hashedPassword,
        name: '전통교회 관리자',
        role: 'church_admin',
        churchId: churches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@modern-church.kr',
        password: hashedPassword,
        name: '모던교회 관리자',
        role: 'church_admin',
        churchId: churches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@minimal-church.kr',
        password: hashedPassword,
        name: '미니멀교회 관리자',
        role: 'church_admin',
        churchId: churches[2].id,
      },
    }),
  ])

  // 샘플 설교 데이터 (각 교회에 2-3개씩)
  const sermonsData = [
    // 전통교회
    {
      title: '사랑의 의미',
      content: '하나님의 사랑에 대한 깊은 묵상. 요한일서 4장 8절 "사랑하지 아니하는 자는 하나님을 알지 못하나니 이는 하나님은 사랑이심이라"',
      speaker: '김목사',
      date: new Date('2026-04-05'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      churchId: churches[0].id,
    },
    {
      title: '믿음의 여정',
      content: '믿음으로 걷는 삶에 대하여. 히브리서 11장 1절 "믿음은 바라는 것들의 실체요 보지 못하는 것들의 증거라"',
      speaker: '이목사',
      date: new Date('2026-03-29'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[0].id,
    },
    {
      title: '부활의 소망',
      content: '부활절 특별 설교. 고린도전서 15장 "그리스도께서 죽은 자 가운데서 다시 살아나셨으니"',
      speaker: '김목사',
      date: new Date('2026-03-22'),
      churchId: churches[0].id,
    },
    // 모던교회
    {
      title: '젊은이여, 일어나라',
      content: '청년들을 향한 하나님의 비전. 디모데전서 4장 12절 "누구든지 네 연소함을 업신여기지 못하게 하고"',
      speaker: '박목사',
      date: new Date('2026-04-05'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[1].id,
    },
    {
      title: '공동체의 힘',
      content: '함께하는 신앙생활의 중요성. 사도행전 2장 "모두 함께 모여 교제하며"',
      speaker: '박목사',
      date: new Date('2026-03-29'),
      churchId: churches[1].id,
    },
    // 미니멀교회
    {
      title: '단순함의 힘',
      content: '복잡한 세상 속 단순한 신앙. 마태복음 11장 "수고하고 무거운 짐 진 자들아 다 내게로 오라"',
      speaker: '최목사',
      date: new Date('2026-04-05'),
      churchId: churches[2].id,
    },
    // 데모 교회
    {
      title: '새로운 시작',
      content: '새로운 마음으로 시작하는 신앙생활. 이사야 43장 19절 "보라 내가 새 일을 행하리라"',
      speaker: '정목사',
      date: new Date('2026-04-05'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[3].id,
    },
    {
      title: '은혜의 강',
      content: '하나님의 은혜가 우리를 덮으신다. 에베소서 2장 "너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 얻었나니"',
      speaker: '정목사',
      date: new Date('2026-03-29'),
      churchId: churches[3].id,
    },
    // 새교회
    {
      title: '새 마음, 새 비전',
      content: '새로운 마음으로 하나님의 비전을 품고. 에스겔 36장 26절 "새 영을 너희 속에 두고"',
      speaker: '한목사',
      date: new Date('2026-04-05'),
      churchId: churches[4].id,
    },
    {
      title: '첫사랑을 회복하라',
      content: '처음 믿음을 회복하라. 요한계시록 2장 "너의 처음 사랑을 버렸느니라"',
      speaker: '한목사',
      date: new Date('2026-03-29'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[4].id,
    },
    // 평화교회
    {
      title: '평화를 이루는 자',
      content: '평화의 복음. 마태복음 5장 "평화를 이루는 자는 복이 있나니"',
      speaker: '윤목사',
      date: new Date('2026-04-05'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[5].id,
    },
    {
      title: '주 안에서 쉼',
      content: '참된 안식. 마태복음 11장 28절 "내가 너희를 쉬게 하리라"',
      speaker: '윤목사',
      date: new Date('2026-03-29'),
      churchId: churches[5].id,
    },
    // 소망교회
    {
      title: '소망의 근원',
      content: '예수 그리스도, 우리 소망의 근원. 로마서 15장 13절 "소망의 하나님이 믿음 안에서 기쁨과 평강을 가득 채우시기를"',
      speaker: '조목사',
      date: new Date('2026-04-05'),
      churchId: churches[6].id,
    },
    {
      title: '인내의 열매',
      content: '고난 속에서 자라는 믿음. 야고보서 1장 "시련을 만나거든 온전히 기쁘게 여기라"',
      speaker: '조목사',
      date: new Date('2026-03-29'),
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      churchId: churches[6].id,
    },
  ]

  await prisma.sermon.createMany({ data: sermonsData })

  // 샘플 공지 데이터 (각 교회에 2-3개씩)
  const noticesData = [
    // 전통교회
    {
      title: '부활절 특별 예배 안내',
      content: '4월 5일 부활절 특별 예배가 있습니다. 오전 6시 새벽 예배, 오전 11시 대예배.',
      churchId: churches[0].id,
    },
    {
      title: '봄 성경 공부 모집',
      content: '새로운 성경 공부 모임을 모집합니다. 매주 화요일 오후 7시 30분.',
      churchId: churches[0].id,
    },
    {
      title: '성가대 신입 모집',
      content: '성가대에서 새로운 멤버를 모집합니다. 찬양에 관심 있는 분들은 사무실로 연락주세요.',
      churchId: churches[0].id,
    },
    // 모던교회
    {
      title: '청년 수련회 안내',
      content: '4월 마지막 주 청년 수련회가 진행됩니다. 자세한 내용은 청년부 카카오톡 방을 확인해주세요.',
      churchId: churches[1].id,
    },
    {
      title: '지역사회 봉사활동',
      content: '매월 셋째 주 토요일 지역사회 봉사활동이 있습니다. 많은 참여 바랍니다.',
      churchId: churches[1].id,
    },
    // 미니멀교회
    {
      title: '주일 예배 시간 변경',
      content: '4월부터 주일 예배 시간이 오전 10시로 변경됩니다.',
      churchId: churches[2].id,
    },
    // 데모 교회
    {
      title: '홈페이지 개편 안내',
      content: 'ChurchHub 플랫폼으로 홈페이지가 새단장했습니다. 많은 이용 바랍니다.',
      churchId: churches[3].id,
    },
    {
      title: '주차 안내',
      content: '주차는 지하 주차장을 이용해주세요. 주차 안내원의 지시에 따라주세요.',
      churchId: churches[3].id,
    },
    // 새교회
    {
      title: '새가족 환영회',
      content: '새로 오신 분들을 위한 환영회가 이번 주일 예배 후 있습니다.',
      churchId: churches[4].id,
    },
    {
      title: '기도회 안내',
      content: '매주 수요일 오후 7시 30분 기도회가 있습니다.',
      churchId: churches[4].id,
    },
    // 평화교회
    {
      title: '선교 바자회',
      content: '4월 둘째 주 토요일 선교 바자회가 열립니다. 물품 기증을 환영합니다.',
      churchId: churches[5].id,
    },
    {
      title: '장학금 신청 안내',
      content: '2026년 하반기 장학금 신청을 받습니다. 자세한 내용은 사무실로 문의주세요.',
      churchId: churches[5].id,
    },
    // 소망교회
    {
      title: '구역 모임 안내',
      content: '구역별 모임이 매주 금요일 저녁 각 가정에서 진행됩니다.',
      churchId: churches[6].id,
    },
    {
      title: '의료 선교 후원',
      content: '필리핀 의료 선교를 위한 후원금을 모집합니다.',
      churchId: churches[6].id,
    },
  ]

  await prisma.notice.createMany({ data: noticesData })

  console.log('✅ Seed data created successfully!')
  console.log(`Churches: ${churches.length}개`)
  console.log(`Sermons: ${sermonsData.length}개`)
  console.log(`Notices: ${noticesData.length}개`)
  console.log('')
  console.log('👤 Super Admin:')
  console.log(`  Email: ${superAdmin.email}`)
  console.log('  Password: admin123!')
  console.log('')
  console.log('👥 Church Admins:')
  churchAdmins.forEach((admin, i) => {
    console.log(`  ${churches[i].name}: ${admin.email} / admin123!`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
