/**
 * 电量 / 电费计算逻辑。
 *
 * 数据来源：
 *     Home Assistant 当前状态
 *     +
 *     本地历史数据
 */

import type {
  DayEle,
  MonthEle,
  BillViewModel,
} from './types'

import {
  updateUsageStore,
  getDailyList,
  getMonthlyList,
} from './dailyStore'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * 获取最近 N 天。
 *
 * dayElePq：
 *
 *     20260910
 *     20260911
 *
 * 最终：
 *
 *     昨天 → 今天
 */
export function recentDays(
  dayElePq: DayEle[],
  n: number,
): DayEle[] {
  if (n <= 0) {
    return []
  }

  return [...dayElePq]
    .sort((a, b) =>
      a.label.localeCompare(b.label),
    )
    .slice(-n)
}

export function shortTime(
  update: string,
): string {
  const parts = update.split(' ')

  if (parts.length !== 2) {
    return update
  }

  const date = parts[0].split('-')
  const time = parts[1].split(':')

  if (
    date.length < 3 ||
    time.length < 2
  ) {
    return update
  }

  return (
    `${date[1]}-${date[2]} ` +
    `${time[0]}:${time[1]}`
  )
}

export function nowString(): string {
  const d = new Date()

  const p = (n: number) =>
    String(n).padStart(2, '0')

  return (
    `${d.getFullYear()}-` +
    `${p(d.getMonth() + 1)}-` +
    `${p(d.getDate())} ` +
    `${p(d.getHours())}:` +
    `${p(d.getMinutes())}:` +
    `${p(d.getSeconds())}`
  )
}

// -----------------------------------------------------------------------------
// ViewModel
// -----------------------------------------------------------------------------

function buildViewModel(
  dayElePq: DayEle[],
  monthElePq: MonthEle[],
  electricityPrice: number,
  meta: {
    update: string
    consName: string
    consNo: string
  },
): BillViewModel {
  const now = new Date()

  const yearPrefix =
    String(now.getFullYear())

  const currentMonthKey =
    `${now.getFullYear()}` +
    `${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}`

  /**
   * 当前月份。
   */
  const currentMonth =
    monthElePq.find(
      m => m.label === currentMonthKey,
    )

  const currentMonthEle =
    currentMonth?.elePq ?? 0

  /**
   * 上个月。
   */
  const previousMonths =
    monthElePq
      .filter(
        m => m.label < currentMonthKey,
      )
      .sort((a, b) =>
        a.label.localeCompare(b.label),
      )

  const lastMonth =
    previousMonths.length > 0
      ? previousMonths[
          previousMonths.length - 1
        ]
      : undefined

  const monthUsage =
    lastMonth?.elePq ?? 0

  const monthFee =
    lastMonth?.cost ?? 0

  /**
   * 年度用电。
   */
  const yearUsage = round2(
    monthElePq
      .filter(m =>
        m.label.startsWith(yearPrefix),
      )
      .reduce(
        (sum, m) =>
          sum + m.elePq,
        0,
      ),
  )

  /**
   * 年度电费。
   */
  const yearFee = round2(
    yearUsage * electricityPrice,
  )

  /**
   * 今日用电。
   *
   * dayElePq 已经按照日期升序排列，
   * 最后一条就是今天。
   */
  const dayFee =
    dayElePq.length > 0
      ? dayElePq[
          dayElePq.length - 1
        ].elePq
      : 0

  console.log(
    '[Calc] 今日用电:',
    dayFee,
  )

  console.log(
    '[Calc] 日数据数量:',
    dayElePq.length,
  )

  return {
    ...meta,

    monthFee,
    monthUsage,

    yearFee,
    yearUsage,

    currentMonthEle,

    dayFee,

    dayElePq,
    monthElePq,
  }
}

function emptyViewModel(
  meta: {
    update: string
    consName: string
    consNo: string
  },
): BillViewModel {
  return {
    ...meta,

    monthFee: 0,
    monthUsage: 0,

    yearFee: 0,
    yearUsage: 0,

    currentMonthEle: 0,

    dayFee: 0,

    dayElePq: [],
    monthElePq: [],
  }
}

export function processUsage(
  currentState: number | undefined,
  electricityPrice: number,
  meta: {
    update: string
    consName: string
    consNo: string
  },
): BillViewModel {
  /**
   * Home Assistant 当前值。
   *
   * 这里保持你的原有逻辑：
   *
   * currentState
   *     ↓
   * 今日实时用电
   */
  if (
    currentState != null &&
    Number.isFinite(currentState) &&
    currentState >= 0
  ) {
    updateUsageStore(currentState)
  }

  /**
   * 获取最近 7 天。
   */
  const dayElePq =
    getDailyList()

  /**
   * 获取月度数据。
   */
  const monthElePq =
    getMonthlyList(
      electricityPrice,
    )

  if (
    dayElePq.length === 0 &&
    monthElePq.length === 0
  ) {
    return emptyViewModel(meta)
  }

  return buildViewModel(
    dayElePq,
    monthElePq,
    electricityPrice,
    meta,
  )
}