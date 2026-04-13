import { Plugin, PluginMeta, PluginType } from './types'

// 등록된 플러그인 저장소
const pluginRegistry = new Map<string, Plugin>()

/**
 * 플러그인 등록
 */
export function registerPlugin(plugin: Plugin): void {
  const { name } = plugin.meta
  if (pluginRegistry.has(name)) {
    console.warn(`Plugin "${name}" is already registered. Overwriting.`)
  }
  pluginRegistry.set(name, plugin)
}

/**
 * 플러그인 가져오기
 */
export function getPlugin(name: string): Plugin | undefined {
  return pluginRegistry.get(name)
}

/**
 * 타입별 플러그인 목록
 */
export function getPluginsByType(type: PluginType): Plugin[] {
  return Array.from(pluginRegistry.values()).filter(p => p.meta.type === type)
}

/**
 * 전체 플러그인 목록
 */
export function getAllPlugins(): Plugin[] {
  return Array.from(pluginRegistry.values())
}

/**
 * 플러그인 등록 해제
 */
export function unregisterPlugin(name: string): boolean {
  return pluginRegistry.delete(name)
}

/**
 * 플러그인 존재 여부
 */
export function hasPlugin(name: string): boolean {
  return pluginRegistry.has(name)
}
