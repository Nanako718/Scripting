/**
 * 电量小组件 —— 数据类型定义
 * 数据来源：Home Assistant
 */

export interface HAStateResponse {
  entity_id: string
  state: string
  attributes: Record<string, unknown>
  last_changed: string
  last_updated: string
}

export interface DayEle {
  label: string
  elePq: number
}

export interface MonthEle {
  label: string
  elePq: number
  cost: number
}

export interface BillViewModel {
  consName: string
  consNo: string
  monthFee: number
  monthUsage: number
  yearFee: number
  yearUsage: number
  currentMonthEle: number
  dayFee: number
  dayElePq: DayEle[]
  monthElePq: MonthEle[]
  update: string
}

export interface SGCCSettings {
  dayAmount: number
  showChartValues: boolean
  haUrl: string
  haToken: string
  haEntityId: string
  electricityPrice: number
}

export const DEFAULT_SETTINGS: SGCCSettings = {
  dayAmount: 7,
  showChartValues: false,
  haUrl: '',
  haToken: '',
  haEntityId: '',
  electricityPrice: 0.56,
}
