import { prisma } from '@/lib/prisma'

// 기본 제공 플러그인 목록
const defaultPlugins = [
  // === 섹션 플러그인 ===
  {
    name: 'hero-image',
    type: 'section',
    label: '이미지 히어로',
    description: '배경 이미지가 있는 히어로 배너',
    icon: '🖼️',
    defaultConfig: { title: '', subtitle: '', imageUrl: '', overlay: true },
    configSchema: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'subtitle', label: '부제목', type: 'text' },
      { key: 'imageUrl', label: '배경 이미지', type: 'image' },
      { key: 'overlay', label: '오버레이', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'hero-video',
    type: 'section',
    label: '비디오 히어로',
    description: 'YouTube 영상이 배경인 히어로 배너',
    icon: '🎬',
    defaultConfig: { title: '', subtitle: '', youtubeUrl: '', overlay: true },
    configSchema: [
      { key: 'title', label: '제목', type: 'text' },
      { key: 'subtitle', label: '부제목', type: 'text' },
      { key: 'youtubeUrl', label: 'YouTube URL', type: 'text' },
      { key: 'overlay', label: '오버레이', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'sermon-list',
    type: 'section',
    label: '설교 목록',
    description: '최신 설교를 리스트 형태로 표시',
    icon: '📖',
    defaultConfig: { limit: 5, showThumbnail: true, layout: 'list' },
    configSchema: [
      { key: 'limit', label: '표시 개수', type: 'number', defaultValue: 5 },
      { key: 'showThumbnail', label: '썸네일 표시', type: 'boolean', defaultValue: true },
      { key: 'layout', label: '레이아웃', type: 'select', options: [
        { label: '리스트', value: 'list' },
        { label: '카드', value: 'cards' },
        { label: '추천', value: 'featured' },
      ]},
    ],
  },
  {
    name: 'notice-board',
    type: 'section',
    label: '공지사항',
    description: '공지사항 게시판 섹션',
    icon: '📋',
    defaultConfig: { limit: 5, showPinned: true },
    configSchema: [
      { key: 'limit', label: '표시 개수', type: 'number', defaultValue: 5 },
      { key: 'showPinned', label: '고정글 표시', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'gallery-grid',
    type: 'section',
    label: '갤러리 그리드',
    description: '사진 갤러리 그리드 뷰',
    icon: '🖼️',
    defaultConfig: { columns: 3, showTitle: true },
    configSchema: [
      { key: 'columns', label: '열 개수', type: 'select', options: [
        { label: '2열', value: '2' },
        { label: '3열', value: '3' },
        { label: '4열', value: '4' },
      ]},
      { key: 'showTitle', label: '제목 표시', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'calendar-view',
    type: 'section',
    label: '교회 달력',
    description: '월별/주간 교회 일정 달력',
    icon: '📅',
    defaultConfig: { defaultView: 'month' },
    configSchema: [
      { key: 'defaultView', label: '기본 뷰', type: 'select', options: [
        { label: '월간', value: 'month' },
        { label: '주간', value: 'week' },
      ]},
    ],
  },
  {
    name: 'contact-info',
    type: 'section',
    label: '연락처 정보',
    description: '교회 주소, 전화, 지도 표시',
    icon: '📍',
    defaultConfig: { showMap: true },
    configSchema: [
      { key: 'showMap', label: '지도 표시', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'about-church',
    type: 'section',
    label: '교회 소개',
    description: '교회 소개, 비전, 담임목사 인사말',
    icon: '⛪',
    defaultConfig: { showHistory: true, showPastor: true },
    configSchema: [
      { key: 'showHistory', label: '교회 역사 표시', type: 'boolean', defaultValue: true },
      { key: 'showPastor', label: '담임목사 표시', type: 'boolean', defaultValue: true },
    ],
  },
  {
    name: 'community-board',
    type: 'section',
    label: '커뮤니티',
    description: '게시판형 커뮤니티 섹션',
    icon: '💬',
    defaultConfig: { limit: 10 },
    configSchema: [
      { key: 'limit', label: '표시 개수', type: 'number', defaultValue: 10 },
    ],
  },

  // === 기능 플러그인 ===
  {
    name: 'donation',
    type: 'feature',
    label: '온라인 헌금',
    description: '온라인 헌금 결제 시스템',
    icon: '💰',
    defaultConfig: { provider: 'toss', minAmount: 1000 },
    configSchema: [
      { key: 'provider', label: '결제 provider', type: 'select', options: [
        { label: '토스페이먼츠', value: 'toss' },
        { label: 'KG이니시스', value: 'inicis' },
      ]},
      { key: 'minAmount', label: '최소 금액', type: 'number', defaultValue: 1000 },
    ],
  },
  {
    name: 'prayer-request',
    type: 'feature',
    label: '기도 요청',
    description: '성도들이 기도 제목을 나누는 기능',
    icon: '🙏',
    defaultConfig: { anonymous: true, moderation: false },
    configSchema: [
      { key: 'anonymous', label: '익명 허용', type: 'boolean', defaultValue: true },
      { key: 'moderation', label: '승인제', type: 'boolean', defaultValue: false },
    ],
  },

  // === 테마 플러그인 ===
  {
    name: 'theme-modern',
    type: 'theme',
    label: '모던',
    description: '깔끔하고 현대적인 디자인',
    icon: '🎨',
    defaultConfig: {
      colors: { primary: '#2d5aa0', secondary: '#5ba3e0', accent: '#ff6b6b', background: '#ffffff' },
      font: 'sans-serif',
      layout: 'modern',
    },
  },
  {
    name: 'theme-traditional',
    type: 'theme',
    label: '전통',
    description: '따뜻하고 전통적인 디자인',
    icon: '🏛️',
    defaultConfig: {
      colors: { primary: '#1e3a5f', secondary: '#8b7355', accent: '#d4af37', background: '#faf8f5' },
      font: 'serif',
      layout: 'traditional',
    },
  },
  {
    name: 'theme-minimal',
    type: 'theme',
    label: '미니멀',
    description: '단순하고 깨끗한 디자인',
    icon: '✨',
    defaultConfig: {
      colors: { primary: '#333333', secondary: '#666666', accent: '#00bcd4', background: '#ffffff' },
      font: 'sans-serif',
      layout: 'minimal',
    },
  },

  // === 위젯 플러그인 ===
  {
    name: 'visitor-counter',
    type: 'widget',
    label: '방문자 카운터',
    description: '사이트 방문자 수 표시',
    icon: '👁️',
    defaultConfig: { position: 'footer', style: 'minimal' },
  },
  {
    name: 'weekly-verse',
    type: 'widget',
    label: '주간 말씀',
    description: '매주 바뀌는 성경 구절 표시',
    icon: '📜',
    defaultConfig: { position: 'sidebar' },
  },
]

export async function initPlugins() {
  console.log('🔌 Initializing plugins...')

  for (const plugin of defaultPlugins) {
    await prisma.plugin.upsert({
      where: { name: plugin.name },
      update: {
        type: plugin.type,
        label: plugin.label,
        description: plugin.description,
        icon: plugin.icon,
        config: JSON.stringify(plugin.defaultConfig),
        configSchema: JSON.stringify(plugin.configSchema || []),
      },
      create: {
        name: plugin.name,
        type: plugin.type,
        label: plugin.label,
        description: plugin.description,
        icon: plugin.icon,
        config: JSON.stringify(plugin.defaultConfig),
        configSchema: JSON.stringify(plugin.configSchema || []),
      },
    })
  }

  console.log(`✅ ${defaultPlugins.length} plugins initialized`)
}
