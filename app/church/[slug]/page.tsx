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
import { GalleryGrid } from '@/components/church/GallerySection/GalleryGrid'
import { AboutSection } from '@/components/church/AboutSection/AboutSection'
import SubscribeForm from './SubscribeForm'

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
      galleries: { orderBy: { createdAt: 'desc' }, take: 6 },
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

  const layout = theme.layout || 'modern'
  const sections = (theme as { sections?: { hero: string; sermon: string; notice: string; footer: string } }).sections

  const HeroComponent = (sections?.hero === 'image') ? ImageHero
    : (sections?.hero === 'text') ? TextHero
    : (layout === 'traditional') ? ImageHero
    : (layout === 'minimal') ? TextHero
    : GradientHero

  const SermonComponent = (sections?.sermon === 'list') ? SermonList
    : (sections?.sermon === 'featured') ? SermonFeatured
    : (sections?.sermon === 'cards') ? SermonCards
    : (layout === 'traditional') ? SermonList
    : (layout === 'minimal') ? SermonList
    : SermonCards

  const NoticeComponent = (sections?.notice === 'table') ? NoticeTable
    : (sections?.notice === 'timeline') ? NoticeTimeline
    : (sections?.notice === 'cards') ? NoticeCards
    : (layout === 'traditional') ? NoticeTable
    : (layout === 'minimal') ? NoticeTimeline
    : NoticeCards

  const FooterComponent = (sections?.footer === 'minimal') ? FooterMinimal
    : (layout === 'minimal') ? FooterMinimal
    : FooterFull

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
          <HeroComponent theme={theme} churchName={church.name} description={church.description} heroTitle={church.heroTitle} heroSubtitle={church.heroSubtitle} heroImage={church.heroImage} />

          <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
            <WorshipSchedule theme={theme} worshipTimes={church.worshipTimes} />
            {modules.sermon && (
              <SermonComponent theme={theme} sermons={churchData.sermons} churchSlug={church.slug} />
            )}
            {modules.notice && (
              <NoticeComponent theme={theme} notices={churchData.notices} churchSlug={church.slug} />
            )}
            <div id="schedule">
              <ScheduleList theme={theme} schedules={church.schedules} churchSlug={church.slug} />
            </div>
            {modules.gallery && church.galleries.length > 0 && (
              <GalleryGrid theme={theme} galleries={church.galleries} churchSlug={church.slug} />
            )}
            <ContactClassic theme={theme} church={churchData} />
          </main>

          <FooterComponent theme={theme} churchName={church.name} />
        </div>
      </div>
    )
  }

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
      <a href="#main-content" className="skip-to-content">본문으로 건너뛰기</a>
      <NavTop theme={theme} churchName={church.name} churchSlug={church.slug} />
      <HeroComponent theme={theme} churchName={church.name} description={church.description} heroTitle={church.heroTitle} heroSubtitle={church.heroSubtitle} heroImage={church.heroImage} />

      <main
        id="main-content"
        style={{ backgroundColor: 'var(--color-background)' }}
        className="space-y-0"
      >
        {/* 예배 시간 - 배경색 악센트 */}
        <section className="py-12" style={{ backgroundColor: `${theme.colors.primary}08` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <WorshipSchedule theme={theme} worshipTimes={church.worshipTimes} />
          </div>
        </section>

        {/* 교회 소개 */}
        <AboutSection
          theme={theme}
          churchSlug={church.slug}
          intro={church.intro}
          vision={church.vision}
          pastorName={church.pastorName}
          pastorMessage={church.pastorMessage}
          pastorImage={church.pastorImage}
        />

        {/* 설교 + 공지 - 메인 배경 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {layout === 'modern' && modules.sermon && church.sermons.length > 0 ? (
              <>
                <SermonFeatured theme={theme} sermons={churchData.sermons} />
                {modules.notice && (
                  <NoticeComponent theme={theme} notices={churchData.notices} churchSlug={church.slug} />
                )}
              </>
            ) : (
              <div className="grid gap-8 lg:grid-cols-2">
                {modules.sermon && (
                  <SermonComponent theme={theme} sermons={churchData.sermons} churchSlug={church.slug} />
                )}
                {modules.notice && (
                  <NoticeComponent theme={theme} notices={churchData.notices} churchSlug={church.slug} />
                )}
              </div>
            )}
          </div>
        </section>

        {/* 일정 - 교대 배경 */}
        <section id="schedule" className="py-16 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScheduleList theme={theme} schedules={church.schedules} churchSlug={church.slug} />
          </div>
        </section>

        {/* 갤러리 - 메인 배경 */}
        {modules.gallery && church.galleries.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <GalleryGrid theme={theme} galleries={church.galleries} churchSlug={church.slug} />
            </div>
          </section>
        )}

        {/* 소식 구독 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SubscribeForm slug={church.slug} />
          </div>
        </section>

        {/* 연락처 - 교대 배경 */}
        <section className="py-16 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactClassic theme={theme} church={churchData} />
          </div>
        </section>
      </main>

      <FooterComponent theme={theme} churchName={church.name} />
    </div>
  )
}
