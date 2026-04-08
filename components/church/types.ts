export type Theme = {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  font: 'serif' | 'sans-serif'
  layout: 'traditional' | 'modern' | 'minimal'
}

export type Modules = {
  sermon: boolean
  notice: boolean
  community: boolean
  gallery: boolean
  donation: boolean
}

export type Sermon = {
  id: string
  title: string
  content: string
  speaker: string
  date: Date
  youtubeUrl: string | null
  thumbnail: string | null
}

export type Notice = {
  id: string
  title: string
  content: string
  createdAt: Date
}

export type ChurchData = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  parking: string | null
  mapLat: number | null
  mapLng: number | null
  sermons: Sermon[]
  notices: Notice[]
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
  },
  font: 'sans-serif',
  layout: 'modern',
}

export const defaultModules: Modules = {
  sermon: true,
  notice: true,
  community: false,
  gallery: false,
  donation: false,
}
