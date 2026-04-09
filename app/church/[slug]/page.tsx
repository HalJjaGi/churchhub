import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Theme, Modules, ChurchData } from '@/components/church/types'
import { defaultTheme, defaultModules } from '@/components/church/types'
import { NavTop } from '@/components/church/Navigation/NavTop'
import { ImageHero } from '@/components/church/Hero/ImageHero'
import { GradientHero } from '@/components/church/Hero/GradientHero'
import { TextHero } from '@/components/church/Hero/TextHero'
import { SermonList } from '@/components/church/SermonSection/SermonList'
import { SermonCards } from '@/components/church/SermonSection/SermonCards'
import { SermonFeatured } from '@/components/church/SermonSection/SermonFeatured'
import { NoticeTable } from '@/components/church/NoticeSection/NoticeTable'
import { NoticeCards } from '@/components/church/NoticeSection/NoticeCards'
import { NoticeTimeline } from '@/components/church/NoticeSection/NoticeTimeline'
import { ContactClassic } from '@/components/church/ContactSection/ContactClassic'
import { FooterFull } from '@/components/church/Footer/FooterFull'
import { FooterMinimal } from '@/components/church/Footer/FooterMinimal'
import { WorshipSchedule } from '@/components/church/WorshipSchedule/WorshipSchedule'
import { ScheduleList } from '@/components/church/ScheduleSection/ScheduleList'
import Link from 'next/link'

export default async function ChurchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      sermons: { orderBy: { date: 'desc' }, take: 6 },
      notices: { orderBy: { createdAt: 'desc' }, take: 5 },
      schedules: { orderBy: { date: 'asc' }, take: 10 },
    },
  })

  if (!church) notFound()

  let theme: Theme
  try { theme = JSON.parse(church.theme) } catch { theme = defaultTheme }

  let modules: Modules
  try { modules = JSON.parse(church.modules) } catch { modules = defaultModules }

  const churchData: ChurchData = {
    id: church.id,
    name: church.name,
    slug: church.slug,
    description: church.description,
    address: church.address,
    phone: church.phone,
    email: church.email,
    parking: church.parking,
    mapLat: church.mapLat,
    mapLng: church.mapLng,
    sermons: church.sermons,
    notices: church.notices,
  }

  // 레이아웃에 따라 컴포넌트 선택
  const layout = theme.layout || 'modern'
  const sections = (theme as { sections?: { hero: string; sermon: string; notice: string; footer: string } }).sections

  // 히어로 선택
  const HeroComponent = (sections?.hero === 'image') ? ImageHero
    : (sections?.hero === 'text') ? TextHero
    : (layout === 'traditional') ? ImageHero
    : (layout === 'minimal') ? TextHero
    : GradientHero

  // 설교 섹션 선택
  const SermonComponent = (sections?.sermon === 'list') ? SermonList
    : (sections?.sermon === 'featured') ? SermonFeatured
    : (sections?.sermon === 'cards') ? SermonCards
    : (layout === 'traditional') ? SermonList
    : (layout === 'minimal') ? SermonList
    : SermonCards

  // 공지 섹션 선택
  const NoticeComponent = (sections?.notice === 'table') ? NoticeTable
    : (sections?.notice === 'timeline') ? NoticeTimeline
    : (sections?.notice === 'cards') ? NoticeCards
    : (layout === 'traditional') ? NoticeTable
    : (layout === 'minimal') ? NoticeTimeline
    : NoticeCards

  // 푸터 선택
  const FooterComponent = (sections?.footer === 'minimal') ? FooterMinimal
    : (layout === 'minimal') ? FooterMinimal
    : FooterFull

  // 미니멀 레이아웃은 사이드바 + 중앙 콘텐츠
  if (layout === 'minimal') {
    return (
      <div
        style={{
          '--color-primary': theme.colors.primary,
          '--color-secondary': theme.colors.secondary,
          '--color-accent': theme.colors.accent,
          '--color-background': theme.colors.background,
          '--font-family': theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
        } as React.CSSProperties}
        className="min-h-screen flex"
      >
        <div className="flex-1">
          <HeroComponent theme={theme} churchName={church.name} description={church.description} />

          <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <WorshipSchedule theme={theme} worshipTimes={church.worshipTimes} />
            {modules.sermon && (
              <SermonComponent theme={theme} sermons={churchData.sermons} churchSlug={church.slug} />
            )}
            {modules.notice && (
              <NoticeComponent theme={theme} notices={churchData.notices} />
            )}
            <ScheduleList theme={theme} schedules={church.schedules} />
            <ContactClassic theme={theme} church={churchData} />
          </main>

          <FooterComponent theme={theme} churchName={church.name} />
        </div>
      </div>
    )
  }

  // 전통 / 모던 레이아웃
  return (
    <div
      style={{
        '--color-primary': theme.colors.primary,
        '--color-secondary': theme.colors.secondary,
        '--color-accent': theme.colors.accent,
        '--color-background': theme.colors.background,
        '--font-family': theme.font === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif',
      } as React.CSSProperties}
      className="min-h-screen"
    >
      <NavTop theme={theme} churchName={church.name} churchSlug={church.slug} />
      <HeroComponent theme={theme} churchName={church.name} description={church.description} />

      <main
        style={{ backgroundColor: 'var(--color-background)' }}
        className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12"
      >
        <WorshipSchedule theme={theme} worshipTimes={church.worshipTimes} />

        {layout === 'modern' && modules.sermon && church.sermons.length > 0 ? (
          // 모던: 피처드 설교 + 카드
          <>
            <SermonFeatured theme={theme} sermons={churchData.sermons} />
            {modules.notice && (
              <NoticeComponent theme={theme} notices={churchData.notices} />
            )}
          </>
        ) : (
          // 전통: 그리드 레이아웃
          <div className="grid gap-8 lg:grid-cols-2">
            {modules.sermon && (
              <SermonComponent theme={theme} sermons={churchData.sermons} churchSlug={church.slug} />
            )}
            {modules.notice && (
              <NoticeComponent theme={theme} notices={churchData.notices} />
            )}
          </div>
        )}

        <ScheduleList theme={theme} schedules={church.schedules} />
        <ContactClassic theme={theme} church={churchData} />
      </main>

      <FooterComponent theme={theme} churchName={church.name} />
    </div>
  )
}
