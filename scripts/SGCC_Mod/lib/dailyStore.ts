/**
 * 本地用电量存储
 *
 * 设计：
 *
 * daily:
 *   保存最近 7 天的每日用电量
 *
 * monthly:
 *   保存已经结算过的每日用电量累计值
 *
 * 重要：
 *   每天的数据会进入 monthly，
 *   但是不会马上从 daily 删除。
 *
 *   daily 始终保留最近 7 天，
 *   只有超过 7 天的数据才从 daily 删除。
 *
 * 示例：
 *
 * 2026-09-11
 *
 * daily:
 *   09-05
 *   09-06
 *   09-07
 *   09-08
 *   09-09
 *   09-10
 *   09-11  ← 今天实时
 *
 * monthly:
 *   09 月已经累计的所有每日数据
 *
 * 当前月电量：
 *   monthly 已结算数据
 *   +
 *   daily 中当前月份的数据
 *
 * 注意：
 *   monthly 中的数值是“已结算数据”，
 *   不包含当前仍然存在于 daily 的数据。
 */

import type { DayEle, MonthEle } from './types'

const KEY = 'sgcc.usageStore'

/** 日数据最多保留 7 天 */
const MAX_DAILY = 7

/** 月数据最多保留 12 个月 */
const MAX_MONTHLY = 12

interface UsageStore {
  /**
   * YYYYMMDD -> 当日用电量
   */
  daily: Record<string, number>

  /**
   * YYYYMM -> 已结算的历史日用电量
   *
   * 注意：
   * 这里不包含仍然保留在 daily 中的日数据。
   */
  monthly: Record<string, number>
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function dateToKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}` +
    `${pad(date.getDate())}`
  )
}

function monthToKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}`
  )
}

function loadStore(): UsageStore {
  try {
    const raw = Storage.get<Partial<UsageStore>>(KEY)

    if (
      raw &&
      typeof raw === 'object' &&
      raw.daily &&
      typeof raw.daily === 'object' &&
      raw.monthly &&
      typeof raw.monthly === 'object'
    ) {
      return {
        daily: { ...raw.daily },
        monthly: { ...raw.monthly },
      }
    }
  } catch (e) {
    console.log(
      `[dailyStore] 读取失败：${
        e instanceof Error ? e.message : String(e)
      }`,
    )
  }

  return {
    daily: {},
    monthly: {},
  }
}

function saveStore(store: UsageStore): void {
  Storage.set(KEY, store)
}

/**
 * 判断某个日期是否仍属于最近 7 天。
 *
 * 例如今天 09-11：
 *
 * 09-05 → 保留
 * 09-06 → 保留
 * 09-07 → 保留
 * 09-08 → 保留
 * 09-09 → 保留
 * 09-10 → 保留
 * 09-11 → 保留
 *
 * 09-04 → 删除
 */
function isWithinLast7Days(
  dayKey: string,
  today: Date,
): boolean {
  const year = Number(dayKey.slice(0, 4))
  const month = Number(dayKey.slice(4, 6))
  const day = Number(dayKey.slice(6, 8))

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return false
  }

  const target = new Date(
    year,
    month - 1,
    day,
    0,
    0,
    0,
    0,
  )

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0,
  )

  const diffMs =
    todayStart.getTime() - target.getTime()

  const diffDays =
    Math.floor(diffMs / 86400000)

  return diffDays >= 0 && diffDays < MAX_DAILY
}

/**
 * 将超过 7 天的 daily 数据结算到 monthly。
 *
 * 这是唯一负责：
 *
 * daily -> monthly
 *
 * 的地方。
 *
 * 已经进入 monthly 的数据不会再次进入 monthly，
 * 因为一旦结算，就会从 daily 删除。
 */
function settleExpiredDaily(
  store: UsageStore,
  today: Date,
): void {
  const dayKeys = Object.keys(store.daily)

  for (const dayKey of dayKeys) {
    if (isWithinLast7Days(dayKey, today)) {
      continue
    }

    const value = Number(store.daily[dayKey])

    if (!Number.isFinite(value)) {
      delete store.daily[dayKey]
      continue
    }

    const monthKey = dayKey.slice(0, 6)

    store.monthly[monthKey] = round2(
      (store.monthly[monthKey] ?? 0) + value,
    )

    delete store.daily[dayKey]

    console.log(
      `[dailyStore] 结算 ${dayKey} -> ${monthKey}: ${value} kWh`,
    )
  }
}

/**
 * 删除异常的 daily 数据。
 */
function cleanDaily(
  store: UsageStore,
): void {
  for (const [dayKey, value] of Object.entries(store.daily)) {
    const num = Number(value)

    if (
      !/^\d{8}$/.test(dayKey) ||
      !Number.isFinite(num) ||
      num < 0
    ) {
      delete store.daily[dayKey]
    }
  }
}

/**
 * 删除异常的 monthly 数据。
 */
function cleanMonthly(
  store: UsageStore,
): void {
  for (const [monthKey, value] of Object.entries(store.monthly)) {
    const num = Number(value)

    if (
      !/^\d{6}$/.test(monthKey) ||
      !Number.isFinite(num) ||
      num < 0
    ) {
      delete store.monthly[monthKey]
    }
  }
}

/**
 * 保证 daily 最多保存最近 7 天。
 *
 * 注意：
 * 超出的数据这里会先进入 monthly，
 * 然后才删除。
 */
