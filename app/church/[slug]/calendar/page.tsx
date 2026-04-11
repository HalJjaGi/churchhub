import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CalendarGrid } from './CalendarGrid'
import CalendarClient from './CalendarClient'

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  worship: { bg: 'bg-orange-100', text: 'text-orange-700', label: '예배' },
  event: { bg: 'bg-blue-100', text: 'text-blue-700', label: '행사' },
  meeting: { bg: 'bg-green-100', text: 'text-green-700', label: '모임' },
  education: { bg: 'bg-purple-100', text: 'text-purple-700', label: '교육' },
  general: { bg: 'bg-gray-100', text: 'text-gray-700', label: '일반' },
}

const categoryDotColors: Record<string, string> = {
  worship: 'bg-orange-400',
  event: 'bg-blue-400',
  meeting: 'bg-green-400',
  education: 'bg-purple-400',
  general: 'bg-gray-400',
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { year: yearStr, month: monthStr } = await searchParams

  const church = await prisma.church.findUnique({
    where: { slug },
    include: { schedules: { orderBy: { date: 'asc' } } },
  })
  if (!church) notFound()

  let colors = { primary: '#2563eb' }
  try {
    const theme = JSON.parse(church.theme || '{}')
    colors = theme.colors || colors
  } catch { /* ignore */ }

  const now = new Date()
  const year = yearStr ? parseInt(yearStr) : now.getFullYear()
  const month = monthStr ? parseInt(monthStr) : now.getMonth() + 1

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const monthSchedules = church.schedules.filter((s) => {
    const d = new Date(s.date)
    return d >= monthStart && d < monthEnd
  })

  const serializedSchedules = monthSchedules.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    date: s.date.toISOString(),
    endDate: s.endDate?.toISOString() ?? null,
    category: s.category,
  }))

  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  return (
    <CalendarClient
      slug={slug}
      churchName={church.name}
      colors={colors}
      year={year}
      month={month}
      schedules={serializedSchedules}
      categoryColors={categoryColors}
      categoryDotColors={categoryDotColors}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      monthNames={monthNames}
    />
  )
}
