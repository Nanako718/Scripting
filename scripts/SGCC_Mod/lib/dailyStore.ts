/**
 * 本地用电量存储。
 * daily: 最多 7 天（柱状图用），monthly: 最多 12 个月，共 19 条。
 * 每次刷新：非今天的日数据自动累入月度，然后只保留今天的日数据。
 */
import type { DayEle, MonthEle } from './types'

const KEY = 'sgcc.usageStore'
const MAX_DAILY = 7
const MAX_MONTHLY = 12

interface UsageStore {
  daily: Record<string, number>
  monthly: Record<string, number>
}

function loadStore(): UsageStore {
  const raw = Storage.get<Partial<UsageStore>>(KEY)
  if (raw && typeof raw === 'object' && raw.daily && raw.monthly) {
    return { daily: raw.daily, monthly: raw.monthly }
  }
  return { daily: {}, monthly: {} }
}

function saveStore(store: UsageStore): void {
  Storage.set(KEY, store)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function dateToKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
}

/**
 * 更新存储。
 * 1. 把 daily 里所有非今天的读数累入对应月份，然后从 daily 删除
 * 2. 写入今日读数
 * 3. 裁剪：monthly 最多 12 条，daily 最多 7 条
 */
export function updateUsageStore(todayUsage: number): void {
  if (!Number.isFinite(todayUsage) || todayUsage < 0) return
  const store = loadStore()
  const todayKey = dateToKey(new Date())

  // 非今天的日数据结算进月度
  for (const dayKey of Object.keys(store.daily)) {
    if (dayKey === todayKey) continue
    const val = store.daily[dayKey]
    const monthKey = dayKey.slice(0, 6)
    store.monthly[monthKey] = round2((store.monthly[monthKey] ?? 0) + val)
    delete store.daily[dayKey]
  }

  // 写入今日
  store.daily[todayKey] = round2(todayUsage)

  // 裁剪月度
  const monthKeys = Object.keys(store.monthly).sort()
  while (monthKeys.length > MAX_MONTHLY) {
    delete store.monthly[monthKeys.shift()!]
  }

  // 裁剪日度
  const dayKeys = Object.keys(store.daily).sort()
  while (dayKeys.length > MAX_DAILY) {
    delete store.daily[dayKeys.shift()!]
  }

  saveStore(store)
}

/** 每日明细（柱状图用），升序 */
export function getDailyList(): DayEle[] {
  const store = loadStore()
  return Object.entries(store.daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, elePq]) => ({ label, elePq }))
}

/** 月度明细。本月 = monthly[本月]（已结算日） + daily[今日]（未结算） */
export function getMonthlyList(electricityPrice: number): MonthEle[] {
  const store = loadStore()
  const todayKey = dateToKey(new Date())
  const todayMonth = todayKey.slice(0, 6)
  const todayUsage = store.daily[todayKey] ?? 0

  const merged: Record<string, number> = { ...store.monthly }
  merged[todayMonth] = round2((merged[todayMonth] ?? 0) + todayUsage)

  return Object.entries(merged)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, elePq]) => ({
      label,
      elePq: round2(elePq),
      cost: round2(elePq * electricityPrice),
    }))
}

export function clearUsageStore(): void {
  Storage.remove(KEY)
}
