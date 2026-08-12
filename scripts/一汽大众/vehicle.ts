// 一汽大众车辆数据模块

import { requestAuthedJson } from './api'
import type { VehicleListData, BasicVehicleData, FullVehicleData, CurrentUserEntitlement } from './types'

// ============ 车辆列表 ============

/** 获取完整车辆列表 */
export const getVehicleList = async (): Promise<VehicleListData> => {
  return await requestAuthedJson('/v1/full/vehicles')
}

/** 刷新车辆列表（触发后端同步） */
export const refreshVehicleList = async (): Promise<VehicleListData> => {
  return await requestAuthedJson('/v1/fawvw/vehicles/refresh', { method: 'POST' })
}

// ============ 车辆数据 ============

/** 获取默认车辆基础数据 */
export const getDefaultBasicVehicle = async (): Promise<BasicVehicleData> => {
  return await requestAuthedJson('/v1/basic/vehicles/default')
}

/** 获取指定车辆基础数据 */
export const getBasicVehicle = async (vehicleId: string): Promise<BasicVehicleData> => {
  return await requestAuthedJson(`/v1/basic/vehicles/${vehicleId}/summary`)
}

/** 获取默认车辆完整数据 */
export const getDefaultFullVehicle = async (includeStaticMap = false): Promise<FullVehicleData> => {
  return await requestAuthedJson(`/v1/full/vehicles/default?includeStaticMap=${includeStaticMap}`)
}

/** 获取指定车辆完整数据 */
export const getFullVehicle = async (vehicleId: string, includeStaticMap = false): Promise<FullVehicleData> => {
  return await requestAuthedJson(`/v1/full/vehicles/${vehicleId}/data?includeStaticMap=${includeStaticMap}`)
}

/** 手动刷新指定车辆数据 */
export const refreshVehicle = async (vehicleId: string): Promise<FullVehicleData> => {
  return await requestAuthedJson(`/v1/full/vehicles/${vehicleId}/refresh`, { method: 'POST' })
}

// ============ 权益管理 ============

/** 获取当前用户权益 */
export const getCurrentEntitlement = async (): Promise<CurrentUserEntitlement> => {
  return await requestAuthedJson('/v1/redemptions/current')
}

/** 兑换权益码 */
export const redeemCode = async (code: string): Promise<{ featureTier: string; expiresAt: string | null }> => {
  return await requestAuthedJson('/v1/redemptions/redeem', {
    method: 'POST',
    body: { code: code.trim() }
  })
}

// ============ 工具函数 ============

/** 格式化续航里程 */
export const formatRange = (rangeKm: number, rangePercent: number): string => {
  return `${rangeKm}km ${rangePercent}%`
}

/** 格式化油量 */
export const formatOil = (oil?: { supported: boolean; levelPercent: number | null; volumeLiters?: number; valid?: boolean; minWarningActive?: boolean; status: string }): string | null => {
  if (!oil?.supported) return null
  if (!oil.valid) return '机油数据无效'
  return `${oil.levelPercent ?? '?'}%${oil.minWarningActive ? ' ⚠️' : ''}`
}

/** 格式化充电状态 */
export const formatCharging = (chargingState?: string): string | null => {
  if (!chargingState) return null
  const stateMap: Record<string, string> = {
    charging: '充电中',
    conservation: '保电中',
    grey: '未充电',
    inactive: '未充电',
    notreadyforcharging: '未充电',
    off: '未充电',
    readyforcharging: '可充电',
    unknown: '充电状态未知'
  }
  return stateMap[chargingState?.toLowerCase()] ?? chargingState
}

/** 格式化位置 */
export const formatLocation = (location?: { longitude: number; latitude: number; address: string }): string => {
  if (!location) return '位置不可用'
  return location.address || `${location.longitude}, ${location.latitude}`
}

/** 格式化锁车状态 */
export const formatLockState = (isLocked: boolean | null, lockState: string): string => {
  if (isLocked === true) return '已锁车'
  if (isLocked === false) return '未锁车'
  return lockState ?? '未知'
}

/** 格式化更新时间 */
export const formatUpdateTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}小时前`
    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay}天前`
  } catch {
    return timeStr
  }
}
