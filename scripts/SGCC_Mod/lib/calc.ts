/**
 * 电量 / 电费计算逻辑。
 * 数据来源：本地存储 + Home Assistant 当前状态
 */
import type { DayEle, MonthEle, BillViewModel } from './types'
import { updateUsageStore, getDailyList, getMonthlyList } from './dailyStore'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function recentDays(dayElePq: DayEle[], n: number): DayEle[] {
  if (n <= 0) return []
  return [...dayElePq].reverse().slice(-n)
}

export function shortTime(update: string): string {
  const parts = update.split(' ')
  if (parts.length !== 2) return update
  const date = parts[0].split('-')
  const time = parts[1].split(':')
  if (date.length < 3 || time.length < 2) return update
  return `${date[1]}-${date[2]} ${time[0]}:${time[1]}`
}

export function nowString(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// --- 视图模型构建 ---

function buildViewModel(
  dayElePq: DayEle[],
  monthElePq: MonthEle[],
  electricityPrice: number,
  meta: { update: string; consName: string; consNo: string },
): BillViewModel {
  const now = new Date()
  const yearPrefix = String(now.getFullYear())
  const currentMonthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

  const currentMonth = monthElePq.find(m => m.label === currentMonthKey)
  const currentMonthEle = currentMonth ? currentMonth.elePq : 0

  const prevMonths = monthElePq.filter(m => m.label !== currentMonthKey)
  const lastMonth = prevMonths.length > 0 ? prevMonths[prevMonths.length - 1] : undefined
  const monthUsage = lastMonth ? lastMonth.elePq : 0
  const monthFee = lastMonth ? lastMonth.cost : 0

  const yearUsage = round2(
    monthElePq.filter(m => m.label.startsWith(yearPrefix)).reduce((sum, m) => sum + m.elePq, 0),
  )
  const yearFee = round2(yearUsage * electricityPrice)
  const dayFee = dayElePq.length > 0 ? dayElePq[dayElePq.length - 1].elePq : 0

  return { ...meta, monthFee, monthUsage, yearFee, yearUsage, currentMonthEle, dayFee, dayElePq, monthElePq }
}

function emptyViewModel(meta: {
  update: string
  consName: string
  consNo: string
}): BillViewModel {
  return { ...meta, monthFee: 0, monthUsage: 0, yearFee: 0, yearUsage: 0, currentMonthEle: 0, dayFee: 0, dayElePq: [], monthElePq: [] }
}

export function processUsage(
  currentState: number | undefined,
  electricityPrice: number,
  meta: { update: string; consName: string; consNo: string },
): BillViewModel {
  // 写入今日读数到本地存储（跨天自动结算进月度）
  if (currentState != null && Number.isFinite(currentState) && currentState >= 0) {
    updateUsageStore(currentState)
  }

  const dayElePq = getDailyList()
  const monthElePq = getMonthlyList(electricityPrice)

  if (dayElePq.length === 0 && monthElePq.length === 0) {
    return emptyViewModel(meta)
  }

  return buildViewModel(dayElePq, monthElePq, electricityPrice, meta)
}
