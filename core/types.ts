// 플러그인 시스템 타입 정의

export type PluginType = 'section' | 'feature' | 'theme' | 'widget'

export interface PluginMeta {
  name: string                         // 고유 ID (예: "hero-video")
  type: PluginType
  label: string                        // 표시명 (예: "비디오 히어로")
  description: string
  version: string
  icon?: string                        // 이모지 아이콘
  author?: string
  defaultConfig: Record<string, any>   // 기본 설정
  configSchema?: ConfigField[]         // 설정 UI 스키마
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'select' | 'boolean' | 'number' | 'image'
  defaultValue?: any
  options?: { label: string; value: string }[]
  required?: boolean
  placeholder?: string
}

// 플러그인 런타임 인터페이스
export interface Plugin {
  meta: PluginMeta
  component: React.ComponentType<PluginRenderProps>
  adminComponent?: React.ComponentType<PluginAdminProps>
}

export interface PluginRenderProps {
  churchId: string
  churchSlug: string
  config: Record<string, any>
}

export interface PluginAdminProps {
  churchId: string
  config: Record<string, any>
  onSave: (config: Record<string, any>) => void
}

// DB와 매핑되는 타입
export interface PluginRecord {
  id: string
  name: string
  type: PluginType
  version: string
  config: string              // JSON
  enabled: boolean
  createdAt: Date
}

export interface ChurchPluginRecord {
  id: string
  churchId: string
  pluginId: string
  enabled: boolean
  config: string              // JSON (교회별 오버라이드)
  order: number
}