function trimDaily(
  store: UsageStore,
): void {
  const dayKeys = Object.keys(store.daily)
    .sort((a, b) => a.localeCompare(b))

  while (dayKeys.length > MAX_DAILY) {
    const oldest = dayKeys.shift()

    if (!oldest) {
      break
    }

    const value = Number(store.daily[oldest])

    if (Number.isFinite(value) && value >= 0) {
      const monthKey = oldest.slice(0, 6)

      store.monthly[monthKey] = round2(
        (store.monthly[monthKey] ?? 0) + value,
      )

      console.log(
        `[dailyStore] 超过 ${MAX_DAILY} 天，结算 ${oldest} -> ${monthKey}: ${value} kWh`,
      )
    }

    delete store.daily[oldest]
  }
}

/**
 * 保证 monthly 最多保存 12 个月。
 */
function trimMonthly(
  store: UsageStore,
): void {
  const monthKeys = Object.keys(store.monthly)
    .sort((a, b) => a.localeCompare(b))

  while (monthKeys.length > MAX_MONTHLY) {
    const oldest = monthKeys.shift()

    if (oldest) {
      delete store.monthly[oldest]
    }
  }
}

/**
 * 更新今日用电量。
 *
 * Home Assistant：
 *
 * sensor.dian_biao_today_energy
 *
 * 是“今日用电量”，例如：
 *
 * 08:00 -> 1.52
 * 08:30 -> 1.56
 * 09:00 -> 1.72
 *
 * 每次刷新只覆盖今天的数据。
 *
 * 不会：
 *
 * 1.52 + 1.56 + 1.72
 *
 * 而是：
 *
 * daily[今天] = 1.72
 */
export function updateUsageStore(
  todayUsage: number,
): void {
  if (
    !Number.isFinite(todayUsage) ||
    todayUsage < 0
  ) {
    return
  }

  const store = loadStore()
  const now = new Date()

  cleanDaily(store)
  cleanMonthly(store)

  /**
   * 先处理超过 7 天的数据。
   *
   * 例如今天 09-11：
   *
   * 09-04 及以前
   * -> monthly
   * -> 从 daily 删除
   *
   * 09-05 ~ 09-11
   * -> 继续留在 daily
   */
  settleExpiredDaily(store, now)

  /**
   * 写入今天。
   *
   * 如果今天已经存在：
   * 直接覆盖。
   */
  const todayKey = dateToKey(now)

  store.daily[todayKey] =
    round2(todayUsage)

  /**
   * 再保险裁剪一次。
   *
   * 正常情况下这里不会超过 7 条，
   * 但如果旧数据很多，可以自动整理。
   */
  trimDaily(store)

  trimMonthly(store)

  saveStore(store)

  console.log(
    `[dailyStore] 今日 ${todayKey} = ${store.daily[todayKey]} kWh`,
  )

  console.log(
    `[dailyStore] daily = ${JSON.stringify(store.daily)}`,
  )

  console.log(
    `[dailyStore] monthly = ${JSON.stringify(store.monthly)}`,
  )
}

/**
 * 获取最近 7 天日数据。
 *
 * 返回升序：
 *
 * 09-05
 * 09-06
 * ...
 * 09-11
 */
export function getDailyList(): DayEle[] {
  const store = loadStore()

  return Object.entries(store.daily)
    .filter(([, value]) => {
      const num = Number(value)
      return Number.isFinite(num) && num >= 0
    })
    .sort(([a], [b]) =>
      a.localeCompare(b),
    )
    .map(([label, value]) => ({
      label,
      elePq: round2(Number(value)),
    }))
}

/**
 * 获取月度数据。
 *
 * monthly：
 *   已经结算的历史日数据
 *
 * daily：
 *   最近 7 天数据
 *
 * 两者相加得到真实月度总量。
 *
 * 但是：
 *
 * monthly 不会被修改。
 *
 * 这里只是计算最终显示值。
 */
export function getMonthlyList(
  electricityPrice: number,
): MonthEle[] {
  const store = loadStore()

  const merged: Record<string, number> = {
    ...store.monthly,
  }

  /**
   * 把 daily 中最近 7 天的数据加入对应月份。
   *
   * 这些数据仍然保留在 daily，
   * 所以这里只是计算，不写回 monthly。
   */
  for (const [dayKey, value] of Object.entries(store.daily)) {
    const num = Number(value)

    if (
      !Number.isFinite(num) ||
      num < 0
    ) {
      continue
    }

    const monthKey = dayKey.slice(0, 6)

    merged[monthKey] = round2(
      (merged[monthKey] ?? 0) + num,
    )
  }

  return Object.entries(merged)
    .sort(([a], [b]) =>
      a.localeCompare(b),
    )
    .map(([label, value]) => {
      const elePq = round2(Number(value))

      return {
        label,
        elePq,
        cost: round2(
          elePq * electricityPrice,
        ),
      }
    })
}

/**
 * 调试：打印当前完整存储。
 */
export function debugUsageStore(): void {
  const store = loadStore()

  console.log(
    `[dailyStore] 当前完整存储：\n${JSON.stringify(
      store,
      null,
      2,
    )}`,
  )
}

/**
 * 清除所有本地数据。
 */
export function clearUsageStore(): void {
  Storage.remove(KEY)

  console.log(
    '[dailyStore] 已清除本地用电数据',
  )
}