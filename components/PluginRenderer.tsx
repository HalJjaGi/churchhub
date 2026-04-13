'use client'

import dynamic from 'next/dynamic'
import { PluginRenderProps } from '@/core/types'

// 플러그인 컴포넌트를 동적으로 로드하는 맵
const pluginComponents: Record<string, React.ComponentType<PluginRenderProps>> = {}

// 플러그인 이름 → 컴포넌트 매핑 등록
export function registerPluginComponent(
  name: string, 
  component: React.ComponentType<PluginRenderProps>
) {
  pluginComponents[name] = component
}

interface PluginRendererProps {
  pluginName: string
  churchId: string
  churchSlug: string
  config: Record<string, any>
}

export default function PluginRenderer({ 
  pluginName, 
  churchId, 
  churchSlug, 
  config 
}: PluginRendererProps) {
  const Component = pluginComponents[pluginName]

  if (!Component) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
        플러그인 "{pluginName}" 컴포넌트를 찾을 수 없습니다.
      </div>
    )
  }

  return <Component churchId={churchId} churchSlug={churchSlug} config={config} />
}
